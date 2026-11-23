import { ref as h, reactive as U, computed as F, useId as De, onMounted as Me, onUnmounted as qe, openBlock as o, createElementBlock as r, createElementVNode as t, toDisplayString as u, Fragment as k, renderList as V, unref as j, withModifiers as N, createTextVNode as c, withDirectives as d, vModelText as g, createCommentVNode as S, normalizeStyle as Ie, vModelCheckbox as z, createBlock as $e, resolveDynamicComponent as Te, normalizeClass as je, withCtx as Le, vModelSelect as Be, defineComponent as Re, h as Ee } from "vue";
const Pe = ["data-theme"], We = { class: "hv-toolbar" }, ze = { class: "hv-actions" }, Ge = { key: 0 }, Je = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, Ke = { style: { "white-space": "nowrap" } }, Qe = { style: { "white-space": "nowrap" } }, Xe = ["aria-labelledby"], Ye = { class: "hv-toolbar" }, Ze = ["id"], we = ["placeholder"], et = ["disabled"], tt = {
  key: 0,
  role: "status"
}, lt = ["data-online"], nt = {
  key: 0,
  role: "status"
}, at = { style: { display: "inline-flex", "align-items": "center", gap: ".5rem" } }, st = ["aria-checked"], ut = { style: { "margin-inline-start": "1rem" } }, it = ["disabled", "checked", ".indeterminate"], ot = ["id", "aria-selected", "aria-controls", "tabindex", "onClick"], rt = ["onUpdate:modelValue"], dt = ["onUpdate:modelValue", "disabled", "required"], mt = ["onUpdate:modelValue", "disabled", "required"], ct = ["disabled"], gt = ["disabled"], vt = ["disabled"], bt = { key: 3 }, pt = ["data-state"], ft = { key: 0 }, ht = ["aria-label"], yt = { class: "iseg-data iseg-detail" }, _t = ["data-state"], kt = ["value", "aria-label"], xt = { class: "iseg-address" }, Ct = ["onSubmit"], Vt = ["aria-label", "value", "disabled", "onInput"], St = {
  key: 0,
  role: "status"
}, Ut = { class: "iseg-number" }, At = ["onSubmit"], Ft = ["onUpdate:modelValue", "aria-label"], Nt = ["disabled"], Ht = ["onSubmit"], Ot = ["onUpdate:modelValue", "aria-label"], Dt = { value: void 0 }, Mt = ["value"], qt = ["disabled"], It = { key: 1 }, $t = ["onClick"], Tt = ["aria-label"], jt = { class: "iseg-data iseg-monitor" }, Lt = ["data-state"], Bt = ["value", "disabled", "aria-label"], Rt = ["disabled", "onClick", "aria-label", "title"], Et = { class: "iseg-number" }, Pt = { class: "iseg-number iseg-measured" }, Wt = { class: "iseg-number" }, zt = { class: "iseg-number iseg-measured" }, Gt = ["onSubmit"], Jt = ["onUpdate:modelValue", "aria-label"], Kt = ["disabled"], Qt = {
  key: 0,
  class: "iseg-row-feedback",
  role: "status"
}, Xt = ["disabled"], Yt = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(Z) {
    const se = Z, v = h({ modules: [], policies: {} }), b = U({ url: "", username: "", password: "", lines: "0" }), x = h(null), y = h(!1), H = h([]), G = U({}), i = U({
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
    }), p = U({}), O = U({}), L = U({}), J = {
      0: "動作なし",
      1: "CH OFF（ランプあり）",
      2: "CH OFF（ランプなし）",
      3: "モジュール OFF（ランプなし）",
      4: "遅延トリップ無効"
    };
    function w(n) {
      const e = String(n.items["Setup.delayedTripAction"]?.value);
      return Object.hasOwn(J, e) ? e : "";
    }
    async function be(n) {
      const e = L[n.key];
      !w(n) || e == null || await Y(n, "set_trip_action", Number(e)) && delete L[n.key];
    }
    const ue = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 4 }), ie = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 3, maximumFractionDigits: 6 }), pe = { V: 1, kV: 1e3 }, fe = { kA: 1e6, A: 1e3, mA: 1, µA: 1e-3, μA: 1e-3, uA: 1e-3, nA: 1e-6 }, ee = (n) => Number(n) / 1e3, B = h(""), oe = h(null), D = h("dark");
    function he() {
      D.value = D.value === "dark" ? "light" : "dark", localStorage.setItem("metis-hv-theme", D.value);
    }
    const re = h(null), K = h([]);
    let ye = 0;
    const _e = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_trip_action: "iseg 遅延トリップ設定",
      set_output: "出力切替"
    };
    function ke(n, e) {
      const l = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = _e[n] ?? n;
      n === "configure_channels" && (a += " " + e.targets.length + " CH"), n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_trip_action" && (a += "：" + J[e.value]), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const s = U({
        id: ++ye,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: l,
        action: a,
        result: "処理中",
        detail: ""
      });
      return K.value = [s, ...K.value].slice(0, 100), s;
    }
    const R = U({}), _ = h(!1), f = h(!1);
    let de = !1, me;
    const E = F(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of v.value.modules) {
        const l = String(e["Status.serialNumber"] ?? "");
        for (const [a, s] of Object.entries(e.channels)) {
          const m = v.value.policies[l + ":" + a] ?? {}, C = m.group || "";
          n.has(C) || n.set(C, []), n.get(C).push({
            key: l + ":" + e.line + ":" + e.address + ":" + a,
            serial: l,
            channel: a,
            items: s,
            settings: m,
            location: e.line + "/" + e.address + "/" + a
          });
        }
      }
      return n;
    }), M = De(), Q = h(""), A = F(() => [...E.value.keys()].filter(Boolean)), q = F(() => A.value.includes(Q.value) ? Q.value : A.value[0]), xe = F(() => {
      const n = [];
      return q.value && n.push({ key: "group", label: q.value, rows: E.value.get(q.value) }), E.value.has("") && n.push({ key: "unassigned", label: "未分類", rows: E.value.get("") }), n;
    }), ce = F(() => A.value.indexOf(q.value));
    function Ce(n) {
      const e = A.value.length, l = ce.value, a = {
        ArrowLeft: (l - 1 + e) % e,
        ArrowRight: (l + 1) % e,
        Home: 0,
        End: e - 1
      }[n.key];
      Number.isInteger(a) && (n.preventDefault(), Q.value = A.value[a], n.currentTarget.children[a]?.focus());
    }
    const I = F(() => [...E.value.values()].flat().filter((n) => n.serial)), $ = F(() => I.value.filter((n) => H.value.includes(n.key)));
    function Ve(n) {
      H.value = n.target.checked ? I.value.map((e) => e.key) : [];
    }
    const te = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "mA" }
    ];
    function P(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function Se() {
      const n = {};
      for (const { key: l } of te)
        if (i[l]) {
          const a = l === "current" ? ee : Number;
          n[l + "_min"] = a(i[l + "_min"]), n[l + "_max"] = a(i[l + "_max"]);
        }
      i.grouping && (n.group = i.group), i.naming && (n.label = i.label);
      const e = $.value.map(({ serial: l, channel: a }) => ({ serial: l, channel: a }));
      await W("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function ge(n, e, l, a) {
      const s = n[e];
      if (s?.value == null || typeof s.value == "string" && !s.value.trim()) return "—";
      const m = Number(s.value) * l[s.unit];
      return Number.isFinite(m) ? a.format(m) : "—";
    }
    function ve(n, e) {
      return ge(n, e, pe, ue);
    }
    function le(n, e) {
      return ge(n, e, fe, ie);
    }
    function Ue(n, e) {
      if (!P(n, e)) return "未設定";
      const l = e === "current" ? 1e3 : 1, a = e === "current" ? ie : ue;
      return a.format(n.settings[e + "_min"] * l) + " ～ " + a.format(n.settings[e + "_max"] * l);
    }
    function T(n, e) {
      const l = String(n[e]?.value).toLowerCase();
      return ["1", "true"].includes(l) ? !0 : ["0", "false"].includes(l) ? !1 : null;
    }
    function X(n) {
      return !f.value || !v.value.online || T(n.items, "Status.on") === null ? "不明" : T(n.items, "Error.currentTrip") ? "異常" : T(n.items, "Status.voltageRamping") ? "ランプ中" : T(n.items, "Status.on") ? "ON" : "OFF";
    }
    const ne = { 不明: "unknown", 異常: "fault", ランプ中: "ramping", ON: "on", OFF: "off" };
    function ae(n) {
      const e = T(n.items, "Status.on");
      return !_.value && f.value && v.value.online && n.serial && e !== null && (e || P(n, "voltage") && P(n, "current"));
    }
    function Ae(n) {
      ae(n) && Y(n, "set_output", !T(n.items, "Status.on"));
    }
    async function Fe(n) {
      const e = G[n.key];
      e !== void 0 && await W("configure_channels", {
        targets: [{ serial: n.serial, channel: n.channel }],
        changes: { label: e }
      }, "表示名を保存しました。", n.key) && delete G[n.key];
    }
    async function W(n, e, l, a) {
      const s = (C) => {
        a ? R[a] = C : B.value = C;
      }, m = ke(n, e);
      _.value = !0, s("処理中…");
      try {
        return await se.client.request(n, e), m.result = n.startsWith("set_") ? "指令受理" : "保存完了", m.detail = l, s(l), !0;
      } catch (C) {
        return m.result = "エラー", m.detail = C.message, s(C.message), !1;
      } finally {
        _.value = !1;
      }
    }
    async function Ne() {
      await W("configure", {
        ...b,
        lines: b.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (b.password = "");
    }
    function He(n) {
      y.value = !0, x.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = n.settings[e];
        p[e] = l != null && e.startsWith("current_") ? Number((l * 1e3).toPrecision(15)) : l ?? "";
      }
    }
    async function Oe() {
      const n = { ...p };
      delete n.label;
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = e.startsWith("current_") ? ee : Number;
        n[e] = n[e] === "" ? null : l(n[e]);
      }
      await W("configure_channels", {
        targets: [{ serial: x.value.serial, channel: x.value.channel }],
        changes: n
      }, "チャンネル設定を保存しました。") && (x.value = null);
    }
    function Y(n, e, l) {
      return W(
        e,
        { serial: n.serial, channel: n.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return Me(() => {
      D.value = localStorage.getItem("metis-hv-theme") === "light" ? "light" : "dark", me = se.client.subscribe("iseg", (n) => {
        f.value = !!n.connected, n.connection && (v.value = n, de || (Object.assign(b, n.connection, { lines: n.connection.lines.join(", ") }), de = !0));
      });
    }), qe(() => me?.()), (n, e) => (o(), r("article", {
      class: "iseg-panel hv-panel",
      "data-theme": D.value
    }, [
      t("header", We, [
        e[19] || (e[19] = t("h2", null, "iseg CC24", -1)),
        t("div", ze, [
          t("button", {
            type: "button",
            onClick: he
          }, u(D.value === "dark" ? "ライト" : "ダーク"), 1),
          t("button", {
            type: "button",
            "aria-label": "接続設定",
            title: "接続設定",
            onClick: e[0] || (e[0] = (l) => oe.value?.showModal())
          }, "⚙"),
          t("button", {
            type: "button",
            onClick: e[1] || (e[1] = (l) => re.value?.showModal())
          }, "ログ")
        ])
      ]),
      t("dialog", {
        ref_key: "logDialog",
        ref: re,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[21] || (e[21] = t("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          t("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ])
        ], -1)),
        K.value.length ? (o(), r("table", Je, [
          e[20] || (e[20] = t("thead", null, [
            t("tr", null, [
              t("th", null, "時刻"),
              t("th", null, "対象"),
              t("th", null, "操作"),
              t("th", null, "結果"),
              t("th", null, "詳細")
            ])
          ], -1)),
          t("tbody", null, [
            (o(!0), r(k, null, V(K.value, (l) => (o(), r("tr", {
              key: l.id
            }, [
              t("td", Ke, u(l.time), 1),
              t("td", null, u(l.target), 1),
              t("td", null, u(l.action), 1),
              t("td", Qe, u(l.result), 1),
              t("td", null, u(l.detail), 1)
            ]))), 128))
          ])
        ])) : (o(), r("p", Ge, "この画面からの操作はまだありません。"))
      ], 512),
      t("dialog", {
        ref_key: "settingsDialog",
        ref: oe,
        "aria-labelledby": j(M) + "-settings",
        class: "hv-settings"
      }, [
        t("header", Ye, [
          t("h3", {
            id: j(M) + "-settings"
          }, "接続設定", 8, Ze),
          e[22] || (e[22] = t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ], -1))
        ]),
        t("form", {
          class: "hv-settings-form",
          onSubmit: N(Ne, ["prevent"])
        }, [
          t("label", null, [
            e[23] || (e[23] = c("WebSocket URL ", -1)),
            d(t("input", {
              "onUpdate:modelValue": e[2] || (e[2] = (l) => b.url = l),
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
            e[24] || (e[24] = c("ユーザー名 ", -1)),
            d(t("input", {
              "onUpdate:modelValue": e[3] || (e[3] = (l) => b.username = l),
              autocomplete: "username"
            }, null, 512), [
              [g, b.username]
            ])
          ]),
          t("label", null, [
            e[25] || (e[25] = c("パスワード ", -1)),
            d(t("input", {
              "onUpdate:modelValue": e[4] || (e[4] = (l) => b.password = l),
              type: "password",
              autocomplete: "new-password",
              placeholder: v.value.password_set ? "設定済み" : ""
            }, null, 8, we), [
              [g, b.password]
            ])
          ]),
          t("label", null, [
            e[26] || (e[26] = c("CAN ライン ", -1)),
            d(t("input", {
              "onUpdate:modelValue": e[5] || (e[5] = (l) => b.lines = l),
              required: "",
              placeholder: "0, 1"
            }, null, 512), [
              [g, b.lines]
            ])
          ]),
          t("button", {
            disabled: _.value || !f.value
          }, "接続設定を保存", 8, et)
        ], 32),
        B.value ? (o(), r("p", tt, u(B.value), 1)) : S("", !0)
      ], 8, Xe),
      t("p", {
        class: "hv-status",
        "data-online": f.value && v.value.online,
        role: "status"
      }, u(f.value ? v.value.online ? "iCS2 接続中" : v.value.error || "iCS2 未接続" : "Metis ノード未接続"), 9, lt),
      B.value ? (o(), r("p", nt, u(B.value), 1)) : S("", !0),
      t("div", at, [
        e[28] || (e[28] = t("span", null, "モニター", -1)),
        t("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": y.value,
          onClick: e[6] || (e[6] = (l) => {
            y.value = !y.value, x.value = null;
          }),
          style: Ie({
            width: "2.75rem",
            height: "1.5rem",
            padding: ".15rem",
            border: 0,
            borderRadius: "1rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: y.value ? "flex-end" : "flex-start",
            background: y.value ? "#145375" : "#627786"
          })
        }, [...e[27] || (e[27] = [
          t("span", {
            "aria-hidden": "true",
            style: { width: "1.2rem", height: "1.2rem", "border-radius": "50%", background: "white" }
          }, null, -1)
        ])], 12, st),
        e[29] || (e[29] = t("span", null, "詳細", -1))
      ]),
      t("label", ut, [
        t("input", {
          type: "checkbox",
          disabled: !I.value.length,
          onChange: Ve,
          checked: I.value.length > 0 && $.value.length === I.value.length,
          ".indeterminate": $.value.length > 0 && $.value.length < I.value.length
        }, null, 40, it),
        e[30] || (e[30] = c(" 全グループを選択 ", -1))
      ]),
      A.value.length ? (o(), r("div", {
        key: 1,
        class: "iseg-group-tabs",
        role: "tablist",
        "aria-label": "チャンネルグループ",
        onKeydown: Ce
      }, [
        (o(!0), r(k, null, V(A.value, (l, a) => (o(), r("button", {
          id: j(M) + "-tab-" + a,
          key: l,
          type: "button",
          role: "tab",
          "aria-selected": l === q.value,
          "aria-controls": j(M) + "-panel",
          tabindex: l === q.value ? 0 : -1,
          onClick: (s) => Q.value = l
        }, u(l), 9, ot))), 128))
      ], 32)) : S("", !0),
      y.value ? (o(), r(k, { key: 2 }, [
        e[33] || (e[33] = t("h3", null, "選択チャンネルの一括設定", -1)),
        t("form", {
          class: "iseg-bulk",
          onSubmit: N(Se, ["prevent"])
        }, [
          (o(), r(k, null, V(te, ({ key: l, label: a, unit: s }) => t("fieldset", { key: l }, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": (m) => i[l] = m,
                  type: "checkbox"
                }, null, 8, rt), [
                  [z, i[l]]
                ]),
                c(" " + u(a) + "の範囲を変更", 1)
              ])
            ]),
            t("label", null, [
              c("下限 (" + u(s) + ") ", 1),
              d(t("input", {
                "onUpdate:modelValue": (m) => i[l + "_min"] = m,
                type: "number",
                step: "any",
                disabled: !i[l],
                required: i[l]
              }, null, 8, dt), [
                [g, i[l + "_min"]]
              ])
            ]),
            t("label", null, [
              c("上限 (" + u(s) + ") ", 1),
              d(t("input", {
                "onUpdate:modelValue": (m) => i[l + "_max"] = m,
                type: "number",
                step: "any",
                disabled: !i[l],
                required: i[l]
              }, null, 8, mt), [
                [g, i[l + "_max"]]
              ])
            ])
          ])), 64)),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": e[7] || (e[7] = (l) => i.grouping = l),
                  type: "checkbox"
                }, null, 512), [
                  [z, i.grouping]
                ]),
                e[31] || (e[31] = c(" グループを変更", -1))
              ])
            ]),
            d(t("input", {
              "onUpdate:modelValue": e[8] || (e[8] = (l) => i.group = l),
              "aria-label": "グループ名",
              disabled: !i.grouping,
              maxlength: "100",
              placeholder: "空欄で未分類"
            }, null, 8, ct), [
              [g, i.group]
            ])
          ]),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": e[9] || (e[9] = (l) => i.naming = l),
                  type: "checkbox"
                }, null, 512), [
                  [z, i.naming]
                ]),
                e[32] || (e[32] = c(" 表示名を変更", -1))
              ])
            ]),
            d(t("input", {
              "onUpdate:modelValue": e[10] || (e[10] = (l) => i.label = l),
              "aria-label": "表示名",
              disabled: !i.naming,
              maxlength: "100"
            }, null, 8, gt), [
              [g, i.label]
            ])
          ]),
          t("button", {
            disabled: _.value || !f.value || !$.value.length || !(i.voltage || i.current || i.grouping || i.naming)
          }, " 選択した " + u($.value.length) + " CH に適用 ", 9, vt)
        ], 32)
      ], 64)) : S("", !0),
      y.value ? S("", !0) : (o(), r("p", bt, [
        e[34] || (e[34] = c("行の色： ", -1)),
        (o(), r(k, null, V(ne, (l, a) => t("span", {
          key: a,
          class: "hv-legend",
          "data-state": l
        }, u(a), 9, pt)), 64))
      ])),
      (o(!0), r(k, null, V(xe.value, (l) => (o(), $e(Te(l.key === "unassigned" ? "details" : "section"), {
        key: l.key,
        class: je({ "iseg-unassigned": l.key === "unassigned" }),
        open: l.key === "unassigned" ? !0 : void 0,
        id: l.key === "group" ? j(M) + "-panel" : void 0,
        role: l.key === "group" ? "tabpanel" : void 0,
        "aria-labelledby": l.key === "group" ? j(M) + "-tab-" + ce.value : void 0
      }, {
        default: Le(() => [
          l.key === "unassigned" ? (o(), r("summary", ft, "未分類（" + u(l.rows.length) + " CH）", 1)) : S("", !0),
          y.value ? (o(), r("div", {
            key: 1,
            class: "iseg-table-scroll",
            tabindex: "0",
            role: "region",
            "aria-label": l.label + " チャンネル詳細"
          }, [
            t("table", yt, [
              e[35] || (e[35] = t("thead", null, [
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
                (o(!0), r(k, null, V(l.rows.filter((a) => a.serial), (a) => (o(), r("tr", {
                  key: a.key,
                  "data-state": ne[X(a)]
                }, [
                  t("td", null, [
                    d(t("input", {
                      "onUpdate:modelValue": e[11] || (e[11] = (s) => H.value = s),
                      type: "checkbox",
                      value: a.key,
                      "aria-label": a.serial + " CH " + a.channel
                    }, null, 8, kt), [
                      [z, H.value]
                    ])
                  ]),
                  t("td", null, [
                    c("CH " + u(a.channel), 1),
                    t("small", xt, u(a.serial) + " · " + u(a.location), 1)
                  ]),
                  t("td", null, [
                    t("form", {
                      onSubmit: N((s) => Fe(a), ["prevent"])
                    }, [
                      t("input", {
                        "aria-label": a.serial + " CH " + a.channel + " 表示名",
                        value: G[a.key] ?? a.settings.label ?? "",
                        disabled: _.value || !f.value,
                        maxlength: "100",
                        onInput: (s) => G[a.key] = s.target.value
                      }, null, 40, Vt)
                    ], 40, Ct),
                    R[a.key] ? (o(), r("small", St, u(R[a.key]), 1)) : S("", !0)
                  ]),
                  t("td", null, u(a.settings.group || "未分類"), 1),
                  (o(), r(k, null, V(te, ({ key: s }) => t("td", { key: s }, u(Ue(a, s)), 1)), 64)),
                  t("td", null, [
                    t("span", Ut, u(le(a.items, "Control.currentSet")), 1),
                    t("form", {
                      class: "iseg-setpoint",
                      onSubmit: N((s) => Y(a, "set_current", ee(O[a.key + "a"])), ["prevent"])
                    }, [
                      d(t("input", {
                        "onUpdate:modelValue": (s) => O[a.key + "a"] = s,
                        type: "number",
                        step: "any",
                        required: "",
                        "aria-label": (a.settings.label || "CH " + a.channel) + " 電流設定 (mA)"
                      }, null, 8, Ft), [
                        [g, O[a.key + "a"]]
                      ]),
                      t("button", {
                        disabled: _.value || !f.value || !v.value.online || !P(a, "current")
                      }, "設定", 8, Nt)
                    ], 40, At)
                  ]),
                  t("td", null, [
                    w(a) ? (o(), r("form", {
                      key: 0,
                      class: "iseg-setpoint",
                      onSubmit: N((s) => be(a), ["prevent"])
                    }, [
                      d(t("select", {
                        "onUpdate:modelValue": (s) => L[a.key] = s,
                        "aria-label": "CH " + a.channel + " iseg 遅延トリップ"
                      }, [
                        t("option", Dt, u(J[w(a)]) + "（現在）", 1),
                        (o(), r(k, null, V(J, (s, m) => t("option", {
                          key: m,
                          value: m
                        }, u(s), 9, Mt)), 64))
                      ], 8, Ot), [
                        [Be, L[a.key]]
                      ]),
                      t("button", {
                        disabled: _.value || !f.value || !v.value.online || L[a.key] == null
                      }, "設定", 8, qt)
                    ], 40, Ht)) : (o(), r("span", It, "取得不可"))
                  ]),
                  t("td", null, [
                    t("button", {
                      type: "button",
                      onClick: (s) => He(a)
                    }, "編集", 8, $t)
                  ])
                ], 8, _t))), 128))
              ])
            ])
          ], 8, ht)) : (o(), r("div", {
            key: 2,
            class: "iseg-table-scroll",
            tabindex: "0",
            role: "region",
            "aria-label": l.label + " モニター"
          }, [
            t("table", jt, [
              e[36] || (e[36] = t("thead", null, [
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
                (o(!0), r(k, null, V(l.rows, (a) => (o(), r("tr", {
                  key: a.key,
                  "data-state": ne[X(a)],
                  style: { "white-space": "nowrap" }
                }, [
                  t("td", null, [
                    d(t("input", {
                      "onUpdate:modelValue": e[12] || (e[12] = (s) => H.value = s),
                      type: "checkbox",
                      value: a.key,
                      disabled: !a.serial,
                      "aria-label": "選択: " + (a.settings.label || "CH " + a.channel)
                    }, null, 8, Bt), [
                      [z, H.value]
                    ])
                  ]),
                  t("td", null, [
                    t("button", {
                      type: "button",
                      disabled: !ae(a),
                      onClick: (s) => Ae(a),
                      "aria-label": (a.settings.label || "CH " + a.channel) + "、状態: " + X(a),
                      title: X(a) + (ae(a) ? "。クリックで出力切替" : "")
                    }, u(a.settings.label || "CH " + a.channel), 9, Rt)
                  ]),
                  t("td", Et, u(ve(a.items, "Control.voltageSet")), 1),
                  t("td", Pt, u(ve(a.items, "Status.voltageMeasure")), 1),
                  t("td", Wt, u(le(a.items, "Control.currentSet")), 1),
                  t("td", zt, u(le(a.items, "Status.currentMeasure")), 1),
                  t("td", null, [
                    t("form", {
                      class: "iseg-setpoint",
                      onSubmit: N((s) => Y(a, "set_voltage", Number(O[a.key + "v"])), ["prevent"])
                    }, [
                      d(t("input", {
                        "onUpdate:modelValue": (s) => O[a.key + "v"] = s,
                        type: "number",
                        step: "any",
                        required: "",
                        "aria-label": (a.settings.label || "CH " + a.channel) + " 電圧設定 (V)"
                      }, null, 8, Jt), [
                        [g, O[a.key + "v"]]
                      ]),
                      t("button", {
                        disabled: _.value || !f.value || !v.value.online || !a.serial || !P(a, "voltage")
                      }, "設定", 8, Kt)
                    ], 40, Gt),
                    R[a.key] ? (o(), r("small", Qt, u(R[a.key]), 1)) : S("", !0)
                  ])
                ], 8, Lt))), 128))
              ])
            ])
          ], 8, Tt))
        ]),
        _: 2
      }, 1032, ["class", "open", "id", "role", "aria-labelledby"]))), 128)),
      x.value && y.value ? (o(), r("form", {
        key: 4,
        class: "iseg-editor",
        onSubmit: N(Oe, ["prevent"])
      }, [
        t("h3", null, u(x.value.serial) + " / CH " + u(x.value.channel), 1),
        t("label", null, [
          e[37] || (e[37] = c("グループ ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[13] || (e[13] = (l) => p.group = l),
            maxlength: "100"
          }, null, 512), [
            [g, p.group]
          ])
        ]),
        t("label", null, [
          e[38] || (e[38] = c("最低電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (l) => p.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_min]
          ])
        ]),
        t("label", null, [
          e[39] || (e[39] = c("最高電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (l) => p.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_max]
          ])
        ]),
        t("label", null, [
          e[40] || (e[40] = c("最低電流 (mA) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (l) => p.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_min]
          ])
        ]),
        t("label", null, [
          e[41] || (e[41] = c("最高電流 (mA) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[17] || (e[17] = (l) => p.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_max]
          ])
        ]),
        t("button", {
          disabled: _.value || !f.value
        }, "保存", 8, Xt),
        t("button", {
          type: "button",
          onClick: e[18] || (e[18] = (l) => x.value = null)
        }, "閉じる")
      ], 32)) : S("", !0)
    ], 8, Pe));
  }
};
function wt(Z) {
  return Re({
    setup() {
      return () => Ee(Yt, { client: Z });
    }
  });
}
export {
  wt as mount
};
