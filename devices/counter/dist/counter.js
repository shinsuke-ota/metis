import { ref as r, onMounted as C, onUnmounted as g, openBlock as d, createElementBlock as v, createElementVNode as t, toDisplayString as a, withModifiers as k, createTextVNode as x, withDirectives as N, vModelText as q, createCommentVNode as w, defineComponent as V, h as B } from "vue";
const M = { class: "clock" }, _ = {
  key: 0,
  role: "alert"
}, D = {
  __name: "Counter",
  props: { client: { type: Object, required: !0 } },
  setup(s) {
    const i = s, c = r(0), l = r(1), o = r(1), m = r(!1), u = r("");
    let p;
    async function b() {
      try {
        const e = await i.client.request("set_rate", { rate: Number(o.value) });
        l.value = e.rate, u.value = "";
      } catch (e) {
        u.value = `レートを設定できません: ${e.message}`;
      }
    }
    async function f() {
      try {
        c.value = (await i.client.request("reset")).count, u.value = "";
      } catch (e) {
        u.value = `リセットできません: ${e.message}`;
      }
    }
    return C(() => {
      p = i.client.subscribe("count", (e) => {
        typeof e.count == "number" && (c.value = e.count), typeof e.rate == "number" && (Number(o.value) === l.value && (o.value = e.rate), l.value = e.rate), m.value = !!e.connected;
      });
    }), g(() => p?.()), (e, n) => (d(), v("article", M, [
      n[3] || (n[3] = t("h2", null, "Counter", -1)),
      t("strong", null, a(c.value), 1),
      t("p", null, "設定レート: " + a(l.value) + " 回/秒 · " + a(m.value ? "接続中" : "切断中"), 1),
      t("form", {
        onSubmit: k(b, ["prevent"])
      }, [
        t("label", null, [
          n[1] || (n[1] = x("レート（回/秒） ", -1)),
          N(t("input", {
            "onUpdate:modelValue": n[0] || (n[0] = (y) => o.value = y),
            type: "number",
            min: "0",
            max: "1000",
            step: "any",
            required: ""
          }, null, 512), [
            [
              q,
              o.value,
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
      u.value ? (d(), v("p", _, a(u.value), 1)) : w("", !0)
    ]));
  }
};
function R(s) {
  return V({
    name: "CounterPlugin",
    setup() {
      return () => B(D, { client: s });
    }
  });
}
export {
  R as mount
};
