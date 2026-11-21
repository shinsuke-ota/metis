<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const sources = ref([]);
const items = ref([]);
const draft = ref({ device_id: '', label: '', monitor: 'count', count_field: 'count', rate_field: 'rate' });
const error = ref('');
const connected = ref(false);
let stop;

async function save(next) {
  try {
    await props.client.request('configure', { sources: next });
    sources.value = next;
    error.value = '';
  } catch (cause) {
    error.value = `登録できません: ${cause.message}`;
  }
}
async function add() {
  const device_id = draft.value.device_id.trim();
  if (!device_id) return;
  const entry = { ...draft.value, device_id, label: draft.value.label.trim() || device_id };
  await save([...sources.value, entry]);
  if (!error.value) draft.value = { device_id: '', label: '', monitor: 'count', count_field: 'count', rate_field: 'rate' };
}
function remove(device_id) {
  save(sources.value.filter(source => source.device_id !== device_id));
}
onMounted(() => {
  stop = props.client.subscribe('summary', value => {
    if (Array.isArray(value.sources)) sources.value = value.sources;
    if (Array.isArray(value.items)) items.value = value.items;
    connected.value = Boolean(value.connected);
  });
});
onUnmounted(() => stop?.());
</script>

<template>
  <article class="clock summary">
    <h2>Counter Summary</h2>
    <p v-if="!connected">集約ノードとの接続を確認中です。</p>
    <table>
      <thead><tr><th>デバイス</th><th>接続</th><th>状態</th><th>カウント</th><th>設定レート（回/秒）</th><th></th></tr></thead>
      <tbody>
        <tr v-for="item in items" :key="item.device_id">
          <td>{{ item.label }} <small>({{ item.device_id }})</small></td>
          <td>{{ item.connected ? '接続中' : '未接続・切断' }}</td>
          <td :data-state="item.state">{{ item.state }}</td>
          <td>{{ item.count ?? '—' }}</td>
          <td>{{ item.rate ?? '—' }}</td>
          <td><button type="button" @click="remove(item.device_id)">解除</button></td>
        </tr>
        <tr v-if="!items.length"><td colspan="6">集約対象を登録してください。</td></tr>
      </tbody>
    </table>
    <h3>集約対象を追加</h3>
    <form @submit.prevent="add">
      <label>Device ID <input v-model="draft.device_id" required pattern="[A-Za-z0-9_-]{1,100}"></label>
      <label>表示名 <input v-model="draft.label"></label>
      <label>監視名 <input v-model="draft.monitor" required></label>
      <label>カウントのキー <input v-model="draft.count_field" required></label>
      <label>レートのキー <input v-model="draft.rate_field" required></label>
      <button type="submit">登録</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
  </article>
</template>

