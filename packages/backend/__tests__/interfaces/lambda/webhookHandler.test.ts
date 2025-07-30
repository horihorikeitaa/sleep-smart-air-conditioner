import type { APIGatewayProxyEvent } from "aws-lambda";
import { webhookHandler } from "../../../src/interfaces/lambda/webhookHandler.js";

describe("Webhook Handler", () => {
	describe("Hub 2 からのWebhook", () => {
		it("正常な環境データを受信して処理できる", async () => {
			// Given: Hub 2 からの Webhook イベント
			const hub2WebhookBody = {
				eventType: "changeReport",
				eventVersion: "1",
				context: {
					deviceType: "WoHub2",
					deviceMac: "AA:BB:CC:DD:EE:FF",
					temperature: 25.5,
					humidity: 60,
					lightLevel: 15,
					scale: "CELSIUS",
					timeOfSample: 1640995200,
				},
			};

			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: JSON.stringify(hub2WebhookBody),
				headers: {
					"Content-Type": "application/json",
				},
			};

			// When: Webhook Handlerを実行
			const result = await webhookHandler(event as APIGatewayProxyEvent);

			// Then: 成功レスポンスが返る
			expect(result.statusCode).toBe(200);
			expect(JSON.parse(result.body)).toEqual({
				message: "Webhook processed successfully",
				deviceType: "WoHub2",
				deviceMac: "AA:BB:CC:DD:EE:FF",
			});
		});

		it("Plug Mini からの電力状態変更を処理できる", async () => {
			// Given: Plug Mini からの Webhook イベント
			const plugWebhookBody = {
				eventType: "changeReport",
				eventVersion: "1",
				context: {
					deviceType: "WoPlugJP",
					deviceMac: "FF:EE:DD:CC:BB:AA",
					powerState: "ON",
					timeOfSample: 1640995260,
				},
			};

			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: JSON.stringify(plugWebhookBody),
				headers: {
					"Content-Type": "application/json",
				},
			};

			// When: Webhook Handlerを実行
			const result = await webhookHandler(event as APIGatewayProxyEvent);

			// Then: 成功レスポンスが返る
			expect(result.statusCode).toBe(200);
			expect(JSON.parse(result.body)).toEqual({
				message: "Webhook processed successfully",
				deviceType: "WoPlugJP",
				deviceMac: "FF:EE:DD:CC:BB:AA",
			});
		});

		it("不正なWebhookデータの場合はエラーを返す", async () => {
			// Given: 不正なWebhookデータ
			const invalidWebhookBody = {
				invalidField: "invalid",
			};

			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: JSON.stringify(invalidWebhookBody),
				headers: {
					"Content-Type": "application/json",
				},
			};

			// When: Webhook Handlerを実行
			const result = await webhookHandler(event as APIGatewayProxyEvent);

			// Then: エラーレスポンスが返る
			expect(result.statusCode).toBe(400);
			expect(JSON.parse(result.body)).toEqual({
				error: "Invalid webhook payload",
			});
		});

		it("POST以外のHTTPメソッドは拒否する", async () => {
			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "GET",
				path: "/webhook/switchbot",
			};

			const result = await webhookHandler(event as APIGatewayProxyEvent);

			expect(result.statusCode).toBe(405);
			expect(JSON.parse(result.body)).toEqual({
				error: "Method not allowed",
			});
		});

		it("リクエストボディが空の場合はエラーを返す", async () => {
			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: null,
				headers: {
					"Content-Type": "application/json",
				},
			};

			const result = await webhookHandler(event as APIGatewayProxyEvent);

			expect(result.statusCode).toBe(400);
			expect(JSON.parse(result.body)).toEqual({
				error: "Request body is required",
			});
		});

		it("JSONパースエラーの場合は適切にハンドリングする", async () => {
			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: "invalid json{",
				headers: {
					"Content-Type": "application/json",
				},
			};

			const result = await webhookHandler(event as APIGatewayProxyEvent);

			expect(result.statusCode).toBe(400);
			expect(JSON.parse(result.body)).toEqual({
				error: "Invalid JSON payload",
			});
		});
	});
});
