import { ref as x, reactive as V, computed as Y, onMounted as xe, onUnmounted as Ce, openBlock as o, createElementBlock as r, createElementVNode as t, Fragment as C, renderList as S, toDisplayString as i, withModifiers as F, createTextVNode as c, withDirectives as m, vModelText as g, createCommentVNode as M, normalizeStyle as Z, vModelCheckbox as L, vModelSelect as Ve, defineComponent as Se, h as Ue } from "vue";
const Fe = { class: "iseg-panel" }, Ae = { key: 0 }, Ne = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, Oe = { style: { "white-space": "nowrap" } }, He = { style: { "white-space": "nowrap" } }, Me = ["placeholder"], qe = ["disabled"], De = { role: "status" }, je = {
  key: 0,
  role: "status"
}, $e = { style: { display: "inline-flex", "align-items": "center", gap: ".5rem" } }, Le = ["aria-checked"], Te = { style: { "margin-inline-start": "1rem" } }, Ie = ["disabled", "checked", ".indeterminate"], Re = ["onUpdate:modelValue"], Be = ["onUpdate:modelValue", "disabled", "required"], Ee = ["onUpdate:modelValue", "disabled", "required"], Pe = ["disabled"], We = ["disabled"], ze = ["disabled"], Je = {
  class: "iseg-table-scroll",
  tabindex: "0",
  role: "region",
  "aria-label": "チャンネル詳細"
}, Ge = { class: "iseg-data iseg-detail" }, Qe = ["value", "aria-label"], Xe = { class: "iseg-address" }, Ye = ["onSubmit"], Ze = ["aria-label", "value", "disabled", "onInput"], Ke = {
  key: 0,
  role: "status"
}, we = { class: "iseg-number" }, et = ["onSubmit"], tt = ["onUpdate:modelValue", "aria-label"], lt = ["disabled"], nt = ["onSubmit"], st = ["onUpdate:modelValue", "aria-label"], at = { value: void 0 }, ut = ["value"], it = ["disabled"], ot = { key: 1 }, rt = ["onClick"], dt = { key: 2 }, mt = ["aria-label"], ct = { class: "iseg-data iseg-monitor" }, gt = ["value", "disabled", "aria-label"], bt = ["disabled", "onClick", "aria-label", "title"], pt = { class: "iseg-number" }, vt = { class: "iseg-number iseg-measured" }, ft = { class: "iseg-number" }, ht = { class: "iseg-number iseg-measured" }, yt = ["onSubmit"], _t = ["onUpdate:modelValue", "aria-label"], kt = ["disabled"], xt = {
  key: 0,
  class: "iseg-row-feedback",
  role: "status"
}, Ct = ["disabled"], Vt = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(E) {
    const K = E, v = x({ modules: [], policies: {} }), b = V({ url: "", username: "", password: "", lines: "0" }), _ = x(null), h = x(!1), A = x([]), T = V({}), u = V({
      voltage: !1,
      current: !1,
      grouping: !1,
      naming: !1,
      label: "",
      voltage_min: "",
      voltage_max: "",
      current_min: "",
      current_max: "",
      group: ""
    }), p = V({}), N = V({}), q = V({}), I = {
      0: "動作なし",
      1: "CH OFF（ランプあり）",
      2: "CH OFF（ランプなし）",
      3: "モジュール OFF（ランプなし）",
      4: "遅延トリップ無効"
    };
    function P(n) {
      const e = String(n.items["Setup.delayedTripAction"]?.value);
      return Object.hasOwn(I, e) ? e : "";
    }
    async function oe(n) {
      const e = q[n.key];
      !P(n) || e == null || await B(n, "set_trip_action", Number(e)) && delete q[n.key];
    }
    const w = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 4 }), ee = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 3, maximumFractionDigits: 6 }), re = { V: 1, kV: 1e3 }, de = { kA: 1e6, A: 1e3, mA: 1, µA: 1e-3, μA: 1e-3, uA: 1e-3, nA: 1e-6 }, W = (n) => Number(n) / 1e3, z = x(""), te = x(null), R = x([]);
    let me = 0;
    const ce = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_trip_action: "iseg 遅延トリップ設定",
      set_output: "出力切替"
    };
    function ge(n, e) {
      const l = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = ce[n] ?? n;
      n === "configure_channels" && (a += " " + e.targets.length + " CH"), n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_trip_action" && (a += "：" + I[e.value]), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const s = V({
        id: ++me,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: l,
        action: a,
        result: "処理中",
        detail: ""
      });
      return R.value = [s, ...R.value].slice(0, 100), s;
    }
    const D = V({}), y = x(!1), f = x(!1);
    let le = !1, ne;
    const se = Y(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of v.value.modules) {
        const l = String(e["Status.serialNumber"] ?? "");
        for (const [a, s] of Object.entries(e.channels)) {
          const d = v.value.policies[l + ":" + a] ?? {}, k = d.group || "未分類";
          n.has(k) || n.set(k, []), n.get(k).push({
            key: l + ":" + e.line + ":" + e.address + ":" + a,
            serial: l,
            channel: a,
            items: s,
            settings: d,
            location: e.line + "/" + e.address + "/" + a
          });
        }
      }
      return n;
    }), U = Y(() => [...se.value.values()].flat().filter((n) => n.serial)), O = Y(() => U.value.filter((n) => A.value.includes(n.key)));
    function be(n) {
      A.value = n.target.checked ? U.value.map((e) => e.key) : [];
    }
    const J = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "mA" }
    ];
    function j(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function pe() {
      const n = {};
      for (const { key: l } of J)
        if (u[l]) {
          const a = l === "current" ? W : Number;
          n[l + "_min"] = a(u[l + "_min"]), n[l + "_max"] = a(u[l + "_max"]);
        }
      u.grouping && (n.group = u.group), u.naming && (n.label = u.label);
      const e = O.value.map(({ serial: l, channel: a }) => ({ serial: l, channel: a }));
      await $("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function ae(n, e, l, a) {
      const s = n[e];
      if (s?.value == null || typeof s.value == "string" && !s.value.trim()) return "—";
      const d = Number(s.value) * l[s.unit];
      return Number.isFinite(d) ? a.format(d) : "—";
    }
    function ue(n, e) {
      return ae(n, e, re, w);
    }
    function G(n, e) {
      return ae(n, e, de, ee);
    }
    function ve(n, e) {
      if (!j(n, e)) return "未設定";
      const l = e === "current" ? 1e3 : 1, a = e === "current" ? ee : w;
      return a.format(n.settings[e + "_min"] * l) + " ～ " + a.format(n.settings[e + "_max"] * l);
    }
    function H(n, e) {
      const l = String(n[e]?.value).toLowerCase();
      return ["1", "true"].includes(l) ? !0 : ["0", "false"].includes(l) ? !1 : null;
    }
    function Q(n) {
      return !f.value || !v.value.online || H(n.items, "Status.on") === null ? "不明" : H(n.items, "Error.currentTrip") ? "異常" : H(n.items, "Status.voltageRamping") ? "ランプ中" : H(n.items, "Status.on") ? "ON" : "OFF";
    }
    const ie = { 不明: "#edf1f5", 異常: "#fbe0de", ランプ中: "#fff0cb", ON: "#dcf2e4", OFF: "#fff" };
    function X(n) {
      const e = H(n.items, "Status.on");
      return !y.value && f.value && v.value.online && n.serial && e !== null && (e || j(n, "voltage") && j(n, "current"));
    }
    function fe(n) {
      X(n) && B(n, "set_output", !H(n.items, "Status.on"));
    }
    async function he(n) {
      const e = T[n.key];
      e !== void 0 && await $("configure_channels", {
        targets: [{ serial: n.serial, channel: n.channel }],
        changes: { label: e }
      }, "表示名を保存しました。", n.key) && delete T[n.key];
    }
    async function $(n, e, l, a) {
      const s = (k) => {
        a ? D[a] = k : z.value = k;
      }, d = ge(n, e);
      y.value = !0, s("処理中…");
      try {
        return await K.client.request(n, e), d.result = n.startsWith("set_") ? "指令受理" : "保存完了", d.detail = l, s(l), !0;
      } catch (k) {
        return d.result = "エラー", d.detail = k.message, s(k.message), !1;
      } finally {
        y.value = !1;
      }
    }
    async function ye() {
      await $("configure", {
        ...b,
        lines: b.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (b.password = "");
    }
    function _e(n) {
      h.value = !0, _.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = n.settings[e];
        p[e] = l != null && e.startsWith("current_") ? Number((l * 1e3).toPrecision(15)) : l ?? "";
      }
    }
    async function ke() {
      const n = { ...p };
      delete n.label;
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = e.startsWith("current_") ? W : Number;
        n[e] = n[e] === "" ? null : l(n[e]);
      }
      await $("configure_channels", {
        targets: [{ serial: _.value.serial, channel: _.value.channel }],
        changes: n
      }, "チャンネル設定を保存しました。") && (_.value = null);
    }
    function B(n, e, l) {
      return $(
        e,
        { serial: n.serial, channel: n.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return xe(() => {
      ne = K.client.subscribe("iseg", (n) => {
        f.value = !!n.connected, n.connection && (v.value = n, le || (Object.assign(b, n.connection, { lines: n.connection.lines.join(", ") }), le = !0));
      });
    }), Ce(() => ne?.()), (n, e) => (o(), r("article", Fe, [
      e[39] || (e[39] = t("h2", null, "iseg CC24", -1)),
      t("button", {
        type: "button",
        onClick: e[0] || (e[0] = (l) => te.value?.showModal())
      }, "操作ログ"),
      t("dialog", {
        ref_key: "logDialog",
        ref: te,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[19] || (e[19] = t("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          t("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ])
        ], -1)),
        R.value.length ? (o(), r("table", Ne, [
          e[18] || (e[18] = t("thead", null, [
            t("tr", null, [
              t("th", null, "時刻"),
              t("th", null, "対象"),
              t("th", null, "操作"),
              t("th", null, "結果"),
              t("th", null, "詳細")
            ])
          ], -1)),
          t("tbody", null, [
            (o(!0), r(C, null, S(R.value, (l) => (o(), r("tr", {
              key: l.id
            }, [
              t("td", Oe, i(l.time), 1),
              t("td", null, i(l.target), 1),
              t("td", null, i(l.action), 1),
              t("td", He, i(l.result), 1),
              t("td", null, i(l.detail), 1)
            ]))), 128))
          ])
        ])) : (o(), r("p", Ae, "この画面からの操作はまだありません。"))
      ], 512),
      t("form", {
        onSubmit: F(ye, ["prevent"])
      }, [
        t("label", null, [
          e[20] || (e[20] = c("WebSocket URL ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => b.url = l),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              g,
              b.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        t("label", null, [
          e[21] || (e[21] = c("ユーザー名 ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => b.username = l),
            autocomplete: "username"
          }, null, 512), [
            [g, b.username]
          ])
        ]),
        t("label", null, [
          e[22] || (e[22] = c("パスワード ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => b.password = l),
            type: "password",
            autocomplete: "new-password",
            placeholder: v.value.password_set ? "設定済み" : ""
          }, null, 8, Me), [
            [g, b.password]
          ])
        ]),
        t("label", null, [
          e[23] || (e[23] = c("CAN ライン ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => b.lines = l),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [g, b.lines]
          ])
        ]),
        t("button", {
          disabled: y.value || !f.value
        }, "接続設定を保存", 8, qe)
      ], 32),
      t("p", De, i(f.value ? v.value.online ? "iCS2 接続中" : v.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      z.value ? (o(), r("p", je, i(z.value), 1)) : M("", !0),
      t("div", $e, [
        e[25] || (e[25] = t("span", null, "モニター", -1)),
        t("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": h.value,
          onClick: e[5] || (e[5] = (l) => {
            h.value = !h.value, _.value = null;
          }),
          style: Z({
            width: "2.75rem",
            height: "1.5rem",
            padding: ".15rem",
            border: 0,
            borderRadius: "1rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: h.value ? "flex-end" : "flex-start",
            background: h.value ? "#145375" : "#627786"
          })
        }, [...e[24] || (e[24] = [
          t("span", {
            "aria-hidden": "true",
            style: { width: "1.2rem", height: "1.2rem", "border-radius": "50%", background: "white" }
          }, null, -1)
        ])], 12, Le),
        e[26] || (e[26] = t("span", null, "詳細", -1))
      ]),
      t("label", Te, [
        t("input", {
          type: "checkbox",
          disabled: !U.value.length,
          onChange: be,
          checked: U.value.length > 0 && O.value.length === U.value.length,
          ".indeterminate": O.value.length > 0 && O.value.length < U.value.length
        }, null, 40, Ie),
        e[27] || (e[27] = c(" 全選択 ", -1))
      ]),
      h.value ? (o(), r(C, { key: 1 }, [
        e[31] || (e[31] = t("h3", null, "選択チャンネルの一括設定", -1)),
        t("form", {
          class: "iseg-bulk",
          onSubmit: F(pe, ["prevent"])
        }, [
          (o(), r(C, null, S(J, ({ key: l, label: a, unit: s }) => t("fieldset", { key: l }, [
            t("legend", null, [
              t("label", null, [
                m(t("input", {
                  "onUpdate:modelValue": (d) => u[l] = d,
                  type: "checkbox"
                }, null, 8, Re), [
                  [L, u[l]]
                ]),
                c(" " + i(a) + "の範囲を変更", 1)
              ])
            ]),
            t("label", null, [
              c("下限 (" + i(s) + ") ", 1),
              m(t("input", {
                "onUpdate:modelValue": (d) => u[l + "_min"] = d,
                type: "number",
                step: "any",
                disabled: !u[l],
                required: u[l]
              }, null, 8, Be), [
                [g, u[l + "_min"]]
              ])
            ]),
            t("label", null, [
              c("上限 (" + i(s) + ") ", 1),
              m(t("input", {
                "onUpdate:modelValue": (d) => u[l + "_max"] = d,
                type: "number",
                step: "any",
                disabled: !u[l],
                required: u[l]
              }, null, 8, Ee), [
                [g, u[l + "_max"]]
              ])
            ])
          ])), 64)),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                m(t("input", {
                  "onUpdate:modelValue": e[6] || (e[6] = (l) => u.grouping = l),
                  type: "checkbox"
                }, null, 512), [
                  [L, u.grouping]
                ]),
                e[28] || (e[28] = c(" グループを変更", -1))
              ])
            ]),
            m(t("input", {
              "onUpdate:modelValue": e[7] || (e[7] = (l) => u.group = l),
              "aria-label": "グループ名",
              disabled: !u.grouping,
              maxlength: "100",
              placeholder: "空欄で未分類"
            }, null, 8, Pe), [
              [g, u.group]
            ])
          ]),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                m(t("input", {
                  "onUpdate:modelValue": e[8] || (e[8] = (l) => u.naming = l),
                  type: "checkbox"
                }, null, 512), [
                  [L, u.naming]
                ]),
                e[29] || (e[29] = c(" 表示名を変更", -1))
              ])
            ]),
            m(t("input", {
              "onUpdate:modelValue": e[9] || (e[9] = (l) => u.label = l),
              "aria-label": "表示名",
              disabled: !u.naming,
              maxlength: "100"
            }, null, 8, We), [
              [g, u.label]
            ])
          ]),
          t("button", {
            disabled: y.value || !f.value || !O.value.length || !(u.voltage || u.current || u.grouping || u.naming)
          }, " 選択した " + i(O.value.length) + " CH に適用 ", 9, ze)
        ], 32),
        t("div", Je, [
          t("table", Ge, [
            e[30] || (e[30] = t("thead", null, [
              t("tr", null, [
                t("th", null, "選択"),
                t("th", null, "チャンネル"),
                t("th", null, "表示名"),
                t("th", null, "グループ"),
                t("th", null, "電圧範囲 (V)"),
                t("th", null, "電流範囲 (mA)"),
                t("th", null, "電流設定 (mA)"),
                t("th", null, "iseg 遅延トリップ"),
                t("th")
              ])
            ], -1)),
            t("tbody", null, [
              (o(!0), r(C, null, S(U.value, (l) => (o(), r("tr", {
                key: l.key
              }, [
                t("td", null, [
                  m(t("input", {
                    "onUpdate:modelValue": e[10] || (e[10] = (a) => A.value = a),
                    type: "checkbox",
                    value: l.key,
                    "aria-label": l.serial + " CH " + l.channel
                  }, null, 8, Qe), [
                    [L, A.value]
                  ])
                ]),
                t("td", null, [
                  c("CH " + i(l.channel), 1),
                  t("small", Xe, i(l.serial) + " · " + i(l.location), 1)
                ]),
                t("td", null, [
                  t("form", {
                    onSubmit: F((a) => he(l), ["prevent"])
                  }, [
                    t("input", {
                      "aria-label": l.serial + " CH " + l.channel + " 表示名",
                      value: T[l.key] ?? l.settings.label ?? "",
                      disabled: y.value || !f.value,
                      maxlength: "100",
                      onInput: (a) => T[l.key] = a.target.value
                    }, null, 40, Ze)
                  ], 40, Ye),
                  D[l.key] ? (o(), r("small", Ke, i(D[l.key]), 1)) : M("", !0)
                ]),
                t("td", null, i(l.settings.group || "未分類"), 1),
                (o(), r(C, null, S(J, ({ key: a }) => t("td", { key: a }, i(ve(l, a)), 1)), 64)),
                t("td", null, [
                  t("span", we, i(G(l.items, "Control.currentSet")), 1),
                  t("form", {
                    class: "iseg-setpoint",
                    onSubmit: F((a) => B(l, "set_current", W(N[l.key + "a"])), ["prevent"])
                  }, [
                    m(t("input", {
                      "onUpdate:modelValue": (a) => N[l.key + "a"] = a,
                      type: "number",
                      step: "any",
                      required: "",
                      "aria-label": (l.settings.label || "CH " + l.channel) + " 電流設定 (mA)"
                    }, null, 8, tt), [
                      [g, N[l.key + "a"]]
                    ]),
                    t("button", {
                      disabled: y.value || !f.value || !v.value.online || !j(l, "current")
                    }, "設定", 8, lt)
                  ], 40, et)
                ]),
                t("td", null, [
                  P(l) ? (o(), r("form", {
                    key: 0,
                    class: "iseg-setpoint",
                    onSubmit: F((a) => oe(l), ["prevent"])
                  }, [
                    m(t("select", {
                      "onUpdate:modelValue": (a) => q[l.key] = a,
                      "aria-label": "CH " + l.channel + " iseg 遅延トリップ"
                    }, [
                      t("option", at, i(I[P(l)]) + "（現在）", 1),
                      (o(), r(C, null, S(I, (a, s) => t("option", {
                        key: s,
                        value: s
                      }, i(a), 9, ut)), 64))
                    ], 8, st), [
                      [Ve, q[l.key]]
                    ]),
                    t("button", {
                      disabled: y.value || !f.value || !v.value.online || q[l.key] == null
                    }, "設定", 8, it)
                  ], 40, nt)) : (o(), r("span", ot, "取得不可"))
                ]),
                t("td", null, [
                  t("button", {
                    type: "button",
                    onClick: (a) => _e(l)
                  }, "編集", 8, rt)
                ])
              ]))), 128))
            ])
          ])
        ])
      ], 64)) : M("", !0),
      h.value ? M("", !0) : (o(), r("p", dt, [
        e[32] || (e[32] = c("行の色： ", -1)),
        (o(), r(C, null, S(ie, (l, a) => t("span", {
          key: a,
          style: Z({ background: l, padding: ".15rem .4rem", marginInlineEnd: ".25rem", border: "1px solid #bcc8cf" })
        }, i(a), 5)), 64))
      ])),
      (o(!0), r(C, null, S(h.value ? [] : se.value, ([l, a]) => (o(), r("section", { key: l }, [
        t("h3", null, i(l), 1),
        t("div", {
          class: "iseg-table-scroll",
          tabindex: "0",
          role: "region",
          "aria-label": l + " モニター"
        }, [
          t("table", ct, [
            e[33] || (e[33] = t("thead", null, [
              t("tr", null, [
                t("th", null, "選択"),
                t("th", null, "表示名"),
                t("th", { class: "iseg-number" }, "電圧設定 (V)"),
                t("th", { class: "iseg-number" }, "電圧実測 (V)"),
                t("th", { class: "iseg-number" }, "電流設定 (mA)"),
                t("th", { class: "iseg-number" }, "電流実測 (mA)"),
                t("th", null, "電圧操作 (V)")
              ])
            ], -1)),
            t("tbody", null, [
              (o(!0), r(C, null, S(a, (s) => (o(), r("tr", {
                key: s.key,
                style: Z({ background: ie[Q(s)], whiteSpace: "nowrap" })
              }, [
                t("td", null, [
                  m(t("input", {
                    "onUpdate:modelValue": e[11] || (e[11] = (d) => A.value = d),
                    type: "checkbox",
                    value: s.key,
                    disabled: !s.serial,
                    "aria-label": "選択: " + (s.settings.label || "CH " + s.channel)
                  }, null, 8, gt), [
                    [L, A.value]
                  ])
                ]),
                t("td", null, [
                  t("button", {
                    type: "button",
                    disabled: !X(s),
                    onClick: (d) => fe(s),
                    "aria-label": (s.settings.label || "CH " + s.channel) + "、状態: " + Q(s),
                    title: Q(s) + (X(s) ? "。クリックで出力切替" : "")
                  }, i(s.settings.label || "CH " + s.channel), 9, bt)
                ]),
                t("td", pt, i(ue(s.items, "Control.voltageSet")), 1),
                t("td", vt, i(ue(s.items, "Status.voltageMeasure")), 1),
                t("td", ft, i(G(s.items, "Control.currentSet")), 1),
                t("td", ht, i(G(s.items, "Status.currentMeasure")), 1),
                t("td", null, [
                  t("form", {
                    class: "iseg-setpoint",
                    onSubmit: F((d) => B(s, "set_voltage", Number(N[s.key + "v"])), ["prevent"])
                  }, [
                    m(t("input", {
                      "onUpdate:modelValue": (d) => N[s.key + "v"] = d,
                      type: "number",
                      step: "any",
                      required: "",
                      "aria-label": (s.settings.label || "CH " + s.channel) + " 電圧設定 (V)"
                    }, null, 8, _t), [
                      [g, N[s.key + "v"]]
                    ]),
                    t("button", {
                      disabled: y.value || !f.value || !v.value.online || !s.serial || !j(s, "voltage")
                    }, "設定", 8, kt)
                  ], 40, yt),
                  D[s.key] ? (o(), r("small", xt, i(D[s.key]), 1)) : M("", !0)
                ])
              ], 4))), 128))
            ])
          ])
        ], 8, mt)
      ]))), 128)),
      _.value && h.value ? (o(), r("form", {
        key: 3,
        class: "iseg-editor",
        onSubmit: F(ke, ["prevent"])
      }, [
        t("h3", null, i(_.value.serial) + " / CH " + i(_.value.channel), 1),
        t("label", null, [
          e[34] || (e[34] = c("グループ ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[12] || (e[12] = (l) => p.group = l),
            maxlength: "100"
          }, null, 512), [
            [g, p.group]
          ])
        ]),
        t("label", null, [
          e[35] || (e[35] = c("最低電圧 (V) ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[13] || (e[13] = (l) => p.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_min]
          ])
        ]),
        t("label", null, [
          e[36] || (e[36] = c("最高電圧 (V) ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (l) => p.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_max]
          ])
        ]),
        t("label", null, [
          e[37] || (e[37] = c("最低電流 (mA) ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (l) => p.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_min]
          ])
        ]),
        t("label", null, [
          e[38] || (e[38] = c("最高電流 (mA) ", -1)),
          m(t("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (l) => p.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_max]
          ])
        ]),
        t("button", {
          disabled: y.value || !f.value
        }, "保存", 8, Ct),
        t("button", {
          type: "button",
          onClick: e[17] || (e[17] = (l) => _.value = null)
        }, "閉じる")
      ], 32)) : M("", !0)
    ]));
  }
};
function Ut(E) {
  return Se({
    setup() {
      return () => Ue(Vt, { client: E });
    }
  });
}
export {
  Ut as mount
};
