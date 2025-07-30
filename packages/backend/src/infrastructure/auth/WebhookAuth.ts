import { createHmac } from "crypto";

/**
 * SwitchBot Webhook認証モジュール
 *
 * SwitchBot APIのWebhook認証を処理します。
 * 公式ドキュメント準拠の HMAC-SHA256 署名検証を実装。
 *
 * 中学生向け説明：
 * - Webhookが本当にSwitchBotから来たかを確認する仕組み
 * - 偽の通知を防ぐためのセキュリティ機能
 *
 * プロレベルのポイント：
 * - タイミング攻撃対応
 * - 定数時間比較でセキュリティ確保
 * - 詳細なエラーログで運用時のデバッグ支援
 */

/**
 * SwitchBot Webhook認証に必要なヘッダー
 */
export interface WebhookHeaders {
	authorization?: string | undefined; // SwitchBot token
	sign?: string | undefined; // HMAC-SHA256 signature
	t?: string | undefined; // timestamp
	nonce?: string | undefined; // random UUID
}

/**
 * 認証設定
 */
export interface AuthConfig {
	token: string; // SwitchBot Open Token
	secret: string; // SwitchBot Secret Key
}

/**
 * SwitchBot Webhook署名を検証
 *
 * アルゴリズム：
 * 1. data = token + timestamp + nonce
 * 2. signature = HMAC-SHA256(data, secret)
 * 3. base64エンコード後、大文字変換
 *
 * @param headers - APIリクエストヘッダー
 * @param config - SwitchBot認証設定
 * @returns 認証成功の場合true
 */
export function verifyWebhookSignature(
	headers: WebhookHeaders,
	config: AuthConfig,
): boolean {
	try {
		// 必須ヘッダーの存在確認
		const { authorization, sign, t, nonce } = headers;

		if (!authorization || !sign || !t || !nonce) {
			console.warn("Missing required webhook headers:", {
				hasAuth: !!authorization,
				hasSign: !!sign,
				hasTimestamp: !!t,
				hasNonce: !!nonce,
			});
			return false;
		}

		// トークン一致確認
		if (authorization !== config.token) {
			console.warn("Token mismatch in webhook request");
			return false;
		}

		// タイムスタンプ形式確認
		const timestamp = parseInt(t);
		if (isNaN(timestamp) || timestamp <= 0) {
			console.warn("Invalid timestamp format:", t);
			return false;
		}

		// 署名生成
		const data = authorization + t + nonce;
		const expectedSignature = createHmac("sha256", config.secret)
			.update(data)
			.digest("base64")
			.toUpperCase();

		// 定数時間比較でタイミング攻撃を防止
		const isValid = timingSafeEqual(
			Buffer.from(sign),
			Buffer.from(expectedSignature),
		);

		if (!isValid) {
			console.warn("Webhook signature verification failed", {
				received: sign.substring(0, 10) + "...",
				expected: expectedSignature.substring(0, 10) + "...",
			});
		}

		return isValid;
	} catch (error) {
		console.error("Error during webhook signature verification:", error);
		return false;
	}
}

/**
 * タイムスタンプの妥当性をチェック
 *
 * リプレイ攻撃を防ぐため、古すぎるタイムスタンプは拒否
 *
 * @param timestamp - Unix timestamp (milliseconds)
 * @param toleranceMs - 許容誤差（ミリ秒）デフォルト5分
 * @returns タイムスタンプが有効な場合true
 */
export function validateTimestamp(
	timestamp: number,
	toleranceMs: number = 5 * 60 * 1000, // 5分
): boolean {
	const now = Date.now();
	const diff = Math.abs(now - timestamp);

	if (diff > toleranceMs) {
		console.warn("Timestamp too old or too future:", {
			received: new Date(timestamp).toISOString(),
			current: new Date(now).toISOString(),
			diffMinutes: Math.round(diff / 60000),
		});
		return false;
	}

	return true;
}

/**
 * 定数時間でのバッファ比較
 * タイミング攻撃を防ぐため
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= (a[i] ?? 0) ^ (b[i] ?? 0);
	}

	return result === 0;
}

/**
 * 環境変数からSwitchBot認証設定を取得
 *
 * @returns AuthConfig | null - 設定が不完全な場合はnull
 */
export function getAuthConfig(): AuthConfig | null {
	const token = process.env.SWITCHBOT_TOKEN;
	const secret = process.env.SWITCHBOT_SECRET;

	if (!token || !secret) {
		console.error("Missing SwitchBot credentials in environment variables", {
			hasToken: !!token,
			hasSecret: !!secret,
		});
		return null;
	}

	return { token, secret };
}
