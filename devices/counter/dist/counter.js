import { ref as r, onMounted as g, onUnmounted as x, openBlock as d, createElementBlock as m, createElementVNode as n, createTextVNode as y, toDisplayString as s, createCommentVNode as b, withModifiers as C, withDirectives as N, vModelText as q, defineComponent as U, h as V } from "vue";
const B = { class: "clock" }, D = { key: 0 }, M = { style: { "overflow-wrap": "anywhere" } }, h = {
  key: 1,
  role: "alert"
}, E = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(a) {
    const i = a, c = r(0), l = r(1), u = r(1), v = r(!1), p = r(""), o = r("");
    let f;
    async function w() {
      try {
        const e = await i.client.request("set_rate", { rate: Number(u.value) });
        l.value = e.rate, o.value = "";
      } catch (e) {
        o.value = `レートを設定できません: ${e.message}`;
      }
    }
    async function _() {
      try {
        c.value = (await i.client.request("reset")).count, o.value = "";
      } catch (e) {
        o.value = `リセットできません: ${e.message}`;
      }
    }
    return g(() => {
      f = i.client.subscribe("count", (e) => {
        typeof e.instance_id == "string" && (p.value = e.instance_id), typeof e.count == "number" && (c.value = e.count), typeof e.rate == "number" && (Number(u.value) === l.value && (u.value = e.rate), l.value = e.rate), v.value = !!e.connected;
      });
    }), x(() => f?.()), (e, t) => (d(), m("article", B, [
      t[4] || (t[4] = n("h2", null, "Counter", -1)),
      p.value ? (d(), m("p", D, [
        t[1] || (t[1] = y("UUID ", -1)),
        n("code", M, s(p.value), 1)
      ])) : b("", !0),
      n("strong", null, s(c.value), 1),
      n("p", null, "設定レート: " + s(l.value) + " 回/秒 · " + s(v.value ? "接続中" : "切断中"), 1),
      n("form", {
        onSubmit: C(w, ["prevent"])
      }, [
        n("label", null, [
          t[2] || (t[2] = y("レート（回/秒） ", -1)),
          N(n("input", {
            "onUpdate:modelValue": t[0] || (t[0] = (k) => u.value = k),
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
        t[3] || (t[3] = n("button", { type: "submit" }, "設定", -1))
      ], 32),
      n("p", null, [
        n("button", {
          type: "button",
          onClick: _
        }, "カウントをリセット")
      ]),
      o.value ? (d(), m("p", h, s(o.value), 1)) : b("", !0)
    ]));
  }
};
function R(a) {
  return U({
    setup() {
      return () => V(E, { client: a });
    }
  });
}
export {
  R as mount
};
