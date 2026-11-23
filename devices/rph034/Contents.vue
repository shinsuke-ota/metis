<script setup>
import { onMounted, onUnmounted, ref, useId } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const theme = ref('dark');
const detail = ref(false);
const settingsDialog = ref(null);
const settingsTitle = useId();
const connected = ref(false);
const online = ref(false);
const channels = ref(Array.from({ length: 4 }, (_, index) => ({ channel: index + 1 })));
const drafts = ref({});
const busy = ref(false);
const message = ref('');
const error = ref('');
const host = ref('');
const port = ref(4660);
const configuredHost = ref('');

async function configure() {
  busy.value = true;
  try {
    await props.client.request('configure', { host: host.value, port: Number(port.value) });
    message.value = '接続設定を保存しました。';
  } catch (cause) {
    message.value = cause.message;
  } finally {
    busy.value = false;
  }
}

async function turnOff(channel) {
  busy.value = true;
  try {
    await props.client.request('off', { channel });
    message.value = 'CH ' + channel + ' の設定電圧をゼロにしたことを確認しました。';
  } catch (cause) {
    message.value = cause.message;
  } finally {
    busy.value = false;
  }
}
let unsubscribe;

async function saveLabel(row) {
  if (busy.value || !connected.value) return;
  busy.value = true;
  message.value = '';
  try {
    const { label } = await props.client.request('set_label', {
      channel: row.channel, label: drafts.value[row.channel] ?? row.label ?? '',
    });
    drafts.value[row.channel] = label;
    message.value = '表示名を保存しました。';
  } catch (error) {
    message.value = error.message;
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  theme.value = localStorage.getItem('metis-hv-theme') === 'light' ? 'light' : 'dark';
  unsubscribe = props.client.subscribe('rph034', payload => {
    connected.value = Boolean(payload.connected);
    if ('host' in payload) {
      configuredHost.value = payload.host;
      error.value = payload.error || '';
      if (!settingsDialog.value?.open) {
        host.value = payload.host;
        port.value = payload.port;
      }
    }
    online.value = connected.value && Boolean(payload.online);
    if (Array.isArray(payload.channels)) channels.value = payload.channels;
  });
});
onUnmounted(() => unsubscribe?.());

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('metis-hv-theme', theme.value);
}
</script>

<template>
  <section class="rph-panel hv-panel" :data-theme="theme">
    <header class="hv-toolbar">
      <h2>RPH-034</h2>
      <div class="hv-actions">
        <button type="button" @click="toggleTheme">{{ theme === 'dark' ? 'ライト' : 'ダーク' }}</button>
        <button type="button" aria-label="チャンネル設定" title="チャンネル設定" @click="settingsDialog?.showModal()">⚙</button>
      </div>
    </header>
    <p class="hv-status" :data-online="online" role="status">
      {{ !connected ? 'Metis ノード未接続' : online ? 'RBCP 読み出し中' : error || '電源との通信未設定' }}
    </p>
    <div class="rph-mode">
      <span :class="{ 'rph-active': !detail }">モニター</span>
      <button type="button" role="switch" aria-label="詳細モード" :aria-checked="detail"
        @click="detail = !detail"><span aria-hidden="true"></span></button>
      <span :class="{ 'rph-active': detail }">詳細</span>
    </div>
    <div class="rph-scroll" tabindex="0" role="region" aria-label="RPH-034 チャンネル">
      <table>
        <thead>
          <tr v-if="detail"><th scope="col">チャンネル</th><th scope="col">表示名</th><th scope="col">出力</th></tr>
          <tr v-else><th scope="col">表示名</th><th scope="col">電圧設定（生値）</th>
            <th scope="col">電圧実測（生値）</th><th scope="col">電流上限（生値）</th>
            <th scope="col">電流実測（生値）</th><th scope="col">出力</th><th scope="col">操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in channels" :key="row.channel" :data-state="!online || row.output == null ? 'unknown' : row.output ? 'on' : 'off'">
            <template v-if="detail">
              <th scope="row">CH {{ row.channel }}</th>
              <td>{{ row.label || '—' }}</td>
              <td>{{ row.output == null ? '不明' : row.output ? 'ON' : 'OFF' }}</td>
            </template>
            <template v-else>
              <th scope="row">{{ row.label || 'CH ' + row.channel }}</th>
              <td class="rph-number">{{ row.set_voltage ?? '—' }}</td>
              <td class="rph-number rph-measured">{{ row.voltage ?? '—' }}</td>
              <td class="rph-number">{{ row.current_limit ?? '—' }}</td>
              <td class="rph-number rph-measured">{{ row.current ?? '—' }}</td>
              <td>{{ row.output == null ? '不明' : row.output ? 'ON' : 'OFF' }}</td>
              <td><button type="button" :disabled="busy || !connected || !configuredHost" @click="turnOff(row.channel)">
                OFF（設定値をゼロ）
              </button></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
    <dialog ref="settingsDialog" class="hv-settings" :aria-labelledby="settingsTitle">
      <header class="hv-toolbar">
        <h3 :id="settingsTitle">チャンネル設定</h3>
        <form method="dialog"><button>閉じる</button></form>
      </header>
      <form class="hv-settings-form" @submit.prevent="configure">
        <label>RBCP IPv4 アドレス <input v-model.trim="host" placeholder="未設定"></label>
        <label>UDP ポート <input v-model.number="port" type="number" min="1" max="65535" required></label>
        <button :disabled="busy || !connected">接続設定を保存</button>
      </form>
      <div v-for="row in channels" :key="row.channel" class="hv-label-row">
        <span>CH {{ row.channel }}</span>
                <form @submit.prevent="saveLabel(row)">
                  <input :value="drafts[row.channel] ?? row.label ?? ''"
                    :aria-label="'CH ' + row.channel + ' の表示名'" placeholder="表示名"
                    maxlength="100" :disabled="busy || !connected"
                    @input="drafts[row.channel] = $event.target.value">
                  <button :disabled="busy || !connected">保存</button>
                </form>

      </div>
      <p v-if="message" role="status">{{ message }}</p>
    </dialog>
  </section>
</template>
