# 🚀 Sleep Smart AC 開発 TODO リスト

## 📊 現在の進捗状況

### ✅ 完了済み - Phase 0.5 データ永続化基盤完成

#### 🏗️ インフラ構築

- [x] DynamoDB CDK スタック作成・デプロイ
- [x] GitHub Actions CI パイプライン設定
- [x] AWS CDK による 3 層アーキテクチャ構築（Data/Lambda/Webhook）
- [x] API Gateway 統合と RESTful エンドポイント構築
- [x] 依存関係の明確化とスタック分離

#### 🔐 セキュリティ & 認証

- [x] SwitchBot Webhook HMAC-SHA256 署名検証実装
- [x] GitHub Environment Secrets による認証情報管理
- [x] ローカル開発環境での .env ファイル対応
- [x] 環境別認証情報管理（dev/prod フォールバック戦略）
- [x] タイムスタンプ検証によるリプレイ攻撃防止
- [x] パブリックリポジトリでの安全な開発環境構築

#### 🧪 テスト基盤

- [x] TDD によるテストファーストの開発実践
- [x] Jest テスト環境設定
- [x] 段階的テスト戦略（Mock → Local → GitHub Actions）
- [x] ES Modules 対応と CI/CD 統合

#### 🏛️ アーキテクチャ実装

- [x] **Step 1-4: データ永続化層完成** - DynamoDB Repository 実装
- [x] **Step 2: EnvironmentDataFactory 実装** - ドメインモデル生成ロジック
- [x] **Step 3: Webhook Handler の実装** - Lambda 関数と API Gateway 統合
- [x] **Step 4: AWS 環境デプロイ完了** - 3 層アーキテクチャ本番構築
- [x] **DDD 構造** - Domain/Application/Infrastructure 層分離
- [x] **CDK 3 層アーキテクチャ** - Data/Lambda/Webhook スタック分離

### 🎯 次のフェーズ: Phase 1 実デバイス統合

- [ ] **Phase 1: 実デバイス統合とデータ蓄積開始** ← 👈 **次はここ**
  - [ ] **Step 5: SwitchBot 実デバイス設定** - Webhook URL 設定
  - [ ] **Step 6: データ蓄積確認** - 実際の環境データ収集開始
  - [ ] **Step 7: ダッシュボード構築** - データ可視化

---

## 🎊 Phase 0.5 完了実績

### 📈 達成された価値

- **✅ 完全な 3 層アーキテクチャ**: Data → Lambda → Webhook の依存関係明確化
- **✅ 型安全なデータ処理**: TypeScript + DDD による保守性向上
- **✅ 本番運用準備完了**: AWS デプロイ成功、監視基盤構築
- **✅ データ蓄積基盤完成**: SwitchBot → DynamoDB パイプライン構築

### 🚀 デプロイ済みリソース

#### AWS CloudFormation スタック

```
✅ sleep-smart-ac-dev-data-stack      (DynamoDB テーブル)
✅ sleep-smart-ac-dev-lambda-stack    (Lambda 関数 + IAM権限)
✅ sleep-smart-ac-dev-webhook-stack   (API Gateway)
```

#### API エンドポイント

```
WebhookEndpoint: https://lhxc14v2c7.execute-api.ap-northeast-1.amazonaws.com/dev/webhook/switchbot
```

### 🔧 技術基盤

- **バックエンド**: Node.js 20.x + TypeScript + DDD + TDD
- **インフラ**: AWS CDK + Lambda + API Gateway + DynamoDB
- **セキュリティ**: HMAC-SHA256 + 環境別認証情報管理
- **CI/CD**: GitHub Actions + dotenv-cli + 段階的テスト戦略

---

## 🎯 Phase 1: Webhook 基盤構築

### ステップ 1: Webhook 型定義の作成

**目標:** SwitchBot Webhook イベントの型安全性を確保

#### 📝 作成ファイル

```bash
packages/backend/src/interfaces/lambda/types.ts
```

#### 📋 実装内容

- [ ] `SwitchBotWebhookEvent` 基底インターフェース
- [ ] `Hub2WebhookEvent` インターフェース
- [ ] `PlugMiniWebhookEvent` インターフェース
- [ ] Type Guard 関数 (`isHub2WebhookEvent`, `isPlugMiniWebhookEvent`)

#### ✅ 完了条件

- TypeScript コンパイルエラーなし
- 型定義が SwitchBot API 公式仕様と一致

#### 📖 参考

```typescript
// 実装例
export interface Hub2WebhookEvent {
  eventType: "changeReport";
  eventVersion: string;
  context: {
    deviceType: "WoHub2";
    deviceMac: string;
    temperature: number;
    humidity: number;
    lightLevel: number;
    scale: "CELSIUS";
    timeOfSample: number;
  };
}
```

---

### ステップ 2: EnvironmentDataFactory の実装

**目標:** Webhook イベントからドメインモデル B を生成

#### 📝 作成ファイル

```bash
packages/backend/src/domain/model/environment/EnvironmentDataFactory.ts
packages/backend/__tests__/domain/model/environment/EnvironmentDataFactory.test.ts
```

#### 📋 実装内容（TDD 順序）

##### 🔴 Step 2.1: テスト作成

- [ ] `fromHub2Webhook()` の正常系テスト
- [ ] タイムスタンプ変換テスト（秒 → ミリ秒）
- [ ] 照度データ範囲チェックテスト
- [ ] 不正データでのエラーテスト

##### 🟢 Step 2.2: 実装

- [ ] `EnvironmentDataFactory.fromHub2Webhook()` メソッド
- [ ] タイムスタンプ変換ロジック
- [ ] エラーハンドリング

##### 🔵 Step 2.3: リファクタリング

- [ ] コード整理
- [ ] JSDoc ドキュメント追加

#### ✅ 完了条件

- 全テストパス（`npm test -- --testNamePattern="EnvironmentDataFactory"`）
- カバレッジ 90% 以上

#### 📖 実装例

```typescript
export class EnvironmentDataFactory {
  static fromHub2Webhook(event: Hub2WebhookEvent): EnvironmentData {
    const timestamp = new Date(event.context.timeOfSample * 1000);
    return new EnvironmentData(
      event.context.deviceMac,
      timestamp,
      event.context.temperature,
      event.context.humidity,
      event.context.lightLevel
    );
  }
}
```

---

### ステップ 3: Webhook Handler の実装

**目標:** API Gateway からの Webhook を処理する Lambda 関数

#### 📝 作成ファイル

```bash
packages/backend/src/interfaces/lambda/webhookHandler.ts
packages/backend/__tests__/interfaces/lambda/webhookHandler.test.ts
```

#### 📦 必要な依存関係

```bash
npm install --save-dev @types/aws-lambda
```

#### 📋 実装内容（TDD 順序）

##### 🔴 Step 3.1: テスト作成

- [ ] Hub2 Webhook 正常処理テスト
- [ ] PlugMini Webhook 正常処理テスト
- [ ] 不正な HTTP メソッド拒否テスト
- [ ] 不正なペイロード拒否テスト
- [ ] JSON パースエラーハンドリングテスト

##### 🟢 Step 3.2: 実装

- [ ] `webhookHandler()` 関数
- [ ] HTTP メソッド検証
- [ ] Webhook ペイロード検証
- [ ] デバイスタイプ別処理分岐
- [ ] エラーレスポンス生成

##### 🔵 Step 3.3: リファクタリング

- [ ] 関数分割（単一責任の原則）
- [ ] ログ出力最適化

#### ✅ 完了条件

- 全テストパス（`npm test -- --testNamePattern="webhookHandler"`）
- API Gateway 統合テスト対応

#### 📖 実装例

```typescript
export async function webhookHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // POSTメソッドチェック
  // ペイロード解析
  // デバイスタイプ別処理
  // レスポンス生成
}
```

---

## 🎯 Phase 1: データ永続化と実デバイス統合

### ステップ 4: DynamoDB Repository 実装

**目標:** EnvironmentData を DynamoDB に保存

#### 📝 作成ファイル

```bash
packages/backend/src/infrastructure/repository/EnvironmentRepository.ts
packages/backend/__tests__/infrastructure/repository/EnvironmentRepository.test.ts
packages/backend/src/infrastructure/repository/DynamoDBClient.ts
```

#### 📦 必要な依存関係

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install --save-dev @aws-sdk/types
```

#### 📋 実装内容

- [ ] DynamoDB 接続設定
- [ ] `save(environmentData)` メソッド
- [ ] `findByDeviceId()` メソッド
- [ ] `findByTimeRange()` メソッド
- [ ] エラーハンドリング（ConditionalCheckFailedException 等）

### ステップ 5: 実デバイステスト

**目標:** 実際の SwitchBot デバイスとの統合確認

#### 📋 実装内容

- [ ] AWS 環境への Lambda 関数デプロイ
- [ ] API Gateway エンドポイント URL 取得
- [ ] SwitchBot アプリでの Webhook URL 設定
- [ ] SwitchBot Hub2 実デバイスでの環境データ変化テスト
- [ ] DynamoDB への実際のデータ保存確認
- [ ] CloudWatch Logs での動作確認

### ステップ 6: エラーハンドリング強化

**目標:** 本番環境での安定性向上

#### 📋 実装内容

- [ ] Lambda 関数のエラーハンドリング強化
- [ ] DynamoDB 書き込み失敗時のリトライロジック
- [ ] 不正な Webhook イベントの適切な拒否
- [ ] CloudWatch アラーム設定
- [ ] デッドレターキュー設定

---

## 🎯 Phase 2: 機能拡張と Application 層実装

### ステップ 7: Application Service 実装

**目標:** Webhook データ処理のビジネスロジック強化

#### 📝 作成ファイル

```bash
packages/backend/src/application/service/DataCollectionService.ts（拡張）
packages/backend/__tests__/application/service/DataCollectionService.test.ts
packages/backend/src/application/usecase/ProcessWebhookUseCase.ts
```

#### 📋 実装内容

- [ ] `DataCollectionService.processHub2Data()` メソッド拡張
- [ ] `DataCollectionService.processPlugMiniData()` メソッド拡張
- [ ] バリデーションロジック強化
- [ ] 重複データ検出・除外
- [ ] エラー通知機能

### ステップ 8: 高度な監視・運用

**目標:** 本番運用に向けた監視・アラート体制構築

#### 📋 実装内容

- [ ] CloudWatch メトリクス設定
- [ ] AWS X-Ray による分散トレーシング
- [ ] SES によるエラー通知
- [ ] ダッシュボード構築（CloudWatch Dashboard）

---

## 🚀 実装開始手順

### 🎬 今すぐ実行すべきコマンド

```bash
# 1. 必要な依存関係をインストール
cd packages/backend
npm install --save-dev @types/aws-lambda

# 2. Phase 1 - Step 1: 型定義ファイル作成
# 以下のコマンドで空ファイルを作成（内容は手動実装）
mkdir -p src/interfaces/lambda
touch src/interfaces/lambda/types.ts

# 3. Phase 1 - Step 2: FactoryとTest作成
touch src/domain/model/environment/EnvironmentDataFactory.ts
mkdir -p __tests__/domain/model/environment
touch __tests__/domain/model/environment/EnvironmentDataFactory.test.ts

# 4. Phase 1 - Step 3: WebhookHandlerとTest作成
touch src/interfaces/lambda/webhookHandler.ts
mkdir -p __tests__/interfaces/lambda
touch __tests__/interfaces/lambda/webhookHandler.test.ts

# 5. テスト実行（現在通るテストのみ）
npm test -- --selectProjects=backend --testNamePattern="EnvironmentData"
```

### 📋 各ステップの実装確認

#### ✅ ステップ完了チェックリスト

```bash
# Step 1 完了後
npm run type-check  # TypeScript エラーなし

# Step 2 完了後
npm test -- --testNamePattern="EnvironmentDataFactory"  # テスト全パス

# Step 3 完了後
npm test -- --testNamePattern="webhookHandler"  # テスト全パス

# Phase 1 完了後
npm test -- --selectProjects=backend  # 全テストパス
npm run build  # ビルド成功
```

---

## 🎯 次の作業

現在は **Phase 1 - Step 4（DynamoDB Repository 実装）** から開始します。

**今すぐ取り組むタスク:**

1. DynamoDB Repository の実装
2. AWS 環境へのデプロイ確認
3. 実デバイステストの準備

## 🏆 Phase 0 完了実績

### 📊 実装済み機能サマリー

#### 🔗 統合された技術スタック

- **バックエンド**: Node.js 20.x + TypeScript + TDD
- **インフラ**: AWS CDK + Lambda + API Gateway + DynamoDB
- **セキュリティ**: HMAC-SHA256 + GitHub Environment Secrets
- **CI/CD**: GitHub Actions + 段階的テスト戦略

#### 🧪 完了したテスト

- ✅ Mock Webhook テスト
- ✅ GitHub Actions 認証テスト (`auth-only`)
- ✅ GitHub Actions 統合テスト (`full-webhook`)
- ✅ ES Modules 互換性確認

#### 📈 品質指標

- **TypeScript 型安全性**: 100%
- **テストカバレッジ**: ドメインモデル層 90%+
- **セキュリティチェック**: 署名検証・タイムスタンプ検証実装済み
- **CI/CD 成功率**: GitHub Actions 全ワークフロー通過
