import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DataCollectionService } from "../../application/service/DataCollectionService.js";
import {
	getAuthConfig,
	validateTimestamp,
	verifyWebhookSignature,
	type WebhookHeaders,
} from "../../infrastructure/auth/WebhookAuth.js";
import { EnvironmentRepository } from "../../infrastructure/repository/EnvironmentRepository.js";
import {
	type Hub2WebhookEvent,
	isHub2WebhookEvent,
	isPlugMiniWebhookEvent,
	isValidWebhookEvent,
	type PlugMiniWebhookEvent,
	type SwitchBotWebhookEvent,
	validateHub2WebhookStructure,
	validatePlugMiniWebhookStructure,
} from "./types.js";

// DynamoDBテーブル名を環境変数から取得
const ENVIRONMENT_TABLE_NAME =
	process.env.ENVIRONMENT_TABLE_NAME || "sleep-smart-ac-environment-data";

/**
 * SwitchBot Webhook Handler
 *
 * - SwitchBotデバイスからデータが変化したときに呼ばれる関数
 * - 温度、湿度、照度、電力状態の変化を受信してデータベースに保存
 * - API Gateway との統合
 * - 型安全なイベント処理
 * - 適切なエラーハンドリング
 * - ログ出力による監視対応
 */
export async function webhookHandler(
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
	console.log("Webhook received:", JSON.stringify(event, null, 2));

	try {
		// POSTメソッドのみ受け付け
		if (event.httpMethod !== "POST") {
			console.warn(`Invalid HTTP method: ${event.httpMethod}`);
			return createErrorResponse(405, "Method not allowed");
		}

		// 🔐 Step 1: SwitchBot Webhook認証
		const authConfig = getAuthConfig();

		// ヘッダーの取得（大文字小文字を正規化）
		const headers: WebhookHeaders = {
			authorization:
				(event.headers.Authorization || event.headers.authorization) ??
				undefined,
			sign: (event.headers.sign || event.headers.Sign) ?? undefined,
			t: (event.headers.t || event.headers.T) ?? undefined,
			nonce: (event.headers.nonce || event.headers.Nonce) ?? undefined,
		};

		// 認証ヘッダーが存在する場合のみ署名検証を実行
		const hasAuthHeaders =
			headers.authorization && headers.sign && headers.t && headers.nonce;

		if (hasAuthHeaders) {
			// Secure Webhook の場合は署名検証を実行
			if (!authConfig) {
				console.error("SwitchBot authentication configuration is missing");
				return createErrorResponse(500, "Authentication configuration error");
			}

			if (!verifyWebhookSignature(headers, authConfig)) {
				console.warn("Webhook signature verification failed");
				return createErrorResponse(401, "Unauthorized");
			}

			// タイムスタンプ検証（リプレイ攻撃防止）
			const timestamp = parseInt(headers.t || "0");
			if (!validateTimestamp(timestamp)) {
				console.warn("Webhook timestamp validation failed");
				return createErrorResponse(401, "Request too old");
			}

			console.log("✅ Secure Webhook authentication successful");
		} else {
			// Simple Webhook の場合は警告ログのみ
			console.log("⚠️ Simple Webhook detected (no authentication headers)");
			console.log("📝 Consider using Secure Webhook for better security");

			// IP許可リストでの簡易セキュリティチェック
			const sourceIp = event.requestContext?.identity?.sourceIp;
			if (sourceIp && !isAllowedSwitchBotIP(sourceIp)) {
				console.warn(`Unauthorized IP address: ${sourceIp}`);
				return createErrorResponse(403, "Forbidden - Invalid source IP");
			}

			console.log(`✅ Simple Webhook accepted from IP: ${sourceIp}`);
		}

		// リクエストボディの存在確認
		if (!event.body) {
			console.warn("Request body is missing");
			return createErrorResponse(400, "Request body is required");
		}

		// JSONパース
		let webhookEvent: SwitchBotWebhookEvent;
		try {
			webhookEvent = JSON.parse(event.body);
		} catch (parseError) {
			console.error("JSON parse error:", parseError);
			return createErrorResponse(400, "Invalid JSON payload");
		}

		// Webhook イベントの基本検証
		if (!isValidWebhookEvent(webhookEvent)) {
			console.warn("Invalid webhook event structure:", webhookEvent);
			return createErrorResponse(400, "Invalid webhook payload");
		}

		// デバイスタイプ別に処理
		if (isHub2WebhookEvent(webhookEvent)) {
			const result = await processHub2Event(webhookEvent);
			return createSuccessResponse(result);
		}

		if (isPlugMiniWebhookEvent(webhookEvent)) {
			const result = await processPlugMiniEvent(webhookEvent);
			return createSuccessResponse(result);
		}

		// 未対応のデバイスタイプ
		console.warn(
			"Unsupported device type:",
			(webhookEvent.context as any)?.deviceType,
		);
		return createErrorResponse(400, "Unsupported device type");
	} catch (error) {
		console.error("Webhook processing error:", error);
		return createErrorResponse(500, "Internal server error");
	}
}

/**
 * Hub 2 のイベントを処理
 *
 * @param event - Hub 2 からのWebhookイベント
 * @returns 処理結果
 */
async function processHub2Event(
	event: Hub2WebhookEvent,
): Promise<ProcessResult> {
	console.log("Processing Hub 2 event:", event.context);

	// 構造的検証
	if (!validateHub2WebhookStructure(event)) {
		throw new Error("Invalid Hub 2 webhook structure");
	}

	// 実際のデータ保存処理
	const environmentRepository = new EnvironmentRepository(
		ENVIRONMENT_TABLE_NAME,
	);
	const dataCollectionService = new DataCollectionService(
		environmentRepository,
	);

	await dataCollectionService.processHub2Event(event);

	return {
		deviceType: "WoHub2",
		deviceMac: event.context.deviceMac,
		processed: true,
	};
}

/**
 * Plug Mini のイベントを処理
 *
 * @param event - Plug Mini からのWebhookイベント
 * @returns 処理結果
 */
async function processPlugMiniEvent(
	event: PlugMiniWebhookEvent,
): Promise<ProcessResult> {
	console.log("Processing Plug Mini event:", event.context);

	// 構造的検証
	if (!validatePlugMiniWebhookStructure(event)) {
		throw new Error("Invalid Plug Mini webhook structure");
	}

	// TODO: PowerData オブジェクトを作成してDynamoDBに保存
	// const powerData = createPowerDataFromPlugMiniWebhook(event);
	// await powerRepository.save(powerData);

	console.log("Plug Mini power state processed:", {
		deviceMac: event.context.deviceMac,
		powerState: event.context.powerState,
	});

	return {
		deviceType: "WoPlugJP",
		deviceMac: event.context.deviceMac,
		processed: true,
	};
}

/**
 * 処理結果の型定義
 */
interface ProcessResult {
	deviceType: string;
	deviceMac: string;
	processed: boolean;
}

/**
 * 成功レスポンスを作成
 *
 * @param result - 処理結果
 * @returns API Gateway レスポンス
 */
function createSuccessResponse(result: ProcessResult): APIGatewayProxyResult {
	return {
		statusCode: 200,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message: "Webhook processed successfully",
			deviceType: result.deviceType,
			deviceMac: result.deviceMac,
		}),
	};
}

/**
 * エラーレスポンスを作成
 *
 * @param statusCode - HTTPステータスコード
 * @param message - エラーメッセージ
 * @returns API Gateway レスポンス
 */
function createErrorResponse(
	statusCode: number,
	message: string,
): APIGatewayProxyResult {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			error: message,
		}),
	};
}

/**
 * SwitchBotの許可されたIPアドレス範囲をチェック
 * 簡易的なセキュリティ対策
 */
function isAllowedSwitchBotIP(sourceIp: string): boolean {
	// SwitchBotのIPアドレス範囲
	const allowedRanges = [
		"54.64.81.21", // 現在観測されているSwitchBot IP
		"54.64.", // AWS APNE1 の一部範囲
		"52.68.", // AWS APNE1 の別の範囲
	];

	return allowedRanges.some((range) => sourceIp.startsWith(range));
}
