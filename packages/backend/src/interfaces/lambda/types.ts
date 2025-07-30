/**
 * SwitchBot Webhook イベントの型定義
 *
 * 公式ドキュメント準拠:
 * - Hub 2: 温度・湿度・照度センサー
 * - Plug Mini: 電力監視プラグ
 */

/**
 * 基本的なSwitchBot Webhookイベント
 */
export interface SwitchBotWebhookEvent {
	eventType: "changeReport";
	eventVersion: string;
	context: unknown; // 各デバイスで異なる
}

/**
 * Hub 2 (温度・湿度・照度センサー) のWebhookイベント
 *
 * - deviceMac: デバイスの識別番号（MACアドレス）
 * - temperature: 温度（摂氏）
 * - humidity: 湿度（パーセント）
 * - lightLevel: 照度レベル（1-20の範囲）
 * - timeOfSample: データが測定された時刻（秒単位）
 */
export interface Hub2WebhookEvent extends SwitchBotWebhookEvent {
	context: {
		deviceType: "WoHub2";
		deviceMac: string;
		temperature: number;
		humidity: number;
		lightLevel: number;
		scale: "CELSIUS";
		timeOfSample: number; // Unix timestamp (秒)
	};
}

/**
 * Plug Mini (電力監視プラグ) のWebhookイベント
 *
 * - deviceMac: プラグの識別番号
 * - powerState: 電源のON/OFF状態
 * - timeOfSample: 状態が変化した時刻
 */
export interface PlugMiniWebhookEvent extends SwitchBotWebhookEvent {
	context: {
		deviceType: "WoPlugJP";
		deviceMac: string;
		powerState: "ON" | "OFF";
		timeOfSample: number; // Unix timestamp (秒)
	};
}

/**
 * Type Guard: Hub 2のWebhookイベントかどうかを判定
 *
 * - TypeScriptの型安全性を活用
 * - ランタイムでの型チェック
 */
export function isHub2WebhookEvent(
	event: SwitchBotWebhookEvent,
): event is Hub2WebhookEvent {
	return (
		event.eventType === "changeReport" &&
		typeof event.context === "object" &&
		event.context !== null &&
		(event.context as any).deviceType === "WoHub2"
	);
}

/**
 * Type Guard: Plug MiniのWebhookイベントかどうかを判定
 */
export function isPlugMiniWebhookEvent(
	event: SwitchBotWebhookEvent,
): event is PlugMiniWebhookEvent {
	return (
		event.eventType === "changeReport" &&
		typeof event.context === "object" &&
		event.context !== null &&
		(event.context as any).deviceType === "WoPlugJP"
	);
}

/**
 * Webhookイベントの基本的な検証
 *
 * @param payload - 受信したペイロード
 * @returns SwitchBotWebhookEventとして有効かどうか
 */
export function isValidWebhookEvent(
	payload: any,
): payload is SwitchBotWebhookEvent {
	return (
		payload &&
		typeof payload === "object" &&
		typeof payload.eventType === "string" &&
		typeof payload.eventVersion === "string" &&
		payload.context &&
		typeof payload.context === "object"
	);
}

/**
 * Hub 2のWebhookペイロードの構造的検証
 *
 * 責任：データの存在と型チェックのみ
 * ビジネスルールの検証はDomain Layerで実施
 */
export function validateHub2WebhookStructure(event: Hub2WebhookEvent): boolean {
	const { context } = event;

	return (
		// 🔍 構造的検証のみ：型と存在チェック
		typeof context.deviceMac === "string" &&
		context.deviceMac.length > 0 &&
		typeof context.temperature === "number" &&
		typeof context.humidity === "number" &&
		typeof context.lightLevel === "number" &&
		context.lightLevel >= 1 && // SwitchBot仕様の最小値
		context.lightLevel <= 20 && // SwitchBot仕様の最大値
		context.scale === "CELSIUS" &&
		typeof context.timeOfSample === "number" &&
		context.timeOfSample > 0
	);
}

/**
 * Plug MiniのWebhookペイロードの構造的検証
 */
export function validatePlugMiniWebhookStructure(
	event: PlugMiniWebhookEvent,
): boolean {
	const { context } = event;

	return (
		typeof context.deviceMac === "string" &&
		context.deviceMac.length > 0 &&
		(context.powerState === "ON" || context.powerState === "OFF") &&
		typeof context.timeOfSample === "number" &&
		context.timeOfSample > 0
	);
}
