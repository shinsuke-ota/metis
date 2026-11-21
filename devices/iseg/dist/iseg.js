import { ref as C, reactive as x, computed as h, onMounted as z, onUnmounted as P, openBlock as g, createElementBlock as c, createElementVNode as t, withModifiers as U, createTextVNode as a, withDirectives as d, vModelText as p, toDisplayString as o, createCommentVNode as $, Fragment as E, renderList as L, defineComponent as W, h as G } from "vue";
const I = ["placeholder"], J = ["disabled"], Q = { role: "status" }, X = {
  key: 0,
  role: "status"
}, Y = { style: { "overflow-x": "auto" } }, Z = { style: { display: "flex", "align-items": "center", gap: ".35rem" } }, K = ["onSubmit"], w = ["onUpdate:modelValue"], ee = ["disabled"], te = ["onSubmit"], le = ["onUpdate:modelValue"], ne = ["disabled"], ue = ["disabled", "onClick"], se = ["disabled", "onClick"], oe = ["disabled", "onClick"], ie = {
  key: 0,
  role: "status"
}, ae = ["disabled"], re = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(_) {
    const j = _, m = C({ modules: [], policies: {} }), r = x({ url: "", username: "", password: "", lines: "0" }), f = C(null), i = x({}), k = x({}), N = C(""), q = x({}), v = C(!1), b = C(!1);
    let A = !1, B;
    const T = h(() => {
      const u = /* @__PURE__ */ new Map();
      for (const e of m.value.modules) {
        const l = String(e["Status.serialNumber"] ?? "");
        for (const [y, n] of Object.entries(e.channels)) {
          const s = m.value.policies[l + ":" + y] ?? {}, F = s.group || "未分類";
          u.has(F) || u.set(F, []), u.get(F).push({
            key: e.line + ":" + e.address + ":" + y,
            serial: l,
            channel: y,
            items: n,
            settings: s,
            location: e.line + "/" + e.address + "/" + y
          });
        }
      }
      return u;
    });
    function S(u, e) {
      const l = u[e];
      return l ? String(l.value) + (l.unit ? " " + l.unit : "") : "—";
    }
    function M(u, e) {
      const l = u[e]?.value;
      return l == null ? "—" : ["1", "true"].includes(String(l).toLowerCase()) ? "ON" : "OFF";
    }
    async function O(u, e, l, y) {
      const n = (s) => {
        y ? q[y] = s : N.value = s;
      };
      v.value = !0, n("処理中…");
      try {
        return await j.client.request(u, e), n(l), !0;
      } catch (s) {
        return n(s.message), !1;
      } finally {
        v.value = !1;
      }
    }
    async function D() {
      await O("configure", {
        ...r,
        lines: r.lines.split(",").map((u) => u.trim())
      }, "接続設定を保存しました。") && (r.password = "");
    }
    function H(u) {
      f.value = u;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        i[e] = u.settings[e] ?? "";
    }
    async function R() {
      const u = { ...i, serial: f.value.serial, channel: f.value.channel };
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        u[e] = u[e] === "" ? null : Number(u[e]);
      await O("configure_channel", u, "チャンネル設定を保存しました。") && (f.value = null);
    }
    function V(u, e, l) {
      return O(
        e,
        { serial: u.serial, channel: u.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        u.key
      );
    }
    return z(() => {
      B = j.client.subscribe("iseg", (u) => {
        b.value = !!u.connected, u.connection && (m.value = u, A || (Object.assign(r, u.connection, { lines: u.connection.lines.join(", ") }), A = !0));
      });
    }), P(() => B?.()), (u, e) => (g(), c("article", null, [
      e[24] || (e[24] = t("h2", null, "iseg CC24", -1)),
      t("form", {
        onSubmit: U(D, ["prevent"])
      }, [
        t("label", null, [
          e[11] || (e[11] = a("WebSocket URL ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (l) => r.url = l),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              p,
              r.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        t("label", null, [
          e[12] || (e[12] = a("ユーザー名 ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => r.username = l),
            autocomplete: "username"
          }, null, 512), [
            [p, r.username]
          ])
        ]),
        t("label", null, [
          e[13] || (e[13] = a("パスワード ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => r.password = l),
            type: "password",
            autocomplete: "new-password",
            placeholder: m.value.password_set ? "設定済み" : ""
          }, null, 8, I), [
            [p, r.password]
          ])
        ]),
        t("label", null, [
          e[14] || (e[14] = a("CAN ライン ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => r.lines = l),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [p, r.lines]
          ])
        ]),
        t("button", {
          disabled: v.value || !b.value
        }, "接続設定を保存", 8, J)
      ], 32),
      t("p", Q, o(b.value ? m.value.online ? "iCS2 接続中" : m.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      N.value ? (g(), c("p", X, o(N.value), 1)) : $("", !0),
      (g(!0), c(E, null, L(T.value, ([l, y]) => (g(), c("section", { key: l }, [
        t("h3", null, o(l), 1),
        t("div", Y, [
          t("table", null, [
            e[17] || (e[17] = t("thead", null, [
              t("tr", null, [
                t("th", null, "チャンネル"),
                t("th", null, "電圧 設定 / 実測"),
                t("th", null, "電流 設定 / 実測"),
                t("th", null, "出力 / ランプ / トリップ"),
                t("th", null, "操作")
              ])
            ], -1)),
            t("tbody", null, [
              (g(!0), c(E, null, L(y, (n) => (g(), c("tr", {
                key: n.key,
                style: { "white-space": "nowrap" }
              }, [
                t("td", null, [
                  a(o(n.settings.label || "CH " + n.channel) + " ", 1),
                  t("small", null, o(n.serial || "S/N 不明") + " · " + o(n.location), 1)
                ]),
                t("td", null, o(S(n.items, "Control.voltageSet")) + " / " + o(S(n.items, "Status.voltageMeasure")), 1),
                t("td", null, o(S(n.items, "Control.currentSet")) + " / " + o(S(n.items, "Status.currentMeasure")), 1),
                t("td", null, o(M(n.items, "Status.on")) + " / " + o(M(n.items, "Status.voltageRamping")) + " / " + o(M(n.items, "Error.currentTrip")), 1),
                t("td", null, [
                  t("div", Z, [
                    t("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: U((s) => V(n, "set_voltage", Number(k[n.key + "v"])), ["prevent"])
                    }, [
                      t("label", null, [
                        e[15] || (e[15] = a("V ", -1)),
                        d(t("input", {
                          "onUpdate:modelValue": (s) => k[n.key + "v"] = s,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, w), [
                          [p, k[n.key + "v"]]
                        ])
                      ]),
                      t("button", {
                        disabled: v.value || !b.value || !m.value.online || !n.serial
                      }, "設定", 8, ee)
                    ], 40, K),
                    t("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: U((s) => V(n, "set_current", Number(k[n.key + "a"])), ["prevent"])
                    }, [
                      t("label", null, [
                        e[16] || (e[16] = a("A ", -1)),
                        d(t("input", {
                          "onUpdate:modelValue": (s) => k[n.key + "a"] = s,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, le), [
                          [p, k[n.key + "a"]]
                        ])
                      ]),
                      t("button", {
                        disabled: v.value || !b.value || !m.value.online || !n.serial
                      }, "設定", 8, ne)
                    ], 40, te),
                    t("button", {
                      type: "button",
                      disabled: v.value || !b.value || !m.value.online || !n.serial,
                      onClick: (s) => V(n, "set_output", !0)
                    }, "ON", 8, ue),
                    t("button", {
                      type: "button",
                      disabled: v.value || !b.value || !m.value.online || !n.serial,
                      onClick: (s) => V(n, "set_output", !1)
                    }, "OFF", 8, se),
                    t("button", {
                      type: "button",
                      disabled: v.value || !b.value || !n.serial,
                      onClick: (s) => H(n)
                    }, "詳細", 8, oe),
                    q[n.key] ? (g(), c("span", ie, o(q[n.key]), 1)) : $("", !0)
                  ])
                ])
              ]))), 128))
            ])
          ])
        ])
      ]))), 128)),
      f.value ? (g(), c("form", {
        key: 1,
        onSubmit: U(R, ["prevent"])
      }, [
        t("h3", null, o(f.value.serial) + " / CH " + o(f.value.channel), 1),
        t("label", null, [
          e[18] || (e[18] = a("表示名 ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => i.label = l),
            maxlength: "100"
          }, null, 512), [
            [p, i.label]
          ])
        ]),
        t("label", null, [
          e[19] || (e[19] = a("グループ ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[5] || (e[5] = (l) => i.group = l),
            maxlength: "100"
          }, null, 512), [
            [p, i.group]
          ])
        ]),
        t("label", null, [
          e[20] || (e[20] = a("最低電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[6] || (e[6] = (l) => i.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, i.voltage_min]
          ])
        ]),
        t("label", null, [
          e[21] || (e[21] = a("最高電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (l) => i.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, i.voltage_max]
          ])
        ]),
        t("label", null, [
          e[22] || (e[22] = a("最低電流 (A) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[8] || (e[8] = (l) => i.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, i.current_min]
          ])
        ]),
        t("label", null, [
          e[23] || (e[23] = a("最高電流 (A) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (l) => i.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, i.current_max]
          ])
        ]),
        t("button", {
          disabled: v.value || !b.value
        }, "保存", 8, ae),
        t("button", {
          type: "button",
          onClick: e[10] || (e[10] = (l) => f.value = null)
        }, "閉じる")
      ], 32)) : $("", !0)
    ]));
  }
};
function pe(_) {
  return W({
    setup() {
      return () => G(re, { client: _ });
    }
  });
}
export {
  pe as mount
};
