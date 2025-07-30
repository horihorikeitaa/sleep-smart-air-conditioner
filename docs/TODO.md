# 🚀 Sleep Smart AC 開発 TODO リスト

## 📊 現在の進捗状況

### ✅ 完了済み

- [x] DynamoDB CDK スタック作成・デプロイ
- [x] GitHub Actions CI パイプライン設定
- [x] EnvironmentData ドメインモデル実装
- [x] Jest テスト環境設定
- [x] **Step 1: Webhook 型定義作成** ← 🎉 完了！
- [x] **Step 2: EnvironmentDataFactory 実装** ← 🎉 新たに完了！
- [x] **Step 3: Webhook Handler の実装** ← 🎉 完了！

### 🔄 現在実装中

- [ ] **Phase 2: データ永続化層** ← 👈 **次はここ**
  - [ ] **Step 4: DynamoDB Repository 実装**

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

## 🎯 Phase 2: データ永続化層

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

---

### ステップ 5: Application Service 実装

**目標:** Webhook データ処理のビジネスロジック

#### 📝 作成ファイル

```bash
packages/backend/src/application/service/DataCollectionService.ts
packages/backend/__tests__/application/service/DataCollectionService.test.ts
packages/backend/src/application/usecase/ProcessWebhookUseCase.ts
```

#### 📋 実装内容

- [ ] `DataCollectionService.processHub2Data()` メソッド
- [ ] `DataCollectionService.processPlugMiniData()` メソッド
- [ ] バリデーションロジック
- [ ] 重複データ検出・除外
- [ ] エラー通知機能

---

## 🎯 Phase 3: インフラストラクチャ & デプロイ

### ステップ 6: CDK スタック更新

**目標:** Webhook 用の AWS リソース構築

#### 📝 作成ファイル

```bash
packages/infra/lib/stacks/webhook-stack.ts
packages/infra/lib/stacks/lambda-stack.ts
```

#### 📋 実装内容

- [ ] API Gateway（`/webhook/switchbot`）
- [ ] Lambda 関数定義
- [ ] IAM ロール・ポリシー
- [ ] DynamoDB アクセス権限
- [ ] CloudWatch Logs 設定

### ステップ 7: SwitchBot Webhook 設定

**目標:** 実際の SwitchBot デバイスから Webhook 受信

#### 📋 設定手順

- [ ] AWS デプロイ
- [ ] API Gateway エンドポイント確認
- [ ] SwitchBot アプリで Webhook URL 設定
- [ ] テストデータ送信・受信確認

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

現在は **Phase 1 - Step 1（型定義作成）** から開始します。

**今すぐ取り組むタスク:**

1. `packages/backend/src/interfaces/lambda/types.ts` の実装
2. TypeScript コンパイル確認
3. Step 2 の TDD サイクル開始
