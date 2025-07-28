import { RemovalPolicy } from 'aws-cdk-lib';

export interface EnvironmentConfig {
  // 環境情報
  environment: 'dev' | 'prod';
  projectName: string;
  
  // DynamoDB設定
  dynamodb: {
    removalPolicy: RemovalPolicy;
    pointInTimeRecovery: boolean;
    deletionProtection: boolean;
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
  };
  
  // Lambda設定（将来用）
  lambda: {
    timeout: number;        // 秒
    memorySize: number;     // MB
    logRetention: number;   // 日
  };
  
  // 監視・アラート設定
  monitoring: {
    enabled: boolean;
    detailedMetrics: boolean;
  };
}