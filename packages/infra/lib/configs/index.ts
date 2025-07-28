import { devConfig } from './dev.js';
import { prodConfig } from './prod.js';
import type { EnvironmentConfig } from './types.js';

export function getConfig(): EnvironmentConfig {
  // 環境変数またはCDKコンテキストから判定
  const environment = process.env['CDK_ENV'] || 
                     process.env['NODE_ENV'] || 
                     'dev';
  
  console.log(`🌍 Environment: ${environment}`);
  
  switch (environment) {
    case 'prod':
    case 'production':
      return prodConfig;
    case 'dev':
    case 'development':
    default:
      return devConfig;
  }
}

export * from './types.js';