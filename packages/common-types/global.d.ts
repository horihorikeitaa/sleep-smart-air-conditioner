declare namespace NodeJS {
	interface ProcessEnv {
		CDK_ENV?: string;
		NODE_ENV?: string;
		// 他にも、モノレポ全体で共通で利用する環境変数を追加
	}
}
