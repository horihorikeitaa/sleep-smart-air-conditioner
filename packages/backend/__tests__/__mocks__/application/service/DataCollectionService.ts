import type { Hub2WebhookEvent } from "../../../../src/interfaces/lambda/types.js";

export class DataCollectionService {
	// constructor(private environmentRepository: any) {}

	async processHub2Event(event: Hub2WebhookEvent): Promise<void> {
		// テスト環境ではビジネスロジックをスキップ
		console.log("Mock: Processing Hub2 event:", {
			deviceType: event.context.deviceType,
			deviceMac: event.context.deviceMac,
			temperature: event.context.temperature,
		});
		return Promise.resolve();
	}
}
