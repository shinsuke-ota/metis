"""RBCP register access for the RPH-034 controller."""
import socket
from struct import Struct

HEADER = Struct("!BBBBI")
SET_VOLTAGE = 0x10
REGISTERS = {"set_voltage": SET_VOLTAGE, "voltage": 0x18, "current_limit": 0x20, "current": 0x30}


def exchange(sock, command, transaction, address, size, payload=b""):
    sock.send(HEADER.pack(0xff, command, transaction, size, address) + payload)
    reply = sock.recv(512)
    if len(reply) < HEADER.size:
        raise OSError("RBCP 応答が短すぎます")
    version, flags, received_id, length, received_address = HEADER.unpack_from(reply)
    data = reply[HEADER.size:]
    if (version, flags, received_id, length, received_address) != (
        0xff, command | 0x08, transaction, size, address
    ):
        raise OSError("RBCP 応答が要求と一致しないか、バスエラーです")
    if command == 0xc0 and len(data) != size:
        raise OSError("RBCP 読み出しデータ長が一致しません")
    if command == 0x80 and data not in (b"", payload):
        raise OSError("RBCP 書き込み応答のデータが一致しません")
    return data


def read_channels(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(.25)
        sock.connect((host, port))
        return [
            {key: int.from_bytes(exchange(sock, 0xc0, index * 4 + channel, address + 2 * channel, 2), "big")
             for index, (key, address) in enumerate(REGISTERS.items())}
            for channel in range(4)
        ]


def zero_channel(host, port, channel):
    address = SET_VOLTAGE + 2 * (channel - 1)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(.5)
        sock.connect((host, port))
        exchange(sock, 0x80, 0, address, 2, b"\x00\x00")
        if exchange(sock, 0xc0, 1, address, 2) != b"\x00\x00":
            raise OSError("設定電圧のゼロを読み戻せませんでした")
