import { EnvironmentData } from "../../../../src/domain/model/environment/EnvironmentData";

describe("EnvironmentData", () => {
	describe("正常なデータの場合", () => {
		it("温度、湿度、照度を正しく保持できる", () => {
			// Given: 正常な環境データ
			const temperature = 25.5;
			const humidity = 60;
			const brightness = 80;
			const timestamp = new Date("2024-01-01T12:00:00Z");
			const deviceId = "switchbot-hub-001";

			// When: EnvironmentDataオブジェクトを作成
			const environmentData = new EnvironmentData(
				deviceId,
				timestamp,
				temperature,
				humidity,
				brightness,
			);

			// Then: 値が正しく設定されている
			expect(environmentData.deviceId).toBe(deviceId);
			expect(environmentData.timestamp).toEqual(timestamp);
			expect(environmentData.temperature).toBe(temperature);
			expect(environmentData.humidity).toBe(humidity);
			expect(environmentData.brightness).toBe(brightness);
		});
	});

	describe("異常なデータの場合", () => {
		it("温度が範囲外の場合はエラーを投げる", () => {
			expect(() => {
				new EnvironmentData(
					"device-001",
					new Date(),
					-100, // 異常な温度
					50,
					80,
				);
			}).toThrow("Temperature must be between -50 and 60 degrees");
		});

		it("湿度が範囲外の場合はエラーを投げる", () => {
			expect(() => {
				new EnvironmentData(
					"device-001",
					new Date(),
					25,
					150, // 異常な湿度
					80,
				);
			}).toThrow("Humidity must be between 0 and 100 percent");
		});

		it("照度が範囲外の場合はエラーを投げる", () => {
			expect(() => {
				new EnvironmentData(
					"device-001",
					new Date(),
					25,
					50,
					-10, // 異常な照度
				);
			}).toThrow("Brightness must be between 0 and 100 percent");
		});
	});

	describe("DynamoDB用の変換", () => {
		it("DynamoDBのアイテム形式に変換できる", () => {
			// Given
			const environmentData = new EnvironmentData(
				"device-001",
				new Date("2024-01-01T12:00:00Z"),
				25.5,
				60,
				80,
			);

			// When
			const dynamoItem = environmentData.toDynamoItem();

			// Then
			expect(dynamoItem).toEqual({
				deviceId: "device-001",
				timestamp: "2024-01-01T12:00:00.000Z",
				temperature: 25.5,
				humidity: 60,
				brightness: 80,
				createdAt: expect.any(String),
			});
		});
	});
});
