<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const count = ref(0);
const rate = ref(1);
const desiredRate = ref(1);
const connected = ref(false);
const error = ref('');
let stop;

async function setRate() {
  try {
    const result = await props.client.request('set_rate', { rate: Number(desiredRate.value) });
    rate.value = result.rate;
    error.value = '';
  } catch (cause) {
    error.value = `レートを設定できません: ${cause.message}`;
  }
}
async function reset() {
  try {
    count.value = (await props.client.request('reset')).count;
    error.value = '';
  } catch (cause) {
    error.value = `リセットできません: ${cause.message}`;
  }
}
onMounted(() => {
  stop = props.client.subscribe('count', value => {
    if (typeof value.count === 'number') count.value = value.count;
    if (typeof value.rate === 'number') {
      if (Number(desiredRate.value) === rate.value) desiredRate.value = value.rate;
      rate.value = value.rate;
    }
    connected.value = Boolean(value.connected);
  });
});
onUnmounted(() => stop?.());
</script>

<template>
  <article class="clock">
    <h2>Counter</h2>
    <strong>{{ count }}</strong>
    <p>設定レート: {{ rate }} 回/秒 · {{ connected ? '接続中' : '切断中' }}</p>
    <form @submit.prevent="setRate">
      <label>レート（回/秒） <input v-model.number="desiredRate" type="number" min="0" max="1000" step="any" required></label>
      <button type="submit">設定</button>
    </form>
    <p><button type="button" @click="reset">カウントをリセット</button></p>
    <p v-if="error" role="alert">{{ error }}</p>
  </article>
</template>
