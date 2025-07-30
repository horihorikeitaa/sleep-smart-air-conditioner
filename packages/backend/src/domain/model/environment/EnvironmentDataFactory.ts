import type { Hub2WebhookEvent } from "../../../interfaces/lambda/types.js";
import { EnvironmentData } from "./EnvironmentData.js";

/**
 * Hub 2 のWebhookイベントからEnvironmentDataを作成
 *
 * 処理内容：
 * 1. タイムスタンプ変換（秒→ミリ秒）
 * 2. 照度レベル変換（SwitchBotの1-20 → 0-100%）
 * 3. ドメインモデル作成（ビジネスルール検証含む）
 *
 * @param event - Hub 2 からのWebhookイベント
 * @returns EnvironmentData オブジェクト
 */
export function createEnvironmentDataFromHub2Webhook(
	event: Hub2WebhookEvent,
): EnvironmentData {
	// タイムスタンプ変換（秒→ミリ秒）
	const timestamp = new Date(event.context.timeOfSample * 1000);

	// 照度レベル変換（SwitchBotの1-20 → 0-100%）
	const brightness = EnvironmentData.convertLightLevelToBrightness(
		event.context.lightLevel,
	);

	// ドメインモデル作成（コンストラクタでビジネスルール検証実行）
	return new EnvironmentData(
		event.context.deviceMac,
		timestamp,
		event.context.temperature,
		event.context.humidity,
		brightness,
	);
}
