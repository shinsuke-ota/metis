import { ref as s, onMounted as a, onUnmounted as p, openBlock as f, createElementBlock as v, createElementVNode as n, toDisplayString as m, defineComponent as _, h as k } from "vue";
const b = { class: "clock" }, d = {
  __name: "Clock",
  props: {
    client: { type: Object, required: !0 }
  },
  setup(o) {
    const u = o, l = s("取得中"), e = s("接続を確認中");
    let c;
    async function i() {
      try {
        l.value = (await u.client.request("get_time")).time, e.value = "接続中";
      } catch {
        e.value = "取得できません";
      }
    }
    return a(() => {
      i(), c = u.client.subscribe("time", (t) => {
        t.time && (l.value = t.time), e.value = t.connected ? "接続中" : "切断中（最後に受信した値）";
      });
    }), p(() => c?.()), (t, r) => (f(), v("article", b, [
      r[0] || (r[0] = n("h2", null, "エッジの時刻", -1)),
      n("strong", null, m(l.value), 1),
      n("p", null, m(e.value), 1),
      n("button", {
        type: "button",
        onClick: i
      }, "エッジに現在時刻を問い合わせる")
    ]));
  }
};
function y(o) {
  return _({
    name: "ClockPlugin",
    setup() {
      return () => k(d, { client: o });
    }
  });
}
export {
  y as mount
};
