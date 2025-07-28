import { RemovalPolicy } from 'aws-cdk-lib';
import type { EnvironmentConfig } from './types.js';

export const devConfig: EnvironmentConfig = {
  environment: 'dev',
  projectName: 'sleep-smart-ac-dev',
  
  // 開発環境：コスト重視、削除OK
  dynamodb: {
    removalPolicy: RemovalPolicy.DESTROY,
    pointInTimeRecovery: false,         // バックアップなし
    deletionProtection: false,          // 削除保護なし
    billingMode: 'PAY_PER_REQUEST',     // オンデマンド
  },
  
  // 開発環境：最小リソース
  lambda: {
    timeout: 30,                        // 30秒
    memorySize: 256,                    // 256MB
    logRetention: 7,                    // 1週間
  },
  
  // 開発環境：監視最小限
  monitoring: {
    enabled: false,                     // CloudWatch詳細監視OFF
    detailedMetrics: false,
  },
};