import { defineComponent, h } from 'vue';
import CounterSummary from './CounterSummary.vue';

export function mount(client) {
  return defineComponent({
    name: 'CounterSummaryPlugin',
    setup() { return () => h(CounterSummary, { client }); },
  });
}
