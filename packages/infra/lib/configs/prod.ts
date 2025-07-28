import { RemovalPolicy } from "aws-cdk-lib";
import type { EnvironmentConfig } from "./types.js";

export const prodConfig: EnvironmentConfig = {
	environment: "prod",
	projectName: "sleep-smart-ac",

	// 本番環境：データ保護重視
	dynamodb: {
		removalPolicy: RemovalPolicy.RETAIN,
		pointInTimeRecovery: true, // バックアップあり
		deletionProtection: true, // 削除保護あり
		billingMode: "PAY_PER_REQUEST", // オンデマンド（IoTなので予測困難）
	},

	// 本番環境：パフォーマンス重視
	lambda: {
		timeout: 300, // 5分
		memorySize: 1024, // 1GB
		logRetention: 365, // 1年
	},

	// 本番環境：完全監視
	monitoring: {
		enabled: true, // CloudWatch詳細監視ON
		detailedMetrics: true,
	},
};
