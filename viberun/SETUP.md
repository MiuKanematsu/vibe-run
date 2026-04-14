# VibeRun セットアップガイド

## Firebase セットアップ（手動）

1. [Firebase Console](https://console.firebase.google.com) で新規プロジェクトを作成
2. **Authentication** → ログイン方法 → **Apple** と **Google** を有効化
3. **Firestore Database** を作成（テストモードで開始）
4. **Storage** を有効化
5. iOS アプリを追加し、`GoogleService-Info.plist` をダウンロードして `viberun/` ルートに配置
6. **Firestore セキュリティルール** → `firestore.rules` の内容を貼り付けて公開

## 環境変数セットアップ

```bash
cp .env.example .env
```

`.env` を編集して Firebase の設定値を入力:
- Firebase Console → プロジェクト設定 → マイアプリ → 構成

## Google Maps API キー

1. Google Cloud Console で Maps SDK for iOS を有効化
2. API キーを作成
3. `app.json` の `YOUR_GOOGLE_MAPS_IOS_API_KEY` を置き換え

## iOS ビルド

```bash
npx expo run:ios
```

Note: Apple Sign-In は実機または TestFlight でのみ動作します（シミュレーターでは不可）。
