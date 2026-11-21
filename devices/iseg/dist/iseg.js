import { ref as k, reactive as S, computed as F, useId as He, onMounted as Oe, onUnmounted as De, openBlock as o, createElementBlock as r, createElementVNode as t, Fragment as _, renderList as V, toDisplayString as i, withModifiers as N, createTextVNode as c, withDirectives as d, vModelText as g, createCommentVNode as U, normalizeStyle as ne, unref as K, vModelCheckbox as R, createBlock as Me, resolveDynamicComponent as qe, normalizeClass as Ie, withCtx as $e, vModelSelect as je, defineComponent as Te, h as Le } from "vue";
const Be = { class: "iseg-panel" }, Re = { key: 0 }, Ee = {
  key: 1,
  style: { width: "100%", "text-align": "left" }
}, Pe = { style: { "white-space": "nowrap" } }, We = { style: { "white-space": "nowrap" } }, ze = ["placeholder"], Ge = ["disabled"], Je = { role: "status" }, Ke = {
  key: 0,
  role: "status"
}, Qe = { style: { display: "inline-flex", "align-items": "center", gap: ".5rem" } }, Xe = ["aria-checked"], Ye = { style: { "margin-inline-start": "1rem" } }, Ze = ["disabled", "checked", ".indeterminate"], we = ["id", "aria-selected", "aria-controls", "tabindex", "onClick"], et = ["onUpdate:modelValue"], tt = ["onUpdate:modelValue", "disabled", "required"], lt = ["onUpdate:modelValue", "disabled", "required"], nt = ["disabled"], at = ["disabled"], st = ["disabled"], ut = { key: 3 }, it = { key: 0 }, ot = ["aria-label"], rt = { class: "iseg-data iseg-detail" }, dt = ["value", "aria-label"], mt = { class: "iseg-address" }, ct = ["onSubmit"], gt = ["aria-label", "value", "disabled", "onInput"], bt = {
  key: 0,
  role: "status"
}, pt = { class: "iseg-number" }, vt = ["onSubmit"], ft = ["onUpdate:modelValue", "aria-label"], yt = ["disabled"], ht = ["onSubmit"], kt = ["onUpdate:modelValue", "aria-label"], _t = { value: void 0 }, xt = ["value"], Ct = ["disabled"], Vt = { key: 1 }, St = ["onClick"], Ut = ["aria-label"], At = { class: "iseg-data iseg-monitor" }, Ft = ["value", "disabled", "aria-label"], Nt = ["disabled", "onClick", "aria-label", "title"], Ht = { class: "iseg-number" }, Ot = { class: "iseg-number iseg-measured" }, Dt = { class: "iseg-number" }, Mt = { class: "iseg-number iseg-measured" }, qt = ["onSubmit"], It = ["onUpdate:modelValue", "aria-label"], $t = ["disabled"], jt = {
  key: 0,
  class: "iseg-row-feedback",
  role: "status"
}, Tt = ["disabled"], Lt = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(Q) {
    const ae = Q, v = k({ modules: [], policies: {} }), b = S({ url: "", username: "", password: "", lines: "0" }), x = k(null), y = k(!1), H = k([]), E = S({}), u = S({
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
    }), p = S({}), O = S({}), $ = S({}), P = {
      0: "動作なし",
      1: "CH OFF（ランプあり）",
      2: "CH OFF（ランプなし）",
      3: "モジュール OFF（ランプなし）",
      4: "遅延トリップ無効"
    };
    function X(n) {
      const e = String(n.items["Setup.delayedTripAction"]?.value);
      return Object.hasOwn(P, e) ? e : "";
    }
    async function be(n) {
      const e = $[n.key];
      !X(n) || e == null || await J(n, "set_trip_action", Number(e)) && delete $[n.key];
    }
    const se = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 4 }), ue = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: 3, maximumFractionDigits: 6 }), pe = { V: 1, kV: 1e3 }, ve = { kA: 1e6, A: 1e3, mA: 1, µA: 1e-3, μA: 1e-3, uA: 1e-3, nA: 1e-6 }, Y = (n) => Number(n) / 1e3, Z = k(""), ie = k(null), W = k([]);
    let fe = 0;
    const ye = {
      configure: "接続設定の保存",
      configure_channel: "チャンネル設定の保存",
      configure_channels: "チャンネル一括設定",
      set_voltage: "電圧設定",
      set_current: "電流設定",
      set_trip_action: "iseg 遅延トリップ設定",
      set_output: "出力切替"
    };
    function he(n, e) {
      const l = e.serial ? e.serial + " / CH " + e.channel : "CC24";
      let a = ye[n] ?? n;
      n === "configure_channels" && (a += " " + e.targets.length + " CH"), n === "set_voltage" && (a += " " + e.value + " V"), n === "set_current" && (a += " " + e.value + " A"), n === "set_trip_action" && (a += "：" + P[e.value]), n === "set_output" && (a += e.value ? " ON" : " OFF");
      const s = S({
        id: ++fe,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        target: l,
        action: a,
        result: "処理中",
        detail: ""
      });
      return W.value = [s, ...W.value].slice(0, 100), s;
    }
    const j = S({}), h = k(!1), f = k(!1);
    let oe = !1, re;
    const T = F(() => {
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
    }), z = He(), G = k(""), A = F(() => [...T.value.keys()].filter(Boolean)), D = F(() => A.value.includes(G.value) ? G.value : A.value[0]), ke = F(() => {
      const n = [];
      return D.value && n.push({ key: "group", label: D.value, rows: T.value.get(D.value) }), T.value.has("") && n.push({ key: "unassigned", label: "未分類", rows: T.value.get("") }), n;
    }), de = F(() => A.value.indexOf(D.value));
    function _e(n) {
      const e = A.value.length, l = de.value, a = {
        ArrowLeft: (l - 1 + e) % e,
        ArrowRight: (l + 1) % e,
        Home: 0,
        End: e - 1
      }[n.key];
      Number.isInteger(a) && (n.preventDefault(), G.value = A.value[a], n.currentTarget.children[a]?.focus());
    }
    const M = F(() => [...T.value.values()].flat().filter((n) => n.serial)), q = F(() => M.value.filter((n) => H.value.includes(n.key)));
    function xe(n) {
      H.value = n.target.checked ? M.value.map((e) => e.key) : [];
    }
    const w = [
      { key: "voltage", label: "電圧", unit: "V" },
      { key: "current", label: "電流", unit: "mA" }
    ];
    function L(n, e) {
      return n.settings[e + "_min"] != null && n.settings[e + "_max"] != null;
    }
    async function Ce() {
      const n = {};
      for (const { key: l } of w)
        if (u[l]) {
          const a = l === "current" ? Y : Number;
          n[l + "_min"] = a(u[l + "_min"]), n[l + "_max"] = a(u[l + "_max"]);
        }
      u.grouping && (n.group = u.group), u.naming && (n.label = u.label);
      const e = q.value.map(({ serial: l, channel: a }) => ({ serial: l, channel: a }));
      await B("configure_channels", { targets: e, changes: n }, e.length + " チャンネルに保存しました。");
    }
    function me(n, e, l, a) {
      const s = n[e];
      if (s?.value == null || typeof s.value == "string" && !s.value.trim()) return "—";
      const m = Number(s.value) * l[s.unit];
      return Number.isFinite(m) ? a.format(m) : "—";
    }
    function ce(n, e) {
      return me(n, e, pe, se);
    }
    function ee(n, e) {
      return me(n, e, ve, ue);
    }
    function Ve(n, e) {
      if (!L(n, e)) return "未設定";
      const l = e === "current" ? 1e3 : 1, a = e === "current" ? ue : se;
      return a.format(n.settings[e + "_min"] * l) + " ～ " + a.format(n.settings[e + "_max"] * l);
    }
    function I(n, e) {
      const l = String(n[e]?.value).toLowerCase();
      return ["1", "true"].includes(l) ? !0 : ["0", "false"].includes(l) ? !1 : null;
    }
    function te(n) {
      return !f.value || !v.value.online || I(n.items, "Status.on") === null ? "不明" : I(n.items, "Error.currentTrip") ? "異常" : I(n.items, "Status.voltageRamping") ? "ランプ中" : I(n.items, "Status.on") ? "ON" : "OFF";
    }
    const ge = { 不明: "#edf1f5", 異常: "#fbe0de", ランプ中: "#fff0cb", ON: "#dcf2e4", OFF: "#fff" };
    function le(n) {
      const e = I(n.items, "Status.on");
      return !h.value && f.value && v.value.online && n.serial && e !== null && (e || L(n, "voltage") && L(n, "current"));
    }
    function Se(n) {
      le(n) && J(n, "set_output", !I(n.items, "Status.on"));
    }
    async function Ue(n) {
      const e = E[n.key];
      e !== void 0 && await B("configure_channels", {
        targets: [{ serial: n.serial, channel: n.channel }],
        changes: { label: e }
      }, "表示名を保存しました。", n.key) && delete E[n.key];
    }
    async function B(n, e, l, a) {
      const s = (C) => {
        a ? j[a] = C : Z.value = C;
      }, m = he(n, e);
      h.value = !0, s("処理中…");
      try {
        return await ae.client.request(n, e), m.result = n.startsWith("set_") ? "指令受理" : "保存完了", m.detail = l, s(l), !0;
      } catch (C) {
        return m.result = "エラー", m.detail = C.message, s(C.message), !1;
      } finally {
        h.value = !1;
      }
    }
    async function Ae() {
      await B("configure", {
        ...b,
        lines: b.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (b.password = "");
    }
    function Fe(n) {
      y.value = !0, x.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = n.settings[e];
        p[e] = l != null && e.startsWith("current_") ? Number((l * 1e3).toPrecision(15)) : l ?? "";
      }
    }
    async function Ne() {
      const n = { ...p };
      delete n.label;
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"]) {
        const l = e.startsWith("current_") ? Y : Number;
        n[e] = n[e] === "" ? null : l(n[e]);
      }
      await B("configure_channels", {
        targets: [{ serial: x.value.serial, channel: x.value.channel }],
        changes: n
      }, "チャンネル設定を保存しました。") && (x.value = null);
    }
    function J(n, e, l) {
      return B(
        e,
        { serial: n.serial, channel: n.channel, value: l },
        "指令を受理。監視欄で実機の反映を確認してください。",
        n.key
      );
    }
    return Oe(() => {
      re = ae.client.subscribe("iseg", (n) => {
        f.value = !!n.connected, n.connection && (v.value = n, oe || (Object.assign(b, n.connection, { lines: n.connection.lines.join(", ") }), oe = !0));
      });
    }), De(() => re?.()), (n, e) => (o(), r("article", Be, [
      e[39] || (e[39] = t("h2", null, "iseg CC24", -1)),
      t("button", {
        type: "button",
        onClick: e[0] || (e[0] = (l) => ie.value?.showModal())
      }, "操作ログ"),
      t("dialog", {
        ref_key: "logDialog",
        ref: ie,
        "aria-labelledby": "iseg-operation-log-title",
        style: { width: "min(56rem, 90vw)", "max-height": "75vh", overflow: "auto" }
      }, [
        e[19] || (e[19] = t("div", { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "1rem" } }, [
          t("h3", { id: "iseg-operation-log-title" }, "操作ログ"),
          t("form", { method: "dialog" }, [
            t("button", null, "閉じる")
          ])
        ], -1)),
        W.value.length ? (o(), r("table", Ee, [
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
            (o(!0), r(_, null, V(W.value, (l) => (o(), r("tr", {
              key: l.id
            }, [
              t("td", Pe, i(l.time), 1),
              t("td", null, i(l.target), 1),
              t("td", null, i(l.action), 1),
              t("td", We, i(l.result), 1),
              t("td", null, i(l.detail), 1)
            ]))), 128))
          ])
        ])) : (o(), r("p", Re, "この画面からの操作はまだありません。"))
      ], 512),
      t("form", {
        onSubmit: N(Ae, ["prevent"])
      }, [
        t("label", null, [
          e[20] || (e[20] = c("WebSocket URL ", -1)),
          d(t("input", {
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
          d(t("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (l) => b.username = l),
            autocomplete: "username"
          }, null, 512), [
            [g, b.username]
          ])
        ]),
        t("label", null, [
          e[22] || (e[22] = c("パスワード ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (l) => b.password = l),
            type: "password",
            autocomplete: "new-password",
            placeholder: v.value.password_set ? "設定済み" : ""
          }, null, 8, ze), [
            [g, b.password]
          ])
        ]),
        t("label", null, [
          e[23] || (e[23] = c("CAN ライン ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (l) => b.lines = l),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [g, b.lines]
          ])
        ]),
        t("button", {
          disabled: h.value || !f.value
        }, "接続設定を保存", 8, Ge)
      ], 32),
      t("p", Je, i(f.value ? v.value.online ? "iCS2 接続中" : v.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      Z.value ? (o(), r("p", Ke, i(Z.value), 1)) : U("", !0),
      t("div", Qe, [
        e[25] || (e[25] = t("span", null, "モニター", -1)),
        t("button", {
          type: "button",
          role: "switch",
          "aria-label": "詳細モード",
          "aria-checked": y.value,
          onClick: e[5] || (e[5] = (l) => {
            y.value = !y.value, x.value = null;
          }),
          style: ne({
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
        }, [...e[24] || (e[24] = [
          t("span", {
            "aria-hidden": "true",
            style: { width: "1.2rem", height: "1.2rem", "border-radius": "50%", background: "white" }
          }, null, -1)
        ])], 12, Xe),
        e[26] || (e[26] = t("span", null, "詳細", -1))
      ]),
      t("label", Ye, [
        t("input", {
          type: "checkbox",
          disabled: !M.value.length,
          onChange: xe,
          checked: M.value.length > 0 && q.value.length === M.value.length,
          ".indeterminate": q.value.length > 0 && q.value.length < M.value.length
        }, null, 40, Ze),
        e[27] || (e[27] = c(" 全グループを選択 ", -1))
      ]),
      A.value.length ? (o(), r("div", {
        key: 1,
        class: "iseg-group-tabs",
        role: "tablist",
        "aria-label": "チャンネルグループ",
        onKeydown: _e
      }, [
        (o(!0), r(_, null, V(A.value, (l, a) => (o(), r("button", {
          id: K(z) + "-tab-" + a,
          key: l,
          type: "button",
          role: "tab",
          "aria-selected": l === D.value,
          "aria-controls": K(z) + "-panel",
          tabindex: l === D.value ? 0 : -1,
          onClick: (s) => G.value = l
        }, i(l), 9, we))), 128))
      ], 32)) : U("", !0),
      y.value ? (o(), r(_, { key: 2 }, [
        e[30] || (e[30] = t("h3", null, "選択チャンネルの一括設定", -1)),
        t("form", {
          class: "iseg-bulk",
          onSubmit: N(Ce, ["prevent"])
        }, [
          (o(), r(_, null, V(w, ({ key: l, label: a, unit: s }) => t("fieldset", { key: l }, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": (m) => u[l] = m,
                  type: "checkbox"
                }, null, 8, et), [
                  [R, u[l]]
                ]),
                c(" " + i(a) + "の範囲を変更", 1)
              ])
            ]),
            t("label", null, [
              c("下限 (" + i(s) + ") ", 1),
              d(t("input", {
                "onUpdate:modelValue": (m) => u[l + "_min"] = m,
                type: "number",
                step: "any",
                disabled: !u[l],
                required: u[l]
              }, null, 8, tt), [
                [g, u[l + "_min"]]
              ])
            ]),
            t("label", null, [
              c("上限 (" + i(s) + ") ", 1),
              d(t("input", {
                "onUpdate:modelValue": (m) => u[l + "_max"] = m,
                type: "number",
                step: "any",
                disabled: !u[l],
                required: u[l]
              }, null, 8, lt), [
                [g, u[l + "_max"]]
              ])
            ])
          ])), 64)),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": e[6] || (e[6] = (l) => u.grouping = l),
                  type: "checkbox"
                }, null, 512), [
                  [R, u.grouping]
                ]),
                e[28] || (e[28] = c(" グループを変更", -1))
              ])
            ]),
            d(t("input", {
              "onUpdate:modelValue": e[7] || (e[7] = (l) => u.group = l),
              "aria-label": "グループ名",
              disabled: !u.grouping,
              maxlength: "100",
              placeholder: "空欄で未分類"
            }, null, 8, nt), [
              [g, u.group]
            ])
          ]),
          t("fieldset", null, [
            t("legend", null, [
              t("label", null, [
                d(t("input", {
                  "onUpdate:modelValue": e[8] || (e[8] = (l) => u.naming = l),
                  type: "checkbox"
                }, null, 512), [
                  [R, u.naming]
                ]),
                e[29] || (e[29] = c(" 表示名を変更", -1))
              ])
            ]),
            d(t("input", {
              "onUpdate:modelValue": e[9] || (e[9] = (l) => u.label = l),
              "aria-label": "表示名",
              disabled: !u.naming,
              maxlength: "100"
            }, null, 8, at), [
              [g, u.label]
            ])
          ]),
          t("button", {
            disabled: h.value || !f.value || !q.value.length || !(u.voltage || u.current || u.grouping || u.naming)
          }, " 選択した " + i(q.value.length) + " CH に適用 ", 9, st)
        ], 32)
      ], 64)) : U("", !0),
      y.value ? U("", !0) : (o(), r("p", ut, [
        e[31] || (e[31] = c("行の色： ", -1)),
        (o(), r(_, null, V(ge, (l, a) => t("span", {
          key: a,
          style: ne({ background: l, padding: ".15rem .4rem", marginInlineEnd: ".25rem", border: "1px solid #bcc8cf" })
        }, i(a), 5)), 64))
      ])),
      (o(!0), r(_, null, V(ke.value, (l) => (o(), Me(qe(l.key === "unassigned" ? "details" : "section"), {
        key: l.key,
        class: Ie({ "iseg-unassigned": l.key === "unassigned" }),
        open: l.key === "unassigned" ? !0 : void 0,
        id: l.key === "group" ? K(z) + "-panel" : void 0,
        role: l.key === "group" ? "tabpanel" : void 0,
        "aria-labelledby": l.key === "group" ? K(z) + "-tab-" + de.value : void 0
      }, {
        default: $e(() => [
          l.key === "unassigned" ? (o(), r("summary", it, "未分類（" + i(l.rows.length) + " CH）", 1)) : U("", !0),
          y.value ? (o(), r("div", {
            key: 1,
            class: "iseg-table-scroll",
            tabindex: "0",
            role: "region",
            "aria-label": l.label + " チャンネル詳細"
          }, [
            t("table", rt, [
              e[32] || (e[32] = t("thead", null, [
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
                (o(!0), r(_, null, V(l.rows.filter((a) => a.serial), (a) => (o(), r("tr", {
                  key: a.key
                }, [
                  t("td", null, [
                    d(t("input", {
                      "onUpdate:modelValue": e[10] || (e[10] = (s) => H.value = s),
                      type: "checkbox",
                      value: a.key,
                      "aria-label": a.serial + " CH " + a.channel
                    }, null, 8, dt), [
                      [R, H.value]
                    ])
                  ]),
                  t("td", null, [
                    c("CH " + i(a.channel), 1),
                    t("small", mt, i(a.serial) + " · " + i(a.location), 1)
                  ]),
                  t("td", null, [
                    t("form", {
                      onSubmit: N((s) => Ue(a), ["prevent"])
                    }, [
                      t("input", {
                        "aria-label": a.serial + " CH " + a.channel + " 表示名",
                        value: E[a.key] ?? a.settings.label ?? "",
                        disabled: h.value || !f.value,
                        maxlength: "100",
                        onInput: (s) => E[a.key] = s.target.value
                      }, null, 40, gt)
                    ], 40, ct),
                    j[a.key] ? (o(), r("small", bt, i(j[a.key]), 1)) : U("", !0)
                  ]),
                  t("td", null, i(a.settings.group || "未分類"), 1),
                  (o(), r(_, null, V(w, ({ key: s }) => t("td", { key: s }, i(Ve(a, s)), 1)), 64)),
                  t("td", null, [
                    t("span", pt, i(ee(a.items, "Control.currentSet")), 1),
                    t("form", {
                      class: "iseg-setpoint",
                      onSubmit: N((s) => J(a, "set_current", Y(O[a.key + "a"])), ["prevent"])
                    }, [
                      d(t("input", {
                        "onUpdate:modelValue": (s) => O[a.key + "a"] = s,
                        type: "number",
                        step: "any",
                        required: "",
                        "aria-label": (a.settings.label || "CH " + a.channel) + " 電流設定 (mA)"
                      }, null, 8, ft), [
                        [g, O[a.key + "a"]]
                      ]),
                      t("button", {
                        disabled: h.value || !f.value || !v.value.online || !L(a, "current")
                      }, "設定", 8, yt)
                    ], 40, vt)
                  ]),
                  t("td", null, [
                    X(a) ? (o(), r("form", {
                      key: 0,
                      class: "iseg-setpoint",
                      onSubmit: N((s) => be(a), ["prevent"])
                    }, [
                      d(t("select", {
                        "onUpdate:modelValue": (s) => $[a.key] = s,
                        "aria-label": "CH " + a.channel + " iseg 遅延トリップ"
                      }, [
                        t("option", _t, i(P[X(a)]) + "（現在）", 1),
                        (o(), r(_, null, V(P, (s, m) => t("option", {
                          key: m,
                          value: m
                        }, i(s), 9, xt)), 64))
                      ], 8, kt), [
                        [je, $[a.key]]
                      ]),
                      t("button", {
                        disabled: h.value || !f.value || !v.value.online || $[a.key] == null
                      }, "設定", 8, Ct)
                    ], 40, ht)) : (o(), r("span", Vt, "取得不可"))
                  ]),
                  t("td", null, [
                    t("button", {
                      type: "button",
                      onClick: (s) => Fe(a)
                    }, "編集", 8, St)
                  ])
                ]))), 128))
              ])
            ])
          ], 8, ot)) : (o(), r("div", {
            key: 2,
            class: "iseg-table-scroll",
            tabindex: "0",
            role: "region",
            "aria-label": l.label + " モニター"
          }, [
            t("table", At, [
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
                (o(!0), r(_, null, V(l.rows, (a) => (o(), r("tr", {
                  key: a.key,
                  style: ne({ background: ge[te(a)], whiteSpace: "nowrap" })
                }, [
                  t("td", null, [
                    d(t("input", {
                      "onUpdate:modelValue": e[11] || (e[11] = (s) => H.value = s),
                      type: "checkbox",
                      value: a.key,
                      disabled: !a.serial,
                      "aria-label": "選択: " + (a.settings.label || "CH " + a.channel)
                    }, null, 8, Ft), [
                      [R, H.value]
                    ])
                  ]),
                  t("td", null, [
                    t("button", {
                      type: "button",
                      disabled: !le(a),
                      onClick: (s) => Se(a),
                      "aria-label": (a.settings.label || "CH " + a.channel) + "、状態: " + te(a),
                      title: te(a) + (le(a) ? "。クリックで出力切替" : "")
                    }, i(a.settings.label || "CH " + a.channel), 9, Nt)
                  ]),
                  t("td", Ht, i(ce(a.items, "Control.voltageSet")), 1),
                  t("td", Ot, i(ce(a.items, "Status.voltageMeasure")), 1),
                  t("td", Dt, i(ee(a.items, "Control.currentSet")), 1),
                  t("td", Mt, i(ee(a.items, "Status.currentMeasure")), 1),
                  t("td", null, [
                    t("form", {
                      class: "iseg-setpoint",
                      onSubmit: N((s) => J(a, "set_voltage", Number(O[a.key + "v"])), ["prevent"])
                    }, [
                      d(t("input", {
                        "onUpdate:modelValue": (s) => O[a.key + "v"] = s,
                        type: "number",
                        step: "any",
                        required: "",
                        "aria-label": (a.settings.label || "CH " + a.channel) + " 電圧設定 (V)"
                      }, null, 8, It), [
                        [g, O[a.key + "v"]]
                      ]),
                      t("button", {
                        disabled: h.value || !f.value || !v.value.online || !a.serial || !L(a, "voltage")
                      }, "設定", 8, $t)
                    ], 40, qt),
                    j[a.key] ? (o(), r("small", jt, i(j[a.key]), 1)) : U("", !0)
                  ])
                ], 4))), 128))
              ])
            ])
          ], 8, Ut))
        ]),
        _: 2
      }, 1032, ["class", "open", "id", "role", "aria-labelledby"]))), 128)),
      x.value && y.value ? (o(), r("form", {
        key: 4,
        class: "iseg-editor",
        onSubmit: N(Ne, ["prevent"])
      }, [
        t("h3", null, i(x.value.serial) + " / CH " + i(x.value.channel), 1),
        t("label", null, [
          e[34] || (e[34] = c("グループ ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[12] || (e[12] = (l) => p.group = l),
            maxlength: "100"
          }, null, 512), [
            [g, p.group]
          ])
        ]),
        t("label", null, [
          e[35] || (e[35] = c("最低電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[13] || (e[13] = (l) => p.voltage_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_min]
          ])
        ]),
        t("label", null, [
          e[36] || (e[36] = c("最高電圧 (V) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[14] || (e[14] = (l) => p.voltage_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.voltage_max]
          ])
        ]),
        t("label", null, [
          e[37] || (e[37] = c("最低電流 (mA) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[15] || (e[15] = (l) => p.current_min = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_min]
          ])
        ]),
        t("label", null, [
          e[38] || (e[38] = c("最高電流 (mA) ", -1)),
          d(t("input", {
            "onUpdate:modelValue": e[16] || (e[16] = (l) => p.current_max = l),
            type: "number",
            step: "any"
          }, null, 512), [
            [g, p.current_max]
          ])
        ]),
        t("button", {
          disabled: h.value || !f.value
        }, "保存", 8, Tt),
        t("button", {
          type: "button",
          onClick: e[17] || (e[17] = (l) => x.value = null)
        }, "閉じる")
      ], 32)) : U("", !0)
    ]));
  }
};
function Rt(Q) {
  return Te({
    setup() {
      return () => Le(Lt, { client: Q });
    }
  });
}
export {
  Rt as mount
};
