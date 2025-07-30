# 🔐 セキュリティセットアップガイド

## SwitchBot 認証情報の安全な管理

### 📋 概要

このプロジェクトでは、SwitchBot API の認証に`SWITCHBOT_TOKEN`と`SWITCHBOT_SECRET`が必要です。
これらの機密情報を安全に管理するための手順を説明します。

## 🎯 推奨管理方法：GitHub Secrets

### 1️⃣ SwitchBot アプリからトークン取得

1. **SwitchBot アプリを最新版に更新** (v6.14 以降)
2. **Developer Options を有効化**
   ```
   Profile > Preferences > About > App Version を10回タップ
   → Developer Options が表示される
   ```
3. **認証情報を取得**
   ```
   Developer Options > Get Token
   → Open Token と Secret Key をコピー
   ```

### 2️⃣ GitHub Secrets の設定

#### 開発環境用 (dev)

```bash
# GitHubリポジトリの Settings > Secrets and variables > Actions
# 以下のSecretを追加：

SWITCHBOT_TOKEN_DEV=your_dev_token_here
SWITCHBOT_SECRET_DEV=your_dev_secret_here
```

#### 本番環境用 (prod)

```bash
# 本番用は別のSwitchBotアカウントを推奨
SWITCHBOT_TOKEN_PROD=your_prod_token_here
SWITCHBOT_SECRET_PROD=your_prod_secret_here
```

### 3️⃣ GitHub Actions 設定

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy Development
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to AWS
        env:
          SWITCHBOT_TOKEN: ${{ secrets.SWITCHBOT_TOKEN_DEV }}
          SWITCHBOT_SECRET: ${{ secrets.SWITCHBOT_SECRET_DEV }}
        run: |
          cd packages/infra
          npx cdk deploy --all
```

### 4️⃣ 本番デプロイ用ワークフロー

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production
on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # 承認必須環境
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to AWS Production
        env:
          SWITCHBOT_TOKEN: ${{ secrets.SWITCHBOT_TOKEN_PROD }}
          SWITCHBOT_SECRET: ${{ secrets.SWITCHBOT_SECRET_PROD }}
        run: |
          cd packages/infra
          CDK_ENV=prod npx cdk deploy --all
```

## 🛡️ セキュリティベストプラクティス

### ✅ 実施すること

1. **環境分離**

   - 開発用と本番用で異なる SwitchBot アカウント使用
   - GitHub 環境（Environment）で本番デプロイを保護

2. **権限最小化**

   - SwitchBot アプリで必要最小限のデバイスのみ設定
   - GitHub Actions でのみ使用、手動利用は避ける

3. **定期的なローテーション**

   - 月次で token/secret を再生成
   - 旧認証情報の無効化確認

4. **監査ログ**
   - CloudWatch Logs で認証失敗を監視
   - 不正アクセスの早期発見

### ❌ してはいけないこと

```bash
# 🚨 絶対禁止
export SWITCHBOT_TOKEN="your_token"  # 環境変数に直接設定
echo $SWITCHBOT_TOKEN               # ログに出力
git add .env                        # .envファイルをコミット
```

## 🧪 開発時のテスト

### ローカル開発用（テスト専用アカウント推奨）

```bash
# .env.local (gitignoreされている)
SWITCHBOT_TOKEN=test_token_here
SWITCHBOT_SECRET=test_secret_here
```

```bash
# テスト実行
cd packages/backend
npm test
```

## 🚨 緊急時対応

### 認証情報漏洩時の手順

1. **即座に SwitchBot アプリで token 無効化**
2. **新しい token/secret 生成**
3. **GitHub Secrets を更新**
4. **CloudWatch Logs で不正利用確認**
5. **緊急デプロイ実行**

```bash
# 緊急デプロイコマンド
cd packages/infra
npx cdk deploy sleep-smart-ac-dev-lambda-stack --force
```

## 📞 サポート

- **セキュリティ問題**: プロジェクト管理者に直接連絡
- **SwitchBot API**: [公式ドキュメント](https://github.com/OpenWonderLabs/SwitchBotAPI)
- **AWS セキュリティ**: [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
