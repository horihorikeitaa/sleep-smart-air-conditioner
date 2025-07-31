export interface WebhookHeaders {
	authorization?: string | undefined;
	sign?: string | undefined;
	t?: string | undefined;
	nonce?: string | undefined;
}

export interface AuthConfig {
	token: string;
	secret: string;
}

export function verifyWebhookSignature(
	_headers: WebhookHeaders,
	_config: AuthConfig,
): boolean {
	// テスト環境では常に認証成功
	return true;
}

export function validateTimestamp(
	_timestamp: number,
	_toleranceMs: number = 5 * 60 * 1000,
): boolean {
	// テスト環境では常にタイムスタンプ有効
	return true;
}

export function getAuthConfig(): AuthConfig | null {
	// テスト環境では固定の認証設定を返す
	return {
		token: "test-switchbot-token",
		secret: "test-switchbot-secret",
	};
}
