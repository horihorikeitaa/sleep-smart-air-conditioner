export class EnvironmentRepository {
	async save(data: any): Promise<void> {
		// テスト環境ではDynamoDBへの実際の保存をスキップ
		console.log("Mock: Saving data to DynamoDB:", data);
		return Promise.resolve();
	}

	async findById(id: string): Promise<any> {
		// テスト環境では固定データを返す
		return Promise.resolve({
			id,
			timestamp: Date.now(),
			temperature: 25.0,
			humidity: 60,
		});
	}
}
