import { ref as r, onMounted as k, onUnmounted as x, openBlock as d, createElementBlock as v, createElementVNode as t, toDisplayString as a, withModifiers as C, createTextVNode as N, withDirectives as g, vModelText as q, createCommentVNode as w, defineComponent as V, h as B } from "vue";
const M = { class: "clock" }, _ = {
  key: 0,
  role: "alert"
}, D = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(s) {
    const c = s, i = r(0), l = r(1), u = r(1), m = r(!1), o = r("");
    let p;
    async function b() {
      try {
        const e = await c.client.request("set_rate", { rate: Number(u.value) });
        l.value = e.rate, o.value = "";
      } catch (e) {
        o.value = `レートを設定できません: ${e.message}`;
      }
    }
    async function f() {
      try {
        i.value = (await c.client.request("reset")).count, o.value = "";
      } catch (e) {
        o.value = `リセットできません: ${e.message}`;
      }
    }
    return k(() => {
      p = c.client.subscribe("count", (e) => {
        typeof e.count == "number" && (i.value = e.count), typeof e.rate == "number" && (Number(u.value) === l.value && (u.value = e.rate), l.value = e.rate), m.value = !!e.connected;
      });
    }), x(() => p?.()), (e, n) => (d(), v("article", M, [
      n[3] || (n[3] = t("h2", null, "Counter", -1)),
      t("strong", null, a(i.value), 1),
      t("p", null, "設定レート: " + a(l.value) + " 回/秒 · " + a(m.value ? "接続中" : "切断中"), 1),
      t("form", {
        onSubmit: C(b, ["prevent"])
      }, [
        t("label", null, [
          n[1] || (n[1] = N("レート（回/秒） ", -1)),
          g(t("input", {
            "onUpdate:modelValue": n[0] || (n[0] = (y) => u.value = y),
            type: "number",
            min: "0",
            max: "1000",
            step: "any",
            required: ""
          }, null, 512), [
            [
              q,
              u.value,
              void 0,
              { number: !0 }
            ]
          ])
        ]),
        n[2] || (n[2] = t("button", { type: "submit" }, "設定", -1))
      ], 32),
      t("p", null, [
        t("button", {
          type: "button",
          onClick: f
        }, "カウントをリセット")
      ]),
      o.value ? (d(), v("p", _, a(o.value), 1)) : w("", !0)
    ]));
  }
};
function R(s) {
  return V({
    setup() {
      return () => B(D, { client: s });
    }
  });
}
export {
  R as mount
};
