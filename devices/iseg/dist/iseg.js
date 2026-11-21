import { ref as C, reactive as _, computed as G, onMounted as I, onUnmounted as J, openBlock as p, createElementBlock as m, createElementVNode as t, Fragment as $, renderList as L, toDisplayString as s, withModifiers as U, createTextVNode as r, withDirectives as v, vModelText as b, createCommentVNode as j, defineComponent as Q, h as X } from "vue";
const Y = { key: 0 }, Z = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, K = { style: { "white-space": "nowrap" } }, ee = { style: { "white-space": "nowrap" } }, te = ["placeholder"], le = ["disabled"], ne = { role: "status" }, ue = {
  key: 0,
  role: "status"
}, se = { style: { "overflow-x": "auto" } }, oe = { style: { display: "flex", "align-items": "center", gap: ".35rem" } }, ie = ["onSubmit"], ae = ["onUpdate:modelValue"], re = ["disabled"], de = ["onSubmit"], pe = ["onUpdate:modelValue"], me = ["disabled"], ve = ["disabled", "onClick"], be = ["disabled", "onClick"], ge = ["disabled", "onClick"], ye = {
  key: 0,
  role: "status"
}, fe = ["disabled"], ce = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(N) {
    const A = N, g = C({ modules: [], policies: {} }), d = _({ url: "", username: "", password: "", lines: "0" }), k = C(null), i = _({}), S = _({}), O = C(""), D = C(null), x = C([]);
    let E = 0;
    const H = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_output: "出力切替"
    };
    function R(n, e) {
      const l = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = H[n] ?? n;
      n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const u = _({
        id: ++E,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: l,
        action: a,
        result: "処理中",
        detail: ""
      });
      return x.value = [u, ...x.value].slice(0, 100), u;
    }
    const q = _({}), y = C(!1), f = C(!1);
    let T = !1, B;
    const W = G(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of g.value.modules) {
        const l = String(e["Status.serialNumber"] ?? "");
        for (const [a, u] of Object.entries(e.channels)) {
          const o = g.value.policies[l + ":" + a] ?? {}, c = o.group || "未分類";
          n.has(c) || n.set(c, []), n.get(c).push({
            key: e.line + ":" + e.address + ":" + a,
            serial: l,
            channel: a,
            items: u,
            settings: o,
            location: e.line + "/" + e.address + "/" + a
          });
        }
      }
      return n;
    });
    function V(n, e) {
      const l = n[e];
      return l ? String(l.value) + (l.unit ? " " + l.unit : "") : "—";
    }
    function F(n, e) {
      const l = n[e]?.value;
      return l == null ? "—" : ["1", "true"].includes(String(l).toLowerCase()) ? "ON" : "OFF";
    }
    async function M(n, e, l, a) {
      const u = (c) => {
        a ? q[a] = c : O.value = c;
      }, o = R(n, e);
      y.value = !0, u("処理中…");
      try {
        return await A.client.request(n, e), o.result = n.startsWith("set_") ? "指令受理" : "保存完了", o.detail = l, u(l), !0;
      } catch (c) {
        return o.result = "エラー", o.detail = c.message, u(c.message), !1;
      } finally {
        y.value = !1;
      }
    }
    async function z() {
      await M("configure", {
        ...d,
        lines: d.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (d.password = "");
    }
    function P(n) {
      k.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        i[e] = n.settings[e] ?? "";
    }
    async function w() {
      const n = { ...i, serial: k.value.serial, channel: k.value.channel };
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        n[e] = n[e] === "" ? null : Number(n[e]);
      await M("configure_channel", n, "チャンネル設定を保存しました。") && (k.value = null);
    }
    function h(n, e, l) {
      return M(
        e,
        { serial: n.serial, channel: n.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return I(() => {
      B = A.client.subscribe("iseg", (n) => {
        f.value = !!n.connected, n.connection && (g.value = n, T || (Object.assign(d, n.connection, { lines: n.connection.lines.join(", ") }), T = !0));
      });
    }), J(() => B?.()), (n, e) => (p(), m("article", null, [
      e[27] || (e[27] = t("h2", null, "iseg CC24", -1)),
      t("button", {
        type: "button",
        onClick: e[0] || (e[0] = (l) => D.value?.showModal())
      }, "操作ログ"),
      t("dialog", {
        ref_key: "logDialog",
        ref: D,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[13] || (e[13] = t("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          t("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ])
        ], -1)),
        x.value.length ? (p(), m("table", Z, [
          e[12] || (e[12] = t("thead", null, [
            t("tr", null, [
              t("th", null, "時刻"),
              t("th", null, "対象"),
              t("th", null, "操作"),
              t("th", null, "結果"),
              t("th", null, "詳細")
            ])
          ], -1)),
          t("tbody", null, [
            (p(!0), m($, null, L(x.value, (l) => (p(), m("tr", {
              key: l.id
            }, [
              t("td", K, s(l.time), 1),
              t("td", null, s(l.target), 1),
              t("td", null, s(l.action), 1),
              t("td", ee, s(l.result), 1),
              t("td", null, s(l.detail), 1)
            ]))), 128))
          ])
        ])) : (p(), m("p", Y, "この画面からの操作はまだありません。"))
      ], 512),
      t("form", {
        onSubmit: U(z, ["prevent"])
      }, [
        t("label", null, [
          e[14] || (e[14] = r("WebSocket URL ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => d.url = l),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              b,
              d.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        t("label", null, [
          e[15] || (e[15] = r("ユーザー名 ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => d.username = l),
            autocomplete: "username"
          }, null, 512), [
            [b, d.username]
          ])
        ]),
        t("label", null, [
          e[16] || (e[16] = r("パスワード ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => d.password = l),
            type: "password",
            autocomplete: "new-password",
            placeholder: g.value.password_set ? "設定済み" : ""
          }, null, 8, te), [
            [b, d.password]
          ])
        ]),
        t("label", null, [
          e[17] || (e[17] = r("CAN ライン ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => d.lines = l),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [b, d.lines]
          ])
        ]),
        t("button", {
          disabled: y.value || !f.value
        }, "接続設定を保存", 8, le)
      ], 32),
      t("p", ne, s(f.value ? g.value.online ? "iCS2 接続中" : g.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      O.value ? (p(), m("p", ue, s(O.value), 1)) : j("", !0),
      (p(!0), m($, null, L(W.value, ([l, a]) => (p(), m("section", { key: l }, [
        t("h3", null, s(l), 1),
        t("div", se, [
          t("table", null, [
            e[20] || (e[20] = t("thead", null, [
              t("tr", null, [
                t("th", null, "チャンネル"),
                t("th", null, "電圧 設定 / 実測"),
                t("th", null, "電流 設定 / 実測"),
                t("th", null, "出力 / ランプ / トリップ"),
                t("th", null, "操作")
              ])
            ], -1)),
            t("tbody", null, [
              (p(!0), m($, null, L(a, (u) => (p(), m("tr", {
                key: u.key,
                style: { "white-space": "nowrap" }
              }, [
                t("td", null, [
                  r(s(u.settings.label || "CH " + u.channel) + " ", 1),
                  t("small", null, s(u.serial || "S/N 不明") + " · " + s(u.location), 1)
                ]),
                t("td", null, s(V(u.items, "Control.voltageSet")) + " / " + s(V(u.items, "Status.voltageMeasure")), 1),
                t("td", null, s(V(u.items, "Control.currentSet")) + " / " + s(V(u.items, "Status.currentMeasure")), 1),
                t("td", null, s(F(u.items, "Status.on")) + " / " + s(F(u.items, "Status.voltageRamping")) + " / " + s(F(u.items, "Error.currentTrip")), 1),
                t("td", null, [
                  t("div", oe, [
                    t("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: U((o) => h(u, "set_voltage", Number(S[u.key + "v"])), ["prevent"])
                    }, [
                      t("label", null, [
                        e[18] || (e[18] = r("V ", -1)),
                        v(t("input", {
                          "onUpdate:modelValue": (o) => S[u.key + "v"] = o,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, ae), [
                          [b, S[u.key + "v"]]
                        ])
                      ]),
                      t("button", {
                        disabled: y.value || !f.value || !g.value.online || !u.serial
                      }, "設定", 8, re)
                    ], 40, ie),
                    t("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: U((o) => h(u, "set_current", Number(S[u.key + "a"])), ["prevent"])
                    }, [
                      t("label", null, [
                        e[19] || (e[19] = r("A ", -1)),
                        v(t("input", {
                          "onUpdate:modelValue": (o) => S[u.key + "a"] = o,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, pe), [
                          [b, S[u.key + "a"]]
                        ])
                      ]),
                      t("button", {
                        disabled: y.value || !f.value || !g.value.online || !u.serial
                      }, "設定", 8, me)
                    ], 40, de),
                    t("button", {
                      type: "button",
                      disabled: y.value || !f.value || !g.value.online || !u.serial,
                      onClick: (o) => h(u, "set_output", !0)
                    }, "ON", 8, ve),
                    t("button", {
                      type: "button",
                      disabled: y.value || !f.value || !g.value.online || !u.serial,
                      onClick: (o) => h(u, "set_output", !1)
                    }, "OFF", 8, be),
                    t("button", {
                      type: "button",
                      disabled: y.value || !f.value || !u.serial,
                      onClick: (o) => P(u)
                    }, "詳細", 8, ge),
                    q[u.key] ? (p(), m("span", ye, s(q[u.key]), 1)) : j("", !0)
                  ])
                ])
              ]))), 128))
            ])
          ])
        ])
      ]))), 128)),
      k.value ? (p(), m("form", {
        key: 1,
        onSubmit: U(w, ["prevent"])
      }, [
        t("h3", null, s(k.value.serial) + " / CH " + s(k.value.channel), 1),
        t("label", null, [
          e[21] || (e[21] = r("表示名 ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[5] || (e[5] = (l) => i.label = l),
            maxlength: "100"
          }, null, 512), [
            [b, i.label]
          ])
        ]),
        t("label", null, [
          e[22] || (e[22] = r("グループ ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[6] || (e[6] = (l) => i.group = l),
            maxlength: "100"
          }, null, 512), [
            [b, i.group]
          ])
        ]),
        t("label", null, [
          e[23] || (e[23] = r("最低電圧 (V) ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (l) => i.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, i.voltage_min]
          ])
        ]),
        t("label", null, [
          e[24] || (e[24] = r("最高電圧 (V) ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[8] || (e[8] = (l) => i.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, i.voltage_max]
          ])
        ]),
        t("label", null, [
          e[25] || (e[25] = r("最低電流 (A) ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (l) => i.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, i.current_min]
          ])
        ]),
        t("label", null, [
          e[26] || (e[26] = r("最高電流 (A) ", -1)),
          v(t("input", {
            "onUpdate:modelValue": e[10] || (e[10] = (l) => i.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, i.current_max]
          ])
        ]),
        t("button", {
          disabled: y.value || !f.value
        }, "保存", 8, fe),
        t("button", {
          type: "button",
          onClick: e[11] || (e[11] = (l) => k.value = null)
        }, "閉じる")
      ], 32)) : j("", !0)
    ]));
  }
};
function Ce(N) {
  return Q({
    setup() {
      return () => X(ce, { client: N });
    }
  });
}
export {
  Ce as mount
};
