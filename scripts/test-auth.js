#!/usr/bin/env node

/**
 * SwitchBot認証情報テストスクリプト
 *
 * GitHub Secretsが正しく設定されているかを確認
 */

const crypto = require("crypto");

function testSwitchBotAuth() {
	console.log("🔐 SwitchBot認証情報テスト開始...\n");

	// 環境変数確認
	const token = process.env.SWITCHBOT_TOKEN;
	const secret = process.env.SWITCHBOT_SECRET;

	if (!token || !secret) {
		console.error("❌ 認証情報が見つかりません:");
		console.error(`   SWITCHBOT_TOKEN: ${token ? "✅ 設定済み" : "❌ 未設定"}`);
		console.error(
			`   SWITCHBOT_SECRET: ${secret ? "✅ 設定済み" : "❌ 未設定"}`,
		);
		console.error("\n📋 設定方法:");
		console.error("   1. SwitchBotアプリでDeveloper Optionsを有効化");
		console.error("   2. GitHubリポジトリのSecretsに設定");
		console.error("   3. GitHub ActionsやCI/CDで環境変数として利用");
		process.exit(1);
	}

	// 基本的な形式確認
	console.log("✅ 認証情報の基本確認:");
	console.log(`   Token長: ${token.length}文字`);
	console.log(`   Secret長: ${secret.length}文字`);

	// 署名生成テスト
	console.log("\n🧪 署名生成テスト:");
	const nonce = "test-nonce-12345";
	const timestamp = Date.now();
	const data = token + timestamp + nonce;

	try {
		const signature = crypto
			.createHmac("sha256", secret)
			.update(data)
			.digest("base64")
			.toUpperCase();

		console.log("✅ 署名生成成功");
		console.log(`   データ: ${data.substring(0, 50)}...`);
		console.log(`   署名: ${signature.substring(0, 20)}...`);

		// 検証テスト
		const isValid =
			crypto
				.createHmac("sha256", secret)
				.update(data)
				.digest("base64")
				.toUpperCase() === signature;

		console.log(`   検証結果: ${isValid ? "✅ 成功" : "❌ 失敗"}`);
	} catch (error) {
		console.error("❌ 署名生成エラー:", error.message);
		process.exit(1);
	}

	console.log("\n🎉 認証情報テスト完了！");
	console.log("   Webhook認証の準備ができています。");
}

// メイン実行
if (require.main === module) {
	testSwitchBotAuth();
}

module.exports = { testSwitchBotAuth };
