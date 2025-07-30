import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import type * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import { getConfig } from "../configs/index.js";

export class WebhookStack extends cdk.Stack {
	public readonly api: apigateway.RestApi;

	constructor(
		scope: Construct,
		id: string,
		webhookHandler: lambda.Function,
		props?: cdk.StackProps,
	) {
		super(scope, id, props);

		const config = getConfig();

		// API Gateway作成
		this.api = new apigateway.RestApi(this, "WebhookApi", {
			restApiName: `${config.projectName}-webhook-api`,
			description: "SwitchBot Webhook API",
			// CORS設定（必要に応じて）
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: ["POST"],
				allowHeaders: ["Content-Type"],
			},
			// CloudWatch Logsの設定
			cloudWatchRole: true,
			deployOptions: {
				stageName: config.environment,
				accessLogDestination: new apigateway.LogGroupLogDestination(
					new logs.LogGroup(this, "ApiGatewayAccessLogs", {
						logGroupName: `/aws/apigateway/${config.projectName}-webhook`,
						retention: logs.RetentionDays.ONE_WEEK,
						removalPolicy:
							config.environment === "dev"
								? cdk.RemovalPolicy.DESTROY
								: cdk.RemovalPolicy.RETAIN,
					}),
				),
				accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
					caller: false,
					httpMethod: true,
					ip: true,
					protocol: true,
					requestTime: true,
					resourcePath: true,
					responseLength: true,
					status: true,
					user: false,
				}),
			},
		});

		// /webhook リソース作成
		const webhookResource = this.api.root.addResource("webhook");

		// /webhook/switchbot リソース作成
		const switchbotResource = webhookResource.addResource("switchbot");

		// Lambda統合
		const lambdaIntegration = new apigateway.LambdaIntegration(webhookHandler, {
			requestTemplates: { "application/json": '{ "statusCode": "200" }' },
			proxy: true, // プロキシ統合を有効化
		});

		// POST /webhook/switchbot エンドポイント
		switchbotResource.addMethod("POST", lambdaIntegration, {
			operationName: "HandleSwitchBotWebhook",
			methodResponses: [
				{
					statusCode: "200",
					responseModels: {
						"application/json": apigateway.Model.EMPTY_MODEL,
					},
				},
				{
					statusCode: "400",
					responseModels: {
						"application/json": apigateway.Model.ERROR_MODEL,
					},
				},
				{
					statusCode: "500",
					responseModels: {
						"application/json": apigateway.Model.ERROR_MODEL,
					},
				},
			],
		});

		// 出力値（API Gateway URL）
		new cdk.CfnOutput(this, "WebhookApiUrl", {
			value: this.api.url,
			description: "SwitchBot Webhook API URL",
			exportName: `${config.projectName}-webhook-api-url`,
		});

		new cdk.CfnOutput(this, "WebhookEndpoint", {
			value: `${this.api.url}webhook/switchbot`,
			description: "SwitchBot Webhook Endpoint",
			exportName: `${config.projectName}-webhook-endpoint`,
		});

		// タグ追加
		cdk.Tags.of(this.api).add("Environment", config.environment);
		cdk.Tags.of(this.api).add("Project", "SleepSmartAC");
	}
}
