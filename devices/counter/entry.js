import { defineComponent, h } from 'vue';
import Counter from './Counter.vue';

export function mount(client) {
  return defineComponent({
    name: 'CounterPlugin',
    setup() { return () => h(Counter, { client }); },
  });
}
