import { ref as x, reactive as S, computed as G, onMounted as pe, onUnmounted as me, openBlock as d, createElementBlock as p, createElementVNode as l, Fragment as V, renderList as U, toDisplayString as s, withModifiers as H, createTextVNode as m, withDirectives as o, vModelText as v, createCommentVNode as F, normalizeStyle as J, vModelCheckbox as A, vModelSelect as ee, defineComponent as ge, h as ve } from "vue";
const be = { key: 0 }, fe = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, ce = { style: { "white-space": "nowrap" } }, ye = { style: { "white-space": "nowrap" } }, ke = ["placeholder"], he = ["disabled"], _e = { role: "status" }, xe = {
  key: 0,
  role: "status"
}, Ve = { style: { display: "inline-flex", "align-items": "center", gap: ".5rem" } }, Ce = ["aria-checked"], Se = { style: { "margin-inline-start": "1rem" } }, Ue = ["disabled", "checked", ".indeterminate"], Fe = ["onUpdate:modelValue"], Ne = ["onUpdate:modelValue", "disabled", "required"], Oe = ["onUpdate:modelValue", "disabled", "required"], qe = ["disabled"], Me = ["disabled"], He = ["disabled"], Ae = ["disabled"], $e = { style: { "text-align": "left" } }, Le = ["value", "aria-label"], je = ["onSubmit"], De = ["aria-label", "value", "disabled", "onInput"], Re = {
  key: 0,
  role: "status"
}, Te = ["onClick"], Be = { key: 2 }, Ee = { style: { "overflow-x": "auto" } }, Ie = ["value", "disabled", "aria-label"], ze = ["disabled", "onClick", "aria-label", "title"], We = { style: { display: "flex", "align-items": "center", gap: ".35rem" } }, Pe = ["onSubmit"], Ge = ["onUpdate:modelValue"], Je = ["disabled"], Qe = ["onSubmit"], Xe = ["onUpdate:modelValue"], Ye = ["disabled"], Ze = {
  key: 0,
  role: "status"
}, Ke = {
  key: 1,
  role: "status"
}, we = ["disabled"], el = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(B) {
    const Q = B, b = x({ modules: [], policies: {} }), f = S({ url: "", username: "", password: "", lines: "0" }), k = x(null), c = x(!1), N = x([]), D = S({}), a = S({
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
    }), g = S({}), O = S({}), E = x(""), X = x(null), R = x([]);
    let le = 0;
    const te = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_output: "出力切替"
    };
    function ne(n, e) {
      const t = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let i = te[n] ?? n;
      n === "configure_channels" && (i += " " + e.targets.length + " CH"), n === "set_voltage" && (i += " " + e.value + " V"), n === "set_current" && (i += " " + e.value + " A"), n === "set_output" && (i += e.value ? " ON" : " OFF");
      const u = S({
        id: ++le,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: t,
        action: i,
        result: "処理中",
        detail: ""
      });
      return R.value = [u, ...R.value].slice(0, 100), u;
    }
    const $ = S({}), h = x(!1), y = x(!1);
    let Y = !1, Z;
    const K = G(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of b.value.modules) {
        const t = String(e["Status.serialNumber"] ?? "");
        for (const [i, u] of Object.entries(e.channels)) {
          const r = b.value.policies[t + ":" + i] ?? {}, _ = r.group || "未分類";
          n.has(_) || n.set(_, []), n.get(_).push({
            key: t + ":" + e.line + ":" + e.address + ":" + i,
            serial: t,
            channel: i,
            items: u,
            settings: r,
            location: e.line + "/" + e.address + "/" + i
          });
        }
      }
      return n;
    }), C = G(() => [...K.value.values()].flat().filter((n) => n.serial)), q = G(() => C.value.filter((n) => N.value.includes(n.key)));
    function ue(n) {
      N.value = n.target.checked ? C.value.map((e) => e.key) : [];
    }
    const I = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "A" }
    ];
    function L(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function ae() {
      const n = {};
      for (const { key: t } of I)
        a[t] && (n[t + "_min"] = Number(a[t + "_min"]), n[t + "_max"] = Number(a[t + "_max"]));
      a.grouping && (n.group = a.group), a.naming && (n.label = a.label), a.action && (n.current_action = a.current_action);
      const e = q.value.map(({ serial: t, channel: i }) => ({ serial: t, channel: i }));
      await j("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function T(n, e) {
      const t = n[e];
      return t ? String(t.value) + (t.unit ? " " + t.unit : "") : "—";
    }
    function M(n, e) {
      const t = String(n[e]?.value).toLowerCase();
      return ["1", "true"].includes(t) ? !0 : ["0", "false"].includes(t) ? !1 : null;
    }
    function z(n) {
      return !y.value || !b.value.online || M(n.items, "Status.on") === null ? "不明" : b.value.overcurrent?.[n.serial + ":" + n.channel] || M(n.items, "Error.currentTrip") ? "異常" : M(n.items, "Status.voltageRamping") ? "ランプ中" : M(n.items, "Status.on") ? "ON" : "OFF";
    }
    const w = { 不明: "#edf1f5", 異常: "#fbe0de", ランプ中: "#fff0cb", ON: "#dcf2e4", OFF: "#fff" };
    function W(n) {
      const e = M(n.items, "Status.on");
      return !h.value && y.value && b.value.online && n.serial && e !== null && (e || L(n, "voltage") && L(n, "current"));
    }
    function ie(n) {
      W(n) && P(n, "set_output", !M(n.items, "Status.on"));
    }
    async function se(n) {
      const e = D[n.key];
      e !== void 0 && await j("configure_channels", {
        targets: [{ serial: n.serial, channel: n.channel }],
        changes: { label: e }
      }, "表示名を保存しました。", n.key) && delete D[n.key];
    }
    async function j(n, e, t, i) {
      const u = (_) => {
        i ? $[i] = _ : E.value = _;
      }, r = ne(n, e);
      h.value = !0, u("処理中…");
      try {
        return await Q.client.request(n, e), r.result = n.startsWith("set_") ? "指令受理" : "保存完了", r.detail = t, u(t), !0;
      } catch (_) {
        return r.result = "エラー", r.detail = _.message, u(_.message), !1;
      } finally {
        h.value = !1;
      }
    }
    async function oe() {
      await j("configure", {
        ...f,
        lines: f.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (f.password = "");
    }
    function re(n) {
      c.value = !0, k.value = n, g.current_action = n.settings.current_action ?? "none";
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        g[e] = n.settings[e] ?? "";
    }
    async function de() {
      const n = { ...g };
      delete n.label;
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        n[e] = n[e] === "" ? null : Number(n[e]);
      await j("configure_channels", {
        targets: [{ serial: k.value.serial, channel: k.value.channel }],
        changes: n
      }, "チャンネル設定を保存しました。") && (k.value = null);
    }
    function P(n, e, t) {
      return j(
        e,
        { serial: n.serial, channel: n.channel, value: t },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return pe(() => {
      Z = Q.client.subscribe("iseg", (n) => {
        y.value = !!n.connected, n.connection && (b.value = n, Y || (Object.assign(f, n.connection, { lines: n.connection.lines.join(", ") }), Y = !0));
      });
    }), me(() => Z?.()), (n, e) => (d(), p("article", null, [
      e[48] || (e[48] = l("h2", null, "iseg CC24", -1)),
      l("button", {
        type: "button",
        onClick: e[0] || (e[0] = (t) => X.value?.showModal())
      }, "操作ログ"),
      l("dialog", {
        ref_key: "logDialog",
        ref: X,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[22] || (e[22] = l("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          l("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          l("form", { method: "dialog" }, [
            l("button", null, "閉じる")
          ])
        ], -1)),
        R.value.length ? (d(), p("table", fe, [
          e[21] || (e[21] = l("thead", null, [
            l("tr", null, [
              l("th", null, "時刻"),
              l("th", null, "対象"),
              l("th", null, "操作"),
              l("th", null, "結果"),
              l("th", null, "詳細")
            ])
          ], -1)),
          l("tbody", null, [
            (d(!0), p(V, null, U(R.value, (t) => (d(), p("tr", {
              key: t.id
            }, [
              l("td", ce, s(t.time), 1),
              l("td", null, s(t.target), 1),
              l("td", null, s(t.action), 1),
              l("td", ye, s(t.result), 1),
              l("td", null, s(t.detail), 1)
            ]))), 128))
          ])
        ])) : (d(), p("p", be, "この画面からの操作はまだありません。"))
      ], 512),
      l("form", {
        onSubmit: H(oe, ["prevent"])
      }, [
        l("label", null, [
          e[23] || (e[23] = m("WebSocket URL ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (t) => f.url = t),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              v,
              f.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[24] || (e[24] = m("ユーザー名 ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (t) => f.username = t),
            autocomplete: "username"
          }, null, 512), [
            [v, f.username]
          ])
        ]),
        l("label", null, [
          e[25] || (e[25] = m("パスワード ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (t) => f.password = t),
            type: "password",
            autocomplete: "new-password",
            placeholder: b.value.password_set ? "設定済み" : ""
          }, null, 8, ke), [
            [v, f.password]
          ])
        ]),
        l("label", null, [
          e[26] || (e[26] = m("CAN ライン ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (t) => f.lines = t),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [v, f.lines]
          ])
        ]),
        l("button", {
          disabled: h.value || !y.value
        }, "接続設定を保存", 8, he)
      ], 32),
      l("p", _e, s(y.value ? b.value.online ? "iCS2 接続中" : b.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      E.value ? (d(), p("p", xe, s(E.value), 1)) : F("", !0),
      l("div", Ve, [
        e[28] || (e[28] = l("span", null, "モニター", -1)),
        l("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": c.value,
          onClick: e[5] || (e[5] = (t) => {
            c.value = !c.value, k.value = null;
          }),
          style: J({
            width: "2.75rem",
            height: "1.5rem",
            padding: ".15rem",
            border: 0,
            borderRadius: "1rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: c.value ? "flex-end" : "flex-start",
            background: c.value ? "#145375" : "#627786"
          })
        }, [...e[27] || (e[27] = [
          l("span", {
            "aria-hidden": "true",
            style: { width: "1.2rem", height: "1.2rem", "border-radius": "50%", background: "white" }
          }, null, -1)
        ])], 12, Ce),
        e[29] || (e[29] = l("span", null, "詳細", -1))
      ]),
      l("label", Se, [
        l("input", {
          type: "checkbox",
          disabled: !C.value.length,
          onChange: ue,
          checked: C.value.length > 0 && q.value.length === C.value.length,
          ".indeterminate": q.value.length > 0 && q.value.length < C.value.length
        }, null, 40, Ue),
        e[30] || (e[30] = m(" 全選択 ", -1))
      ]),
      c.value ? (d(), p(V, { key: 1 }, [
        e[36] || (e[36] = l("h3", null, "選択チャンネルの一括設定", -1)),
        l("form", {
          onSubmit: H(ae, ["prevent"])
        }, [
          (d(), p(V, null, U(I, ({ key: t, label: i, unit: u }) => l("fieldset", { key: t }, [
            l("legend", null, [
              l("label", null, [
                o(l("input", {
                  "onUpdate:modelValue": (r) => a[t] = r,
                  type: "checkbox"
                }, null, 8, Fe), [
                  [A, a[t]]
                ]),
                m(" " + s(i) + "の範囲を変更", 1)
              ])
            ]),
            l("label", null, [
              m("下限 (" + s(u) + ") ", 1),
              o(l("input", {
                "onUpdate:modelValue": (r) => a[t + "_min"] = r,
                type: "number",
                step: "any",
                disabled: !a[t],
                required: a[t]
              }, null, 8, Ne), [
                [v, a[t + "_min"]]
              ])
            ]),
            l("label", null, [
              m("上限 (" + s(u) + ") ", 1),
              o(l("input", {
                "onUpdate:modelValue": (r) => a[t + "_max"] = r,
                type: "number",
                step: "any",
                disabled: !a[t],
                required: a[t]
              }, null, 8, Oe), [
                [v, a[t + "_max"]]
              ])
            ])
          ])), 64)),
          l("label", null, [
            o(l("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (t) => a.grouping = t),
              type: "checkbox"
            }, null, 512), [
              [A, a.grouping]
            ]),
            e[31] || (e[31] = m(" グループを変更", -1))
          ]),
          o(l("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (t) => a.group = t),
            "aria-label": "グループ名",
            disabled: !a.grouping,
            maxlength: "100",
            placeholder: "空欄で未分類"
          }, null, 8, qe), [
            [v, a.group]
          ]),
          l("label", null, [
            o(l("input", {
              "onUpdate:modelValue": e[8] || (e[8] = (t) => a.naming = t),
              type: "checkbox"
            }, null, 512), [
              [A, a.naming]
            ]),
            e[32] || (e[32] = m(" 表示名を変更", -1))
          ]),
          o(l("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (t) => a.label = t),
            "aria-label": "表示名",
            disabled: !a.naming,
            maxlength: "100"
          }, null, 8, Me), [
            [v, a.label]
          ]),
          l("label", null, [
            o(l("input", {
              "onUpdate:modelValue": e[10] || (e[10] = (t) => a.action = t),
              type: "checkbox"
            }, null, 512), [
              [A, a.action]
            ]),
            e[33] || (e[33] = m(" 電流上限超過時の動作を変更", -1))
          ]),
          o(l("select", {
            "onUpdate:modelValue": e[11] || (e[11] = (t) => a.current_action = t),
            "aria-label": "電流上限超過時の動作",
            disabled: !a.action
          }, [...e[34] || (e[34] = [
            l("option", { value: "none" }, "動作なし", -1),
            l("option", { value: "warn" }, "警告", -1),
            l("option", { value: "off" }, "出力 OFF", -1)
          ])], 8, He), [
            [ee, a.current_action]
          ]),
          l("button", {
            disabled: h.value || !y.value || !q.value.length || !(a.voltage || a.current || a.grouping || a.naming || a.action)
          }, " 選択した " + s(q.value.length) + " CH に適用 ", 9, Ae)
        ], 32),
        l("table", $e, [
          e[35] || (e[35] = l("thead", null, [
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
            (d(!0), p(V, null, U(C.value, (t) => (d(), p("tr", {
              key: t.key
            }, [
              l("td", null, [
                o(l("input", {
                  "onUpdate:modelValue": e[12] || (e[12] = (i) => N.value = i),
                  type: "checkbox",
                  value: t.key,
                  "aria-label": t.serial + " CH " + t.channel
                }, null, 8, Le), [
                  [A, N.value]
                ])
              ]),
              l("td", null, s("CH " + t.channel) + " · " + s(t.serial) + " / " + s(t.location), 1),
              l("td", null, [
                l("form", {
                  onSubmit: H((i) => se(t), ["prevent"])
                }, [
                  l("input", {
                    "aria-label": t.serial + " CH " + t.channel + " 表示名",
                    value: D[t.key] ?? t.settings.label ?? "",
                    disabled: h.value || !y.value,
                    maxlength: "100",
                    onInput: (i) => D[t.key] = i.target.value
                  }, null, 40, De)
                ], 40, je),
                $[t.key] ? (d(), p("small", Re, s($[t.key]), 1)) : F("", !0)
              ]),
              l("td", null, s(t.settings.group || "未分類"), 1),
              (d(), p(V, null, U(I, ({ key: i }) => l("td", { key: i }, s(L(t, i) ? t.settings[i + "_min"] + " ～ " + t.settings[i + "_max"] : "未設定"), 1)), 64)),
              l("td", null, s({ warn: "警告", off: "出力 OFF" }[t.settings.current_action] || "動作なし"), 1),
              l("td", null, [
                l("button", {
                  type: "button",
                  onClick: (i) => re(t)
                }, "編集", 8, Te)
              ])
            ]))), 128))
          ])
        ])
      ], 64)) : F("", !0),
      c.value ? F("", !0) : (d(), p("p", Be, [
        e[37] || (e[37] = m("行の色： ", -1)),
        (d(), p(V, null, U(w, (t, i) => l("span", {
          key: i,
          style: J({ background: t, padding: ".15rem .4rem", marginInlineEnd: ".25rem", border: "1px solid #bcc8cf" })
        }, s(i), 5)), 64))
      ])),
      (d(!0), p(V, null, U(c.value ? [] : K.value, ([t, i]) => (d(), p("section", { key: t }, [
        l("h3", null, s(t), 1),
        l("div", Ee, [
          l("table", null, [
            e[40] || (e[40] = l("thead", null, [
              l("tr", null, [
                l("th", null, "選択"),
                l("th", null, "表示名"),
                l("th", null, "電圧 設定 / 実測"),
                l("th", null, "電流 設定 / 実測"),
                l("th", null, "設定")
              ])
            ], -1)),
            l("tbody", null, [
              (d(!0), p(V, null, U(i, (u) => (d(), p("tr", {
                key: u.key,
                style: J({ background: w[z(u)], whiteSpace: "nowrap" })
              }, [
                l("td", null, [
                  o(l("input", {
                    "onUpdate:modelValue": e[13] || (e[13] = (r) => N.value = r),
                    type: "checkbox",
                    value: u.key,
                    disabled: !u.serial,
                    "aria-label": "選択: " + (u.settings.label || "CH " + u.channel)
                  }, null, 8, Ie), [
                    [A, N.value]
                  ])
                ]),
                l("td", null, [
                  l("button", {
                    type: "button",
                    disabled: !W(u),
                    onClick: (r) => ie(u),
                    "aria-label": (u.settings.label || "CH " + u.channel) + "、状態: " + z(u),
                    title: z(u) + (W(u) ? "。クリックで出力切替" : "")
                  }, s(u.settings.label || "CH " + u.channel), 9, ze)
                ]),
                l("td", null, s(T(u.items, "Control.voltageSet")) + " / " + s(T(u.items, "Status.voltageMeasure")), 1),
                l("td", null, s(T(u.items, "Control.currentSet")) + " / " + s(T(u.items, "Status.currentMeasure")), 1),
                l("td", null, [
                  l("div", We, [
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: H((r) => P(u, "set_voltage", Number(O[u.key + "v"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[38] || (e[38] = m("V ", -1)),
                        o(l("input", {
                          "onUpdate:modelValue": (r) => O[u.key + "v"] = r,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, Ge), [
                          [v, O[u.key + "v"]]
                        ])
                      ]),
                      l("button", {
                        disabled: h.value || !y.value || !b.value.online || !u.serial || !L(u, "voltage")
                      }, "設定", 8, Je)
                    ], 40, Pe),
                    l("form", {
                      style: { display: "inline-flex", "align-items": "center", gap: ".2rem", margin: "0" },
                      onSubmit: H((r) => P(u, "set_current", Number(O[u.key + "a"])), ["prevent"])
                    }, [
                      l("label", null, [
                        e[39] || (e[39] = m("A ", -1)),
                        o(l("input", {
                          "onUpdate:modelValue": (r) => O[u.key + "a"] = r,
                          type: "number",
                          step: "any",
                          required: "",
                          style: { width: "5em" }
                        }, null, 8, Xe), [
                          [v, O[u.key + "a"]]
                        ])
                      ]),
                      l("button", {
                        disabled: h.value || !y.value || !b.value.online || !u.serial || !L(u, "current")
                      }, "設定", 8, Ye)
                    ], 40, Qe),
                    b.value.overcurrent?.[u.serial + ":" + u.channel] ? (d(), p("span", Ze, s(b.value.overcurrent[u.serial + ":" + u.channel]), 1)) : F("", !0),
                    $[u.key] ? (d(), p("span", Ke, s($[u.key]), 1)) : F("", !0)
                  ])
                ])
              ], 4))), 128))
            ])
          ])
        ])
      ]))), 128)),
      k.value && c.value ? (d(), p("form", {
        key: 3,
        onSubmit: H(de, ["prevent"])
      }, [
        l("h3", null, s(k.value.serial) + " / CH " + s(k.value.channel), 1),
        l("label", null, [
          e[41] || (e[41] = m("グループ ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (t) => g.group = t),
            maxlength: "100"
          }, null, 512), [
            [v, g.group]
          ])
        ]),
        l("label", null, [
          e[42] || (e[42] = m("最低電圧 (V) ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (t) => g.voltage_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.voltage_min]
          ])
        ]),
        l("label", null, [
          e[43] || (e[43] = m("最高電圧 (V) ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (t) => g.voltage_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.voltage_max]
          ])
        ]),
        l("label", null, [
          e[44] || (e[44] = m("最低電流 (A) ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[17] || (e[17] = (t) => g.current_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.current_min]
          ])
        ]),
        l("label", null, [
          e[45] || (e[45] = m("最高電流 (A) ", -1)),
          o(l("input", {
            "onUpdate:modelValue": e[18] || (e[18] = (t) => g.current_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [v, g.current_max]
          ])
        ]),
        l("label", null, [
          e[47] || (e[47] = m("電流上限超過時の動作 ", -1)),
          o(l("select", {
            "onUpdate:modelValue": e[19] || (e[19] = (t) => g.current_action = t)
          }, [...e[46] || (e[46] = [
            l("option", { value: "none" }, "動作なし", -1),
            l("option", { value: "warn" }, "警告", -1),
            l("option", { value: "off" }, "出力 OFF", -1)
          ])], 512), [
            [ee, g.current_action]
          ])
        ]),
        l("button", {
          disabled: h.value || !y.value
        }, "保存", 8, we),
        l("button", {
          type: "button",
          onClick: e[20] || (e[20] = (t) => k.value = null)
        }, "閉じる")
      ], 32)) : F("", !0)
    ]));
  }
};
function tl(B) {
  return ge({
    setup() {
      return () => ve(el, { client: B });
    }
  });
}
export {
  tl as mount
};
