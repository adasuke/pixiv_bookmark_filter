# Pixiv Bookmark Filter

Pixiv の小説一覧ページから、指定したブックマーク数以下の作品を非表示にする Chrome 拡張機能です。

## 機能

- ✅ ブックマーク数の閾値を設定
- ✅ フィルターの ON/OFF 切り替え（トグルスイッチ）
- ✅ 設定を Chrome Storage に保存
- ✅ リアルタイム反映（ページリロード不要）
- ✅ Pixiv 小説一覧ページに対応
- ✅ 無限スクロールに対応（動的に追加される作品も自動フィルタリング）
- ✅ プロダクションビルドではコンソールログを自動削除

## ユーザー向け: インストール方法

### GitHub Releases からダウンロード（推奨）

1. [Releases ページ](../../releases) から最新版の zip ファイルをダウンロード
2. zip ファイルを解凍
3. Chrome で `chrome://extensions/` を開く
4. 右上の「デベロッパーモード」を有効化
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. 解凍したフォルダを選択

### 使い方

1. Pixiv の小説一覧ページ（`https://www.pixiv.net/tags/*/novels`）を開く
2. 拡張機能アイコンをクリック
3. 「フィルター有効」トグルを ON にする
4. 「ブックマーク数しきい値」を設定（デフォルト: 100）
5. 「保存」ボタンをクリック

設定は自動的に保存され、すぐに反映されます！

---

## 開発者向け: セットアップ

### 前提条件

- Node.js 20.x
- npm

### 依存関係のインストール

```bash
npm install
```

### アイコンの準備（初回のみ）

- `assets/icons/` ディレクトリにアイコンを配置
- 必要なサイズ: icon16.png, icon32.png, icon48.png, icon128.png
- アイコンは自動的に `public/icons/` と `out/icons/` にコピーされます

### ビルド

#### プロダクションビルド（本番環境）

```bash
npm run build:extension
```

コンソールログが削除されたビルドが `out/` ディレクトリに生成されます。

#### 開発ビルド（デバッグ用）

```bash
npm run build:extension:dev
```

コンソールログが残るビルドが生成されます。デバッグ時に便利です。

詳細は [BUILD.md](BUILD.md) を参照してください。

### Chrome に拡張機能を読み込む

1. Chrome を開き、`chrome://extensions/` にアクセス
2. 右上の「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `out` フォルダを選択

### 開発中の変更反映

変更を加えた場合は、再ビルドします:

```bash
npm run build:extension:dev
```

ビルド後、Chrome の拡張機能ページで「更新」ボタン（🔄）をクリックしてください。

## リリース・配布

GitHub Actions を使って自動的にビルドとリリースを行います。

### リリース手順

1. `public/manifest.json` のバージョンを更新
2. 変更をコミット
3. タグを作成: `git tag v1.0.0`
4. タグを push: `git push origin v1.0.0`
5. GitHub Actions が自動的にビルドして Releases に公開

詳細は [RELEASE.md](RELEASE.md) を参照してください。

### 友人への配布方法

- **推奨**: GitHub Releases ページの URL を共有
- **代替**: zip ファイルをダウンロードして直接送付

友人は npm 環境不要で、zip をダウンロードして Chrome に読み込むだけで使えます！

## ディレクトリ構造

```
.
├── app/                  # Next.jsアプリケーション
│   ├── layout.tsx       # ルートレイアウト
│   ├── page.tsx         # ポップアップページ（設定UI）
│   └── globals.css      # グローバルスタイル
├── assets/
│   └── icons/           # ソースアイコン（ビルド時に自動コピー）
├── public/
│   ├── manifest.json    # Chrome拡張機能のマニフェスト
│   ├── content.js       # コンテンツスクリプト（Pixivページで実行）
│   └── icons/           # アイコン画像（自動生成、Git管理外）
├── scripts/
│   └── generate-icons.sh # アイコン生成スクリプト
├── package.json
├── tsconfig.json
└── next.config.js       # Next.js設定（静的エクスポート用）
```

## 技術仕様

### コンテンツスクリプト (content.js)

- Pixiv の小説一覧ページで各作品のブックマーク数を取得
- 閾値以下の作品を `display: none` で非表示化
- MutationObserver で動的に追加される要素も監視
- Chrome Storage から設定を読み込み、リアルタイムで反映

### ポップアップ UI (page.tsx)

- 閾値の入力フィールド（数値型）
- フィルターの ON/OFF トグル
- Chrome Storage への設定保存
- アクティブタブへのメッセージ送信

## トラブルシューティング

### フィルターが動作しない場合

1. 拡張機能が正しく読み込まれているか確認

   - `chrome://extensions/` でエラーがないか確認

2. ページをリロード

   - F5 キーまたは Cmd+R でページをリロード

3. デベロッパーコンソールでログを確認
   - F12 キーで開発者ツールを開き、Console タブで `[Pixiv Filter]` のログを確認

### 設定が保存されない場合

- Chrome Storage の権限が有効か確認
- ポップアップで「設定を保存」ボタンを押したか確認

## 今後の拡張予定

- [ ] イラスト一覧ページへの対応
- [ ] マンガ一覧ページへの対応
- [ ] 複数の閾値設定（閾値範囲の指定）
- [ ] ダークモード対応

## 機能追加

拡張機能に機能を追加する場合は、`REQUIREMENTS.md` ファイルに要望を記述してください。
