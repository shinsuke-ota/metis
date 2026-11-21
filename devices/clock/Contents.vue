<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  client: { type: Object, required: true },
});

const time = ref('取得中');
const status = ref('接続を確認中');
let stop;

async function getTime() {
  try {
    time.value = (await props.client.request('get_time')).time;
    status.value = '接続中';
  } catch {
    status.value = '取得できません';
  }
}

onMounted(() => {
  getTime();
  stop = props.client.subscribe('time', data => {
    if (data.time) time.value = data.time;
    status.value = data.connected ? '接続中' : '切断中（最後に受信した値）';
  });
});
onUnmounted(() => stop?.());
</script>

<template>
  <article class="clock">
    <h2>エッジの時刻</h2>
    <strong>{{ time }}</strong>
    <p>{{ status }}</p>
    <button type="button" @click="getTime">エッジに現在時刻を問い合わせる</button>
  </article>
</template>
