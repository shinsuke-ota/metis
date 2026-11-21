import { ref as x, reactive as N, computed as z, onMounted as ne, onUnmounted as ue, openBlock as p, createElementBlock as m, createElementVNode as l, Fragment as C, renderList as q, toDisplayString as i, withModifiers as O, createTextVNode as d, withDirectives as r, vModelText as v, createCommentVNode as j, vModelCheckbox as D, defineComponent as ie, h as oe } from "vue";
const se = { key: 0 }, ae = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, re = { style: { "white-space": "nowrap" } }, de = { style: { "white-space": "nowrap" } }, pe = ["placeholder"], me = ["disabled"], ve = { role: "status" }, ge = {
  key: 0,
  role: "status"
}, be = ["onUpdate:modelValue"], fe = ["onUpdate:modelValue", "disabled", "required"], ye = ["onUpdate:modelValue", "disabled", "required"], ce = ["disabled"], ke = ["disabled"], he = { style: { "text-align": "left" } }, xe = ["checked", ".indeterminate"], _e = ["value", "aria-label"], Ce = { style: { "overflow-x": "auto" } }, Ve = { style: { display: "flex", "align-items": "center", gap: ".35rem" } }, Ue = ["onSubmit"], Se = ["onUpdate:modelValue"], Ne = ["disabled"], qe = ["onSubmit"], Me = ["onUpdate:modelValue"], Oe = ["disabled"], Fe = ["disabled", "onClick"], Ae = ["disabled", "onClick"], $e = ["disabled", "onClick"], He = {
  key: 0,
  role: "status"
}, Le = ["disabled"], je = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(B) {
    const P = B, f = x({ modules: [], policies: {} }), b = N({ url: "", username: "", password: "", lines: "0" }), k = x(null), M = x(!1), F = x([]), s = N({
      voltage: !1,
      current: !1,
      grouping: !1,
      voltage_min: "",
      voltage_max: "",
      current_min: "",
      current_max: "",
      group: ""
    }), g = N({}), V = N({}), R = x(""), G = x(null), A = x([]);
    let X = 0;
    const Y = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_output: "出力切替"
    };
    function Z(n, e) {
      const t = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let o = Y[n] ?? n;
      n === "configure_channels" && (o += " " + e.targets.length + " CH"), n === "set_voltage" && (o += " " + e.value + " V"), n === "set_current" && (o += " " + e.value + " A"), n === "set_output" && (o += e.value ? " ON" : " OFF");
      const u = N({
        id: ++X,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: t,
        action: o,
        result: "処理中",
        detail: ""
      });
      return A.value = [u, ...A.value].slice(0, 100), u;
    }
    const T = N({}), y = x(!1), c = x(!1);
    let I = !1, J;
    const Q = z(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of f.value.modules) {
        const t = String(e["Status.serialNumber"] ?? "");
        for (const [o, u] of Object.entries(e.channels)) {
          const a = f.value.policies[t + ":" + o] ?? {}, h = a.group || "未分類";
          n.has(h) || n.set(h, []), n.get(h).push({
            key: t + ":" + e.line + ":" + e.address + ":" + o,
            serial: t,
            channel: o,
            items: u,
            settings: a,
            location: e.line + "/" + e.address + "/" + o
          });
        }
      }
      return n;
    }), U = z(() => [...Q.value.values()].flat().filter((n) => n.serial)), S = z(() => U.value.filter((n) => F.value.includes(n.key))), E = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "A" }
    ];
    function _(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    function K(n) {
      F.value = n.target.checked ? U.value.map((e) => e.key) : [];
    }
    async function w() {
      const n = {};
      for (const { key: t } of E)
        s[t] && (n[t + "_min"] = Number(s[t + "_min"]), n[t + "_max"] = Number(s[t + "_max"]));
      s.grouping && (n.group = s.group);
      const e = S.value.map(({ serial: t, channel: o }) => ({ serial: t, channel: o }));
      await H("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function $(n, e) {
      const t = n[e];
      return t ? String(t.value) + (t.unit ? " " + t.unit : "") : "—";
    }
    function W(n, e) {
      const t = n[e]?.value;
      return t == null ? "—" : ["1", "true"].includes(String(t).toLowerCase()) ? "ON" : "OFF";
    }
    async function H(n, e, t, o) {
      const u = (h) => {
        o ? T[o] = h : R.value = h;
      }, a = Z(n, e);
      y.value = !0, u("処理中…");
      try {
        return await P.client.request(n, e), a.result = n.startsWith("set_") ? "指令受理" : "保存完了", a.detail = t, u(t), !0;
      } catch (h) {
        return a.result = "エラー", a.detail = h.message, u(h.message), !1;
      } finally {
        y.value = !1;
      }
    }
    async function ee() {
      await H("configure", {
        ...b,
        lines: b.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (b.password = "");
    }
    function le(n) {
      k.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        g[e] = n.settings[e] ?? "";
    }
    async function te() {
      const n = { ...g, serial: k.value.serial, channel: k.value.channel };
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        n[e] = n[e] === "" ? null : Number(n[e]);
      await H("configure_channel", n, "チャンネル設定を保存しました。") && (k.value = null);
    }
    function L(n, e, t) {
      return H(
        e,
        { serial: n.serial, channel: n.channel, value: t },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return ne(() => {
      J = P.client.subscribe("iseg", (n) => {
        c.value = !!n.connected, n.connection && (f.value = n, I || (Object.assign(b, n.connection, { lines: n.connection.lines.join(", ") }), I = !0));
      });
    }), ue(() => J?.()), (n, e) => (p(), m("article", null, [
      e[39] || (e[39] = l("h2", null, "iseg CC24", -1)),
      l("button", {
        type: "button",
        onClick: e[0] || (e[0] = (t) => G.value?.showModal())
      }, "操作ログ"),
      l("dialog", {
        ref_key: "logDialog",
        ref: G,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[18] || (e[18] = l("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          l("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          l("form", { method: "dialog" }, [
            l("button", null, "閉じる")
          ])
        ], -1)),
        A.value.length ? (p(), m("table", ae, [
          e[17] || (e[17] = l("thead", null, [
            l("tr", null, [
              l("th", null, "時刻"),
              l("th", null, "対象"),
              l("th", null, "操作"),
              l("th", null, "結果"),
              l("th", null, "詳細")
            ])
          ], -1)),
          l("tbody", null, [
            (p(!0), m(C, null, q(A.value, (t) => (p(), m("tr", {
              key: t.id
            }, [
              l("td", re, i(t.time), 1),
              l("td", null, i(t.target), 1),
              l("td", null, i(t.action), 1),
              l("td", de, i(t.result), 1),
              l("td", null, i(t.detail), 1)
            ]))), 128))
          ])
        ])) : (p(), m("p", se, "この画面からの操作はまだありません。"))
      ], 512),
      l("form", {
        onSubmit: O(ee, ["prevent"])
      }, [
        l("label", null, [
          e[19] || (e[19] = d("WebSocket URL ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (t) => b.url = t),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              v,
              b.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[20] || (e[20] = d("ユーザー名 ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (t) => b.username = t),
            autocomplete: "username"
          }, null, 512), [
            [v, b.username]
          ])
        ]),
        l("label", null, [
          e[21] || (e[21] = d("パスワード ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (t) => b.password = t),
            type: "password",
            autocomplete: "new-password",
            placeholder: f.value.password_set ? "設定済み" : ""
          }, null, 8, pe), [
            [v, b.password]
          ])
        ]),
        l("label", null, [
          e[22] || (e[22] = d("CAN ライン ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (t) => b.lines = t),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [v, b.lines]
          ])
        ]),
        l("button", {
          disabled: y.value || !c.value
        }, "接続設定を保存", 8, me)
      ], 32),
      l("p", ve, i(c.value ? f.value.online ? "iCS2 接続中" : f.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      R.value ? (p(), m("p", ge, i(R.value), 1)) : j("", !0),
      l("label", null, [
        r(l("input", {
          "onUpdate:modelValue": e[5] || (e[5] = (t) => M.value = t),
          type: "checkbox",
          role: "switch",
          onChange: e[6] || (e[6] = (t) => k.value = null)
        }, null, 544), [
          [D, M.value]
        ]),
        e[23] || (e[23] = d(" 一括設定モード ", -1))
      ]),
      M.value ? (p(), m(C, { key: 1 }, [
        e[29] || (e[29] = l("p", null, "チャンネルを選択し、変更する項目にチェックを入れてください。", -1)),
        l("form", {
          onSubmit: O(w, ["prevent"])
        }, [
          (p(), m(C, null, q(E, ({ key: t, label: o, unit: u }) => l("fieldset", { key: t }, [
            l("legend", null, [
              l("label", null, [
                r(l("input", {
                  "onUpdate:modelValue": (a) => s[t] = a,
                  type: "checkbox"
                }, null, 8, be), [
                  [D, s[t]]
                ]),
                d(" " + i(o) + "の範囲を変更", 1)
              ])
            ]),
            l("label", null, [
              d("下限 (" + i(u) + ") ", 1),
              r(l("input", {
                "onUpdate:modelValue": (a) => s[t + "_min"] = a,
                type: "number",
                step: "any",
                disabled: !s[t],
                required: s[t]
              }, null, 8, fe), [
                [v, s[t + "_min"]]
              ])
            ]),
            l("label", null, [
              d("上限 (" + i(u) + ") ", 1),
              r(l("input", {
                "onUpdate:modelValue": (a) => s[t + "_max"] = a,
                type: "number",
                step: "any",
                disabled: !s[t],
                required: s[t]
              }, null, 8, ye), [
                [v, s[t + "_max"]]
              ])
            ])
          ])), 64)),
          l("label", null, [
            r(l("input", {
              "onUpdate:modelValue": e[7] || (e[7] = (t) => s.grouping = t),
              type: "checkbox"
            }, null, 512), [
              [D, s.grouping]
            ]),
            e[24] || (e[24] = d(" グループを変更", -1))
          ]),
          r(l("input", {
            "onUpdate:modelValue": e[8] || (e[8] = (t) => s.group = t),
            "aria-label": "グループ名",
            disabled: !s.grouping,
            maxlength: "100",
            placeholder: "空欄で未分類"
          }, null, 8, ce), [
            [v, s.group]
          ]),
          l("button", {
            disabled: y.value || !c.value || !S.value.length || !(s.voltage || s.current || s.grouping)
          }, " 選択した " + i(S.value.length) + " CH に適用 ", 9, ke)
        ], 32),
        l("table", he, [
          l("thead", null, [
            l("tr", null, [
              l("th", null, [
                l("input", {
                  type: "checkbox",
                  "aria-label": "全チャンネルを選択",
                  onChange: K,
                  checked: U.value.length > 0 && S.value.length === U.value.length,
                  ".indeterminate": S.value.length > 0 && S.value.length < U.value.length
                }, null, 40, xe)
              ]),
              e[25] || (e[25] = l("th", null, "チャンネル", -1)),
              e[26] || (e[26] = l("th", null, "グループ", -1)),
              e[27] || (e[27] = l("th", null, "電圧範囲 (V)", -1)),
              e[28] || (e[28] = l("th", null, "電流範囲 (A)", -1))
            ])
          ]),
          l("tbody", null, [
            (p(!0), m(C, null, q(U.value, (t) => (p(), m("tr", {
              key: t.key
            }, [
              l("td", null, [
                r(l("input", {
                  "onUpdate:modelValue": e[9] || (e[9] = (o) => F.value = o),
                  type: "checkbox",
                  value: t.key,
                  "aria-label": t.serial + " CH " + t.channel
                }, null, 8, _e), [
                  [D, F.value]
                ])
              ]),
              l("td", null, i(t.settings.label || "CH " + t.channel) + " · " + i(t.serial) + " / " + i(t.location), 1),
              l("td", null, i(t.settings.group || "未分類"), 1),
              (p(), m(C, null, q(E, ({ key: o }) => l("td", { key: o }, i(_(t, o) ? t.settings[o + "_min"] + " ～ " + t.settings[o + "_max"] : "未設定"), 1)), 64))
            ]))), 128))
          ])
        ])
      ], 64)) : j("", !0),
      (p(!0), m(C, null, q(M.value ? [] : Q.value, ([t, o]) => (p(), m("section", { key: t }, [
        l("h3", null, i(t), 1),
        l("div", Ce, [
          l("table", null, [
            e[32] || (e[32] = l("thead", null, [
              l("tr", null, [
                l("th", null, "チャンネル"),
                l("th", null, "電圧 設定 / 実測"),
                l("th", null, "電流 設定 / 実測"),
                l("th", null, "出力 / ランプ / トリップ"),
                l("th", null, "操作")
              ])
            ], -1)),
            l("tbody", null, [
              (p(!0), m(C, null, q(o, (u) => (p(), m("tr", {
                key: u.key,
                style: { "white-space": "nowrap" }
              }, [
                l("td", null, [
                  d(i(u.settings.label || "CH " + u.channel) + " ", 1),
                  l("small", null, i(u.serial || "S/N 不明") + " · " + i(u.location), 1)
                ]),
                l("td", null, i($(u.items, "Control.voltageSet")) + " / " + i($(u.items, "Status.voltageMeasure")), 1),
                l("td", null, i($(u.items, "Control.currentSet")) + " / " + i($(u.items, "Status.currentMeasure")), 1),
                l("td", null, i(W(u.items, "Status.on")) + " / " + i(W(u.items, "Status.voltageRamping")) + " / " + i(W(u.items, "Error.currentTrip")), 1),
                l("td", null, [
                  l("div", Ve, [
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: O((a) => L(u, "set_voltage", Number(V[u.key + "v"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[30] || (e[30] = d("V ", -1)),
                        r(l("input", {
                          "onUpdate:modelValue": (a) => V[u.key + "v"] = a,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, Se), [
                          [v, V[u.key + "v"]]
                        ])
                      ]),
                      l("button", {
                        disabled: y.value || !c.value || !f.value.online || !u.serial || !_(u, "voltage")
                      }, "設定", 8, Ne)
                    ], 40, Ue),
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: O((a) => L(u, "set_current", Number(V[u.key + "a"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[31] || (e[31] = d("A ", -1)),
                        r(l("input", {
                          "onUpdate:modelValue": (a) => V[u.key + "a"] = a,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, Me), [
                          [v, V[u.key + "a"]]
                        ])
                      ]),
                      l("button", {
                        disabled: y.value || !c.value || !f.value.online || !u.serial || !_(u, "current")
                      }, "設定", 8, Oe)
                    ], 40, qe),
                    l("button", {
                      type: "button",
                      disabled: y.value || !c.value || !f.value.online || !u.serial || !_(u, "voltage") || !_(u, "current"),
                      onClick: (a) => L(u, "set_output", !0)
                    }, "ON", 8, Fe),
                    l("button", {
                      type: "button",
                      disabled: y.value || !c.value || !f.value.online || !u.serial,
                      onClick: (a) => L(u, "set_output", !1)
                    }, "OFF", 8, Ae),
                    l("button", {
                      type: "button",
                      disabled: y.value || !c.value || !u.serial,
                      onClick: (a) => le(u)
                    }, i(_(u, "voltage") && _(u, "current") ? "詳細" : "許容範囲を設定"), 9, $e),
                    T[u.key] ? (p(), m("span", He, i(T[u.key]), 1)) : j("", !0)
                  ])
                ])
              ]))), 128))
            ])
          ])
        ])
      ]))), 128)),
      k.value && !M.value ? (p(), m("form", {
        key: 2,
        onSubmit: O(te, ["prevent"])
      }, [
        l("h3", null, i(k.value.serial) + " / CH " + i(k.value.channel), 1),
        l("label", null, [
          e[33] || (e[33] = d("表示名 ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[10] || (e[10] = (t) => g.label = t),
            maxlength: "100"
          }, null, 512), [
            [v, g.label]
          ])
        ]),
        l("label", null, [
          e[34] || (e[34] = d("グループ ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[11] || (e[11] = (t) => g.group = t),
            maxlength: "100"
          }, null, 512), [
            [v, g.group]
          ])
        ]),
        l("label", null, [
          e[35] || (e[35] = d("最低電圧 (V) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[12] || (e[12] = (t) => g.voltage_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.voltage_min]
          ])
        ]),
        l("label", null, [
          e[36] || (e[36] = d("最高電圧 (V) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[13] || (e[13] = (t) => g.voltage_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.voltage_max]
          ])
        ]),
        l("label", null, [
          e[37] || (e[37] = d("最低電流 (A) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (t) => g.current_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.current_min]
          ])
        ]),
        l("label", null, [
          e[38] || (e[38] = d("最高電流 (A) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (t) => g.current_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.current_max]
          ])
        ]),
        l("button", {
          disabled: y.value || !c.value
        }, "保存", 8, Le),
        l("button", {
          type: "button",
          onClick: e[16] || (e[16] = (t) => k.value = null)
        }, "閉じる")
      ], 32)) : j("", !0)
    ]));
  }
};
function Be(B) {
  return ie({
    setup() {
      return () => oe(je, { client: B });
    }
  });
}
export {
  Be as mount
};
