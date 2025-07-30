#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { getConfig } from "../lib/configs/index.js";

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

// Lambda Stack（既存テーブルを使用）
const lambdaStack = new LambdaStack(
	app,
	`${config.projectName}-lambda-stack`,
	`${config.projectName}-environment-data`, // 既存テーブル名
	{ env },
);

// Webhook Stack（API Gateway）
const webhookStack = new WebhookStack(
	app,
	`${config.projectName}-webhook-stack`,
	lambdaStack.webhookHandler,
	{ env },
);

// 依存関係設定
webhookStack.addDependency(lambdaStack);
