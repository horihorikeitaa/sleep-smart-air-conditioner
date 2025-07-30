import { EnvironmentData } from "../../../../src/domain/model/environment/EnvironmentData.js";
import { createEnvironmentDataFromHub2Webhook } from "../../../../src/domain/model/environment/EnvironmentDataFactory.js";
import type { Hub2WebhookEvent } from "../../../../src/interfaces/lambda/types.js";

describe("createEnvironmentDataFromHub2Webhook", () => {
	it("正常なHub2WebhookEventからEnvironmentDataを作成できる", () => {
		// Given
		const hub2Event: Hub2WebhookEvent = {
			eventType: "changeReport",
			eventVersion: "1",
			context: {
				deviceType: "WoHub2",
				deviceMac: "AA:BB:CC:DD:EE:FF",
				temperature: 25.5,
				humidity: 60,
				lightLevel: 10,
				scale: "CELSIUS",
				timeOfSample: 1640995200,
			},
		};

		// When
		const environmentData = createEnvironmentDataFromHub2Webhook(hub2Event);

		// Then
		expect(environmentData).toBeInstanceOf(EnvironmentData);
		expect(environmentData.deviceId).toBe("AA:BB:CC:DD:EE:FF");
		expect(environmentData.brightness).toBeCloseTo(47.37, 2);
	});
});
