import { RemovalPolicy } from "aws-cdk-lib";
import type { EnvironmentConfig } from "./types.js";

export const prodConfig: EnvironmentConfig = {
	environment: "prod",
	projectName: "sleep-smart-ac-prod",

	// 本番環境：高可用性・セキュリティ重視
	dynamodb: {
		removalPolicy: RemovalPolicy.RETAIN, // データ保護
		pointInTimeRecovery: true, // バックアップ有効
		deletionProtection: true, // 削除保護有効
		billingMode: "PAY_PER_REQUEST", // オンデマンド
	},

	// 本番環境：パフォーマンス重視
	lambda: {
		timeout: 30, // 30秒
		memorySize: 512, // 512MB（本番用に増強）
		logRetention: 30, // 30日間
	},

	// 本番環境：詳細監視
	monitoring: {
		enabled: true, // CloudWatch詳細監視ON
		detailedMetrics: true,
	},
};
