<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const state = ref({ modules: [], policies: {} });
const connection = reactive({ url: '', username: '', password: '', lines: '0' });
const selected = ref(null);
const detailMode = ref(false);
const checked = ref([]);
const nameDrafts = reactive({});
const bulk = reactive({ voltage: false, current: false, grouping: false, naming: false, action: false, label: "", current_action: "none",
  voltage_min: '', voltage_max: '', current_min: '', current_max: '', group: '' });
const policy = reactive({});
const drafts = reactive({});
const feedback = ref('');
const logDialog = ref(null);
const operationLog = ref([]);
let logSequence = 0;
const operationLabels = {
  configure: '接続設定の保存',
  configure_channel: 'チャンネル設定の保存',
  configure_channels: 'チャンネル一括設定',
  set_voltage: '電圧設定',
  set_current: '電流設定',
  set_output: '出力切替',
};

function logOperation(operation, parameters) {
  const target = parameters.serial ? parameters.serial + ' / CH ' + parameters.channel : 'CC24';
  let action = operationLabels[operation] ?? operation;
  if (operation === 'configure_channels') action += ' ' + parameters.targets.length + ' CH';
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
        key: serial + ':' + module.line + ':' + module.address + ':' + channel,
        serial, channel, items, settings, location: module.line + '/' + module.address + '/' + channel,
      });
    }
  }
  return result;
});

const allRows = computed(() => [...groups.value.values()].flat().filter(row => row.serial));
const checkedRows = computed(() => allRows.value.filter(row => checked.value.includes(row.key)));
function toggleAll(event) {
  checked.value = event.target.checked ? allRows.value.map(row => row.key) : [];
}

const editorFields = [
  { key: 'voltage', label: '電圧', unit: 'V' },
  { key: 'current', label: '電流', unit: 'A' },
];
function hasLimits(row, quantity) {
  return row.settings[quantity + '_min'] != null && row.settings[quantity + '_max'] != null;
}
async function saveBulk() {
  const changes = {};
  for (const { key } of editorFields) {
    if (bulk[key]) {
      changes[key + '_min'] = Number(bulk[key + '_min']);
      changes[key + '_max'] = Number(bulk[key + '_max']);
    }
  }
  if (bulk.grouping) changes.group = bulk.group;
  if (bulk.naming) changes.label = bulk.label;
  if (bulk.action) changes.current_action = bulk.current_action;
  const targets = checkedRows.value.map(({ serial, channel }) => ({ serial, channel }));
  await request('configure_channels', { targets, changes }, targets.length + ' チャンネルに保存しました。');
}
function display(items, key) {
  const item = items[key];
  return item ? String(item.value) + (item.unit ? ' ' + item.unit : '') : '—';
}
function flag(items, key) {
  const value = String(items[key]?.value).toLowerCase();
  if (['1', 'true'].includes(value)) return true;
  if (['0', 'false'].includes(value)) return false;
  return null;
}
function channelState(row) {
  if (!nodeConnected.value || !state.value.online || flag(row.items, 'Status.on') === null) return '不明';
  if (state.value.overcurrent?.[row.serial + ':' + row.channel] || flag(row.items, 'Error.currentTrip')) return '異常';
  if (flag(row.items, 'Status.voltageRamping')) return 'ランプ中';
  return flag(row.items, 'Status.on') ? 'ON' : 'OFF';
}
const rowColors = { 不明: '#edf1f5', 異常: '#fbe0de', ランプ中: '#fff0cb', ON: '#dcf2e4', OFF: '#fff' };

function canToggle(row) {
  const output = flag(row.items, 'Status.on');
  return !busy.value && nodeConnected.value && state.value.online && row.serial && output !== null &&
    (output || (hasLimits(row, 'voltage') && hasLimits(row, 'current')));
}
function toggleOutput(row) {
  if (canToggle(row)) send(row, 'set_output', !flag(row.items, 'Status.on'));
}
async function saveName(row) {
  const label = nameDrafts[row.key];
  if (label === undefined) return;
  if (await request('configure_channels', {
    targets: [{ serial: row.serial, channel: row.channel }], changes: { label },
  }, '表示名を保存しました。', row.key)) {
    delete nameDrafts[row.key];
  }
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
  detailMode.value = true;
  selected.value = row;
  policy.current_action = row.settings.current_action ?? 'none';
  for (const key of ['label', 'group', 'voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    policy[key] = row.settings[key] ?? '';
  }
}
async function savePolicy() {
  const changes = { ...policy };
  delete changes.label;
  for (const key of ['voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    changes[key] = changes[key] === '' ? null : Number(changes[key]);
  }
  if (await request('configure_channels', {
    targets: [{ serial: selected.value.serial, channel: selected.value.channel }], changes,
  }, 'チャンネル設定を保存しました。')) selected.value = null;
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
    <div style="display: inline-flex; align-items: center; gap: .5rem">
      <span>モニター</span>
      <button type="button" role="switch" aria-label="詳細モード" :aria-checked="detailMode"
        @click="detailMode = !detailMode; selected = null"
        :style="{ width: '2.75rem', height: '1.5rem', padding: '.15rem', border: 0, borderRadius: '1rem',
          display: 'inline-flex', alignItems: 'center', justifyContent: detailMode ? 'flex-end' : 'flex-start',
          background: detailMode ? '#145375' : '#627786' }">
        <span aria-hidden="true" style="width: 1.2rem; height: 1.2rem; border-radius: 50%; background: white"></span>
      </button>
      <span>詳細</span>
    </div>
    <label style="margin-inline-start: 1rem">
      <input type="checkbox" :disabled="!allRows.length" @change="toggleAll"
        :checked="allRows.length > 0 && checkedRows.length === allRows.length"
        :indeterminate.prop="checkedRows.length > 0 && checkedRows.length < allRows.length">
      全選択
    </label>
    <template v-if="detailMode">
      <h3>選択チャンネルの一括設定</h3>
      <form @submit.prevent="saveBulk">
        <fieldset v-for="{key, label, unit} in editorFields" :key="key">
          <legend><label><input v-model="bulk[key]" type="checkbox"> {{ label }}の範囲を変更</label></legend>
          <label>下限 ({{ unit }}) <input v-model="bulk[key + '_min']" type="number" step="any"
            :disabled="!bulk[key]" :required="bulk[key]"></label>
          <label>上限 ({{ unit }}) <input v-model="bulk[key + '_max']" type="number" step="any"
            :disabled="!bulk[key]" :required="bulk[key]"></label>
        </fieldset>
        <label><input v-model="bulk.grouping" type="checkbox"> グループを変更</label>
        <input v-model="bulk.group" aria-label="グループ名" :disabled="!bulk.grouping"
          maxlength="100" placeholder="空欄で未分類">
        <label><input v-model="bulk.naming" type="checkbox"> 表示名を変更</label>
        <input v-model="bulk.label" aria-label="表示名" :disabled="!bulk.naming" maxlength="100">
        <label><input v-model="bulk.action" type="checkbox"> 電流上限超過時の動作を変更</label>
        <select v-model="bulk.current_action" aria-label="電流上限超過時の動作" :disabled="!bulk.action">
          <option value="none">動作なし</option><option value="warn">警告</option><option value="off">出力 OFF</option>
        </select>
        <button :disabled="busy || !nodeConnected || !checkedRows.length || !(bulk.voltage || bulk.current || bulk.grouping || bulk.naming || bulk.action)">
          選択した {{ checkedRows.length }} CH に適用
        </button>
      </form>
      <table style="text-align: left">
        <thead><tr>
          <th>選択</th><th>チャンネル</th><th>表示名</th><th>グループ</th><th>電圧範囲 (V)</th><th>電流範囲 (A)</th><th>電流超過時</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-for="row in allRows" :key="row.key">
            <td><input v-model="checked" type="checkbox" :value="row.key"
              :aria-label="row.serial + ' CH ' + row.channel"></td>
            <td>{{ 'CH ' + row.channel }} · {{ row.serial }} / {{ row.location }}</td>
            <td><form @submit.prevent="saveName(row)">
              <input :aria-label="row.serial + ' CH ' + row.channel + ' 表示名'"
                :value="nameDrafts[row.key] ?? row.settings.label ?? ''"
                :disabled="busy || !nodeConnected" maxlength="100"
                @input="nameDrafts[row.key] = $event.target.value">
            </form><small v-if="rowFeedback[row.key]" role="status">{{ rowFeedback[row.key] }}</small></td>
            <td>{{ row.settings.group || '未分類' }}</td>
            <td v-for="{ key } in editorFields" :key="key">
              {{ hasLimits(row, key) ? row.settings[key + '_min'] + ' ～ ' + row.settings[key + '_max'] : '未設定' }}
            </td>
            <td>{{ ({ warn: '警告', off: '出力 OFF' })[row.settings.current_action] || '動作なし' }}</td>
            <td><button type="button" @click="edit(row)">編集</button></td>
          </tr>
        </tbody>
      </table>
    </template>
    <p v-if="!detailMode">行の色：
      <span v-for="(color, label) in rowColors" :key="label"
        :style="{ background: color, padding: '.15rem .4rem', marginInlineEnd: '.25rem', border: '1px solid #bcc8cf' }">{{ label }}</span>
    </p>
    <section v-for="[group, rows] in (detailMode ? [] : groups)" :key="group">
      <h3>{{ group }}</h3>
      <div style="overflow-x: auto">
        <table>
          <thead><tr>
            <th>選択</th><th>表示名</th><th>電圧 設定 / 実測</th><th>電流 設定 / 実測</th><th>設定</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key"
              :style="{ background: rowColors[channelState(row)], whiteSpace: 'nowrap' }">
              <td><input v-model="checked" type="checkbox" :value="row.key" :disabled="!row.serial"
                :aria-label="'選択: ' + (row.settings.label || 'CH ' + row.channel)"></td>
              <td>
                <button type="button" :disabled="!canToggle(row)" @click="toggleOutput(row)"
                  :aria-label="(row.settings.label || 'CH ' + row.channel) + '、状態: ' + channelState(row)"
                  :title="channelState(row) + (canToggle(row) ? '。クリックで出力切替' : '')">
                  {{ row.settings.label || 'CH ' + row.channel }}
                </button>
              </td>
              <td>{{ display(row.items, 'Control.voltageSet') }} / {{ display(row.items, 'Status.voltageMeasure') }}</td>
              <td>{{ display(row.items, 'Control.currentSet') }} / {{ display(row.items, 'Status.currentMeasure') }}</td>
              <td><div style="display: flex; align-items: center; gap: .35rem">
                <form style="display: inline-flex; align-items: center; gap: .2rem; margin: 0" @submit.prevent="send(row, 'set_voltage', Number(drafts[row.key + 'v']))">
                  <label>V <input v-model="drafts[row.key + 'v']" type="number" step="any" required style="width: 5em"></label>
                  <button :disabled="busy || !nodeConnected || !state.online || !row.serial || !hasLimits(row, 'voltage')">設定</button>
                </form>
                <form style="display: inline-flex; align-items: center; gap: .2rem; margin: 0" @submit.prevent="send(row, 'set_current', Number(drafts[row.key + 'a']))">
                  <label>A <input v-model="drafts[row.key + 'a']" type="number" step="any" required style="width: 5em"></label>
                  <button :disabled="busy || !nodeConnected || !state.online || !row.serial || !hasLimits(row, 'current')">設定</button>
                </form>
                <span v-if="state.overcurrent?.[row.serial + ':' + row.channel]" role="status">
                  {{ state.overcurrent[row.serial + ':' + row.channel] }}
                </span>
                <span v-if="rowFeedback[row.key]" role="status">{{ rowFeedback[row.key] }}</span>
              </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <form v-if="selected && detailMode" @submit.prevent="savePolicy">
      <h3>{{ selected.serial }} / CH {{ selected.channel }}</h3>
      <label>グループ <input v-model="policy.group" maxlength="100"></label>
      <label>最低電圧 (V) <input v-model="policy.voltage_min" type="number" step="any"></label>
      <label>最高電圧 (V) <input v-model="policy.voltage_max" type="number" step="any"></label>
      <label>最低電流 (A) <input v-model="policy.current_min" type="number" step="any"></label>
      <label>最高電流 (A) <input v-model="policy.current_max" type="number" step="any"></label>
      <label>電流上限超過時の動作
        <select v-model="policy.current_action">
          <option value="none">動作なし</option><option value="warn">警告</option><option value="off">出力 OFF</option>
        </select>
      </label>
      <button :disabled="busy || !nodeConnected">保存</button>
      <button type="button" @click="selected = null">閉じる</button>
    </form>
  </article>
</template>
