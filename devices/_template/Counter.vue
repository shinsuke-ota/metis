<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true } });
const count = ref(0);
let stop;

async function increment() {
  count.value = (await props.client.request('increment')).count;
}
onMounted(() => {
  stop = props.client.subscribe('count', value => {
    if (typeof value.count === 'number') count.value = value.count;
  });
});
onUnmounted(() => stop?.());
</script>

<template>
  <article class="clock">
    <h2>Example Counter</h2>
    <strong>{{ count }}</strong>
    <p><button type="button" @click="increment">Increment</button></p>
  </article>
</template>
