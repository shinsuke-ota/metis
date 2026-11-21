import { ref as a, onMounted as V, openBlock as u, createElementBlock as i, createElementVNode as l, createCommentVNode as k, withModifiers as q, createTextVNode as m, withDirectives as f, vModelText as x, Fragment as S, renderList as _, toDisplayString as n, vModelSelect as C, defineComponent as D, h as U } from "vue";
const J = ["disabled"], M = { key: 0 }, T = ["value"], B = ["disabled"], I = {
  key: 1,
  role: "status"
}, E = { style: { "overflow-x": "auto" } }, j = { key: 0 }, F = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(y) {
    const N = y, o = a({ sources: [], mappings: [] }), g = a(""), b = a(""), d = a(""), v = a(""), r = a(""), p = a(!1);
    async function c(s, e = {}) {
      p.value = !0, r.value = "";
      try {
        o.value = await N.client.request(s, e), s === "assign" && (r.value = "対応を登録しました。");
      } catch (t) {
        r.value = t.message;
      } finally {
        p.value = !1;
      }
    }
    function O() {
      const s = o.value.sources.find((e) => JSON.stringify(e) === d.value);
      s && c("assign", {
        experiment_id: g.value,
        logical_channel: b.value,
        namespace: s.namespace,
        source_key: s.source_key,
        valid_from: v.value ? new Date(v.value).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return V(() => c("list")), (s, e) => (u(), i("section", null, [
      e[11] || (e[11] = l("h2", null, "実験チャンネル対応", -1)),
      l("button", {
        type: "button",
        disabled: p.value,
        onClick: e[0] || (e[0] = (t) => c("list"))
      }, "測定元と対応を更新", 8, J),
      o.value.sources.length ? k("", !0) : (u(), i("p", M, "履歴 DB に測定元が登録されると選択できます。")),
      l("form", {
        style: { display: "flex", "flex-wrap": "wrap", gap: ".6rem", "align-items": "center", "margin-block": "1rem" },
        onSubmit: q(O, ["prevent"])
      }, [
        l("label", null, [
          e[5] || (e[5] = m("実験 ID ", -1)),
          f(l("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (t) => g.value = t),
            required: ""
          }, null, 512), [
            [
              x,
              g.value,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[6] || (e[6] = m("論理チャンネル ", -1)),
          f(l("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (t) => b.value = t),
            required: ""
          }, null, 512), [
            [
              x,
              b.value,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[8] || (e[8] = m("測定元 ", -1)),
          f(l("select", {
            "onUpdate:modelValue": e[3] || (e[3] = (t) => d.value = t),
            required: ""
          }, [
            e[7] || (e[7] = l("option", {
              value: "",
              disabled: ""
            }, "選択", -1)),
            (u(!0), i(S, null, _(o.value.sources, (t) => (u(), i("option", {
              key: JSON.stringify(t),
              value: JSON.stringify(t)
            }, n(t.namespace) + " / " + n(t.source_key), 9, T))), 128))
          ], 512), [
            [C, d.value]
          ])
        ]),
        l("label", null, [
          e[9] || (e[9] = m("開始日時（現地時刻、空欄は現在） ", -1)),
          f(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (t) => v.value = t),
            type: "datetime-local"
          }, null, 512), [
            [x, v.value]
          ])
        ]),
        l("button", {
          disabled: p.value || d.value === ""
        }, "登録", 8, B)
      ], 32),
      r.value ? (u(), i("p", I, n(r.value), 1)) : k("", !0),
      l("div", E, [
        o.value.mappings.length ? (u(), i("table", j, [
          e[10] || (e[10] = l("thead", null, [
            l("tr", null, [
              l("th", null, "実験"),
              l("th", null, "論理チャンネル"),
              l("th", null, "測定元"),
              l("th", null, "開始 (UTC)"),
              l("th", null, "終了 (UTC)")
            ])
          ], -1)),
          l("tbody", null, [
            (u(!0), i(S, null, _(o.value.mappings, (t) => (u(), i("tr", {
              key: JSON.stringify([t.experiment_id, t.logical_channel, t.valid_from])
            }, [
              l("td", null, n(t.experiment_id), 1),
              l("td", null, n(t.logical_channel), 1),
              l("td", null, n(t.namespace) + " / " + n(t.source_key), 1),
              l("td", null, n(t.valid_from), 1),
              l("td", null, n(t.valid_until ?? "—"), 1)
            ]))), 128))
          ])
        ])) : k("", !0)
      ])
    ]));
  }
};
function $(y) {
  return D({
    setup() {
      return () => U(F, { client: y });
    }
  });
}
export {
  $ as mount
};
