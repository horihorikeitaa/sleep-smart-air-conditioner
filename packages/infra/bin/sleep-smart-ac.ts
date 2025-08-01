#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { getConfig } from "../lib/configs/index.js";

import { DataStack } from "../lib/stacks/data-stack.js";
import { LambdaStack } from "../lib/stacks/lambda-stack.js";
import { WebhookStack } from "../lib/stacks/webhook-stack.js";

const app = new cdk.App();
const config = getConfig();

// 環境設定（accountがundefinedの場合は設定しない）
const env = process.env.CDK_DEFAULT_ACCOUNT
	? {
			account: process.env.CDK_DEFAULT_ACCOUNT,
			region: process.env.CDK_DEFAULT_REGION || "ap-northeast-1",
		}
	: {
			region: process.env.CDK_DEFAULT_REGION || "ap-northeast-1",
		};

// 🗃️ Step 1: データ層（DynamoDB）
// 環境データを保存するテーブルを作成
const dataStack = new DataStack(app, `${config.projectName}-data-stack`, {
	env,
});

// 🔧 Step 2: 処理層（Lambda）
// SwitchBot Webhookを処理するLambda関数を作成
// DataStackのテーブルを参照して権限設定も自動で行う
const lambdaStack = new LambdaStack(
	app,
	`${config.projectName}-lambda-stack`,
	dataStack.environmentTable, // ✅ Tableオブジェクトを直接渡す
	{ env },
);

// 🌐 Step 3: 公開層（API Gateway）
// 外部からのWebhookを受け取るエンドポイントを作成
const webhookStack = new WebhookStack(
	app,
	`${config.projectName}-webhook-stack`,
	lambdaStack.webhookHandler,
	{ env },
);

// 📐 依存関係の明確化
// データ層 → 処理層 → 公開層の順序でデプロイ
lambdaStack.addDependency(dataStack); // Lambda → Data の依存関係
webhookStack.addDependency(lambdaStack); // Webhook → Lambda の依存関係
