import type { APIGatewayProxyEvent } from "aws-lambda";

// ESモジュール環境でのモック設定
const mockVerifyWebhookSignature = jest.fn().mockReturnValue(true);
const mockValidateTimestamp = jest.fn().mockReturnValue(true);
const mockGetAuthConfig = jest.fn().mockReturnValue({
	token: "test-switchbot-token",
	secret: "test-switchbot-secret",
});

const mockProcessHub2Event = jest.fn().mockResolvedValue(undefined);

const mockEnvironmentRepository = jest.fn().mockImplementation(() => ({
	save: jest.fn().mockResolvedValue(undefined),
	findById: jest.fn().mockResolvedValue({
		id: "test-id",
		timestamp: Date.now(),
		temperature: 25.0,
		humidity: 60,
	}),
}));

// モジュールをモック
jest.mock("../../../src/infrastructure/auth/WebhookAuth.js", () => ({
	verifyWebhookSignature: mockVerifyWebhookSignature,
	validateTimestamp: mockValidateTimestamp,
	getAuthConfig: mockGetAuthConfig,
}));

jest.mock(
	"../../../src/infrastructure/repository/EnvironmentRepository.js",
	() => ({
		EnvironmentRepository: mockEnvironmentRepository,
	}),
);

jest.mock("../../../src/application/service/DataCollectionService.js", () => ({
	DataCollectionService: jest.fn().mockImplementation(() => ({
		processHub2Event: mockProcessHub2Event,
	})),
}));

// 動的インポートをdescribe内で行う
describe("Webhook Handler", () => {
	let webhookHandler: any;

	beforeAll(async () => {
		// テストファイル内で動的インポート
		const module = await import(
			"../../../src/interfaces/lambda/webhookHandler.js"
		);
		webhookHandler = module.webhookHandler;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		// モック関数の戻り値を再設定
		mockVerifyWebhookSignature.mockReturnValue(true);
		mockValidateTimestamp.mockReturnValue(true);
		mockGetAuthConfig.mockReturnValue({
			token: "test-switchbot-token",
			secret: "test-switchbot-secret",
		});
		mockProcessHub2Event.mockResolvedValue(undefined);
	});

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
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
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

			// モック関数が呼ばれたことを確認
			expect(mockVerifyWebhookSignature).toHaveBeenCalledWith(
				{
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
				},
				{
					token: "test-switchbot-token",
					secret: "test-switchbot-secret",
				},
			);
			expect(mockProcessHub2Event).toHaveBeenCalledWith(hub2WebhookBody);
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
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
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
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
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
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
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
					authorization: "test-token",
					sign: "test-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
				},
			};

			const result = await webhookHandler(event as APIGatewayProxyEvent);

			expect(result.statusCode).toBe(400);
			expect(JSON.parse(result.body)).toEqual({
				error: "Invalid JSON payload",
			});
		});

		it("認証失敗の場合は401エラーを返す", async () => {
			// Given: 認証を失敗させる
			mockVerifyWebhookSignature.mockReturnValue(false);

			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: JSON.stringify({
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
				}),
				headers: {
					"Content-Type": "application/json",
					authorization: "invalid-token",
					sign: "invalid-signature",
					t: "1640995200000",
					nonce: "test-nonce-uuid",
				},
			};

			// When: Webhook Handlerを実行
			const result = await webhookHandler(event as APIGatewayProxyEvent);

			// Then: 認証エラーが返る
			expect(result.statusCode).toBe(401);
			expect(JSON.parse(result.body)).toEqual({
				error: "Unauthorized",
			});
		});

		it("タイムスタンプが古い場合は401エラーを返す", async () => {
			// Given: タイムスタンプ検証を失敗させる
			mockValidateTimestamp.mockReturnValue(false);

			const event: Partial<APIGatewayProxyEvent> = {
				httpMethod: "POST",
				path: "/webhook/switchbot",
				body: JSON.stringify({
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
				}),
				headers: {
					"Content-Type": "application/json",
					authorization: "test-token",
					sign: "test-signature",
					t: "1540995200000", // 古いタイムスタンプ
					nonce: "test-nonce-uuid",
				},
			};

			// When: Webhook Handlerを実行
			const result = await webhookHandler(event as APIGatewayProxyEvent);

			// Then: タイムスタンプエラーが返る
			expect(result.statusCode).toBe(401);
			expect(JSON.parse(result.body)).toEqual({
				error: "Request too old",
			});
		});
	});
});
