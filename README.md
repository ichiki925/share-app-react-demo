# SHARE-app (React/Next.js版)

Twitter風のソーシャルメディアアプリケーションです。ユーザー同士で短いメッセージ（投稿）を共有し、いいねやコメント機能を通じてリアルタイムでコミュニケーションを取ることができるプラットフォームです。Firebase認証を使用したセキュアなユーザー管理とバリデーション機能により、安全で使いやすいSNS体験を提供します。

## このリポジトリについて

このリポジトリは、[Vue.js/Nuxt.js版SHARE-app](https://github.com/ichiki925/SHARE-app)をReact/Next.js + TypeScriptで再実装したポートフォリオ用デモ版です。モダンなフロントエンド技術への理解を深め、Vue.jsとReactの両方での開発経験を示すために作成しました。

### デモ版の特徴
- **デモログイン機能**: ワンクリックで体験可能
- **自動データリセット**: ログイン時に投稿データを自動的にリセットし、常にクリーンな状態で体験できます
- **ポートフォリオ最適化**: 採用担当者や評価者が手軽に機能を確認できるように設計

## 作成した目的

Vue.js/Nuxt.jsで開発した元のアプリケーションをReact/Next.js + TypeScriptで再実装することで、以下のスキルを習得・実証することを目的としています：

- React 18の最新機能（Hooks、カスタムフック）の理解
- Next.js 14のApp Router、Server Components、API Routesの活用
- TypeScriptによる型安全な開発
- Vue.jsとReactの設計思想の違いの理解
- フレームワーク間の技術移行能力

## 機能一覧

**認証機能**
- ユーザー認証（Firebase Authentication）
- 新規登録機能（ユーザーネーム、メールアドレス、パスワード）
- ログイン機能（メールアドレス、パスワード）
- デモログイン機能（ワンクリックログイン）
- ログアウト機能

**投稿機能**
- 投稿の一覧表示、追加処理、削除処理
- 投稿者名と投稿内容の表示
- 投稿の追加（120文字以内）
- 投稿の削除機能

**いいね機能**
- ハートマークでいいね/いいね解除
- リアルタイムでのいいね数更新

**コメント機能**
- コメント画面への遷移
- コメント者名と内容の表示
- コメントの追加（120文字以内）

**デモ機能（ポートフォリオ用）**
- デモユーザーでの自動ログイン
- ログイン時の投稿データ自動リセット
- クリーンな初期状態での体験提供

## 使用技術（実行環境）

**フロントエンド**
- React 18.3.1
- Next.js 14.2.0
- TypeScript 5.x
- Node.js 20.x

**バックエンド**
- Laravel 8.83.8
- PHP 8.2
- MySQL 8.0

**認証**
- Firebase Authentication
- Firebase Admin SDK

**開発・デプロイ環境**
- PM2（プロセス管理）
- Nginx（Webサーバー）

## リポジトリ構成
```
share-app-react-demo/
├── nextjs-frontend/     # Next.jsフロントエンド
│   ├── src/
│   │   ├── app/         # App Router
│   │   ├── components/  # Reactコンポーネント
│   │   └── lib/         # ユーティリティ、Firebase設定
│   └── package.json
├── laravel-backend/     # Laravel API
│   ├── app/
│   ├── routes/
│   └── composer.json
└── README.md
```

## テーブル設計

### users テーブル

| カラム名          | データ型        | 制約             | 説明                 |
| ----------------- | --------------- | ---------------- | -------------------- |
| id                | unsigned bigint | PRIMARY KEY      | ユーザーID          |
| firebase_uid      | varchar(255)    | UNIQUE           | Firebase認証ID     |
| name              | varchar(255)    | NOT NULL         | ユーザー名           |
| email             | varchar(255)    | UNIQUE, NOT NULL | メールアドレス       |
| email_verified_at | timestamp       |                  | メール認証日時       |
| password          | varchar(255)    |                  | パスワード           |
| remember_token    | varchar(100)    |                  | ログイン保持トークン |
| created_at        | timestamp       | NOT NULL         | 作成日時             |
| updated_at        | timestamp       | NOT NULL         | 更新日時             |

### posts テーブル

| カラム名   | データ型        | 制約                  | 説明        |
| ---------- | --------------- | --------------------- | ----------- |
| id         | unsigned bigint | PRIMARY KEY           | 投稿ID     |
| user_id    | unsigned bigint | FOREIGN KEY, NOT NULL | ユーザーID |
| content    | text            | NOT NULL              | 投稿内容    |
| created_at | timestamp       | NOT NULL              | 作成日時    |
| updated_at | timestamp       | NOT NULL              | 更新日時    |

### likes テーブル

| カラム名   | データ型        | 制約                  | 説明        |
| ---------- | --------------- | --------------------- | ----------- |
| id         | unsigned bigint | PRIMARY KEY           | いいねID   |
| post_id    | unsigned bigint | FOREIGN KEY, NOT NULL | 投稿ID     |
| user_id    | unsigned bigint | FOREIGN KEY, NOT NULL | ユーザーID |
| created_at | timestamp       | NOT NULL              | 作成日時    |
| updated_at | timestamp       | NOT NULL              | 更新日時    |

### comments テーブル

| カラム名   | データ型        | 制約                  | 説明         |
| ---------- | --------------- | --------------------- | ------------ |
| id         | unsigned bigint | PRIMARY KEY           | コメントID  |
| post_id    | unsigned bigint | FOREIGN KEY, NOT NULL | 投稿ID      |
| user_id    | unsigned bigint | FOREIGN KEY, NOT NULL | ユーザーID  |
| content    | text            | NOT NULL              | コメント内容 |
| created_at | timestamp       | NOT NULL              | 作成日時     |
| updated_at | timestamp       | NOT NULL              | 更新日時     |

## 環境構築

### 前提条件
- Node.js 20.x以上
- PHP 8.2以上
- Composer
- MySQL 8.0以上
- Firebaseアカウント

### Laravel（バックエンド）環境構築

1. リポジトリのクローン
```bash
git clone git@github.com:ichiki925/share-app-react-demo.git
cd share-app-react-demo/laravel-backend
```

2. 依存パッケージのインストール
```bash
composer install
```

3. 環境変数ファイルの作成
```bash
cp .env.example .env
```

4. `.env`ファイルの編集（データベース設定）
```text
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=share_demo
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. アプリケーションキーの生成
```bash
php artisan key:generate
```

6. データベースのマイグレーション
```bash
php artisan migrate
```

### Firebase設定

1. Firebaseプロジェクトの作成
   - [Firebase Console](https://console.firebase.google.com/)にアクセス
   - 「プロジェクトを追加」をクリック

2. Firebase Authenticationの有効化
   - 「Authentication」→「Sign-in method」
   - 「メール/パスワード」を有効化

3. サービスアカウント認証情報の取得
   - 「プロジェクトの設定」→「サービスアカウント」
   - 「新しい秘密鍵の生成」をクリック
   - ダウンロードしたJSONファイルを `laravel-backend/storage/app/firebase/credentials.json` として保存

4. Laravel側の環境変数設定（`.env`に追加）
```text
FIREBASE_PROJECT_ID=your-firebase-project-id
```

5. Next.js側の環境変数設定
`nextjs-frontend/.env.local`を作成：
```text
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Next.js（フロントエンド）環境構築

1. フロントエンドディレクトリに移動
```bash
cd ../nextjs-frontend
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

### 起動方法

**バックエンド（Laravel）**
```bash
cd laravel-backend
php artisan serve --port=8000
```

**フロントエンド（Next.js）**
```bash
cd nextjs-frontend
npm run dev
```

## 利用方法

### 通常のログイン
1. 新規登録からアカウントを作成
2. Firebase認証によるメール認証
3. 認証後、全機能が利用可能

### デモログイン（推奨）
1. ログイン画面の「デモログイン」ボタンをクリック
2. 自動的にデモアカウントでログイン
3. ログイン時に投稿データが自動リセットされます

## アクセスURL

**開発環境**
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000

**本番環境（予定）**
- デモサイト: https://share.k-ichiki.com

## Vue.js版との違い

| 項目 | Vue.js/Nuxt.js版 | React/Next.js版 |
|------|------------------|-----------------|
| フロントエンド | Vue 3 + Nuxt 3 | React 18 + Next.js 14 |
| 型システム | JavaScript | TypeScript |
| 状態管理 | Composition API | React Hooks |
| ルーティング | Nuxt Router | Next.js App Router |
| API通信 | $fetch | fetch API |
| 開発環境 | Docker | ローカル環境 |
| デモ機能 | なし | デモログイン＆データリセット |

## こだわりポイント

1. **TypeScriptによる型安全性**: 全てのコンポーネントとAPIレスポンスに型定義を実装
2. **カスタムフックの活用**: 認証状態管理やAPIリクエスト処理をカスタムフックとして再利用可能に設計
3. **デモ体験の最適化**: 採用担当者が手軽に機能を確認できるよう、ワンクリックログイン＆自動データリセット機能を実装
4. **レスポンシブデザイン**: モバイルファーストで設計し、全デバイスで快適に利用可能
5. **Firebase Authenticationとの統合**: セキュアな認証フローをNext.jsのServer Componentsと組み合わせて実装

## 技術的な学び

- Vue.jsの`ref`/`reactive`からReactの`useState`/`useEffect`への思考の切り替え
- Next.js App RouterのServer ComponentsとClient Componentsの使い分け
- TypeScriptによる型推論を活かした開発効率の向上
- Firebaseとの統合における環境変数管理のベストプラクティス

## セキュリティに関する注意事項

- Firebase認証情報ファイル（`credentials.json`）はGit管理対象外
- `.env`および`.env.local`ファイルはGitHubにプッシュしないこと
- 本番環境では環境変数を適切に設定すること

## ライセンス

このプロジェクトはポートフォリオ目的で作成されています。

## 関連リンク

- [Vue.js/Nuxt.js版SHARE-app](https://github.com/ichiki925/SHARE-app)
- [ポートフォリオサイト](https://k-ichiki.com)