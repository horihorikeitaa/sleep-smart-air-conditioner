# 開発環境セットアップガイド

このドキュメントでは、`SleepSmartAC` プロジェクトの開発環境をセットアップする手順について説明します。

---

## 前提条件

以下のツールが必要です：

* **Node.js** (v18以上) - JavaScript/TypeScript実行環境
* **npm** または **yarn** - パッケージマネージャー
* **Git** - バージョン管理
* **AWS CLI** - AWS操作用コマンドラインツール
* **AWS CDK** - Infrastructure as Code (IaC) ツール
* **SwitchBot APIトークン** - SwitchBotデバイス操作用

---

## 1. 基本環境のセットアップ

### 1.1 Node.js のインストール

```bash
# Node.js 公式サイトからダウンロードしてインストール
# または nvm を使用（推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 1.2 プロジェクトのクローンと依存関係のインストール

```bash
git clone https://github.com/[YOUR-USERNAME]/sleep-smart-air-conditioner.git
cd sleep-smart-air-conditioner

# まだpackage.jsonが存在しない場合は作成
npm init -y

# 開発に必要なパッケージをインストール（後のスプリントで随時追加）
npm install --save-dev typescript @types/node eslint prettier
```

---

## 2. AWS環境のセットアップ

### 2.1 AWS CLIのインストールと設定

```bash
# AWS CLI のインストール（Windows/macOS/Linux対応）
# https://aws.amazon.com/cli/ からダウンロード

# 認証情報の設定
aws configure
# AWS Access Key ID: [あなたのアクセスキー]
# AWS Secret Access Key: [あなたのシークレットキー]
# Default region name: ap-northeast-1
# Default output format: json
```

### 2.2 AWS CDKのセットアップ

```bash
# AWS CDK のグローバルインストール
npm install -g aws-cdk

# CDK の初期化とブートストラップ
mkdir infra
cd infra
cdk init app --language typescript
cdk bootstrap
```

### 2.3 AWS予算アラートの設定

コスト管理のため、AWSコンソールで予算アラートを設定することを強く推奨します：

1. AWS Budgetsコンソールにアクセス
2. 「予算の作成」をクリック
3. 月額予算を設定（例：$10）
4. 80%, 100%でアラート通知を設定

---

## 3. SwitchBot API設定

### 3.1 SwitchBot APIトークンの取得

1. SwitchBotアプリを開く
2. プロフィール → 設定 → アプリバージョン（10回タップ）→ 開発者オプション
3. トークンを生成・コピー

### 3.2 環境変数の設定

```bash
# プロジェクトルートに .env.local ファイルを作成
touch .env.local

# .env.local に以下を記載
SWITCHBOT_API_TOKEN=your_switchbot_token_here
SWITCHBOT_SECRET=your_switchbot_secret_here  # 必要に応じて
```

**重要:** `.env.local` ファイルは `.gitignore` に追加し、GitHubにコミットしないでください。

---

## 4. 開発ツールのセットアップ

### 4.1 コードフォーマッタとリンタの設定

プロジェクトルートに以下のファイルを作成：

**`.eslintrc.json`:**
```json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  }
}
```

**`.prettierrc`:**
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 4.2 GitHooks の設定（オプション）

```bash
# pre-commit フックでコード品質を自動チェック
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**`package.json` に追加:**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 5. フェーズ別セットアップ

### フェーズ0: データ収集・可視化基盤

```bash
# Lambda関数用の依存関係
npm install aws-sdk axios

# フロントエンド用 (Next.js)
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
npm install recharts  # グラフ描画ライブラリ
```

### フェーズ1: 機械学習関連

```bash
# Python環境（SageMaker Studio Lab使用のため、ローカルでは最小限）
# AWS SDK for Python（Boto3）はAWS Lambda内で利用
```

---

## 6. 動作確認

### 6.1 AWS接続テスト

```bash
# AWS CLI が正しく設定されているかテスト
aws sts get-caller-identity

# CDK が正しく設定されているかテスト
cd infra
cdk synth
```

### 6.2 SwitchBot API接続テスト

簡単なテストスクリプトを作成して接続確認：

```javascript
// test-switchbot.js
const axios = require('axios');

const SWITCHBOT_TOKEN = process.env.SWITCHBOT_API_TOKEN;

async function testConnection() {
  try {
    const response = await axios.get('https://api.switch-bot.com/v1.1/devices', {
      headers: {
        'Authorization': SWITCHBOT_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    console.log('SwitchBot API接続成功:', response.data);
  } catch (error) {
    console.error('SwitchBot API接続エラー:', error.message);
  }
}

testConnection();
```

```bash
node test-switchbot.js
```

---

## 7. IDE設定（推奨）

### Visual Studio Code

推奨拡張機能：
* AWS Toolkit
* TypeScript
* Prettier - Code formatter
* ESLint
* GitLens

### settings.json 設定例

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## トラブルシューティング

### よくある問題と解決策

1. **AWS認証エラー**
   - `aws configure` で正しい認証情報が設定されているか確認
   - IAMユーザーに必要な権限が付与されているか確認

2. **SwitchBot API エラー**
   - トークンが正しく設定されているか確認
   - SwitchBotデバイスがオンラインか確認

3. **CDK デプロイエラー**
   - `cdk bootstrap` が実行されているか確認
   - リージョンが正しく設定されているか確認

---

## 次のステップ

開発環境のセットアップが完了したら、[docs/roadmap.md](./roadmap.md) の「フェーズ0: スプリント0」のタスクから開始してください。

何か問題が発生した場合は、GitHubのIssuesで報告いただくか、プロジェクト内のドキュメントを参照してください。 