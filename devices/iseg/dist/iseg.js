import { ref as x, reactive as S, computed as G, onMounted as he, onUnmounted as ke, openBlock as d, createElementBlock as m, createElementVNode as t, Fragment as V, renderList as U, toDisplayString as i, withModifiers as M, createTextVNode as g, withDirectives as o, vModelText as p, createCommentVNode as F, normalizeStyle as Q, vModelCheckbox as q, vModelSelect as ae, defineComponent as _e, h as xe } from "vue";
const Ve = { class: "iseg-panel" }, Ce = { key: 0 }, Se = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, Ue = { style: { "white-space": "nowrap" } }, Fe = { style: { "white-space": "nowrap" } }, Ae = ["placeholder"], Ne = ["disabled"], Oe = { role: "status" }, He = {
  key: 0,
  role: "status"
}, Me = { style: { display: "inline-flex", "align-items": "center", gap: ".5rem" } }, qe = ["aria-checked"], De = { style: { "margin-inline-start": "1rem" } }, je = ["disabled", "checked", ".indeterminate"], $e = ["onUpdate:modelValue"], Le = ["onUpdate:modelValue", "disabled", "required"], Ie = ["onUpdate:modelValue", "disabled", "required"], Re = ["disabled"], Te = ["disabled"], Be = ["disabled"], Ee = ["disabled"], Pe = {
  class: "iseg-table-scroll",
  tabindex: "0",
  role: "region",
  "aria-label": "チャンネル詳細"
}, We = { class: "iseg-data" }, ze = ["value", "aria-label"], Je = ["onSubmit"], Ge = ["aria-label", "value", "disabled", "onInput"], Qe = {
  key: 0,
  role: "status"
}, Xe = { class: "iseg-number" }, Ye = ["onSubmit"], Ze = ["onUpdate:modelValue", "aria-label"], Ke = ["disabled"], we = ["onClick"], et = { key: 2 }, tt = ["aria-label"], lt = { class: "iseg-data iseg-monitor" }, nt = ["value", "disabled", "aria-label"], ut = ["disabled", "onClick", "aria-label", "title"], at = { class: "iseg-number" }, st = { class: "iseg-number iseg-measured" }, it = { class: "iseg-number" }, ot = { class: "iseg-number iseg-measured" }, rt = ["onSubmit"], dt = ["onUpdate:modelValue", "aria-label"], mt = ["disabled"], gt = {
  key: 0,
  role: "status"
}, ct = {
  key: 1,
  class: "iseg-row-feedback",
  role: "status"
}, pt = ["disabled"], bt = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(R) {
    const X = R, b = x({ modules: [], policies: {} }), v = S({ url: "", username: "", password: "", lines: "0" }), h = x(null), f = x(!1), A = x([]), L = S({}), s = S({
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
    }), c = S({}), N = S({}), Y = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 4 }), Z = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 3, maximumFractionDigits: 6 }), se = { V: 1, kV: 1e3 }, ie = { kA: 1e6, A: 1e3, mA: 1, µA: 1e-3, μA: 1e-3, uA: 1e-3, nA: 1e-6 }, T = (n) => Number(n) / 1e3, B = x(""), K = x(null), I = x([]);
    let oe = 0;
    const re = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_output: "出力切替"
    };
    function de(n, e) {
      const l = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = re[n] ?? n;
      n === "configure_channels" && (a += " " + e.targets.length + " CH"), n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const u = S({
        id: ++oe,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: l,
        action: a,
        result: "処理中",
        detail: ""
      });
      return I.value = [u, ...I.value].slice(0, 100), u;
    }
    const D = S({}), k = x(!1), y = x(!1);
    let w = !1, ee;
    const te = G(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of b.value.modules) {
        const l = String(e["Status.serialNumber"] ?? "");
        for (const [a, u] of Object.entries(e.channels)) {
          const r = b.value.policies[l + ":" + a] ?? {}, _ = r.group || "未分類";
          n.has(_) || n.set(_, []), n.get(_).push({
            key: l + ":" + e.line + ":" + e.address + ":" + a,
            serial: l,
            channel: a,
            items: u,
            settings: r,
            location: e.line + "/" + e.address + "/" + a
          });
        }
      }
      return n;
    }), C = G(() => [...te.value.values()].flat().filter((n) => n.serial)), O = G(() => C.value.filter((n) => A.value.includes(n.key)));
    function me(n) {
      A.value = n.target.checked ? C.value.map((e) => e.key) : [];
    }
    const E = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "mA" }
    ];
    function j(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function ge() {
      const n = {};
      for (const { key: l } of E)
        if (s[l]) {
          const a = l === "current" ? T : Number;
          n[l + "_min"] = a(s[l + "_min"]), n[l + "_max"] = a(s[l + "_max"]);
        }
      s.grouping && (n.group = s.group), s.naming && (n.label = s.label), s.action && (n.current_action = s.current_action);
      const e = O.value.map(({ serial: l, channel: a }) => ({ serial: l, channel: a }));
      await $("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function le(n, e, l, a) {
      const u = n[e];
      if (u?.value == null || typeof u.value == "string" && !u.value.trim()) return "—";
      const r = Number(u.value) * l[u.unit];
      return Number.isFinite(r) ? a.format(r) : "—";
    }
    function ne(n, e) {
      return le(n, e, se, Y);
    }
    function P(n, e) {
      return le(n, e, ie, Z);
    }
    function ce(n, e) {
      if (!j(n, e)) return "未設定";
      const l = e === "current" ? 1e3 : 1, a = e === "current" ? Z : Y;
      return a.format(n.settings[e + "_min"] * l) + " ～ " + a.format(n.settings[e + "_max"] * l);
    }
    function H(n, e) {
      const l = String(n[e]?.value).toLowerCase();
      return ["1", "true"].includes(l) ? !0 : ["0", "false"].includes(l) ? !1 : null;
    }
    function W(n) {
      return !y.value || !b.value.online || H(n.items, "Status.on") === null ? "不明" : b.value.overcurrent?.[n.serial + ":" + n.channel] || H(n.items, "Error.currentTrip") ? "異常" : H(n.items, "Status.voltageRamping") ? "ランプ中" : H(n.items, "Status.on") ? "ON" : "OFF";
    }
    const ue = { 不明: "#edf1f5", 異常: "#fbe0de", ランプ中: "#fff0cb", ON: "#dcf2e4", OFF: "#fff" };
    function z(n) {
      const e = H(n.items, "Status.on");
      return !k.value && y.value && b.value.online && n.serial && e !== null && (e || j(n, "voltage") && j(n, "current"));
    }
    function pe(n) {
      z(n) && J(n, "set_output", !H(n.items, "Status.on"));
    }
    async function be(n) {
      const e = L[n.key];
      e !== void 0 && await $("configure_channels", {
        targets: [{ serial: n.serial, channel: n.channel }],
        changes: { label: e }
      }, "表示名を保存しました。", n.key) && delete L[n.key];
    }
    async function $(n, e, l, a) {
      const u = (_) => {
        a ? D[a] = _ : B.value = _;
      }, r = de(n, e);
      k.value = !0, u("処理中…");
      try {
        return await X.client.request(n, e), r.result = n.startsWith("set_") ? "指令受理" : "保存完了", r.detail = l, u(l), !0;
      } catch (_) {
        return r.result = "エラー", r.detail = _.message, u(_.message), !1;
      } finally {
        k.value = !1;
      }
    }
    async function ve() {
      await $("configure", {
        ...v,
        lines: v.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (v.password = "");
    }
    function fe(n) {
      f.value = !0, h.value = n, c.current_action = n.settings.current_action ?? "none";
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = n.settings[e];
        c[e] = l != null && e.startsWith("current_") ? Number((l * 1e3).toPrecision(15)) : l ?? "";
      }
    }
    async function ye() {
      const n = { ...c };
      delete n.label;
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = e.startsWith("current_") ? T : Number;
        n[e] = n[e] === "" ? null : l(n[e]);
      }
      await $("configure_channels", {
        targets: [{ serial: h.value.serial, channel: h.value.channel }],
        changes: n
      }, "チャンネル設定を保存しました。") && (h.value = null);
    }
    function J(n, e, l) {
      return $(
        e,
        { serial: n.serial, channel: n.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return he(() => {
      ee = X.client.subscribe("iseg", (n) => {
        y.value = !!n.connected, n.connection && (b.value = n, w || (Object.assign(v, n.connection, { lines: n.connection.lines.join(", ") }), w = !0));
      });
    }), ke(() => ee?.()), (n, e) => (d(), m("article", Ve, [
      e[46] || (e[46] = t("h2", null, "iseg CC24", -1)),
      t("button", {
        type: "button",
        onClick: e[0] || (e[0] = (l) => K.value?.showModal())
      }, "操作ログ"),
      t("dialog", {
        ref_key: "logDialog",
        ref: K,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[22] || (e[22] = t("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          t("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ])
        ], -1)),
        I.value.length ? (d(), m("table", Se, [
          e[21] || (e[21] = t("thead", null, [
            t("tr", null, [
              t("th", null, "時刻"),
              t("th", null, "対象"),
              t("th", null, "操作"),
              t("th", null, "結果"),
              t("th", null, "詳細")
            ])
          ], -1)),
          t("tbody", null, [
            (d(!0), m(V, null, U(I.value, (l) => (d(), m("tr", {
              key: l.id
            }, [
              t("td", Ue, i(l.time), 1),
              t("td", null, i(l.target), 1),
              t("td", null, i(l.action), 1),
              t("td", Fe, i(l.result), 1),
              t("td", null, i(l.detail), 1)
            ]))), 128))
          ])
        ])) : (d(), m("p", Ce, "この画面からの操作はまだありません。"))
      ], 512),
      t("form", {
        onSubmit: M(ve, ["prevent"])
      }, [
        t("label", null, [
          e[23] || (e[23] = g("WebSocket URL ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (l) => v.url = l),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              p,
              v.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        t("label", null, [
          e[24] || (e[24] = g("ユーザー名 ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => v.username = l),
            autocomplete: "username"
          }, null, 512), [
            [p, v.username]
          ])
        ]),
        t("label", null, [
          e[25] || (e[25] = g("パスワード ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => v.password = l),
            type: "password",
            autocomplete: "new-password",
            placeholder: b.value.password_set ? "設定済み" : ""
          }, null, 8, Ae), [
            [p, v.password]
          ])
        ]),
        t("label", null, [
          e[26] || (e[26] = g("CAN ライン ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => v.lines = l),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [p, v.lines]
          ])
        ]),
        t("button", {
          disabled: k.value || !y.value
        }, "接続設定を保存", 8, Ne)
      ], 32),
      t("p", Oe, i(y.value ? b.value.online ? "iCS2 接続中" : b.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      B.value ? (d(), m("p", He, i(B.value), 1)) : F("", !0),
      t("div", Me, [
        e[28] || (e[28] = t("span", null, "モニター", -1)),
        t("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": f.value,
          onClick: e[5] || (e[5] = (l) => {
            f.value = !f.value, h.value = null;
          }),
          style: Q({
            width: "2.75rem",
            height: "1.5rem",
            padding: ".15rem",
            border: 0,
            borderRadius: "1rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: f.value ? "flex-end" : "flex-start",
            background: f.value ? "#145375" : "#627786"
          })
        }, [...e[27] || (e[27] = [
          t("span", {
            "aria-hidden": "true",
            style: { width: "1.2rem", height: "1.2rem", "border-radius": "50%", background: "white" }
          }, null, -1)
        ])], 12, qe),
        e[29] || (e[29] = t("span", null, "詳細", -1))
      ]),
      t("label", De, [
        t("input", {
          type: "checkbox",
          disabled: !C.value.length,
          onChange: me,
          checked: C.value.length > 0 && O.value.length === C.value.length,
          ".indeterminate": O.value.length > 0 && O.value.length < C.value.length
        }, null, 40, je),
        e[30] || (e[30] = g(" 全選択 ", -1))
      ]),
      f.value ? (d(), m(V, { key: 1 }, [
        e[36] || (e[36] = t("h3", null, "選択チャンネルの一括設定", -1)),
        t("form", {
          onSubmit: M(ge, ["prevent"])
        }, [
          (d(), m(V, null, U(E, ({ key: l, label: a, unit: u }) => t("fieldset", { key: l }, [
            t("legend", null, [
              t("label", null, [
                o(t("input", {
                  "onUpdate:modelValue": (r) => s[l] = r,
                  type: "checkbox"
                }, null, 8, $e), [
                  [q, s[l]]
                ]),
                g(" " + i(a) + "の範囲を変更", 1)
              ])
            ]),
            t("label", null, [
              g("下限 (" + i(u) + ") ", 1),
              o(t("input", {
                "onUpdate:modelValue": (r) => s[l + "_min"] = r,
                type: "number",
                step: "any",
                disabled: !s[l],
                required: s[l]
              }, null, 8, Le), [
                [p, s[l + "_min"]]
              ])
            ]),
            t("label", null, [
              g("上限 (" + i(u) + ") ", 1),
              o(t("input", {
                "onUpdate:modelValue": (r) => s[l + "_max"] = r,
                type: "number",
                step: "any",
                disabled: !s[l],
                required: s[l]
              }, null, 8, Ie), [
                [p, s[l + "_max"]]
              ])
            ])
          ])), 64)),
          t("label", null, [
            o(t("input", {
              "onUpdate:modelValue": e[6] || (e[6] = (l) => s.grouping = l),
              type: "checkbox"
            }, null, 512), [
              [q, s.grouping]
            ]),
            e[31] || (e[31] = g(" グループを変更", -1))
          ]),
          o(t("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (l) => s.group = l),
            "aria-label": "グループ名",
            disabled: !s.grouping,
            maxlength: "100",
            placeholder: "空欄で未分類"
          }, null, 8, Re), [
            [p, s.group]
          ]),
          t("label", null, [
            o(t("input", {
              "onUpdate:modelValue": e[8] || (e[8] = (l) => s.naming = l),
              type: "checkbox"
            }, null, 512), [
              [q, s.naming]
            ]),
            e[32] || (e[32] = g(" 表示名を変更", -1))
          ]),
          o(t("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (l) => s.label = l),
            "aria-label": "表示名",
            disabled: !s.naming,
            maxlength: "100"
          }, null, 8, Te), [
            [p, s.label]
          ]),
          t("label", null, [
            o(t("input", {
              "onUpdate:modelValue": e[10] || (e[10] = (l) => s.action = l),
              type: "checkbox"
            }, null, 512), [
              [q, s.action]
            ]),
            e[33] || (e[33] = g(" 電流上限超過時の動作を変更", -1))
          ]),
          o(t("select", {
            "onUpdate:modelValue": e[11] || (e[11] = (l) => s.current_action = l),
            "aria-label": "電流上限超過時の動作",
            disabled: !s.action
          }, [...e[34] || (e[34] = [
            t("option", { value: "none" }, "動作なし", -1),
            t("option", { value: "warn" }, "警告", -1),
            t("option", { value: "off" }, "出力 OFF", -1)
          ])], 8, Be), [
            [ae, s.current_action]
          ]),
          t("button", {
            disabled: k.value || !y.value || !O.value.length || !(s.voltage || s.current || s.grouping || s.naming || s.action)
          }, " 選択した " + i(O.value.length) + " CH に適用 ", 9, Ee)
        ], 32),
        t("div", Pe, [
          t("table", We, [
            e[35] || (e[35] = t("thead", null, [
              t("tr", null, [
                t("th", null, "選択"),
                t("th", null, "チャンネル"),
                t("th", null, "表示名"),
                t("th", null, "グループ"),
                t("th", null, "電圧範囲 (V)"),
                t("th", null, "電流範囲 (mA)"),
                t("th", null, "電流設定 (mA)"),
                t("th", null, "電流超過時"),
                t("th")
              ])
            ], -1)),
            t("tbody", null, [
              (d(!0), m(V, null, U(C.value, (l) => (d(), m("tr", {
                key: l.key
              }, [
                t("td", null, [
                  o(t("input", {
                    "onUpdate:modelValue": e[12] || (e[12] = (a) => A.value = a),
                    type: "checkbox",
                    value: l.key,
                    "aria-label": l.serial + " CH " + l.channel
                  }, null, 8, ze), [
                    [q, A.value]
                  ])
                ]),
                t("td", null, i("CH " + l.channel) + " · " + i(l.serial) + " / " + i(l.location), 1),
                t("td", null, [
                  t("form", {
                    onSubmit: M((a) => be(l), ["prevent"])
                  }, [
                    t("input", {
                      "aria-label": l.serial + " CH " + l.channel + " 表示名",
                      value: L[l.key] ?? l.settings.label ?? "",
                      disabled: k.value || !y.value,
                      maxlength: "100",
                      onInput: (a) => L[l.key] = a.target.value
                    }, null, 40, Ge)
                  ], 40, Je),
                  D[l.key] ? (d(), m("small", Qe, i(D[l.key]), 1)) : F("", !0)
                ]),
                t("td", null, i(l.settings.group || "未分類"), 1),
                (d(), m(V, null, U(E, ({ key: a }) => t("td", { key: a }, i(ce(l, a)), 1)), 64)),
                t("td", null, [
                  t("span", Xe, i(P(l.items, "Control.currentSet")), 1),
                  t("form", {
                    class: "iseg-setpoint",
                    onSubmit: M((a) => J(l, "set_current", T(N[l.key + "a"])), ["prevent"])
                  }, [
                    o(t("input", {
                      "onUpdate:modelValue": (a) => N[l.key + "a"] = a,
                      type: "number",
                      step: "any",
                      required: "",
                      "aria-label": (l.settings.label || "CH " + l.channel) + " 電流設定 (mA)"
                    }, null, 8, Ze), [
                      [p, N[l.key + "a"]]
                    ]),
                    t("button", {
                      disabled: k.value || !y.value || !b.value.online || !j(l, "current")
                    }, "設定", 8, Ke)
                  ], 40, Ye)
                ]),
                t("td", null, i({ warn: "警告", off: "出力 OFF" }[l.settings.current_action] || "動作なし"), 1),
                t("td", null, [
                  t("button", {
                    type: "button",
                    onClick: (a) => fe(l)
                  }, "編集", 8, we)
                ])
              ]))), 128))
            ])
          ])
        ])
      ], 64)) : F("", !0),
      f.value ? F("", !0) : (d(), m("p", et, [
        e[37] || (e[37] = g("行の色： ", -1)),
        (d(), m(V, null, U(ue, (l, a) => t("span", {
          key: a,
          style: Q({ background: l, padding: ".15rem .4rem", marginInlineEnd: ".25rem", border: "1px solid #bcc8cf" })
        }, i(a), 5)), 64))
      ])),
      (d(!0), m(V, null, U(f.value ? [] : te.value, ([l, a]) => (d(), m("section", { key: l }, [
        t("h3", null, i(l), 1),
        t("div", {
          class: "iseg-table-scroll",
          tabindex: "0",
          role: "region",
          "aria-label": l + " モニター"
        }, [
          t("table", lt, [
            e[38] || (e[38] = t("thead", null, [
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
              (d(!0), m(V, null, U(a, (u) => (d(), m("tr", {
                key: u.key,
                style: Q({ background: ue[W(u)], whiteSpace: "nowrap" })
              }, [
                t("td", null, [
                  o(t("input", {
                    "onUpdate:modelValue": e[13] || (e[13] = (r) => A.value = r),
                    type: "checkbox",
                    value: u.key,
                    disabled: !u.serial,
                    "aria-label": "選択: " + (u.settings.label || "CH " + u.channel)
                  }, null, 8, nt), [
                    [q, A.value]
                  ])
                ]),
                t("td", null, [
                  t("button", {
                    type: "button",
                    disabled: !z(u),
                    onClick: (r) => pe(u),
                    "aria-label": (u.settings.label || "CH " + u.channel) + "、状態: " + W(u),
                    title: W(u) + (z(u) ? "。クリックで出力切替" : "")
                  }, i(u.settings.label || "CH " + u.channel), 9, ut)
                ]),
                t("td", at, i(ne(u.items, "Control.voltageSet")), 1),
                t("td", st, i(ne(u.items, "Status.voltageMeasure")), 1),
                t("td", it, i(P(u.items, "Control.currentSet")), 1),
                t("td", ot, i(P(u.items, "Status.currentMeasure")), 1),
                t("td", null, [
                  t("form", {
                    class: "iseg-setpoint",
                    onSubmit: M((r) => J(u, "set_voltage", Number(N[u.key + "v"])), ["prevent"])
                  }, [
                    o(t("input", {
                      "onUpdate:modelValue": (r) => N[u.key + "v"] = r,
                      type: "number",
                      step: "any",
                      required: "",
                      "aria-label": (u.settings.label || "CH " + u.channel) + " 電圧設定 (V)"
                    }, null, 8, dt), [
                      [p, N[u.key + "v"]]
                    ]),
                    t("button", {
                      disabled: k.value || !y.value || !b.value.online || !u.serial || !j(u, "voltage")
                    }, "設定", 8, mt)
                  ], 40, rt),
                  b.value.overcurrent?.[u.serial + ":" + u.channel] ? (d(), m("span", gt, i(b.value.overcurrent[u.serial + ":" + u.channel]), 1)) : F("", !0),
                  D[u.key] ? (d(), m("small", ct, i(D[u.key]), 1)) : F("", !0)
                ])
              ], 4))), 128))
            ])
          ])
        ], 8, tt)
      ]))), 128)),
      h.value && f.value ? (d(), m("form", {
        key: 3,
        onSubmit: M(ye, ["prevent"])
      }, [
        t("h3", null, i(h.value.serial) + " / CH " + i(h.value.channel), 1),
        t("label", null, [
          e[39] || (e[39] = g("グループ ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (l) => c.group = l),
            maxlength: "100"
          }, null, 512), [
            [p, c.group]
          ])
        ]),
        t("label", null, [
          e[40] || (e[40] = g("最低電圧 (V) ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (l) => c.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, c.voltage_min]
          ])
        ]),
        t("label", null, [
          e[41] || (e[41] = g("最高電圧 (V) ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (l) => c.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, c.voltage_max]
          ])
        ]),
        t("label", null, [
          e[42] || (e[42] = g("最低電流 (mA) ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[17] || (e[17] = (l) => c.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, c.current_min]
          ])
        ]),
        t("label", null, [
          e[43] || (e[43] = g("最高電流 (mA) ", -1)),
          o(t("input", {
            "onUpdate:modelValue": e[18] || (e[18] = (l) => c.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [p, c.current_max]
          ])
        ]),
        t("label", null, [
          e[45] || (e[45] = g("電流上限超過時の動作 ", -1)),
          o(t("select", {
            "onUpdate:modelValue": e[19] || (e[19] = (l) => c.current_action = l)
          }, [...e[44] || (e[44] = [
            t("option", { value: "none" }, "動作なし", -1),
            t("option", { value: "warn" }, "警告", -1),
            t("option", { value: "off" }, "出力 OFF", -1)
          ])], 512), [
            [ae, c.current_action]
          ])
        ]),
        t("button", {
          disabled: k.value || !y.value
        }, "保存", 8, pt),
        t("button", {
          type: "button",
          onClick: e[20] || (e[20] = (l) => h.value = null)
        }, "閉じる")
      ], 32)) : F("", !0)
    ]));
  }
};
function ft(R) {
  return _e({
    setup() {
      return () => xe(bt, { client: R });
    }
  });
}
export {
  ft as mount
};
