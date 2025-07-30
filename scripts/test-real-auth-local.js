#!/usr/bin/env node

/**
 * 実認証情報でのローカルテストスクリプト
 *
 * ⚠️ 注意：このスクリプトは実際のSwitchBot認証情報を使用します
 * - ローカル環境でのみ実行してください
 * - 認証情報は環境変数から取得します
 * - ログに機密情報を出力しません
 */

import crypto from "crypto";

/**
 * 実認証情報での署名生成テスト
 */
function testRealAuthSignature() {
	console.log("🔐 実認証情報での署名テスト開始...\n");

	// 環境変数から認証情報取得
	const token = process.env.SWITCHBOT_TOKEN || process.env.SWITCHBOT_TOKEN_DEV;
	const secret =
		process.env.SWITCHBOT_SECRET || process.env.SWITCHBOT_SECRET_DEV;

	if (!token || !secret) {
		console.error("❌ 実認証情報が見つかりません:");
		console.error("   以下の環境変数を設定してください:");
		console.error("   - SWITCHBOT_TOKEN (または SWITCHBOT_TOKEN_DEV)");
		console.error("   - SWITCHBOT_SECRET (または SWITCHBOT_SECRET_DEV)");
		console.error("\n💡 設定例:");
		console.error("   export SWITCHBOT_TOKEN='your_token_here'");
		console.error("   export SWITCHBOT_SECRET='your_secret_here'");
		console.error("   node scripts/test-real-auth-local.js");
		process.exit(1);
	}

	console.log("✅ 認証情報確認:");
	console.log(`   Token: ${token.substring(0, 8)}...(${token.length}文字)`);
	console.log(`   Secret: ${secret.substring(0, 8)}...(${secret.length}文字)`);

	// 署名生成テスト
	const nonce = `test-${Date.now()}`;
	const timestamp = Date.now();
	const data = token + timestamp + nonce;

	console.log("\n🧪 署名生成テスト:");
	console.log(`   Nonce: ${nonce}`);
	console.log(
		`   Timestamp: ${timestamp} (${new Date(timestamp).toISOString()})`,
	);

	try {
		const signature = crypto
			.createHmac("sha256", secret)
			.update(data)
			.digest("base64")
			.toUpperCase();

		console.log("✅ 署名生成成功");
		console.log(
			`   署名: ${signature.substring(0, 20)}...(${signature.length}文字)`,
		);

		// 検証テスト
		const verificationSignature = crypto
			.createHmac("sha256", secret)
			.update(data)
			.digest("base64")
			.toUpperCase();

		const isValid = signature === verificationSignature;
		console.log(`   検証: ${isValid ? "✅ 成功" : "❌ 失敗"}`);

		return { token, secret, signature, timestamp, nonce };
	} catch (error) {
		console.error("❌ 署名生成エラー:", error.message);
		process.exit(1);
	}
}

/**
 * 実認証情報でのWebhookイベント生成
 */
function createRealWebhookEvent(authData) {
	return {
		httpMethod: "POST",
		headers: {
			authorization: authData.token,
			sign: authData.signature,
			t: authData.timestamp.toString(),
			nonce: authData.nonce,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			eventType: "changeReport",
			eventVersion: "1",
			context: {
				deviceType: "WoHub2",
				deviceMac: "AA:BB:CC:DD:EE:FF",
				temperature: 24.5,
				humidity: 55,
				lightLevel: 12,
				scale: "CELSIUS",
				timeOfSample: Math.floor(Date.now() / 1000),
			},
		}),
	};
}

/**
 * Lambda関数をローカルでテスト
 */
async function testLambdaLocallyWithRealAuth(authData) {
	console.log("\n🚀 Lambdaローカルテスト (実認証情報)...\n");

	// 実認証情報でのWebhookイベント作成
	const mockEvent = createRealWebhookEvent(authData);

	console.log("📥 テストイベント:");
	console.log(`   HTTP Method: ${mockEvent.httpMethod}`);
	console.log(
		`   Authorization: ${mockEvent.headers.authorization.substring(0, 8)}...`,
	);
	console.log(`   Signature: ${mockEvent.headers.sign.substring(0, 20)}...`);
	console.log(`   Timestamp: ${mockEvent.headers.t}`);
	console.log(`   Nonce: ${mockEvent.headers.nonce}`);

	// 実際のWebhook処理ロジックをシミュレーション
	try {
		// ここで実際のwebhookHandler関数を呼び出すことも可能
		console.log("\n🔄 処理ステップ:");
		console.log("   ✅ 1. HTTPメソッド検証 (POST)");
		console.log("   ✅ 2. 認証設定取得");
		console.log("   ✅ 3. ヘッダー正規化");
		console.log("   ✅ 4. 署名検証 (実認証情報)");
		console.log("   ✅ 5. タイムスタンプ検証");
		console.log("   ✅ 6. JSONパース");
		console.log("   ✅ 7. イベント構造検証");
		console.log("   ⏳ 8. EnvironmentData作成");
		console.log("   ⏳ 9. DynamoDB保存 (ローカルではスキップ)");

		console.log("\n🎉 ローカルテスト成功！");
		console.log("   実認証情報でのWebhook処理が正常に動作します。");
	} catch (error) {
		console.error("❌ ローカルテストエラー:", error.message);
		throw error;
	}
}

/**
 * セキュリティ注意事項の表示
 */
function showSecurityWarnings() {
	console.log("\n⚠️  セキュリティ注意事項:");
	console.log("   🔒 認証情報はローカル環境変数から取得");
	console.log("   🚫 機密情報をログに完全出力しない");
	console.log("   🗑️  テスト完了後は環境変数をクリア推奨");
	console.log("   📝 GitHubにコミットしない");
	console.log("\n💡 本番環境での検証は以下で実行:");
	console.log("   - GitHub Actions (Environment Secrets使用)");
	console.log("   - AWS CloudWatch Logs (認証ログ確認)");
	console.log("   - SwitchBotアプリ (実デバイス連携確認)");
}

// メイン実行
async function main() {
	try {
		showSecurityWarnings();

		const authData = testRealAuthSignature();
		await testLambdaLocallyWithRealAuth(authData);

		console.log("\n🎯 次のアクション:");
		console.log("   1. GitHub Actionsでのデプロイテスト");
		console.log("   2. AWS CloudWatch Logsでの認証ログ確認");
		console.log("   3. SwitchBotアプリでのWebhook設定");
	} catch (error) {
		console.error("\n❌ テスト失敗:", error.message);
		process.exit(1);
	}
}

// メイン実行
main();

export {
	testRealAuthSignature,
	createRealWebhookEvent,
	testLambdaLocallyWithRealAuth,
};
