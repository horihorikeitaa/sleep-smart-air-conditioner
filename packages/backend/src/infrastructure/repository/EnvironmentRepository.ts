import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { EnvironmentData } from "../../domain/model/environment/EnvironmentData.js";

/**
 * 環境データのDynamoDB Repository
 * 最小限の実装でAPI確認用
 */
export class EnvironmentRepository {
	private readonly docClient: DynamoDBDocumentClient;

	constructor(private readonly tableName: string) {
		const client = new DynamoDBClient({
			region: process.env.AWS_REGION || "ap-northeast-1",
		});
		this.docClient = DynamoDBDocumentClient.from(client);
	}

	/**
	 * 環境データをDynamoDBに保存
	 */
	async save(environmentData: EnvironmentData): Promise<void> {
		const item = environmentData.toDynamoItem();

		console.log("Saving environment data to DynamoDB:", item);

		try {
			await this.docClient.send(
				new PutCommand({
					TableName: this.tableName,
					Item: item,
				}),
			);

			console.log("Successfully saved environment data");
		} catch (error) {
			console.error("Failed to save environment data:", error);
			throw new Error(`Failed to save environment data: ${error}`);
		}
	}
}
