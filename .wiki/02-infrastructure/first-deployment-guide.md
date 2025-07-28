# 初回デプロイガイド

## 完了事項

- [x] DynamoDB テーブル作成・デプロイ
- [x] ESM 環境での CDK 動作確認
- [x] 環境別設定システムの実運用

## デプロイされたリソース

### DynamoDB テーブル

- **テーブル名:** `sleep-smart-ac-dev-environment-data`
- **リージョン:** ap-northeast-1 (東京)
- **設定:** 開発環境用（削除保護なし、バックアップなし）

## 解決したトラブル

### 1. ESM 設定の課題

- **問題:** TypeScript + ESM で CDK が動作しない
- **解決:** `tsx` 使用、`cdk.json` の app 設定変更

### 2. スタック設定ミス

- **問題:** 空のスタックがデプロイされていた
- **解決:** `bin/sleep-smart-ac.ts` で `DataStack` を直接使用

### 3. 型安全性エラー

- **問題:** 環境変数が `undefined` の可能性
- **解決:** `env` 設定を削除し自動検出に委ねる

## 学習ポイント

- CDK デプロイフローの理解
- CloudFormation スタックとリソースの関係
- ESM 環境での開発ツール選択
- AWS リソース命名規則の実践

## 次のステップ

- Lambda 関数の作成
- SwitchBot API 連携の実装
