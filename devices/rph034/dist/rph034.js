import { ref as a, onMounted as y, onUnmounted as C, openBlock as h, createElementBlock as d, createElementVNode as e, toDisplayString as s, Fragment as x, renderList as S, withModifiers as V, withDirectives as A, vModelText as B, createCommentVNode as H, defineComponent as M, h as F } from "vue";
const N = ["data-theme"], O = { class: "rph-header" }, U = {
  class: "rph-connection",
  role: "status"
}, q = {
  class: "rph-scroll",
  tabindex: "0",
  role: "region",
  "aria-label": "RPH-034 チャンネル"
}, D = { scope: "row" }, E = ["onSubmit"], I = ["onUpdate:modelValue", "aria-label", "placeholder", "disabled"], L = ["disabled"], P = { class: "rph-number" }, R = { class: "rph-number" }, T = {
  key: 0,
  role: "status"
}, j = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(v) {
    const p = v, o = a("dark"), u = a(!1), m = a(!1), b = a(Array.from({ length: 4 }, (t, n) => ({ channel: n + 1 }))), i = a({}), c = a(!1), r = a("");
    let _;
    async function g(t) {
      if (!(c.value || !u.value)) {
        c.value = !0, r.value = "";
        try {
          const { label: n } = await p.client.request("set_label", {
            channel: t.channel,
            label: i.value[t.channel] ?? t.label ?? ""
          });
          i.value[t.channel] = n, r.value = "表示名を保存しました。";
        } catch (n) {
          r.value = n.message;
        } finally {
          c.value = !1;
        }
      }
    }
    y(() => {
      o.value = localStorage.getItem("metis-rph034-theme") === "light" ? "light" : "dark", _ = p.client.subscribe("rph034", (t) => {
        u.value = !!t.connected, m.value = u.value && !!t.online, Array.isArray(t.channels) && (b.value = t.channels);
      });
    }), C(() => _?.());
    function k() {
      o.value = o.value === "dark" ? "light" : "dark", localStorage.setItem("metis-rph034-theme", o.value);
    }
    return (t, n) => (h(), d("section", {
      class: "rph-panel",
      "data-theme": o.value
    }, [
      e("header", O, [
        n[0] || (n[0] = e("h2", null, "RPH-034", -1)),
        e("button", {
          type: "button",
          onClick: k
        }, s(o.value === "dark" ? "ライトテーマ" : "ダークテーマ"), 1)
      ]),
      e("p", U, s(u.value ? m.value ? "電源接続中" : "電源との通信未設定" : "Metis ノード未接続"), 1),
      e("div", q, [
        e("table", null, [
          n[1] || (n[1] = e("thead", null, [
            e("tr", null, [
              e("th", { scope: "col" }, "チャンネル"),
              e("th", { scope: "col" }, "表示名"),
              e("th", { scope: "col" }, "実測電圧 (V)"),
              e("th", { scope: "col" }, "実測電流 (µA)"),
              e("th", { scope: "col" }, "出力")
            ])
          ], -1)),
          e("tbody", null, [
            (h(!0), d(x, null, S(b.value, (l) => (h(), d("tr", {
              key: l.channel
            }, [
              e("th", D, "CH " + s(l.channel), 1),
              e("td", null, [
                e("form", {
                  onSubmit: V((f) => g(l), ["prevent"])
                }, [
                  A(e("input", {
                    "onUpdate:modelValue": (f) => i.value[l.channel] = f,
                    "aria-label": "CH " + l.channel + " の表示名",
                    placeholder: l.label || "表示名",
                    maxlength: "100",
                    disabled: c.value || !u.value
                  }, null, 8, I), [
                    [B, i.value[l.channel]]
                  ]),
                  e("button", {
                    disabled: c.value || !u.value
                  }, "保存", 8, L)
                ], 40, E)
              ]),
              e("td", P, s(l.voltage ?? "—"), 1),
              e("td", R, s(l.current ?? "—"), 1),
              e("td", null, s(l.output == null ? "不明" : l.output ? "ON" : "OFF"), 1)
            ]))), 128))
          ])
        ])
      ]),
      r.value ? (h(), d("p", T, s(r.value), 1)) : H("", !0)
    ], 8, N));
  }
};
function z(v) {
  return M({
    setup() {
      return () => F(j, { client: v });
    }
  });
}
export {
  z as mount
};
