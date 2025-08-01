#!/usr/bin/env node

import crypto from "node:crypto";
import { config } from "dotenv";

// ✅ .envファイルを読み込み
config();

// 環境変数から認証情報を取得
const SWITCHBOT_TOKEN = process.env.SWITCHBOT_TOKEN_DEV;
const SWITCHBOT_SECRET = process.env.SWITCHBOT_SECRET_DEV;

if (!SWITCHBOT_TOKEN || !SWITCHBOT_SECRET) {
	console.error("❌ 環境変数 SWITCHBOT_TOKEN と SWITCHBOT_SECRET が必要です");
	process.exit(1);
}

// SwitchBot API認証署名生成
function generateSignature(token, timestamp, nonce, secret) {
	const data = token + timestamp + nonce;
	return crypto
		.createHmac("sha256", secret)
		.update(data)
		.digest("base64")
		.toUpperCase();
}

// Webhook設定実行
async function setupWebhook() {
	const timestamp = Date.now().toString();
	const nonce = crypto.randomUUID();
	const signature = generateSignature(
		SWITCHBOT_TOKEN,
		timestamp,
		nonce,
		SWITCHBOT_SECRET,
	);

	const webhookUrl =
		"https://ydefx7iy83.execute-api.ap-northeast-1.amazonaws.com/dev/webhook/switchbot";

	const requestOptions = {
		method: "POST",
		headers: {
			Authorization: SWITCHBOT_TOKEN,
			"Content-Type": "application/json",
			sign: signature,
			t: timestamp,
			nonce: nonce,
		},
		body: JSON.stringify({
			action: "setupWebhook",
			url: webhookUrl,
			deviceList: "ALL",
			enable: true,
			enableSecurity: true, // ← この行を追加
		}),
	};

	console.log("🚀 SwitchBot Webhook設定中...");
	console.log(`📡 Webhook URL: ${webhookUrl}`);
	console.log(`🔐 Authorization: ${SWITCHBOT_TOKEN.substring(0, 10)}...`);
	console.log(`✏️ Signature: ${signature.substring(0, 20)}...`);

	try {
		const response = await fetch(
			"https://api.switch-bot.com/v1.1/webhook/setupWebhook",
			requestOptions,
		);
		const result = await response.json();

		if (response.ok) {
			console.log("✅ Webhook設定完了！");
			console.log("📊 レスポンス:", result);
		} else {
			console.error("❌ Webhook設定失敗");
			console.error("📊 エラー詳細:", result);
		}
	} catch (error) {
		console.error("❌ API呼び出しエラー:", error.message);
	}
}

// 実行
setupWebhook();
