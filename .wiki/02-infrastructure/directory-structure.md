packages/infra/
├── bin/
│   └── sleep-smart-ac.ts              # アプリケーションエントリーポイント
├── lib/
│   ├── stacks/                        # スタック定義
│   │   ├── data-stack.ts              # データ層（DynamoDB, S3）
│   │   ├── compute-stack.ts           # 処理層（Lambda関数群）
│   │   ├── api-stack.ts               # API層（API Gateway）
│   │   ├── schedule-stack.ts          # スケジュール層（EventBridge）
│   │   └── monitoring-stack.ts       # 監視層（CloudWatch）【将来】
│   ├── constructs/                    # 再利用可能なコンストラクト
│   │   ├── switchbot-lambda.ts        # SwitchBot API用Lambda
│   │   ├── data-collector.ts          # データ収集用コンストラクト
│   │   └── environment-table.ts       # 環境データテーブル
│   ├── configs/                       # 環境別設定
│   │   ├── dev.ts                     # 開発環境設定
│   │   ├── prod.ts                    # 本番環境設定
│   │   └── common.ts                  # 共通設定
│   └── types/                         # 型定義
│       └── infra-types.ts
├── package.json
├── tsconfig.json
├── cdk.json
└── README.md                          # インフラ概要・デプロイ手順