/**
 * Sleep Smart Air Conditioner - Backend
 * メインエントリーポイント
 */

// 簡単な関数で動作確認
export function greet(name: string): string {
	if (!name || name.trim() === "") {
		throw new Error("Name is required");
	}
	return `Hello, ${name}! Welcome to Sleep Smart AC!`;
}

// 環境データの型定義（将来のSwitchBot連携用）
export interface EnvironmentData {
	deviceId: string;
	timestamp: string;
	temperature: number;
	humidity: number;
	brightness: number;
}

// 設定値の検証
export function validateEnvironmentData(data: EnvironmentData): boolean {
	return (
		data.temperature >= -50 &&
		data.temperature <= 60 &&
		data.humidity >= 0 &&
		data.humidity <= 100 &&
		data.brightness >= 0 &&
		data.brightness <= 100
	);
}

console.log("Backend module loaded successfully");
