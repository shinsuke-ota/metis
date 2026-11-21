import { createApp, h, ref, onUnmounted } from 'vue';

createApp({
  setup() {
    const devices = ref([]);
    const components = ref({});
    const selectedId = ref(null);
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      try {
        const response = await fetch('/api/devices');
        if (!response.ok) throw new Error(response.status);
        devices.value = await response.json();
        if (!devices.value.some(device => device.id === selectedId.value)) {
          selectedId.value = devices.value[0]?.id ?? null;
        }
        for (const device of devices.value) {
          if (!device.connected) continue;
          const key = `${device.id}:${device.plugin.revision}`;
          if (components.value[key]) continue;
          try {
            const module = await import(device.plugin.url);
            const base = `/api/devices/${encodeURIComponent(device.id)}`;
            const client = {
              async request(operation, parameters = {}) {
                const response = await fetch(`${base}/operations`, {
                  method: 'POST', headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({operation, parameters}),
                });
                if (!response.ok) {
                  const error = await response.json().catch(() => null);
                  throw new Error(typeof error?.detail === 'string' ? error.detail : `HTTP ${response.status}`);
                }
                return response.json();
              },
              subscribe(monitor, onValue) {
                const source = new EventSource(`${base}/monitors/${encodeURIComponent(monitor)}/events`);
                source.onmessage = (event) => onValue(JSON.parse(event.data));
                source.onerror = () => onValue({connected: false});
                return () => source.close();
              },
            };
            components.value = {...components.value, [key]: module.mount(client)};
          } catch (error) { console.error('Plugin load failed', device.id, error); }
        }
        const active = new Set(devices.value.map(d => `${d.id}:${d.plugin.revision}`));
        components.value = Object.fromEntries(
          Object.entries(components.value).filter(([key]) => active.has(key))
        );
      } catch (error) { console.error('Discovery failed', error); }
      finally { refreshing = false; }
    }
    refresh();
    const poll = setInterval(refresh, 3000);
    onUnmounted(() => clearInterval(poll));
    return () => {
      if (!devices.value.length) return h('p', 'デバイスの接続を待っています…');
      const selected = devices.value.find(device => device.id === selectedId.value) ?? devices.value[0];
      const key = `${selected.id}:${selected.plugin.revision}`;
      return h('section', [
        h('div', {class: 'device-tabs', role: 'tablist', 'aria-label': 'デバイス'},
          devices.value.map(device => h('button', {
            key: device.id,
            type: 'button',
            role: 'tab',
            id: `tab-${device.id}`,
            'aria-selected': device.id === selected.id,
            'aria-controls': 'device-panel',
            'data-state': device.state ?? 'unknown',
            onClick: () => { selectedId.value = device.id; },
          }, `${device.id} · ${device.connected ? (device.state ?? 'unknown') : '切断'}`))),
        h('div', {
          id: 'device-panel',
          class: 'device-panel',
          role: 'tabpanel',
          'aria-labelledby': `tab-${selected.id}`,
        }, !selected.connected
          ? [h('p', 'このノードとの接続が切れています。')]
          : components.value[key]
          ? [h(components.value[key], {key})]
          : [h('p', '画面を読み込み中')]),
      ]);
    };
  },
}).mount('#app');
