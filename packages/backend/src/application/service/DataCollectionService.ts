import { createEnvironmentDataFromHub2Webhook } from "../../domain/model/environment/EnvironmentDataFactory.js";
import type { EnvironmentRepository } from "../../infrastructure/repository/EnvironmentRepository.js";
import type { Hub2WebhookEvent } from "../../interfaces/lambda/types.js";

/**
 * データ収集サービス
 * WebhookからDynamoDBへの統合処理
 */
export class DataCollectionService {
	constructor(private readonly environmentRepository: EnvironmentRepository) {}

	/**
	 * Hub 2のWebhookイベントを処理してDynamoDBに保存
	 */
	async processHub2Event(event: Hub2WebhookEvent): Promise<void> {
		console.log("Processing Hub 2 webhook event:", event.context);

		// ドメインモデルに変換
		const environmentData = createEnvironmentDataFromHub2Webhook(event);

		// DynamoDBに保存
		await this.environmentRepository.save(environmentData);

		console.log("Hub 2 event processed successfully");
	}
}
