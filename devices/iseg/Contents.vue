<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const state = ref({ modules: [], policies: {} });
const connection = reactive({ url: '', username: '', password: '', lines: '0' });
const selected = ref(null);
const policy = reactive({});
const drafts = reactive({});
const feedback = ref('');
const logDialog = ref(null);
const operationLog = ref([]);
let logSequence = 0;
const operationLabels = {
  configure: '接続設定の保存',
  configure_channel: 'チャンネル設定の保存',
  set_voltage: '電圧設定',
  set_current: '電流設定',
  set_output: '出力切替',
};

function logOperation(operation, parameters) {
  const target = parameters.serial ? parameters.serial + ' / CH ' + parameters.channel : 'CC24';
  let action = operationLabels[operation] ?? operation;
  if (operation === 'set_voltage') action += ' ' + parameters.value + ' V';
  if (operation === 'set_current') action += ' ' + parameters.value + ' A';
  if (operation === 'set_output') action += parameters.value ? ' ON' : ' OFF';
  const entry = reactive({
    id: ++logSequence, time: new Date().toLocaleTimeString(), target, action,
    result: '処理中', detail: '',
  });
  operationLog.value = [entry, ...operationLog.value].slice(0, 100);
  return entry;
}
const rowFeedback = reactive({});
const busy = ref(false);
const nodeConnected = ref(false);
let initialized = false;
let unsubscribe;

const groups = computed(() => {
  const result = new Map();
  for (const module of state.value.modules) {
    const serial = String(module['Status.serialNumber'] ?? '');
    for (const [channel, items] of Object.entries(module.channels)) {
      const settings = state.value.policies[serial + ':' + channel] ?? {};
      const group = settings.group || '未分類';
      if (!result.has(group)) result.set(group, []);
      result.get(group).push({
        key: module.line + ':' + module.address + ':' + channel,
        serial, channel, items, settings, location: module.line + '/' + module.address + '/' + channel,
      });
    }
  }
  return result;
});

function display(items, key) {
  const item = items[key];
  return item ? String(item.value) + (item.unit ? ' ' + item.unit : '') : '—';
}
function flag(items, key) {
  const value = items[key]?.value;
  if (value == null) return '—';
  return ['1', 'true'].includes(String(value).toLowerCase()) ? 'ON' : 'OFF';
}
async function request(operation, parameters, success, rowKey) {
  const report = message => {
    if (rowKey) rowFeedback[rowKey] = message;
    else feedback.value = message;
  };
  const entry = logOperation(operation, parameters);
  busy.value = true;
  report('処理中…');
  try {
    await props.client.request(operation, parameters);
    entry.result = operation.startsWith('set_') ? '指令受理' : '保存完了';
    entry.detail = success;
    report(success);
    return true;
  } catch (error) {
    entry.result = 'エラー';
    entry.detail = error.message;
    report(error.message);
    return false;
  } finally {
    busy.value = false;
  }
}
async function saveConnection() {
  if (await request('configure', {
    ...connection, lines: connection.lines.split(',').map(line => line.trim()),
  }, '接続設定を保存しました。')) connection.password = '';
}
function edit(row) {
  selected.value = row;
  for (const key of ['label', 'group', 'voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    policy[key] = row.settings[key] ?? '';
  }
}
async function savePolicy() {
  const parameters = { ...policy, serial: selected.value.serial, channel: selected.value.channel };
  for (const key of ['voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    parameters[key] = parameters[key] === '' ? null : Number(parameters[key]);
  }
  if (await request('configure_channel', parameters, 'チャンネル設定を保存しました。')) selected.value = null;
}
function send(row, operation, value) {
  return request(operation, { serial: row.serial, channel: row.channel, value },
    '指令を受理。監視欄で実機の反映を確認してください。', row.key);
}
onMounted(() => {
  unsubscribe = props.client.subscribe('iseg', value => {
    nodeConnected.value = Boolean(value.connected);
    if (!value.connection) return;
    state.value = value;
    if (!initialized) {
      Object.assign(connection, value.connection, { lines: value.connection.lines.join(', ') });
      initialized = true;
    }
  });
});
onUnmounted(() => unsubscribe?.());
</script>

<template>
  <article>
    <h2>iseg CC24</h2>
    <button type="button" @click="logDialog?.showModal()">操作ログ</button>
    <dialog ref="logDialog" aria-labelledby="iseg-operation-log-title"
      style="width: min(56rem, 90vw); max-height: 75vh; overflow: auto">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem">
        <h3 id="iseg-operation-log-title">操作ログ</h3>
        <form method="dialog"><button>閉じる</button></form>
      </div>
      <p v-if="!operationLog.length">この画面からの操作はまだありません。</p>
      <table v-else style="width: 100%; text-align: left">
        <thead><tr><th>時刻</th><th>対象</th><th>操作</th><th>結果</th><th>詳細</th></tr></thead>
        <tbody>
          <tr v-for="entry in operationLog" :key="entry.id">
            <td style="white-space: nowrap">{{ entry.time }}</td>
            <td>{{ entry.target }}</td><td>{{ entry.action }}</td>
            <td style="white-space: nowrap">{{ entry.result }}</td><td>{{ entry.detail }}</td>
          </tr>
        </tbody>
      </table>
    </dialog>
    <form @submit.prevent="saveConnection">
      <label>WebSocket URL <input v-model.trim="connection.url" placeholder="ws://cc24:8080" required></label>
      <label>ユーザー名 <input v-model="connection.username" autocomplete="username"></label>
      <label>パスワード <input v-model="connection.password" type="password" autocomplete="new-password"
        :placeholder="state.password_set ? '設定済み' : ''"></label>
      <label>CAN ライン <input v-model="connection.lines" required placeholder="0, 1"></label>
      <button :disabled="busy || !nodeConnected">接続設定を保存</button>
    </form>
    <p role="status">{{ !nodeConnected ? 'Metis ノード未接続' : state.online ? 'iCS2 接続中' : state.error || 'iCS2 未接続' }}</p>
    <p v-if="feedback" role="status">{{ feedback }}</p>
    <section v-for="[group, rows] in groups" :key="group">
      <h3>{{ group }}</h3>
      <div style="overflow-x: auto">
        <table>
          <thead><tr>
            <th>チャンネル</th><th>電圧 設定 / 実測</th><th>電流 設定 / 実測</th>
            <th>出力 / ランプ / トリップ</th><th>操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" style="white-space: nowrap">
              <td>{{ row.settings.label || 'CH ' + row.channel }} <small>{{ row.serial || 'S/N 不明' }} · {{ row.location }}</small></td>
              <td>{{ display(row.items, 'Control.voltageSet') }} / {{ display(row.items, 'Status.voltageMeasure') }}</td>
              <td>{{ display(row.items, 'Control.currentSet') }} / {{ display(row.items, 'Status.currentMeasure') }}</td>
              <td>{{ flag(row.items, 'Status.on') }} / {{ flag(row.items, 'Status.voltageRamping') }} /
                {{ flag(row.items, 'Error.currentTrip') }}</td>
              <td><div style="display: flex; align-items: center; gap: .35rem">
                <form style="display: inline-flex; align-items: center; gap: .2rem; margin: 0" @submit.prevent="send(row, 'set_voltage', Number(drafts[row.key + 'v']))">
                  <label>V <input v-model="drafts[row.key + 'v']" type="number" step="any" required style="width: 5em"></label>
                  <button :disabled="busy || !nodeConnected || !state.online || !row.serial">設定</button>
                </form>
                <form style="display: inline-flex; align-items: center; gap: .2rem; margin: 0" @submit.prevent="send(row, 'set_current', Number(drafts[row.key + 'a']))">
                  <label>A <input v-model="drafts[row.key + 'a']" type="number" step="any" required style="width: 5em"></label>
                  <button :disabled="busy || !nodeConnected || !state.online || !row.serial">設定</button>
                </form>
                <button type="button" :disabled="busy || !nodeConnected || !state.online || !row.serial" @click="send(row, 'set_output', true)">ON</button>
                <button type="button" :disabled="busy || !nodeConnected || !state.online || !row.serial" @click="send(row, 'set_output', false)">OFF</button>
                <button type="button" :disabled="busy || !nodeConnected || !row.serial" @click="edit(row)">詳細</button>
                <span v-if="rowFeedback[row.key]" role="status">{{ rowFeedback[row.key] }}</span>
              </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <form v-if="selected" @submit.prevent="savePolicy">
      <h3>{{ selected.serial }} / CH {{ selected.channel }}</h3>
      <label>表示名 <input v-model="policy.label" maxlength="100"></label>
      <label>グループ <input v-model="policy.group" maxlength="100"></label>
      <label>最低電圧 (V) <input v-model="policy.voltage_min" type="number" step="any"></label>
      <label>最高電圧 (V) <input v-model="policy.voltage_max" type="number" step="any"></label>
      <label>最低電流 (A) <input v-model="policy.current_min" type="number" step="any"></label>
      <label>最高電流 (A) <input v-model="policy.current_max" type="number" step="any"></label>
      <button :disabled="busy || !nodeConnected">保存</button>
      <button type="button" @click="selected = null">閉じる</button>
    </form>
  </article>
</template>
