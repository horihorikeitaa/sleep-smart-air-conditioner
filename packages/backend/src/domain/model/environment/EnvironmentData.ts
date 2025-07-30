/**
 * 環境データを表すドメインモデル
 * ビジネスルール：
 * - 温度: -50°C ～ 60°C
 * - 湿度: 0% ～ 100%
 * - 照度: 0% ～ 100%
 */
export class EnvironmentData {
	constructor(
		public readonly deviceId: string,
		public readonly timestamp: Date,
		public readonly temperature: number,
		public readonly humidity: number,
		public readonly brightness: number,
	) {
		this.validateTemperature(temperature);
		this.validateHumidity(humidity);
		this.validateBrightness(brightness);
	}

	/**
	 * 温度の妥当性検証
	 */
	private validateTemperature(temperature: number): void {
		if (temperature < -50 || temperature > 60) {
			throw new Error("Temperature must be between -50 and 60 degrees");
		}
	}

	/**
	 * 湿度の妥当性検証
	 */
	private validateHumidity(humidity: number): void {
		if (humidity < 0 || humidity > 100) {
			throw new Error("Humidity must be between 0 and 100 percent");
		}
	}

	/**
	 * 照度の妥当性検証
	 */
	private validateBrightness(brightness: number): void {
		if (brightness < 0 || brightness > 100) {
			throw new Error("Brightness must be between 0 and 100 percent");
		}
	}

	/**
	 * SwitchBot Hub2の照度レベル（1-20）を明度パーセント（0-100）に変換
	 *
	 * @param lightLevel - SwitchBotの照度レベル（1-20）
	 * @returns 明度パーセント（0-100）
	 */
	static convertLightLevelToBrightness(lightLevel: number): number {
		if (lightLevel < 1 || lightLevel > 20) {
			throw new Error("SwitchBot lightLevel must be between 1 and 20");
		}

		// 1-20 を 0-100 に線形変換
		// lightLevel 1 → 0%, lightLevel 20 → 100%
		return ((lightLevel - 1) / 19) * 100;
	}

	/**
	 * DynamoDB用のアイテム形式に変換
	 */
	toDynamoItem(): Record<string, any> {
		return {
			deviceId: this.deviceId,
			timestamp: this.timestamp.toISOString(),
			temperature: this.temperature,
			humidity: this.humidity,
			brightness: this.brightness,
			createdAt: new Date().toISOString(),
		};
	}
}
