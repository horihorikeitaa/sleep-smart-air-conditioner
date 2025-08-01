import * as cdk from "aws-cdk-lib";
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import { getConfig } from "../configs/index.js";

/**
 * 🔐 環境別SwitchBot認証情報取得
 *
 * 🎯 目的: 環境（dev/prod）に応じてSwitchBotのトークンを取得
 * 📍 優先順位: 環境固有変数 → 汎用変数 → 空文字
 *
 * 実行環境別の動作:
 * - GitHub Actions: SWITCHBOT_TOKEN_DEV を使用
 * - ローカル開発: SWITCHBOT_TOKEN を使用（.envファイル）
 */
function getSwitchBotToken(environment: string): string {
	// 1️⃣ 環境に応じた変数名を決定
	const envVar =
		environment === "prod"
			? "SWITCHBOT_TOKEN_PROD" // 本番環境用
			: "SWITCHBOT_TOKEN_DEV"; // 開発環境用

	// 2️⃣ 3段階のフォールバック戦略で取得
	const token =
		process.env[envVar] || // 🥇 環境固有変数（GitHub Actions用）
		process.env.SWITCHBOT_TOKEN || // 🥈 汎用変数（ローカル.env用）
		""; // 🥉 最終フォールバック

	// 3️⃣ 値が見つからない場合の警告
	if (!token) {
		console.warn(`⚠️ SwitchBot token not found for environment: ${environment}`);
		console.warn(
			`   Expected environment variable: ${envVar} or SWITCHBOT_TOKEN`,
		);
	}

	return token;
}

/**
 * 🔐 環境別SwitchBotシークレット取得
 *
 * 🎯 目的: HMAC署名検証用のシークレットを取得
 * 📍 取得ロジックはトークンと同じ
 */
function getSwitchBotSecret(environment: string): string {
	// 1️⃣ 環境に応じた変数名を決定
	const envVar =
		environment === "prod"
			? "SWITCHBOT_SECRET_PROD" // 本番環境用
			: "SWITCHBOT_SECRET_DEV"; // 開発環境用

	// 2️⃣ 3段階のフォールバック戦略で取得
	const secret =
		process.env[envVar] || // 🥇 環境固有変数（GitHub Actions用）
		process.env.SWITCHBOT_SECRET || // 🥈 汎用変数（ローカル.env用）
		""; // 🥉 最終フォールバック

	// 3️⃣ 値が見つからない場合の警告
	if (!secret) {
		console.warn(
			`⚠️ SwitchBot secret not found for environment: ${environment}`,
		);
		console.warn(
			`   Expected environment variable: ${envVar} or SWITCHBOT_SECRET`,
		);
	}

	return secret;
}

/**
 * 🔧 Lambda Stack
 *
 * 🎯 目的: SwitchBot Webhookを処理するLambda関数とその関連リソースを管理
 * 📦 含まれるリソース:
 *   - Lambda関数（Webhook処理）
 *   - CloudWatch Logs（ログ管理）
 *   - IAM権限（DynamoDB書き込み権限）
 */
export class LambdaStack extends cdk.Stack {
	public readonly webhookHandler: lambda.Function;

	constructor(
		scope: Construct,
		id: string,
		environmentTable: dynamodb.Table, // ✅ Tableオブジェクトのみ受け付け（シンプル化）
		props?: cdk.StackProps,
	) {
		super(scope, id, props);

		const config = getConfig();

		// 🚀 Webhook Handler Lambda関数の作成
		this.webhookHandler = new lambda.Function(this, "WebhookHandler", {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: "interfaces/lambda/webhookHandler.webhookHandler",
			code: lambda.Code.fromAsset("../backend/dist"),
			functionName: `${config.projectName}-webhook-handler`,
			timeout: cdk.Duration.seconds(config.lambda.timeout),
			memorySize: config.lambda.memorySize,

			// ✅ ES Modules対応の追加設定
			architecture: lambda.Architecture.X86_64,

			// 🌍 Lambda関数の環境変数設定
			environment: {
				NODE_ENV: config.environment,
				NODE_OPTIONS: "--enable-source-maps",
				ENVIRONMENT_TABLE_NAME: environmentTable.tableName, // DynamoDBテーブル名
				SWITCHBOT_TOKEN: getSwitchBotToken(config.environment), // SwitchBot認証トークン
				SWITCHBOT_SECRET: getSwitchBotSecret(config.environment), // HMAC署名検証用シークレット
			},

			// 📊 CloudWatch Logs設定
			logGroup: new logs.LogGroup(this, "WebhookHandlerLogs", {
				logGroupName: `/aws/lambda/${config.projectName}-webhook-handler`,
				retention: logs.RetentionDays.ONE_WEEK, // 7日間保持（開発環境設定）
				removalPolicy: config.dynamodb.removalPolicy,
			}),
		});

		// 📝 CloudWatch Logs への書き込み権限
		// （Lambda関数には自動で付与されるが、明示的に記載）
		this.webhookHandler.addToRolePolicy(
			new iam.PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: [
					"logs:CreateLogGroup",
					"logs:CreateLogStream",
					"logs:PutLogEvents",
				],
				resources: ["*"],
			}),
		);

		// 🗃️ DynamoDB書き込み権限の付与
		// CDKの便利メソッドを使用（自動で適切な権限を設定）
		environmentTable.grantWriteData(this.webhookHandler);

		// 🏷️ 運用管理用のタグ追加
		cdk.Tags.of(this.webhookHandler).add("Environment", config.environment);
		cdk.Tags.of(this.webhookHandler).add("Project", "SleepSmartAC");
	}
}
