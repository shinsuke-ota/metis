import { ref as V, reactive as S, computed as W, onMounted as ne, onUnmounted as ue, openBlock as p, createElementBlock as m, createElementVNode as l, Fragment as h, renderList as F, toDisplayString as i, withModifiers as O, createTextVNode as d, withDirectives as s, vModelText as b, createCommentVNode as q, vModelCheckbox as N, vModelSelect as Y, defineComponent as oe, h as ie } from "vue";
const ae = { key: 0 }, se = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, re = { style: { "white-space": "nowrap" } }, de = { style: { "white-space": "nowrap" } }, pe = ["placeholder"], me = ["disabled"], ve = { role: "status" }, be = {
  key: 0,
  role: "status"
}, ge = ["onUpdate:modelValue"], fe = ["onUpdate:modelValue", "disabled", "required"], ce = ["onUpdate:modelValue", "disabled", "required"], ye = ["disabled"], ke = ["disabled"], xe = ["disabled"], Ve = ["disabled"], _e = { style: { "text-align": "left" } }, Ce = ["value", "aria-label"], he = ["onClick"], Ue = { style: { "overflow-x": "auto" } }, Se = { key: 0 }, Fe = { style: { display: "flex", "align-items": "center", gap: ".35rem" } }, Ne = ["onSubmit"], Oe = ["onUpdate:modelValue"], qe = ["disabled"], Me = ["onSubmit"], $e = ["onUpdate:modelValue"], Ae = ["disabled"], He = ["disabled", "onClick"], Le = ["disabled", "onClick"], je = ["disabled", "onClick"], De = {
  key: 0,
  role: "status"
}, Be = ["disabled"], Re = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(L) {
    const z = L, g = V({ modules: [], policies: {} }), f = S({ url: "", username: "", password: "", lines: "0" }), k = V(null), _ = V(!1), j = V([]), o = S({
      voltage: !1,
      current: !1,
      grouping: !1,
      naming: !1,
      action: !1,
      label: "",
      current_action: "none",
      voltage_min: "",
      voltage_max: "",
      current_min: "",
      current_max: "",
      group: ""
    }), v = S({}), U = S({}), D = V(""), P = V(null), M = V([]);
    let Z = 0;
    const K = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_output: "出力切替"
    };
    function w(n, e) {
      const t = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = K[n] ?? n;
      n === "configure_channels" && (a += " " + e.targets.length + " CH"), n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const u = S({
        id: ++Z,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: t,
        action: a,
        result: "処理中",
        detail: ""
      });
      return M.value = [u, ...M.value].slice(0, 100), u;
    }
    const B = S({}), c = V(!1), y = V(!1);
    let G = !1, I;
    const J = W(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of g.value.modules) {
        const t = String(e["Status.serialNumber"] ?? "");
        for (const [a, u] of Object.entries(e.channels)) {
          const r = g.value.policies[t + ":" + a] ?? {}, x = r.group || "未分類";
          n.has(x) || n.set(x, []), n.get(x).push({
            key: t + ":" + e.line + ":" + e.address + ":" + a,
            serial: t,
            channel: a,
            items: u,
            settings: r,
            location: e.line + "/" + e.address + "/" + a
          });
        }
      }
      return n;
    }), Q = W(() => [...J.value.values()].flat().filter((n) => n.serial)), R = W(() => Q.value.filter((n) => j.value.includes(n.key))), T = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "A" }
    ];
    function C(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function ee() {
      const n = {};
      for (const { key: t } of T)
        o[t] && (n[t + "_min"] = Number(o[t + "_min"]), n[t + "_max"] = Number(o[t + "_max"]));
      o.grouping && (n.group = o.group), o.naming && (n.label = o.label), o.action && (n.current_action = o.current_action);
      const e = R.value.map(({ serial: t, channel: a }) => ({ serial: t, channel: a }));
      await A("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function $(n, e) {
      const t = n[e];
      return t ? String(t.value) + (t.unit ? " " + t.unit : "") : "—";
    }
    function E(n, e) {
      const t = n[e]?.value;
      return t == null ? "—" : ["1", "true"].includes(String(t).toLowerCase()) ? "ON" : "OFF";
    }
    async function A(n, e, t, a) {
      const u = (x) => {
        a ? B[a] = x : D.value = x;
      }, r = w(n, e);
      c.value = !0, u("処理中…");
      try {
        return await z.client.request(n, e), r.result = n.startsWith("set_") ? "指令受理" : "保存完了", r.detail = t, u(t), !0;
      } catch (x) {
        return r.result = "エラー", r.detail = x.message, u(x.message), !1;
      } finally {
        c.value = !1;
      }
    }
    async function le() {
      await A("configure", {
        ...f,
        lines: f.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (f.password = "");
    }
    function X(n) {
      _.value = !0, k.value = n, v.current_action = n.settings.current_action ?? "none";
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        v[e] = n.settings[e] ?? "";
    }
    async function te() {
      const n = { ...v, serial: k.value.serial, channel: k.value.channel };
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        n[e] = n[e] === "" ? null : Number(n[e]);
      await A("configure_channel", n, "チャンネル設定を保存しました。") && (k.value = null);
    }
    function H(n, e, t) {
      return A(
        e,
        { serial: n.serial, channel: n.channel, value: t },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return ne(() => {
      I = z.client.subscribe("iseg", (n) => {
        y.value = !!n.connected, n.connection && (g.value = n, G || (Object.assign(f, n.connection, { lines: n.connection.lines.join(", ") }), G = !0));
      });
    }), ue(() => I?.()), (n, e) => (p(), m("article", null, [
      e[45] || (e[45] = l("h2", null, "iseg CC24", -1)),
      l("button", {
        type: "button",
        onClick: e[0] || (e[0] = (t) => P.value?.showModal())
      }, "操作ログ"),
      l("dialog", {
        ref_key: "logDialog",
        ref: P,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[23] || (e[23] = l("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          l("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          l("form", { method: "dialog" }, [
            l("button", null, "閉じる")
          ])
        ], -1)),
        M.value.length ? (p(), m("table", se, [
          e[22] || (e[22] = l("thead", null, [
            l("tr", null, [
              l("th", null, "時刻"),
              l("th", null, "対象"),
              l("th", null, "操作"),
              l("th", null, "結果"),
              l("th", null, "詳細")
            ])
          ], -1)),
          l("tbody", null, [
            (p(!0), m(h, null, F(M.value, (t) => (p(), m("tr", {
              key: t.id
            }, [
              l("td", re, i(t.time), 1),
              l("td", null, i(t.target), 1),
              l("td", null, i(t.action), 1),
              l("td", de, i(t.result), 1),
              l("td", null, i(t.detail), 1)
            ]))), 128))
          ])
        ])) : (p(), m("p", ae, "この画面からの操作はまだありません。"))
      ], 512),
      l("form", {
        onSubmit: O(le, ["prevent"])
      }, [
        l("label", null, [
          e[24] || (e[24] = d("WebSocket URL ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (t) => f.url = t),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              b,
              f.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[25] || (e[25] = d("ユーザー名 ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (t) => f.username = t),
            autocomplete: "username"
          }, null, 512), [
            [b, f.username]
          ])
        ]),
        l("label", null, [
          e[26] || (e[26] = d("パスワード ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (t) => f.password = t),
            type: "password",
            autocomplete: "new-password",
            placeholder: g.value.password_set ? "設定済み" : ""
          }, null, 8, pe), [
            [b, f.password]
          ])
        ]),
        l("label", null, [
          e[27] || (e[27] = d("CAN ライン ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (t) => f.lines = t),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [b, f.lines]
          ])
        ]),
        l("button", {
          disabled: c.value || !y.value
        }, "接続設定を保存", 8, me)
      ], 32),
      l("p", ve, i(y.value ? g.value.online ? "iCS2 接続中" : g.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      D.value ? (p(), m("p", be, i(D.value), 1)) : q("", !0),
      l("label", null, [
        s(l("input", {
          "onUpdate:modelValue": e[5] || (e[5] = (t) => _.value = t),
          type: "checkbox",
          role: "switch",
          onChange: e[6] || (e[6] = (t) => k.value = null)
        }, null, 544), [
          [N, _.value]
        ]),
        d(" " + i(_.value ? "詳細モード" : "モニターモード"), 1)
      ]),
      _.value ? (p(), m(h, { key: 1 }, [
        e[33] || (e[33] = l("h3", null, "選択チャンネルの一括設定", -1)),
        l("form", {
          onSubmit: O(ee, ["prevent"])
        }, [
          (p(), m(h, null, F(T, ({ key: t, label: a, unit: u }) => l("fieldset", { key: t }, [
            l("legend", null, [
              l("label", null, [
                s(l("input", {
                  "onUpdate:modelValue": (r) => o[t] = r,
                  type: "checkbox"
                }, null, 8, ge), [
                  [N, o[t]]
                ]),
                d(" " + i(a) + "の範囲を変更", 1)
              ])
            ]),
            l("label", null, [
              d("下限 (" + i(u) + ") ", 1),
              s(l("input", {
                "onUpdate:modelValue": (r) => o[t + "_min"] = r,
                type: "number",
                step: "any",
                disabled: !o[t],
                required: o[t]
              }, null, 8, fe), [
                [b, o[t + "_min"]]
              ])
            ]),
            l("label", null, [
              d("上限 (" + i(u) + ") ", 1),
              s(l("input", {
                "onUpdate:modelValue": (r) => o[t + "_max"] = r,
                type: "number",
                step: "any",
                disabled: !o[t],
                required: o[t]
              }, null, 8, ce), [
                [b, o[t + "_max"]]
              ])
            ])
          ])), 64)),
          l("label", null, [
            s(l("input", {
              "onUpdate:modelValue": e[7] || (e[7] = (t) => o.grouping = t),
              type: "checkbox"
            }, null, 512), [
              [N, o.grouping]
            ]),
            e[28] || (e[28] = d(" グループを変更", -1))
          ]),
          s(l("input", {
            "onUpdate:modelValue": e[8] || (e[8] = (t) => o.group = t),
            "aria-label": "グループ名",
            disabled: !o.grouping,
            maxlength: "100",
            placeholder: "空欄で未分類"
          }, null, 8, ye), [
            [b, o.group]
          ]),
          l("label", null, [
            s(l("input", {
              "onUpdate:modelValue": e[9] || (e[9] = (t) => o.naming = t),
              type: "checkbox"
            }, null, 512), [
              [N, o.naming]
            ]),
            e[29] || (e[29] = d(" 表示名を変更", -1))
          ]),
          s(l("input", {
            "onUpdate:modelValue": e[10] || (e[10] = (t) => o.label = t),
            "aria-label": "表示名",
            disabled: !o.naming,
            maxlength: "100"
          }, null, 8, ke), [
            [b, o.label]
          ]),
          l("label", null, [
            s(l("input", {
              "onUpdate:modelValue": e[11] || (e[11] = (t) => o.action = t),
              type: "checkbox"
            }, null, 512), [
              [N, o.action]
            ]),
            e[30] || (e[30] = d(" 電流上限超過時の動作を変更", -1))
          ]),
          s(l("select", {
            "onUpdate:modelValue": e[12] || (e[12] = (t) => o.current_action = t),
            "aria-label": "電流上限超過時の動作",
            disabled: !o.action
          }, [...e[31] || (e[31] = [
            l("option", { value: "none" }, "動作なし", -1),
            l("option", { value: "warn" }, "警告", -1),
            l("option", { value: "off" }, "出力 OFF", -1)
          ])], 8, xe), [
            [Y, o.current_action]
          ]),
          l("button", {
            disabled: c.value || !y.value || !R.value.length || !(o.voltage || o.current || o.grouping || o.naming || o.action)
          }, " 選択した " + i(R.value.length) + " CH に適用 ", 9, Ve)
        ], 32),
        l("table", _e, [
          e[32] || (e[32] = l("thead", null, [
            l("tr", null, [
              l("th", null, "選択"),
              l("th", null, "チャンネル"),
              l("th", null, "表示名"),
              l("th", null, "グループ"),
              l("th", null, "電圧範囲 (V)"),
              l("th", null, "電流範囲 (A)"),
              l("th", null, "電流超過時"),
              l("th")
            ])
          ], -1)),
          l("tbody", null, [
            (p(!0), m(h, null, F(Q.value, (t) => (p(), m("tr", {
              key: t.key
            }, [
              l("td", null, [
                s(l("input", {
                  "onUpdate:modelValue": e[13] || (e[13] = (a) => j.value = a),
                  type: "checkbox",
                  value: t.key,
                  "aria-label": t.serial + " CH " + t.channel
                }, null, 8, Ce), [
                  [N, j.value]
                ])
              ]),
              l("td", null, i("CH " + t.channel) + " · " + i(t.serial) + " / " + i(t.location), 1),
              l("td", null, i(t.settings.label || "—"), 1),
              l("td", null, i(t.settings.group || "未分類"), 1),
              (p(), m(h, null, F(T, ({ key: a }) => l("td", { key: a }, i(C(t, a) ? t.settings[a + "_min"] + " ～ " + t.settings[a + "_max"] : "未設定"), 1)), 64)),
              l("td", null, i({ warn: "警告", off: "出力 OFF" }[t.settings.current_action] || "動作なし"), 1),
              l("td", null, [
                l("button", {
                  type: "button",
                  onClick: (a) => X(t)
                }, "編集", 8, he)
              ])
            ]))), 128))
          ])
        ])
      ], 64)) : q("", !0),
      (p(!0), m(h, null, F(_.value ? [] : J.value, ([t, a]) => (p(), m("section", { key: t }, [
        l("h3", null, i(t), 1),
        l("div", Ue, [
          l("table", null, [
            e[36] || (e[36] = l("thead", null, [
              l("tr", null, [
                l("th", null, "チャンネル"),
                l("th", null, "電圧 設定 / 実測"),
                l("th", null, "電流 設定 / 実測"),
                l("th", null, "出力 / ランプ / トリップ"),
                l("th", null, "操作")
              ])
            ], -1)),
            l("tbody", null, [
              (p(!0), m(h, null, F(a, (u) => (p(), m("tr", {
                key: u.key,
                style: { "white-space": "nowrap" }
              }, [
                l("td", null, [
                  d(i(u.settings.label || "CH " + u.channel) + " ", 1),
                  l("small", null, i(u.serial || "S/N 不明") + " · " + i(u.location), 1)
                ]),
                l("td", null, i($(u.items, "Control.voltageSet")) + " / " + i($(u.items, "Status.voltageMeasure")), 1),
                l("td", null, i($(u.items, "Control.currentSet")) + " / " + i($(u.items, "Status.currentMeasure")), 1),
                l("td", null, [
                  d(i(E(u.items, "Status.on")) + " / " + i(E(u.items, "Status.voltageRamping")) + " / " + i(E(u.items, "Error.currentTrip")) + " ", 1),
                  g.value.overcurrent?.[u.serial + ":" + u.channel] ? (p(), m("strong", Se, i(g.value.overcurrent[u.serial + ":" + u.channel]), 1)) : q("", !0)
                ]),
                l("td", null, [
                  l("div", Fe, [
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: O((r) => H(u, "set_voltage", Number(U[u.key + "v"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[34] || (e[34] = d("V ", -1)),
                        s(l("input", {
                          "onUpdate:modelValue": (r) => U[u.key + "v"] = r,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, Oe), [
                          [b, U[u.key + "v"]]
                        ])
                      ]),
                      l("button", {
                        disabled: c.value || !y.value || !g.value.online || !u.serial || !C(u, "voltage")
                      }, "設定", 8, qe)
                    ], 40, Ne),
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: O((r) => H(u, "set_current", Number(U[u.key + "a"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[35] || (e[35] = d("A ", -1)),
                        s(l("input", {
                          "onUpdate:modelValue": (r) => U[u.key + "a"] = r,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, $e), [
                          [b, U[u.key + "a"]]
                        ])
                      ]),
                      l("button", {
                        disabled: c.value || !y.value || !g.value.online || !u.serial || !C(u, "current")
                      }, "設定", 8, Ae)
                    ], 40, Me),
                    l("button", {
                      type: "button",
                      disabled: c.value || !y.value || !g.value.online || !u.serial || !C(u, "voltage") || !C(u, "current"),
                      onClick: (r) => H(u, "set_output", !0)
                    }, "ON", 8, He),
                    l("button", {
                      type: "button",
                      disabled: c.value || !y.value || !g.value.online || !u.serial,
                      onClick: (r) => H(u, "set_output", !1)
                    }, "OFF", 8, Le),
                    l("button", {
                      type: "button",
                      disabled: c.value || !y.value || !u.serial,
                      onClick: (r) => X(u)
                    }, i(C(u, "voltage") && C(u, "current") ? "詳細" : "許容範囲を設定"), 9, je),
                    B[u.key] ? (p(), m("span", De, i(B[u.key]), 1)) : q("", !0)
                  ])
                ])
              ]))), 128))
            ])
          ])
        ])
      ]))), 128)),
      k.value && _.value ? (p(), m("form", {
        key: 2,
        onSubmit: O(te, ["prevent"])
      }, [
        l("h3", null, i(k.value.serial) + " / CH " + i(k.value.channel), 1),
        l("label", null, [
          e[37] || (e[37] = d("表示名 ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (t) => v.label = t),
            maxlength: "100"
          }, null, 512), [
            [b, v.label]
          ])
        ]),
        l("label", null, [
          e[38] || (e[38] = d("グループ ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (t) => v.group = t),
            maxlength: "100"
          }, null, 512), [
            [b, v.group]
          ])
        ]),
        l("label", null, [
          e[39] || (e[39] = d("最低電圧 (V) ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (t) => v.voltage_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, v.voltage_min]
          ])
        ]),
        l("label", null, [
          e[40] || (e[40] = d("最高電圧 (V) ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[17] || (e[17] = (t) => v.voltage_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, v.voltage_max]
          ])
        ]),
        l("label", null, [
          e[41] || (e[41] = d("最低電流 (A) ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[18] || (e[18] = (t) => v.current_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, v.current_min]
          ])
        ]),
        l("label", null, [
          e[42] || (e[42] = d("最高電流 (A) ", -1)),
          s(l("input", {
            "onUpdate:modelValue": e[19] || (e[19] = (t) => v.current_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [b, v.current_max]
          ])
        ]),
        l("label", null, [
          e[44] || (e[44] = d("電流上限超過時の動作 ", -1)),
          s(l("select", {
            "onUpdate:modelValue": e[20] || (e[20] = (t) => v.current_action = t)
          }, [...e[43] || (e[43] = [
            l("option", { value: "none" }, "動作なし", -1),
            l("option", { value: "warn" }, "警告", -1),
            l("option", { value: "off" }, "出力 OFF", -1)
          ])], 512), [
            [Y, v.current_action]
          ])
        ]),
        l("button", {
          disabled: c.value || !y.value
        }, "保存", 8, Be),
        l("button", {
          type: "button",
          onClick: e[21] || (e[21] = (t) => k.value = null)
        }, "閉じる")
      ], 32)) : q("", !0)
    ]));
  }
};
function Ee(L) {
  return oe({
    setup() {
      return () => ie(Re, { client: L });
    }
  });
}
export {
  Ee as mount
};
