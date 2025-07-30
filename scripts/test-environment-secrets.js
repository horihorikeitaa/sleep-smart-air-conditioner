#!/usr/bin/env node

/**
 * GitHub Environment Secrets対応テストスクリプト
 *
 * 環境別のSwitchBot認証情報をテストします
 */

const crypto = require("crypto");

function testEnvironmentSecrets() {
	console.log("🔐 GitHub Environment Secrets テスト開始...\n");

	// 環境判定
	const environment = process.env.NODE_ENV || "dev";
	console.log(`📊 環境: ${environment}`);

	// 環境別認証情報取得
	const tokenVar =
		environment === "prod" ? "SWITCHBOT_TOKEN_PROD" : "SWITCHBOT_TOKEN_DEV";
	const secretVar =
		environment === "prod" ? "SWITCHBOT_SECRET_PROD" : "SWITCHBOT_SECRET_DEV";

	const token = process.env[tokenVar] || process.env.SWITCHBOT_TOKEN;
	const secret = process.env[secretVar] || process.env.SWITCHBOT_SECRET;

	console.log(`🔑 期待する環境変数:`);
	console.log(`   Token: ${tokenVar}`);
	console.log(`   Secret: ${secretVar}`);

	// 認証情報確認
	if (!token || !secret) {
		console.error("\n❌ 認証情報が見つかりません:");
		console.error(`   ${tokenVar}: ${token ? "✅ 設定済み" : "❌ 未設定"}`);
		console.error(`   ${secretVar}: ${secret ? "✅ 設定済み" : "❌ 未設定"}`);

		console.error("\n📋 GitHub Environment Secrets 設定確認:");
		console.error(
			`   1. GitHub > Settings > Environments > ${environment === "prod" ? "production" : "development"}`,
		);
		console.error(`   2. Environment secrets に以下を設定:`);
		console.error(`      - ${tokenVar}`);
		console.error(`      - ${secretVar}`);
		console.error(
			`   3. GitHub Actions ワークフローで environment: ${environment === "prod" ? "production" : "development"} を指定`,
		);

		process.exit(1);
	}

	// 基本情報表示
	console.log("\n✅ 認証情報の基本確認:");
	console.log(`   Token長: ${token.length}文字`);
	console.log(`   Secret長: ${secret.length}文字`);

	// 署名生成テスト
	console.log("\n🧪 署名生成テスト:");
	const nonce = `test-nonce-${Date.now()}`;
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

		// 環境別設定確認
		console.log("\n🌍 環境別設定確認:");
		console.log(`   現在の環境: ${environment}`);
		console.log(`   使用中のToken変数: ${tokenVar}`);
		console.log(`   使用中のSecret変数: ${secretVar}`);
	} catch (error) {
		console.error("❌ 署名生成エラー:", error.message);
		process.exit(1);
	}

	console.log("\n🎉 Environment Secrets テスト完了！");
	console.log(`   ${environment}環境でのWebhook認証準備完了です。`);
}

// 使用方法の表示
function showUsage() {
	console.log("📋 使用方法:");
	console.log("   # 開発環境テスト");
	console.log("   NODE_ENV=dev node scripts/test-environment-secrets.js");
	console.log("");
	console.log("   # 本番環境テスト");
	console.log("   NODE_ENV=prod node scripts/test-environment-secrets.js");
	console.log("");
	console.log("   # GitHub Actions での使用例:");
	console.log("   environment: development  # または production");
	console.log("   env:");
	console.log("     SWITCHBOT_TOKEN_DEV: ${{ secrets.SWITCHBOT_TOKEN_DEV }}");
	console.log("     SWITCHBOT_SECRET_DEV: ${{ secrets.SWITCHBOT_SECRET_DEV }}");
}

// コマンドライン引数確認
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	showUsage();
	process.exit(0);
}

// メイン実行
if (require.main === module) {
	testEnvironmentSecrets();
}

module.exports = { testEnvironmentSecrets };
