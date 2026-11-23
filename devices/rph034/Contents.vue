<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const theme = ref('dark');
const connected = ref(false);
const online = ref(false);
const channels = ref(Array.from({ length: 4 }, (_, index) => ({ channel: index + 1 })));
const drafts = ref({});
const busy = ref(false);
const message = ref('');
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
  theme.value = localStorage.getItem('metis-rph034-theme') === 'light' ? 'light' : 'dark';
  unsubscribe = props.client.subscribe('rph034', payload => {
    connected.value = Boolean(payload.connected);
    online.value = connected.value && Boolean(payload.online);
    if (Array.isArray(payload.channels)) channels.value = payload.channels;
  });
});
onUnmounted(() => unsubscribe?.());

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('metis-rph034-theme', theme.value);
}
</script>

<template>
  <section class="rph-panel" :data-theme="theme">
    <header class="rph-header">
      <h2>RPH-034</h2>
      <button type="button" @click="toggleTheme">{{ theme === 'dark' ? 'ライトテーマ' : 'ダークテーマ' }}</button>
    </header>
    <p class="rph-connection" role="status">
      {{ !connected ? 'Metis ノード未接続' : online ? '電源接続中' : '電源との通信未設定' }}
    </p>
    <div class="rph-scroll" tabindex="0" role="region" aria-label="RPH-034 チャンネル">
      <table>
        <thead><tr><th scope="col">チャンネル</th><th scope="col">表示名</th><th scope="col">実測電圧 (V)</th>
          <th scope="col">実測電流 (µA)</th><th scope="col">出力</th></tr></thead>
        <tbody>
          <tr v-for="row in channels" :key="row.channel">
            <th scope="row">CH {{ row.channel }}</th>
            <td>
              <form @submit.prevent="saveLabel(row)">
                <input v-model="drafts[row.channel]" :aria-label="'CH ' + row.channel + ' の表示名'"
                  :placeholder="row.label || '表示名'" maxlength="100" :disabled="busy || !connected">
                <button :disabled="busy || !connected">保存</button>
              </form>
            </td>
            <td class="rph-number">{{ row.voltage ?? '—' }}</td>
            <td class="rph-number">{{ row.current ?? '—' }}</td>
            <td>{{ row.output == null ? '不明' : row.output ? 'ON' : 'OFF' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
  </section>
</template>
