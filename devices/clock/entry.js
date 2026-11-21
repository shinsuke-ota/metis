import { defineComponent, h } from 'vue';
import Clock from './Clock.vue';

// Keep the host contract stable: module.mount(client) returns a Vue component.
export function mount(client) {
  return defineComponent({
    name: 'ClockPlugin',
    setup() {
      return () => h(Clock, { client });
    },
  });
}
