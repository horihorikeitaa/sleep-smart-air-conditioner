import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { DataStack } from "../lib/stacks/data-stack.js";

describe("Sleep Smart AC Infrastructure", () => {
	test("DynamoDB Environment Table Created", () => {
		// GIVEN
		const app = new cdk.App();

		// WHEN
		const stack = new DataStack(app, "TestDataStack");

		// THEN
		const template = Template.fromStack(stack);

		// DynamoDBテーブルが作成されることを確認
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			// パーティションキーの確認
			KeySchema: [
				{
					AttributeName: "deviceId",
					KeyType: "HASH",
				},
				{
					AttributeName: "timestamp",
					KeyType: "RANGE",
				},
			],
			// 属性定義の確認
			AttributeDefinitions: [
				{
					AttributeName: "deviceId",
					AttributeType: "S",
				},
				{
					AttributeName: "timestamp",
					AttributeType: "S",
				},
			],
		});

		// テーブル名にプロジェクト名が含まれることを確認
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			TableName: "sleep-smart-ac-dev-environment-data",
		});
	});

	test("Environment Table has correct tags", () => {
		// GIVEN
		const app = new cdk.App();

		// WHEN
		const stack = new DataStack(app, "TestDataStack");

		// THEN
		const template = Template.fromStack(stack);

		// タグが正しく設定されることを確認
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			Tags: [
				{
					Key: "Environment",
					Value: "dev",
				},
				{
					Key: "Project",
					Value: "SleepSmartAC",
				},
			],
		});
	});
});
