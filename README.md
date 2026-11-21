# ３ノードの時刻デモ

同じ `node:app` を A（ルート）、B（中間）、D（時計つきエッジ）として起動します。各ノードは下位ノード用 WebSocket サーバーを持ち、上位が指定されているときだけ上位へ接続します。中央とエッジは固定的なプログラム種別ではなく、接続に対する役割です。ノード ID・接続先・担当デバイスは各ノードの SQLite に保存します。

## 起動

Python 3.10 以降を使用し、`pip install -r requirements.txt` を実行します。画面をビルドするときは Node.js と pnpm を使用します。ビルド済みの `devices/clock/dist/clock.js` は配布物に含まれています。

```bash
pnpm install --frozen-lockfile
pnpm build
```

画面を編集しないときは pnpm のコマンドを実行せずに起動できます。以下の３つの端末を使い、いずれもこのディレクトリで起動してください。`--data-dir` は同じホストでノードごとに異なる SQLite を使うための保存先です。

`serve.py` は Ctrl+C 時に監視配信と上位ノードへの接続を終了し、残った接続を最大５秒待ちます。必要なら `--shutdown-timeout 10` のように調整できます。

```bash
python serve.py --port 8000 --data-dir ./run/A
```

```bash
python serve.py --port 8001 --data-dir ./run/B
```

```bash
python serve.py --port 8002 --data-dir ./run/D
```

各ノードの `/setup` を開き、次のように保存します。保存した接続先は直ちに反映され、次回起動時に復元されます。

| ポート | ノード ID | 上位ノード WebSocket URL | 担当デバイス |
| --- | --- | --- | --- |
| 8000 | A | 空欄 | なし |
| 8001 | B | `ws://127.0.0.1:8000/ws/children` | なし |
| 8002 | D | `ws://127.0.0.1:8001/ws/children` | clock |

同じ設定は `GET /api/config` と `PUT /api/config` からも取得・更新できます。例：

```bash
curl -X PUT http://127.0.0.1:8002/api/config \
  -H 'Content-Type: application/json' \
  -d '{"node_id":"D","parent_ws":"ws://127.0.0.1:8001/ws/children","device_plugin":"clock"}'
```

http://127.0.0.1:8000 、 http://127.0.0.1:8001 、 http://127.0.0.1:8002 のどれからでも D の時計画面を開けます。例えば A から時刻を要求するには以下を実行します。

```bash
curl -X POST http://127.0.0.1:8000/api/devices/D/operations \
  -H 'Content-Type: application/json' \
  -d '{"operation":"get_time","parameters":{}}'
```

B を止めても D のローカル画面と操作 API は動作します。B が再起動すると D が再接続し、A にも再登録されます。画面プラグインはカタログ内で上位に複製し、ブラウザはアクセス先ノードから読み込みます。

監視値は担当ノードで変化した時点で `monitor` メッセージとして上位へ転送され、画面の監視イベントにも即時通知されます。操作後にも `monitors()` を取得して通知します。担当デバイスが外部要因で変化した場合に備え、ローカルの監視値取得は１秒周期でも行います。カタログ全体はデバイスの追加・削除、画面または状態の変更時に転送します。

## ノードの状態

各ノードは自身、担当デバイス、直結する子ノードの状態から `healthy`、`warning`、`critical`、`unknown` のいずれかを判定します。判定ルールは各ノードの `state_policy.py` の `evaluate(self_state, device_state, children)` を編集して定義します。変更後はそのノードを再起動してください。戻り値は `(状態名, 理由)` です。複数条件の優先順位は関数の条件分岐の順番で決まります。担当デバイスがないノードでは `device_state` は `None`、状態取得に対応しないプラグインでは `unknown` です。時計プラグインの `status()` は `healthy` を返します。

子が切断した場合、親は子の最後の状態と切断フラグを保持し、判定には `unknown` を渡します。上位との接続が切れても各ノードのローカル判定は継続します。状態変化は WebSocket で親へ通知され、`GET /api/states` と `GET /api/states/events` で自身と直結する子の状態・理由・遷移時刻を取得できます。画面のデバイスタブにも各デバイスを担当するノードの状態を表示します。接続前に存在した子の一覧は永続化しないため、ノード自体を再起動した直後には再接続するまで子を把握できません。

## Counter を複数台つなぐ

`devices/counter` と `devices/counter_summary` は `_template` をもとにした独立プラグインです。A（8000）の `/setup` で担当デバイスを `counter_summary` に設定します。C1（8003）と C2（8004）の担当デバイスをそれぞれ `counter` にし、異なるノード ID で親の `/ws/children` に接続します。１ノードの担当デバイスは１つのままです。

```bash
python serve.py --port 8003 --data-dir ./run/C1
python serve.py --port 8004 --data-dir ./run/C2
```

両ノードの親接続先に `ws://127.0.0.1:8000/ws/children` を設定します。中間ノード B を経由することもできます。A のトップページで A のタブを選び、Counter Summary 画面に集約対象を登録します。まだ接続していない C3 も先に登録できます。登録には Device ID と表示名、監視名、値のキーを指定します。省略時は監視名 `count`、カウントのキー `count`、レートのキー `rate` です。API からの設定例：

```bash
curl -X POST http://127.0.0.1:8000/api/devices/A/operations \
  -H 'Content-Type: application/json' \
  -d '{"operation":"configure","parameters":{"sources":[{"device_id":"C1","label":"左"},{"device_id":"C2","label":"右"},{"device_id":"C3","label":"将来追加"}]}}'
```

一覧は `counter_summary` の `summary` 監視値として流れ、通常の `/api/devices/A/monitors/summary/events` からも取得できます。対象の設定は A の SQLite に保存し、再起動後にも復元します。未接続・切断中は `unknown` と表示し、受信済みの値があれば最後の値を残します。カウントとレート自体は counter ノードのプロセス再起動後に初期値へ戻ります。ホスト画面や共通 API は counter の監視名・フィールドを知りません。

C1/C2 を A に直結した後で B の下へ付け替えた場合も、A は切断した旧経路の記録より B 経由の接続中の経路を優先します。確認には A と B の `/api/devices` を比較し、A の `/api/states` で直結していた C1/C2 が切断、B が接続中になっていることを確認できます。
旧経路の子が別の接続中の子を経由して到達できる場合、その切断履歴は A の状態判定から除外されます。`/api/states` の各子には `reconnected_via` と `included_in_state` が表示されます。別経路でも到達できなくなると、旧経路の切断は再び `unknown` の判定対象になります。

counter は初期レート 1 回/秒で動きます。例えば親から C1 のレートを変更します。

```bash
curl -X POST http://127.0.0.1:8000/api/devices/C1/operations \
  -H 'Content-Type: application/json' \
  -d '{"operation":"set_rate","parameters":{"rate":12}}'
```

指定できるレートは 0〜1000 回/秒で、小数にも対応します。経過時間とレートの積を累積し、整数部分だけカウントを増やします。0 または 20 超は `critical`、0 超 1 未満または 10 超 20 以下は `warning`、1〜10 は `healthy` です。境界は `devices/counter/plugin.py` の `status()` で変更できます。Counter Summary の `status()` は登録された対象の状態を集約します。ノード全体の集約ルールは `state_policy.py` で変更します。現在、カウント・設定レート・ノード側の切断履歴はプロセスを再起動すると復元されません。

`Clock.vue` を編集して `pnpm build` を実行したら D を再起動します。画面ファイルの SHA-256 をプラグインの revision として登録し、A の画面は約３秒ごとに revision を確認します。変更があれば新しい URL からモジュールを読み込み、表示中のコンポーネントを入れ替えます。A と B の再起動やブラウザの再読み込みは不要です。Vue のモジュールは読み込んだタブから削除できないので、開発中に多数回更新したタブは適宜再読み込みしてください。

`node.py` は時計の種類、操作、監視名、画面のファイル名を知りません。起動時に `devices/<name>/plugin.py` があるパッケージを自動検出し、設定画面に表示します。`devices/_template/` はコピー用のテンプレートで、そのままでは読み込みません。新しいプラグインはこのテンプレートを複製するか、Git submodule で `devices/<name>` に配置し、`pnpm build` で全プラグインの画面をビルドしてノードを再起動します。個別のビルドは `pnpm build:device <name>` です。ファイル構成と実装契約は `devices/_template/README.md` を参照してください。

時計の表示は `devices/clock/Clock.vue` に記述し、`pnpm build` で生成した `devices/clock/dist/clock.js` を時計デバイスが登録します。ビルドでは Vue 本体を外部依存にし、各ノードの画面と時計画面が同じ Vue インスタンスを使います。デバイス側は `operate(name, parameters)`、`monitors()`、画面の `manifest` と `assets` を提供します。中間ノードとルートノードは追加設定なしで上位へ伝えます。

この実装は動作原理の検証です。設定画面・API に認証はありません。ネットワークに公開する前に認証と TLS が必要です。画面コードの検証、経路重複と循環の排除、監視履歴の永続保存、複数 worker 間の状態共有、操作権限も未実装です。トポロジーは設定時に木構造として与えてください。
