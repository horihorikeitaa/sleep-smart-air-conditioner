import { devConfig } from "./dev.js";
import { prodConfig } from "./prod.js";
import type { EnvironmentConfig } from "./types.js";

export function getConfig(): EnvironmentConfig {
	// CDK_ENVを優先、フォールバックでNODE_ENVを変換
	const env =
		process.env.CDK_ENV ||
		(process.env.NODE_ENV === "production" ? "prod" : "dev");

	if (env === "prod") {
		return prodConfig;
	}

	return devConfig; // dev またはその他
}

export * from "./types.js";
