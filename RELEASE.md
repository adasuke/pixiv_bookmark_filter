# リリース手順

このプロジェクトは、GitHub Actions を使って自動的にビルドとリリースを行います。

## 本番用リリース（プロダクションビルド）

1. **バージョン番号を更新**

   `public/manifest.json` のバージョンを更新します：

   ```json
   {
     "version": "1.0.1",
     ...
   }
   ```

2. **変更をコミット**

   ```bash
   git add public/manifest.json
   git commit -m "Bump version to 1.0.1"
   git push origin main
   ```

3. **タグを作成して push**

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **GitHub Actions が自動実行**

   - 自動的にビルドが開始されます
   - ビルド完了後、GitHub Releases ページに自動公開されます
   - zip ファイルがアップロードされます

5. **Release ページを確認**

   `https://github.com/あなたのユーザー名/リポジトリ名/releases` で確認できます

## 開発用リリース（デバッグビルド）

デバッグ情報が必要な場合は、開発用ビルドを作成できます：

```bash
git tag dev-v1.0.1-beta
git push origin dev-v1.0.1-beta
```

これにより、console.log が残ったビルドが生成されます。

## 友人への配布方法

### 方法 1: GitHub Releases から直接ダウンロード（推奨）

1. GitHub Releases ページの URL を友人に共有
2. 友人が最新の zip ファイルをダウンロード
3. zip を解凍して Chrome に読み込む

**メリット**: GitHub アカウント不要、いつでも最新版をダウンロード可能

### 方法 2: zip ファイルを直接送付

1. Releases ページから zip ファイルをダウンロード
2. メールやチャットで zip ファイルを送付
3. 友人が解凍して Chrome に読み込む

**メリット**: GitHub を使わなくても配布可能

## ユーザー向けインストール手順

友人には以下の手順を伝えてください：

1. **zip ファイルをダウンロード**

   - GitHub Releases ページまたはあなたから zip ファイルをダウンロード

2. **zip ファイルを解凍**

   - デスクトップなど、分かりやすい場所に解凍
   - フォルダ名: `pixiv-bookmark-filter-v1.0.0`など

3. **Chrome で拡張機能を読み込む**

   - Chrome で `chrome://extensions/` を開く
   - 右上の「デベロッパーモード」を**ON**にする
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - 解凍したフォルダを選択

4. **使い方**
   - Pixiv の小説一覧ページを開く
   - 拡張機能アイコンをクリック
   - トグルスイッチを ON にして、しきい値を設定
   - 「保存」ボタンをクリック

## トラブルシューティング

### ビルドが失敗する場合

- `package.json` の依存関係が正しいか確認
- Node.js 20 が使用されているか確認
- ローカルで `npm run build:extension` が成功するか確認

### Release が作成されない場合

- タグ名が `v1.0.0` の形式になっているか確認
- GitHub リポジトリの Settings > Actions > General で Workflow permissions が「Read and write permissions」になっているか確認

## バージョン番号の規則

セマンティックバージョニングを使用：

- **Major (1.x.x)**: 互換性のない大きな変更
- **Minor (x.1.x)**: 後方互換性のある機能追加
- **Patch (x.x.1)**: バグ修正

例:

- `v1.0.0` → `v1.0.1`: バグ修正
- `v1.0.1` → `v1.1.0`: 新機能追加
- `v1.1.0` → `v2.0.0`: 大きな仕様変更
