<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, useId } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const state = ref({ modules: [], policies: {} });
const connection = reactive({ url: '', username: '', password: '', lines: '0' });
const selected = ref(null);
const detailMode = ref(false);
const checked = ref([]);
const nameDrafts = reactive({});
const bulk = reactive({ voltage: false, current: false, grouping: false, naming: false, label: "",
  voltage_min: '', voltage_max: '', current_min: '', current_max: '', group: '' });
const policy = reactive({});
const drafts = reactive({});
const tripDrafts = reactive({});
const tripActions = {
  0: '動作なし', 1: 'CH OFF（ランプあり）', 2: 'CH OFF（ランプなし）',
  3: 'モジュール OFF（ランプなし）', 4: '遅延トリップ無効',
};
function tripAction(row) {
  const value = String(row.items['Setup.delayedTripAction']?.value);
  return Object.hasOwn(tripActions, value) ? value : '';
}
async function saveTripAction(row) {
  const value = tripDrafts[row.key];
  if (!tripAction(row) || value == null) return;
  if (await send(row, 'set_trip_action', Number(value))) delete tripDrafts[row.key];
}
const voltageFormat = new Intl.NumberFormat('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 4 });
const currentFormat = new Intl.NumberFormat('ja-JP', { minimumFractionDigits: 3, maximumFractionDigits: 6 });
const toVolts = { V: 1, kV: 1000 };
const toMilliamps = { kA: 1e6, A: 1000, mA: 1, 'µA': .001, 'μA': .001, uA: .001, nA: 1e-6 };
const amperes = value => Number(value) / 1000;
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
  set_trip_action: 'iseg 遅延トリップ設定',
  set_output: '出力切替',
};

function logOperation(operation, parameters) {
  const target = parameters.serial ? parameters.serial + ' / CH ' + parameters.channel : 'CC24';
  let action = operationLabels[operation] ?? operation;
  if (operation === 'configure_channels') action += ' ' + parameters.targets.length + ' CH';
  if (operation === 'set_voltage') action += ' ' + parameters.value + ' V';
  if (operation === 'set_current') action += ' ' + parameters.value + ' A';
  if (operation === 'set_trip_action') action += '：' + tripActions[parameters.value];
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
      const group = settings.group || '';
      if (!result.has(group)) result.set(group, []);
      result.get(group).push({
        key: serial + ':' + module.line + ':' + module.address + ':' + channel,
        serial, channel, items, settings, location: module.line + '/' + module.address + '/' + channel,
      });
    }
  }
  return result;
});

const tabsId = useId();
const selectedGroup = ref('');
const groupNames = computed(() => [...groups.value.keys()].filter(Boolean));
const activeGroup = computed(() => groupNames.value.includes(selectedGroup.value) ? selectedGroup.value : groupNames.value[0]);
const channelSections = computed(() => {
  const sections = [];
  if (activeGroup.value) sections.push({ key: 'group', label: activeGroup.value, rows: groups.value.get(activeGroup.value) });
  if (groups.value.has('')) sections.push({ key: 'unassigned', label: '未分類', rows: groups.value.get('') });
  return sections;
});
const activeTabIndex = computed(() => groupNames.value.indexOf(activeGroup.value));

function navigateGroups(event) {
  const count = groupNames.value.length;
  const index = activeTabIndex.value;
  const next = { ArrowLeft: (index - 1 + count) % count, ArrowRight: (index + 1) % count,
    Home: 0, End: count - 1 }[event.key];
  if (!Number.isInteger(next)) return;
  event.preventDefault();
  selectedGroup.value = groupNames.value[next];
  event.currentTarget.children[next]?.focus();
}

const allRows = computed(() => [...groups.value.values()].flat().filter(row => row.serial));
const checkedRows = computed(() => allRows.value.filter(row => checked.value.includes(row.key)));
function toggleAll(event) {
  checked.value = event.target.checked ? allRows.value.map(row => row.key) : [];
}

const editorFields = [
  { key: 'voltage', label: '電圧', unit: 'V' },
  { key: 'current', label: '電流', unit: 'mA' },
];
function hasLimits(row, quantity) {
  return row.settings[quantity + '_min'] != null && row.settings[quantity + '_max'] != null;
}
async function saveBulk() {
  const changes = {};
  for (const { key } of editorFields) {
    if (bulk[key]) {
      const parse = key === 'current' ? amperes : Number;
      changes[key + '_min'] = parse(bulk[key + '_min']);
      changes[key + '_max'] = parse(bulk[key + '_max']);
    }
  }
  if (bulk.grouping) changes.group = bulk.group;
  if (bulk.naming) changes.label = bulk.label;
  const targets = checkedRows.value.map(({ serial, channel }) => ({ serial, channel }));
  await request('configure_channels', { targets, changes }, targets.length + ' チャンネルに保存しました。');
}
function reading(items, key, factors, formatter) {
  const item = items[key];
  if (item?.value == null || (typeof item.value === 'string' && !item.value.trim())) return '—';
  const value = Number(item.value) * factors[item.unit];
  return Number.isFinite(value) ? formatter.format(value) : '—';
}
function voltage(items, key) {
  return reading(items, key, toVolts, voltageFormat);
}
function current(items, key) {
  return reading(items, key, toMilliamps, currentFormat);
}
function range(row, key) {
  if (!hasLimits(row, key)) return '未設定';
  const scale = key === 'current' ? 1000 : 1;
  const formatter = key === 'current' ? currentFormat : voltageFormat;
  return formatter.format(row.settings[key + '_min'] * scale) + ' ～ ' +
    formatter.format(row.settings[key + '_max'] * scale);
}
function flag(items, key) {
  const value = String(items[key]?.value).toLowerCase();
  if (['1', 'true'].includes(value)) return true;
  if (['0', 'false'].includes(value)) return false;
  return null;
}
function channelState(row) {
  if (!nodeConnected.value || !state.value.online || flag(row.items, 'Status.on') === null) return '不明';
  if (flag(row.items, 'Error.currentTrip')) return '異常';
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
  for (const key of ['label', 'group', 'voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    const value = row.settings[key];
    policy[key] = value != null && key.startsWith('current_') ? Number((value * 1000).toPrecision(15)) : value ?? '';
  }
}
async function savePolicy() {
  const changes = { ...policy };
  delete changes.label;
  for (const key of ['voltage_min', 'voltage_max', 'current_min', 'current_max']) {
    const parse = key.startsWith('current_') ? amperes : Number;
    changes[key] = changes[key] === '' ? null : parse(changes[key]);
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
  <article class="iseg-panel">
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
      全グループを選択
    </label>
    <div v-if="groupNames.length" class="iseg-group-tabs" role="tablist"
      aria-label="チャンネルグループ" @keydown="navigateGroups">
      <button v-for="(group, index) in groupNames" :id="tabsId + '-tab-' + index" :key="group"
        type="button" role="tab" :aria-selected="group === activeGroup" :aria-controls="tabsId + '-panel'"
        :tabindex="group === activeGroup ? 0 : -1" @click="selectedGroup = group">{{ group }}</button>
    </div>
    <template v-if="detailMode">
      <h3>選択チャンネルの一括設定</h3>
      <form class="iseg-bulk" @submit.prevent="saveBulk">
        <fieldset v-for="{key, label, unit} in editorFields" :key="key">
          <legend><label><input v-model="bulk[key]" type="checkbox"> {{ label }}の範囲を変更</label></legend>
          <label>下限 ({{ unit }}) <input v-model="bulk[key + '_min']" type="number" step="any"
            :disabled="!bulk[key]" :required="bulk[key]"></label>
          <label>上限 ({{ unit }}) <input v-model="bulk[key + '_max']" type="number" step="any"
            :disabled="!bulk[key]" :required="bulk[key]"></label>
        </fieldset>
        <fieldset>
          <legend><label><input v-model="bulk.grouping" type="checkbox"> グループを変更</label></legend>
          <input v-model="bulk.group" aria-label="グループ名" :disabled="!bulk.grouping"
            maxlength="100" placeholder="空欄で未分類">
        </fieldset>
        <fieldset>
          <legend><label><input v-model="bulk.naming" type="checkbox"> 表示名を変更</label></legend>
          <input v-model="bulk.label" aria-label="表示名" :disabled="!bulk.naming" maxlength="100">
        </fieldset>
        <button :disabled="busy || !nodeConnected || !checkedRows.length || !(bulk.voltage || bulk.current || bulk.grouping || bulk.naming)">
          選択した {{ checkedRows.length }} CH に適用
        </button>
      </form>
    </template>
    <p v-if="!detailMode">行の色：
      <span v-for="(color, label) in rowColors" :key="label"
        :style="{ background: color, padding: '.15rem .4rem', marginInlineEnd: '.25rem', border: '1px solid #bcc8cf' }">{{ label }}</span>
    </p>
    <component v-for="section in channelSections" :key="section.key"
      :is="section.key === 'unassigned' ? 'details' : 'section'"
      :class="{ 'iseg-unassigned': section.key === 'unassigned' }"
      :open="section.key === 'unassigned' ? true : undefined"
      :id="section.key === 'group' ? tabsId + '-panel' : undefined"
      :role="section.key === 'group' ? 'tabpanel' : undefined"
      :aria-labelledby="section.key === 'group' ? tabsId + '-tab-' + activeTabIndex : undefined">
      <summary v-if="section.key === 'unassigned'">未分類（{{ section.rows.length }} CH）</summary>
      <div v-if="detailMode" class="iseg-table-scroll" tabindex="0" role="region" :aria-label="section.label + ' チャンネル詳細'">
      <table class="iseg-data iseg-detail">
        <thead><tr>
          <th>選択</th><th>チャンネル</th><th>表示名</th><th>グループ</th><th>電圧範囲 (V)</th><th>電流範囲 (mA)</th><th>電流設定 (mA)</th><th>iseg 遅延トリップ</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-for="row in section.rows.filter(item => item.serial)" :key="row.key">
            <td><input v-model="checked" type="checkbox" :value="row.key"
              :aria-label="row.serial + ' CH ' + row.channel"></td>
            <td>CH {{ row.channel }}<small class="iseg-address">{{ row.serial }} · {{ row.location }}</small></td>
            <td><form @submit.prevent="saveName(row)">
              <input :aria-label="row.serial + ' CH ' + row.channel + ' 表示名'"
                :value="nameDrafts[row.key] ?? row.settings.label ?? ''"
                :disabled="busy || !nodeConnected" maxlength="100"
                @input="nameDrafts[row.key] = $event.target.value">
            </form><small v-if="rowFeedback[row.key]" role="status">{{ rowFeedback[row.key] }}</small></td>
            <td>{{ row.settings.group || '未分類' }}</td>
            <td v-for="{ key } in editorFields" :key="key">
              {{ range(row, key) }}
            </td>
            <td>
              <span class="iseg-number">{{ current(row.items, 'Control.currentSet') }}</span>
              <form class="iseg-setpoint" @submit.prevent="send(row, 'set_current', amperes(drafts[row.key + 'a']))">
                <input v-model="drafts[row.key + 'a']" type="number" step="any" required
                  :aria-label="(row.settings.label || 'CH ' + row.channel) + ' 電流設定 (mA)'">
                <button :disabled="busy || !nodeConnected || !state.online || !hasLimits(row, 'current')">設定</button>
              </form>
            </td>
            <td>
              <form v-if="tripAction(row)" class="iseg-setpoint" @submit.prevent="saveTripAction(row)">
                <select v-model="tripDrafts[row.key]" :aria-label="'CH ' + row.channel + ' iseg 遅延トリップ'">
                  <option :value="undefined">{{ tripActions[tripAction(row)] }}（現在）</option>
                  <option v-for="(label, value) in tripActions" :key="value" :value="value">{{ label }}</option>
                </select>
                <button :disabled="busy || !nodeConnected || !state.online || tripDrafts[row.key] == null">設定</button>
              </form>
              <span v-else>取得不可</span>
            </td>
            <td><button type="button" @click="edit(row)">編集</button></td>
          </tr>
        </tbody>
      </table>
      </div>
      <div v-else class="iseg-table-scroll" tabindex="0" role="region" :aria-label="section.label + ' モニター'">
        <table class="iseg-data iseg-monitor">
          <thead><tr>
            <th>選択</th><th>表示名</th>
            <th class="iseg-number">電圧設定 (V)</th><th class="iseg-number">電圧実測 (V)</th>
            <th class="iseg-number">電流設定 (mA)</th><th class="iseg-number">電流実測 (mA)</th>
            <th>電圧操作 (V)</th>
          </tr></thead>
          <tbody>
            <tr v-for="row in section.rows" :key="row.key"
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
              <td class="iseg-number">{{ voltage(row.items, 'Control.voltageSet') }}</td>
              <td class="iseg-number iseg-measured">{{ voltage(row.items, 'Status.voltageMeasure') }}</td>
              <td class="iseg-number">{{ current(row.items, 'Control.currentSet') }}</td>
              <td class="iseg-number iseg-measured">{{ current(row.items, 'Status.currentMeasure') }}</td>
              <td>
                <form class="iseg-setpoint" @submit.prevent="send(row, 'set_voltage', Number(drafts[row.key + 'v']))">
                  <input v-model="drafts[row.key + 'v']" type="number" step="any" required
                    :aria-label="(row.settings.label || 'CH ' + row.channel) + ' 電圧設定 (V)'">
                  <button :disabled="busy || !nodeConnected || !state.online || !row.serial || !hasLimits(row, 'voltage')">設定</button>
                </form>
                <small v-if="rowFeedback[row.key]" class="iseg-row-feedback" role="status">{{ rowFeedback[row.key] }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </component>
    <form v-if="selected && detailMode" class="iseg-editor" @submit.prevent="savePolicy">
      <h3>{{ selected.serial }} / CH {{ selected.channel }}</h3>
      <label>グループ <input v-model="policy.group" maxlength="100"></label>
      <label>最低電圧 (V) <input v-model="policy.voltage_min" type="number" step="any"></label>
      <label>最高電圧 (V) <input v-model="policy.voltage_max" type="number" step="any"></label>
      <label>最低電流 (mA) <input v-model="policy.current_min" type="number" step="any"></label>
      <label>最高電流 (mA) <input v-model="policy.current_max" type="number" step="any"></label>
      <button :disabled="busy || !nodeConnected">保存</button>
      <button type="button" @click="selected = null">閉じる</button>
    </form>
  </article>
</template>
