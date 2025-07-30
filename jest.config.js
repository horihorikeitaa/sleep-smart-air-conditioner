/** @type {import('jest').Config} */
export default {
	// プロジェクト設定（複数パッケージ対応）
	projects: [
		{
			displayName: "backend",
			testMatch: ["<rootDir>/packages/backend/__tests__/**/*.test.ts"],
			preset: "ts-jest/presets/default-esm",
			extensionsToTreatAsEsm: [".ts"],
			testEnvironment: "node",
			collectCoverageFrom: [
				"packages/backend/src/**/*.ts",
				"!packages/backend/src/**/*.d.ts",
			],
			coverageDirectory: "packages/backend/coverage",
			transform: {
				"^.+\\.ts$": [
					"ts-jest",
					{
						useESM: true,
						tsconfig: {
							esModuleInterop: true,
						},
					},
				],
			},
			moduleNameMapper: {
				"^(\\.{1,2}/.*)\\.js$": "$1",
			},
		},
		{
			displayName: "infra",
			testMatch: ["<rootDir>/packages/infra/**/*.test.ts"],
			preset: "ts-jest/presets/default-esm",
			extensionsToTreatAsEsm: [".ts"],
			testEnvironment: "node",
			collectCoverageFrom: [
				"packages/infra/lib/**/*.ts",
				"!packages/infra/lib/**/*.d.ts",
			],
			coverageDirectory: "packages/infra/coverage",
			transform: {
				"^.+\\.ts$": [
					"ts-jest",
					{
						useESM: true,
						tsconfig: {
							esModuleInterop: true,
						},
					},
				],
			},
			moduleNameMapper: {
				"^(\\.{1,2}/.*)\\.js$": "$1",
			},
		},
	],

	// 共通設定
	coverageReporters: ["text", "lcov", "html"],
};
