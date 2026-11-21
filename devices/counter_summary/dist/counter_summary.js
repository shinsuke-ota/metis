import { ref as s, onMounted as A, onUnmounted as U, openBlock as r, createElementBlock as i, createElementVNode as t, createCommentVNode as y, Fragment as g, renderList as w, createTextVNode as d, toDisplayString as o, withModifiers as x, withDirectives as v, vModelText as p, defineComponent as B, h as D } from "vue";
const M = { class: "clock summary" }, N = { key: 0 }, S = ["data-state"], z = ["onClick"], E = { key: 0 }, T = {
  key: 1,
  role: "alert"
}, Z = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(f) {
    const c = f, m = s([]), b = s([]), u = s({ device_id: "", label: "", monitor: "count", count_field: "count", rate_field: "rate" }), a = s(""), k = s(!1);
    let C;
    async function V(n) {
      try {
        await c.client.request("configure", { sources: n }), m.value = n, a.value = "";
      } catch (e) {
        a.value = `登録できません: ${e.message}`;
      }
    }
    async function _() {
      const n = u.value.device_id.trim();
      if (!n) return;
      const e = { ...u.value, device_id: n, label: u.value.label.trim() || n };
      await V([...m.value, e]), a.value || (u.value = { device_id: "", label: "", monitor: "count", count_field: "count", rate_field: "rate" });
    }
    function q(n) {
      V(m.value.filter((e) => e.device_id !== n));
    }
    return A(() => {
      C = c.client.subscribe("summary", (n) => {
        Array.isArray(n.sources) && (m.value = n.sources), Array.isArray(n.items) && (b.value = n.items), k.value = !!n.connected;
      });
    }), U(() => C?.()), (n, e) => (r(), i("article", M, [
      e[13] || (e[13] = t("h2", null, "Counter Summary", -1)),
      k.value ? y("", !0) : (r(), i("p", N, "集約ノードとの接続を確認中です。")),
      t("table", null, [
        e[6] || (e[6] = t("thead", null, [
          t("tr", null, [
            t("th", null, "デバイス"),
            t("th", null, "接続"),
            t("th", null, "状態"),
            t("th", null, "カウント"),
            t("th", null, "設定レート（回/秒）"),
            t("th")
          ])
        ], -1)),
        t("tbody", null, [
          (r(!0), i(g, null, w(b.value, (l) => (r(), i("tr", {
            key: l.device_id
          }, [
            t("td", null, [
              d(o(l.label) + " ", 1),
              t("small", null, "(" + o(l.device_id) + ")", 1)
            ]),
            t("td", null, o(l.connected ? "接続中" : "未接続・切断"), 1),
            t("td", {
              "data-state": l.state
            }, o(l.state), 9, S),
            t("td", null, o(l.count ?? "—"), 1),
            t("td", null, o(l.rate ?? "—"), 1),
            t("td", null, [
              t("button", {
                type: "button",
                onClick: ($) => q(l.device_id)
              }, "解除", 8, z)
            ])
          ]))), 128)),
          b.value.length ? y("", !0) : (r(), i("tr", E, [...e[5] || (e[5] = [
            t("td", { colspan: "6" }, "集約対象を登録してください。", -1)
          ])]))
        ])
      ]),
      e[14] || (e[14] = t("h3", null, "集約対象を追加", -1)),
      t("form", {
        onSubmit: x(_, ["prevent"])
      }, [
        t("label", null, [
          e[7] || (e[7] = d("デバイス ID ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (l) => u.value.device_id = l),
            required: "",
            placeholder: "例：C2:C21",
            pattern: "[A-Za-z0-9_\\-]{1,100}(?::[A-Za-z0-9_\\-]{1,100})?"
          }, null, 512), [
            [p, u.value.device_id]
          ])
        ]),
        t("label", null, [
          e[8] || (e[8] = d("表示名 ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => u.value.label = l)
          }, null, 512), [
            [p, u.value.label]
          ])
        ]),
        t("label", null, [
          e[9] || (e[9] = d("監視名 ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => u.value.monitor = l),
            required: ""
          }, null, 512), [
            [p, u.value.monitor]
          ])
        ]),
        t("label", null, [
          e[10] || (e[10] = d("カウントのキー ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => u.value.count_field = l),
            required: ""
          }, null, 512), [
            [p, u.value.count_field]
          ])
        ]),
        t("label", null, [
          e[11] || (e[11] = d("レートのキー ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => u.value.rate_field = l),
            required: ""
          }, null, 512), [
            [p, u.value.rate_field]
          ])
        ]),
        e[12] || (e[12] = t("button", { type: "submit" }, "登録", -1))
      ], 32),
      a.value ? (r(), i("p", T, o(a.value), 1)) : y("", !0)
    ]));
  }
};
function F(f) {
  return B({
    setup() {
      return () => D(Z, { client: f });
    }
  });
}
export {
  F as mount
};
