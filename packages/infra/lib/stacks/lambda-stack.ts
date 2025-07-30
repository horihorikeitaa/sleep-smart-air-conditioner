import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import { getConfig } from "../configs/index.js";

/**
 * 環境別SwitchBot認証情報取得
 *
 * GitHub Environment Secretsから環境に応じた認証情報を取得
 */
function getSwitchBotToken(environment: string): string {
	const envVar =
		environment === "prod" ? "SWITCHBOT_TOKEN_PROD" : "SWITCHBOT_TOKEN_DEV";
	const token = process.env[envVar] || process.env.SWITCHBOT_TOKEN || "";

	if (!token) {
		console.warn(`⚠️ SwitchBot token not found for environment: ${environment}`);
		console.warn(
			`   Expected environment variable: ${envVar} or SWITCHBOT_TOKEN`,
		);
	}

	return token;
}

function getSwitchBotSecret(environment: string): string {
	const envVar =
		environment === "prod" ? "SWITCHBOT_SECRET_PROD" : "SWITCHBOT_SECRET_DEV";
	const secret = process.env[envVar] || process.env.SWITCHBOT_SECRET || "";

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

export class LambdaStack extends cdk.Stack {
	public readonly webhookHandler: lambda.Function;

	constructor(
		scope: Construct,
		id: string,
		environmentTableName: string,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);

		const config = getConfig();

		// Webhook Handler Lambda関数
		this.webhookHandler = new lambda.Function(this, "WebhookHandler", {
			runtime: lambda.Runtime.NODEJS_20_X,
			handler: "interfaces/lambda/webhookHandler.webhookHandler",
			code: lambda.Code.fromAsset("../backend/dist"), // ビルド後のコード
			functionName: `${config.projectName}-webhook-handler`,
			timeout: cdk.Duration.seconds(config.lambda.timeout),
			memorySize: config.lambda.memorySize,
			environment: {
				NODE_ENV: config.environment,
				ENVIRONMENT_TABLE_NAME: environmentTableName,
				// SwitchBot Webhook認証情報（GitHub Environment Secretsから取得）
				SWITCHBOT_TOKEN: getSwitchBotToken(config.environment),
				SWITCHBOT_SECRET: getSwitchBotSecret(config.environment),
			},
			logGroup: new logs.LogGroup(this, "WebhookHandlerLogs", {
				logGroupName: `/aws/lambda/${config.projectName}-webhook-handler`,
				retention: logs.RetentionDays.ONE_WEEK, // 7日間（開発環境設定）
				removalPolicy: config.dynamodb.removalPolicy,
			}),
		});

		// DynamoDB テーブルへの書き込み権限を付与
		// 既存テーブルへの権限付与
		this.webhookHandler.addToRolePolicy(
			new iam.PolicyStatement({
				effect: iam.Effect.ALLOW,
				actions: ["dynamodb:PutItem", "dynamodb:UpdateItem"],
				resources: [
					`arn:aws:dynamodb:${this.region}:${this.account}:table/${environmentTableName}`,
				],
			}),
		);

		// CloudWatch Logs への書き込み権限（自動で付与されるが明示的に記載）
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

		// タグ追加
		cdk.Tags.of(this.webhookHandler).add("Environment", config.environment);
		cdk.Tags.of(this.webhookHandler).add("Project", "SleepSmartAC");
	}
}
