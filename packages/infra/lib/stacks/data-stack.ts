import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getConfig } from '../configs/index.js';

export class DataStack extends cdk.Stack {
  public readonly environmentTable: dynamodb.Table;
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // 設定を取得
    const config = getConfig();
    
    // 環境データテーブル
    this.environmentTable = new dynamodb.Table(this, 'EnvironmentData', {
      tableName: `${config.projectName}-environment-data`,  // プロジェクト名追加
      partitionKey: { 
        name: 'deviceId', 
        type: dynamodb.AttributeType.STRING 
      },
      sortKey: { 
        name: 'timestamp', 
        type: dynamodb.AttributeType.STRING 
      },
      // 設定ファイルから取得
      removalPolicy: config.dynamodb.removalPolicy,
      pointInTimeRecovery: config.dynamodb.pointInTimeRecovery,
      deletionProtection: config.dynamodb.deletionProtection,
      billingMode: config.dynamodb.billingMode === 'PAY_PER_REQUEST' 
        ? dynamodb.BillingMode.PAY_PER_REQUEST 
        : dynamodb.BillingMode.PROVISIONED,
    });
    
    // タグ追加（運用で重要）
    cdk.Tags.of(this.environmentTable).add('Environment', config.environment);
    cdk.Tags.of(this.environmentTable).add('Project', 'SleepSmartAC');
  }
}