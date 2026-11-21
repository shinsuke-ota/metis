<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const data = ref({ sources: [], mappings: [] });
const experiment = ref('');
const logical = ref('');
const selected = ref('');
const starts = ref('');
const message = ref('');
const busy = ref(false);

async function request(operation, parameters = {}) {
  busy.value = true;
  message.value = '';
  try {
    data.value = await props.client.request(operation, parameters);
    if (operation === 'assign') message.value = '対応を登録しました。';
  } catch (error) {
    message.value = error.message;
  } finally {
    busy.value = false;
  }
}
function save() {
  const source = data.value.sources.find(item => JSON.stringify(item) === selected.value);
  if (!source) return;
  request('assign', {
    experiment_id: experiment.value, logical_channel: logical.value,
    namespace: source.namespace, source_key: source.source_key,
    valid_from: starts.value ? new Date(starts.value).toISOString() : new Date().toISOString(),
  });
}
onMounted(() => request('list'));
</script>

<template>
  <section>
    <h2>実験チャンネル対応</h2>
    <button type="button" :disabled="busy" @click="request('list')">測定元と対応を更新</button>
    <p v-if="!data.sources.length">履歴 DB に測定元が登録されると選択できます。</p>
    <form style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;margin-block:1rem" @submit.prevent="save">
      <label>実験 ID <input v-model.trim="experiment" required></label>
      <label>論理チャンネル <input v-model.trim="logical" required></label>
      <label>測定元
        <select v-model="selected" required>
          <option value="" disabled>選択</option>
          <option v-for="source in data.sources" :key="JSON.stringify(source)" :value="JSON.stringify(source)">
            {{ source.namespace }} / {{ source.source_key }}
          </option>
        </select>
      </label>
      <label>開始日時（現地時刻、空欄は現在） <input v-model="starts" type="datetime-local"></label>
      <button :disabled="busy || selected === ''">登録</button>
    </form>
    <p v-if="message" role="status">{{ message }}</p>
    <div style="overflow-x:auto">
      <table v-if="data.mappings.length">
        <thead><tr><th>実験</th><th>論理チャンネル</th><th>測定元</th><th>開始 (UTC)</th><th>終了 (UTC)</th></tr></thead>
        <tbody>
          <tr v-for="row in data.mappings" :key="JSON.stringify([row.experiment_id,row.logical_channel,row.valid_from])">
            <td>{{ row.experiment_id }}</td><td>{{ row.logical_channel }}</td>
            <td>{{ row.namespace }} / {{ row.source_key }}</td><td>{{ row.valid_from }}</td>
            <td>{{ row.valid_until ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
