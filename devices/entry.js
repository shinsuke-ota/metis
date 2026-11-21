import { defineComponent, h } from 'vue';
import Contents from 'device-contents';

export function mount(client) {
  return defineComponent({
    setup() {
      return () => h(Contents, { client });
    },
  });
}
