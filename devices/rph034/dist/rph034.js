import { ref as s, useId as $, onMounted as A, onUnmounted as E, openBlock as i, createElementBlock as r, createElementVNode as e, toDisplayString as a, normalizeClass as B, Fragment as _, renderList as I, createCommentVNode as N, unref as P, withModifiers as S, createTextVNode as q, withDirectives as D, vModelText as M, defineComponent as L, h as j } from "vue";
const z = ["data-theme"], G = { class: "hv-toolbar" }, J = { class: "hv-actions" }, K = ["data-online"], Q = { class: "rph-mode" }, W = ["aria-checked"], X = {
  class: "rph-scroll",
  tabindex: "0",
  role: "region",
  "aria-label": "RPH-034 チャンネル"
}, Y = { key: 0 }, Z = { key: 1 }, w = ["data-state"], ee = { scope: "row" }, te = { scope: "row" }, le = { class: "rph-number" }, ne = { class: "rph-number rph-measured" }, ae = { class: "rph-number" }, se = { class: "rph-number rph-measured" }, oe = ["disabled", "onClick"], ue = {
  key: 0,
  role: "status"
}, ie = ["aria-labelledby"], re = { class: "hv-toolbar" }, ce = ["id"], de = ["disabled"], ve = ["onSubmit"], he = ["value", "aria-label", "disabled", "onInput"], pe = ["disabled"], be = {
  key: 0,
  role: "status"
}, me = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(g) {
    const h = g, v = s("dark"), d = s(!1), k = s(null), H = $(), c = s(!1), p = s(!1), y = s(Array.from({ length: 4 }, (n, t) => ({ channel: t + 1 }))), b = s({}), o = s(!1), u = s(""), x = s(""), m = s(""), f = s(4660), F = s("");
    async function V() {
      o.value = !0;
      try {
        await h.client.request("configure", { host: m.value, port: Number(f.value) }), u.value = "接続設定を保存しました。";
      } catch (n) {
        u.value = n.message;
      } finally {
        o.value = !1;
      }
    }
    async function R(n) {
      o.value = !0;
      try {
        await h.client.request("off", { channel: n }), u.value = "CH " + n + " の設定電圧をゼロにしたことを確認しました。";
      } catch (t) {
        u.value = t.message;
      } finally {
        o.value = !1;
      }
    }
    let O;
    async function T(n) {
      if (!(o.value || !c.value)) {
        o.value = !0, u.value = "";
        try {
          const { label: t } = await h.client.request("set_label", {
            channel: n.channel,
            label: b.value[n.channel] ?? n.label ?? ""
          });
          y.value = y.value.map(row => row.channel === n.channel ? { ...row, label: t } : row);
          delete b.value[n.channel];
          u.value = "表示名を保存しました。";
        } catch (t) {
          u.value = t.message;
        } finally {
          o.value = !1;
        }
      }
    }
    A(() => {
      v.value = localStorage.getItem("metis-hv-theme") === "light" ? "light" : "dark", O = h.client.subscribe("rph034", (n) => {
        c.value = !!n.connected, "host" in n && (F.value = n.host, x.value = n.error || "", k.value?.open || (m.value = n.host, f.value = n.port)), p.value = c.value && !!n.online, Array.isArray(n.channels) && (y.value = n.channels);
      });
    }), E(() => O?.());
    function U() {
      v.value = v.value === "dark" ? "light" : "dark", localStorage.setItem("metis-hv-theme", v.value);
    }
    return (n, t) => (i(), r("section", {
      class: "rph-panel hv-panel",
      "data-theme": v.value
    }, [
      e("header", G, [
        t[4] || (t[4] = e("h2", null, "RPH-034", -1)),
        e("div", J, [
          e("button", {
            type: "button",
            onClick: U
          }, a(v.value === "dark" ? "ライト" : "ダーク"), 1),
          e("button", {
            type: "button",
            "aria-label": "接続設定",
            title: "接続設定",
            onClick: t[0] || (t[0] = (l) => k.value?.showModal())
          }, "⚙")
        ])
      ]),
      e("p", {
        class: "hv-status",
        "data-online": p.value,
        role: "status"
      }, a(c.value ? p.value ? "RBCP 読み出し中" : x.value || "電源との通信未設定" : "Metis ノード未接続"), 9, K),
      e("div", Q, [
        e("span", {
          class: B({ "rph-active": !d.value })
        }, "モニター", 2),
        e("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": d.value,
          onClick: t[1] || (t[1] = (l) => d.value = !d.value)
        }, [...t[5] || (t[5] = [
          e("span", { "aria-hidden": "true" }, null, -1)
        ])], 8, W),
        e("span", {
          class: B({ "rph-active": d.value })
        }, "詳細", 2)
      ]),
      e("div", X, [
        e("table", null, [
          e("thead", null, [
            d.value ? (i(), r("tr", Y, [...t[6] || (t[6] = [
              e("th", { scope: "col" }, "チャンネル", -1),
              e("th", { scope: "col" }, "表示名", -1),
              e("th", { scope: "col" }, "出力", -1)
            ])])) : (i(), r("tr", Z, [...t[7] || (t[7] = [
              e("th", { scope: "col" }, "表示名", -1),
              e("th", { scope: "col" }, "電圧設定（生値）", -1),
              e("th", { scope: "col" }, "電圧実測（生値）", -1),
              e("th", { scope: "col" }, "電流上限（生値）", -1),
              e("th", { scope: "col" }, "電流実測（生値）", -1),
              e("th", { scope: "col" }, "出力", -1),
              e("th", { scope: "col" }, "操作", -1)
            ])]))
          ]),
          e("tbody", null, [
            (i(!0), r(_, null, I(y.value, (l) => (i(), r("tr", {
              key: l.channel,
              "data-state": !p.value || l.output == null ? "unknown" : l.output ? "on" : "off"
            }, [
              d.value ? (i(), r(_, { key: 0 }, [
                e("th", ee, "CH " + a(l.channel), 1),
                e("td", null, [
                  e("form", {
                    onSubmit: S((C) => T(l), ["prevent"])
                  }, [
                    e("input", {
                      value: b.value[l.channel] ?? l.label ?? "",
                      "aria-label": "CH " + l.channel + " の表示名",
                      placeholder: "表示名",
                      maxlength: "100",
                      disabled: o.value || !c.value,
                      onInput: (C) => b.value[l.channel] = C.target.value
                    }, null, 40, he),
                    e("button", {
                      disabled: o.value || !c.value
                    }, "保存", 8, pe)
                  ], 40, ve)
                ]),
                e("td", null, a(l.output == null ? "不明" : l.output ? "ON" : "OFF"), 1)
              ], 64)) : (i(), r(_, { key: 1 }, [
                e("th", te, a(l.label || "CH " + l.channel), 1),
                e("td", le, a(l.set_voltage ?? "—"), 1),
                e("td", ne, a(l.voltage ?? "—"), 1),
                e("td", ae, a(l.current_limit ?? "—"), 1),
                e("td", se, a(l.current ?? "—"), 1),
                e("td", null, a(l.output == null ? "不明" : l.output ? "ON" : "OFF"), 1),
                e("td", null, [
                  e("button", {
                    type: "button",
                    disabled: o.value || !c.value || !F.value,
                    onClick: (C) => R(l.channel)
                  }, " OFF（設定値をゼロ） ", 8, oe)
                ])
              ], 64))
            ], 8, w))), 128))
          ])
        ])
      ]),
      u.value ? (i(), r("p", ue, a(u.value), 1)) : N("", !0),
      e("dialog", {
        ref_key: "settingsDialog",
        ref: k,
        class: "hv-settings",
        "aria-labelledby": P(H)
      }, [
        e("header", re, [
          e("h3", { id: P(H) }, "接続設定", 8, ce),
          t[8] || (t[8] = e("form", { method: "dialog" }, [
            e("button", null, "閉じる")
          ], -1))
        ]),
        e("form", {
          class: "hv-settings-form",
          onSubmit: S(V, ["prevent"])
        }, [
          e("label", null, [
            t[9] || (t[9] = q("RBCP IPv4 アドレス ", -1)),
            D(e("input", {
              "onUpdate:modelValue": t[2] || (t[2] = (l) => m.value = l),
              placeholder: "未設定"
            }, null, 512), [
              [
                M,
                m.value,
                void 0,
                { trim: !0 }
              ]
            ])
          ]),
          e("label", null, [
            t[10] || (t[10] = q("UDP ポート ", -1)),
            D(e("input", {
              "onUpdate:modelValue": t[3] || (t[3] = (l) => f.value = l),
              type: "number",
              min: "1",
              max: "65535",
              required: ""
            }, null, 512), [
              [
                M,
                f.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          e("button", {
            disabled: o.value || !c.value
          }, "接続設定を保存", 8, de)
        ], 32),
        u.value ? (i(), r("p", be, a(u.value), 1)) : N("", !0)
      ], 8, ie)
    ], 8, z));
  }
};
function _e(g) {
  return L({
    setup() {
      return () => j(me, { client: g });
    }
  });
}
export {
  _e as mount
};
