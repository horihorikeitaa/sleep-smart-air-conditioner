# システムアーキテクチャ

`SleepSmartAC` は、AWS のサーバーレスサービスを中心に構築されたスケーラブルで堅牢なシステムです。ドメイン駆動設計（DDD）の思想を取り入れたレイヤードアーキテクチャを採用し、保守性と拡張性を高めています。

---

## 1. 全体システムアーキテクチャ (DDD 適用版)

```mermaid
graph TD
    subgraph "ユーザー"
        UserDevice["📱 スマートフォン/PC"]
    end

    subgraph "SwitchBot デバイス"
        Hub2["🌡️ SwitchBot Hub 2<br/>温度・湿度・照度"]
        PlugMini["🔌 SwitchBot Plug Mini<br/>電力監視"]
    end

    subgraph "AWS Cloud"
        subgraph "Frontend (AWS Amplify)"
            WebApp["🌐 Next.js App"]
        end

        subgraph "API & Webhook Gateway"
            APIGW_Web["📡 API Gateway<br/>/api/v1/*"]
            APIGW_Webhook["🎣 API Gateway<br/>/webhook/switchbot"]
        end

        subgraph "Interface Layer (Lambda)"
            direction TB
            Handler_WebAPI["🌐 Web API Handler<br/>ユーザーリクエスト処理"]
            Handler_Webhook["⚡ Webhook Handler<br/>リアルタイムデータ受信"]
            Handler_Control["🎛️ Control Handler<br/>エアコン制御"]
        end

        subgraph "Application Layer"
            direction LR
            AppService_Data["📊 Data Collection Service<br/>環境データ収集"]
            AppService_Control["🎯 AC Control Service<br/>エアコン制御"]
            AppService_Analysis["🧠 Analysis Service<br/>データ分析"]
        end

        subgraph "Domain Layer"
            direction LR
            EnvironmentData["🌡️ EnvironmentData<br/>温度・湿度・照度"]
            PowerData["⚡ PowerData<br/>電力データ"]
            SleepData["😴 SleepData<br/>睡眠品質データ"]
        end

        subgraph "Infrastructure Layer"
            direction LR
            EnvRepository["🗄️ Environment Repository<br/>環境データ永続化"]
            PowerRepository["🗄️ Power Repository<br/>電力データ永続化"]
            SwitchBotClient["🔗 SwitchBot API Client<br/>デバイス制御用"]
        end

        subgraph "Data Store & ML"
            DynamoDB_Env["🗄️ DynamoDB<br/>Environment Table"]
            DynamoDB_Power["🗄️ DynamoDB<br/>Power Table"]
            S3["📦 S3<br/>ML Models & Datasets"]
            SageMaker["🧠 SageMaker<br/>機械学習"]
        end
    end

    %% リアルタイムWebhookフロー
    Hub2 -->|"🎣 POST Webhook<br/>データ変化時"| APIGW_Webhook
    PlugMini -->|"🎣 POST Webhook<br/>電力状態変化時"| APIGW_Webhook
    APIGW_Webhook --> Handler_Webhook

    %% ユーザーAPIフロー
    UserDevice --> WebApp
    WebApp <--> APIGW_Web
    APIGW_Web --> Handler_WebAPI
    APIGW_Web --> Handler_Control

    %% アプリケーション層の処理フロー
    Handler_Webhook --> AppService_Data
    Handler_WebAPI --> AppService_Analysis
    Handler_Control --> AppService_Control

    %% ドメイン層との連携
    AppService_Data --> EnvironmentData
    AppService_Data --> PowerData
    AppService_Analysis --> SleepData
    AppService_Control --> SwitchBotClient

    %% インフラ層との連携
    EnvironmentData --> EnvRepository
    PowerData --> PowerRepository
    EnvRepository --> DynamoDB_Env
    PowerRepository --> DynamoDB_Power
    SwitchBotClient --> Hub2
    SwitchBotClient --> PlugMini

    %% ML フロー
    DynamoDB_Env --> S3
    DynamoDB_Power --> S3
    S3 --> SageMaker
    SageMaker --> S3
```

## 2. データフローの詳細

### 🎣 リアルタイム Webhook フロー

1. **Hub 2** → 温度・湿度・照度変化を検知
2. **SwitchBot サーバー** → Webhook POST 送信
3. **API Gateway** → `/webhook/switchbot` で受信
4. **Webhook Handler** → イベント解析・検証
5. **Data Collection Service** → ビジネスロジック実行
6. **Environment Repository** → DynamoDB に保存

### 📱 ユーザー操作フロー

1. **ユーザー** → Web アプリで操作
2. **Web API Handler** → リクエスト処理
3. **Analysis Service** → データ分析・推奨設定算出
4. **Control Handler** → エアコン制御指示
5. **SwitchBot API Client** → デバイス制御実行

---

## 2. レイヤーの説明

### Frontend

- **Next.js (on AWS Amplify):** ユーザーが操作する Web アプリケーションです。バックエンドの API Gateway と通信し、データの表示やユーザー入力を担当します。

### Backend (DDD レイヤードアーキテクチャ)

- **Interface Layer (Lambda Handlers):**
  - API Gateway や EventBridge からのリクエストを直接受け取る薄い層です。
  - リクエストのバリデーションや、後続の Application Service へのデータの受け渡しのみを担当します。
- **Application Layer (Use Cases):**
  - 「睡眠データを記録する」「最適なエアコン設定を提示する」といった、アプリケーションのユースケースを実装します。
  - ドメインモデルやインフラストラクチャ層を組み合わせて処理フローを構築します。
- **Domain Layer:**
  - プロジェクトの核心部分です。「睡眠」「環境」「エアコン設定」といったドメイン（ビジネス領域）のルールやロジックをここに集約します。
  - この層は、特定のフレームワークや DB に依存しない、純粋なビジネスロジックの塊となり、TDD を適用するのに最適な層です。
- **Infrastructure Layer:**
  - データベース（DynamoDB）へのアクセスや、外部 API（SwitchBot API）の呼び出しなど、インフラストラクチャに関わる具体的な実装を担当します。

### Data Store & ML

- **Amazon DynamoDB:** 収集した環境データ、電力消費量、ユーザーが入力した睡眠データを格納する NoSQL データベースです。
- **Amazon S3:** 機械学習の学習データセットや学習済みモデルを保存するストレージです。
- **Amazon SageMaker Studio Lab:** 収集したデータを分析し、機械学習モデルを開発・学習させるための開発環境です。
- **Amazon EventBridge (Scheduler):** データ収集用 Lambda を定期的に実行するためのスケジューラです。

---

## 3. 設計上の考慮事項

### セキュリティ

- **認証・認可:** API Gateway へのアクセスは `AWS Cognito` を利用したユーザー認証を導入し、不正なアクセスを防ぎます。各 Lambda 関数には、必要最小限の権限を持つ IAM ロールを割り当てます。
- **データ暗号化:** DynamoDB や S3 に保存されるデータは、`AWS KMS` を利用してサーバーサイドで暗号化します。
- **秘密情報の管理:** SwitchBot API のトークンなどの秘密情報は、`AWS Secrets Manager` または `Parameter Store` で安全に管理し、コードにハードコードしません。

### コスト管理

- **サーバーレスの活用:** リクエストに応じてコンピューティングリソースが起動するサーバーレスアーキテクチャを全面的に採用し、アイドリングコストを最小化します。
- **無料利用枠の活用:** AWS の無料利用枠を最大限に活用します。
- **予算アラート:** `AWS Budgets` を設定し、想定外のコストが発生した場合に速やかに通知されるようにします。
