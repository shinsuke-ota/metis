import { ref as s, onMounted as p, onUnmounted as a, openBlock as f, createElementBlock as v, createElementVNode as n, toDisplayString as m, defineComponent as _, h as b } from "vue";
const d = { class: "clock" }, y = {
  __name: "Contents",
  props: {
    client: { type: Object, required: !0 }
  },
  setup(o) {
    const c = o, u = s("取得中"), e = s("接続を確認中");
    let l;
    async function r() {
      try {
        u.value = (await c.client.request("get_time")).time, e.value = "接続中";
      } catch {
        e.value = "取得できません";
      }
    }
    return p(() => {
      r(), l = c.client.subscribe("time", (t) => {
        t.time && (u.value = t.time), e.value = t.connected ? "接続中" : "切断中（最後に受信した値）";
      });
    }), a(() => l?.()), (t, i) => (f(), v("article", d, [
      i[0] || (i[0] = n("h2", null, "エッジの時刻", -1)),
      n("strong", null, m(u.value), 1),
      n("p", null, m(e.value), 1),
      n("button", {
        type: "button",
        onClick: r
      }, "エッジに現在時刻を問い合わせる")
    ]));
  }
};
function k(o) {
  return _({
    setup() {
      return () => b(y, { client: o });
    }
  });
}
export {
  k as mount
};
