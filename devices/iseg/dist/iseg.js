import { ref as S, reactive as _, computed as R, onMounted as z, onUnmounted as P, openBlock as g, createElementBlock as c, createElementVNode as l, withModifiers as x, createTextVNode as i, withDirectives as r, vModelText as d, toDisplayString as o, createCommentVNode as A, Fragment as B, renderList as E, defineComponent as W, h as G } from "vue";
const I = ["placeholder"], J = ["disabled"], K = { role: "status" }, Q = {
  key: 0,
  role: "status"
}, X = { style: { "overflow-x": "auto" } }, Y = ["onSubmit"], Z = ["onUpdate:modelValue"], h = ["disabled"], w = ["onSubmit"], ee = ["onUpdate:modelValue"], le = ["disabled"], te = ["disabled", "onClick"], ne = ["disabled", "onClick"], ue = ["disabled", "onClick"], oe = ["disabled"], se = {
  __name: "Contents",
  props: { client: { type: Object, required: !0 } },
  setup(N) {
    const $ = N, m = S({ modules: [], policies: {} }), a = _({ url: "", username: "", password: "", lines: "0" }), f = S(null), s = _({}), k = _({}), C = S(""), v = S(!1), b = S(!1);
    let F = !1, j;
    const L = R(() => {
      const n = /* @__PURE__ */ new Map();
      for (const e of m.value.modules) {
        const t = String(e["Status.serialNumber"] ?? "");
        for (const [y, u] of Object.entries(e.channels)) {
          const p = m.value.policies[t + ":" + y] ?? {}, O = p.group || "未分類";
          n.has(O) || n.set(O, []), n.get(O).push({
            key: e.line + ":" + e.address + ":" + y,
            serial: t,
            channel: y,
            items: u,
            settings: p,
            location: e.line + "/" + e.address + "/" + y
          });
        }
      }
      return n;
    });
    function V(n, e) {
      const t = n[e];
      return t ? String(t.value) + (t.unit ? " " + t.unit : "") : "—";
    }
    function q(n, e) {
      const t = n[e]?.value;
      return t == null ? "—" : ["1", "true"].includes(String(t).toLowerCase()) ? "ON" : "OFF";
    }
    async function M(n, e, t) {
      v.value = !0, C.value = "";
      try {
        return await $.client.request(n, e), C.value = t, !0;
      } catch (y) {
        return C.value = "処理を確認できませんでした。接続、許容範囲、実機の状態を確認してください。 " + y.message, !1;
      } finally {
        v.value = !1;
      }
    }
    async function T() {
      await M("configure", {
        ...a,
        lines: a.lines.split(",").map((n) => n.trim())
      }, "接続設定を保存しました。") && (a.password = "");
    }
    function D(n) {
      f.value = n;
      for (const e of ["label", "group", "voltage_min", "voltage_max", "current_min", "current_max"])
        s[e] = n.settings[e] ?? "";
    }
    async function H() {
      const n = { ...s, serial: f.value.serial, channel: f.value.channel };
      for (const e of ["voltage_min", "voltage_max", "current_min", "current_max"])
        n[e] = n[e] === "" ? null : Number(n[e]);
      await M("configure_channel", n, "チャンネル設定を保存しました。") && (f.value = null);
    }
    function U(n, e, t) {
      return M(
        e,
        { serial: n.serial, channel: n.channel, value: t },
        "指令が受理されました。設定値と出力状態は監視欄で確認できます。"
      );
    }
    return z(() => {
      j = $.client.subscribe("iseg", (n) => {
        b.value = !!n.connected, n.connection && (m.value = n, F || (Object.assign(a, n.connection, { lines: n.connection.lines.join(", ") }), F = !0));
      });
    }), P(() => j?.()), (n, e) => (g(), c("article", null, [
      e[25] || (e[25] = l("h2", null, "iseg CC24", -1)),
      l("form", {
        onSubmit: x(T, ["prevent"])
      }, [
        l("label", null, [
          e[11] || (e[11] = i("WebSocket URL ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[0] || (e[0] = (t) => a.url = t),
            placeholder: "ws://cc24:8080",
            required: ""
          }, null, 512), [
            [
              d,
              a.url,
              void 0,
              { trim: !0 }
            ]
          ])
        ]),
        l("label", null, [
          e[12] || (e[12] = i("ユーザー名 ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (t) => a.username = t),
            autocomplete: "username"
          }, null, 512), [
            [d, a.username]
          ])
        ]),
        l("label", null, [
          e[13] || (e[13] = i("パスワード ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[2] || (e[2] = (t) => a.password = t),
            type: "password",
            autocomplete: "new-password",
            placeholder: m.value.password_set ? "設定済み" : ""
          }, null, 8, I), [
            [d, a.password]
          ])
        ]),
        l("label", null, [
          e[14] || (e[14] = i("CAN ライン ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[3] || (e[3] = (t) => a.lines = t),
            required: "",
            placeholder: "0, 1"
          }, null, 512), [
            [d, a.lines]
          ])
        ]),
        l("button", {
          disabled: v.value || !b.value
        }, "接続設定を保存", 8, J)
      ], 32),
      l("p", K, o(b.value ? m.value.online ? "iCS2 接続中" : m.value.error || "iCS2 未接続" : "Metis ノード未接続"), 1),
      C.value ? (g(), c("p", Q, o(C.value), 1)) : A("", !0),
      (g(!0), c(B, null, E(L.value, ([t, y]) => (g(), c("section", { key: t }, [
        l("h3", null, o(t), 1),
        l("div", X, [
          l("table", null, [
            e[18] || (e[18] = l("thead", null, [
              l("tr", null, [
                l("th", null, "チャンネル"),
                l("th", null, "電圧 設定 / 実測"),
                l("th", null, "電流 設定 / 実測"),
                l("th", null, "出力 / ランプ / トリップ"),
                l("th", null, "操作")
              ])
            ], -1)),
            l("tbody", null, [
              (g(!0), c(B, null, E(y, (u) => (g(), c("tr", {
                key: u.key
              }, [
                l("td", null, [
                  i(o(u.settings.label || "CH " + u.channel), 1),
                  e[15] || (e[15] = l("br", null, null, -1)),
                  l("small", null, o(u.serial || "S/N 不明") + " · " + o(u.location), 1)
                ]),
                l("td", null, o(V(u.items, "Control.voltageSet")) + " / " + o(V(u.items, "Status.voltageMeasure")), 1),
                l("td", null, o(V(u.items, "Control.currentSet")) + " / " + o(V(u.items, "Status.currentMeasure")), 1),
                l("td", null, o(q(u.items, "Status.on")) + " / " + o(q(u.items, "Status.voltageRamping")) + " / " + o(q(u.items, "Error.currentTrip")), 1),
                l("td", null, [
                  l("form", {
                    onSubmit: x((p) => U(u, "set_voltage", Number(k[u.key + "v"])), ["prevent"])
                  }, [
                    l("label", null, [
                      e[16] || (e[16] = i("V ", -1)),
                      r(l("input", {
                        "onUpdate:modelValue": (p) => k[u.key + "v"] = p,
                        type: "number",
                        step: "any",
                        required: ""
                      }, null, 8, Z), [
                        [d, k[u.key + "v"]]
                      ])
                    ]),
                    l("button", {
                      disabled: v.value || !b.value || !m.value.online || !u.serial
                    }, "設定", 8, h)
                  ], 40, Y),
                  l("form", {
                    onSubmit: x((p) => U(u, "set_current", Number(k[u.key + "a"])), ["prevent"])
                  }, [
                    l("label", null, [
                      e[17] || (e[17] = i("A ", -1)),
                      r(l("input", {
                        "onUpdate:modelValue": (p) => k[u.key + "a"] = p,
                        type: "number",
                        step: "any",
                        required: ""
                      }, null, 8, ee), [
                        [d, k[u.key + "a"]]
                      ])
                    ]),
                    l("button", {
                      disabled: v.value || !b.value || !m.value.online || !u.serial
                    }, "設定", 8, le)
                  ], 40, w),
                  l("button", {
                    type: "button",
                    disabled: v.value || !b.value || !m.value.online || !u.serial,
                    onClick: (p) => U(u, "set_output", !0)
                  }, "ON", 8, te),
                  l("button", {
                    type: "button",
                    disabled: v.value || !b.value || !m.value.online || !u.serial,
                    onClick: (p) => U(u, "set_output", !1)
                  }, "OFF", 8, ne),
                  l("button", {
                    type: "button",
                    disabled: v.value || !b.value || !u.serial,
                    onClick: (p) => D(u)
                  }, "チャンネル設定", 8, ue)
                ])
              ]))), 128))
            ])
          ])
        ])
      ]))), 128)),
      f.value ? (g(), c("form", {
        key: 1,
        onSubmit: x(H, ["prevent"])
      }, [
        l("h3", null, o(f.value.serial) + " / CH " + o(f.value.channel), 1),
        l("label", null, [
          e[19] || (e[19] = i("表示名 ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[4] || (e[4] = (t) => s.label = t),
            maxlength: "100"
          }, null, 512), [
            [d, s.label]
          ])
        ]),
        l("label", null, [
          e[20] || (e[20] = i("グループ ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[5] || (e[5] = (t) => s.group = t),
            maxlength: "100"
          }, null, 512), [
            [d, s.group]
          ])
        ]),
        l("label", null, [
          e[21] || (e[21] = i("最低電圧 (V) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[6] || (e[6] = (t) => s.voltage_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [d, s.voltage_min]
          ])
        ]),
        l("label", null, [
          e[22] || (e[22] = i("最高電圧 (V) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[7] || (e[7] = (t) => s.voltage_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [d, s.voltage_max]
          ])
        ]),
        l("label", null, [
          e[23] || (e[23] = i("最低電流 (A) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[8] || (e[8] = (t) => s.current_min = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [d, s.current_min]
          ])
        ]),
        l("label", null, [
          e[24] || (e[24] = i("最高電流 (A) ", -1)),
          r(l("input", {
            "onUpdate:modelValue": e[9] || (e[9] = (t) => s.current_max = t),
            type: "number",
            step: "any"
          }, null, 512), [
            [d, s.current_max]
          ])
        ]),
        l("button", {
          disabled: v.value || !b.value
        }, "保存", 8, oe),
        l("button", {
          type: "button",
          onClick: e[10] || (e[10] = (t) => f.value = null)
        }, "閉じる")
      ], 32)) : A("", !0)
    ]));
  }
};
function ae(N) {
  return W({
    setup() {
      return () => G(se, { client: N });
    }
  });
}
export {
  ae as mount
};
