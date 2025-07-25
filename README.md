# sleep-smart-air-conditioner: AIを活用した快適睡眠サポートエアコン自動調整システム

## 概要

`SleepWise` は、AWSサーバーレスアーキテクチャと機械学習 (ML) を活用し、快適な睡眠環境を自動で最適化するシステムです。SwitchBot Hub 2からの環境データ（温度、湿度、照度）とSwitchBot Plug Miniからの電力消費量をリアルタイムで収集。これらのデータとユーザーが入力する睡眠の質、さらに外部の睡眠データ（AutoSleep/Health Auto Export）を組み合わせ、機械学習モデルが最適なエアコン設定を導き出します。

このプロジェクトは、単なるスマートホーム化に留まらず、以下のスキルセットを実践的に習得するための学習機会と位置づけています。

* **クラウドネイティブ開発** (AWSサーバーレス)
* **機械学習/AI** (データ収集、モデル構築、推論、MLOps)
* **IoTデバイス連携** (Raspberry Pi, SwitchBot API)
* **フロントエンド開発** (Next.js/React/TypeScript)
* **インフラストラクチャ・アズ・コード (IaC)**
* **CI/CDパイプライン構築**
* **テスト駆動開発 (TDD) / ドメイン駆動設計 (DDD)** (将来的な導入目標)
* **コンテナ技術** (Docker, Kubernetes)

## プロジェクトの目的と提供価値

* **快適な睡眠環境の実現:** 個人の睡眠の質を最大化するエアコン設定を自動調整します。
* **省エネルギー化:** 電力消費データを学習に含めることで、快適性を維持しつつ無駄な電力消費を抑制します。
* **実践的な技術スキル習得:** EVバッテリー劣化抑制プロジェクトで必要となる機械学習、クラウド、データ活用などのスキルを本プロジェクトを通じて実践的に習得します。

## アーキテクチャ概要

`SleepWise` システムは、以下の主要コンポーネントで構成されるサーバーレスアーキテクチャを採用しています。

* **デバイス層:** Raspberry Pi、SwitchBot Hub 2、SwitchBot Plug Mini
* **データ収集層:** AWS IoT Core
* **データストア層:** AWS DynamoDB, AWS S3
* **バックエンド層:** AWS Lambda, AWS API Gateway
* **フロントエンド層:** Next.js (AWS Amplify/S3 + CloudFrontでホスティング)
* **機械学習層:** AWS SageMaker Studio Lab (開発), AWS Lambda (推論)

より詳細なアーキテクチャ図は [docs/architecture.md](docs/architecture.md) を参照してください。

## 要件（MVPと将来）

本プロジェクトのMVP（Minimum Viable Product）と、その後の拡張要件については [docs/requirements.md](docs/requirements.md) に詳細を記述しています。

## ロードマップ

プロジェクトはスクラム開発のアプローチを採用し、MVPを明確に定めて段階的に機能を拡張していきます。各フェーズの目標とタスクについては [docs/roadmap.md](docs/roadmap.md) を参照してください。

## セットアップと開発環境

開発環境のセットアップ方法、各コンポーネントの起動手順については、[docs/development_setup.md](docs/development_setup.md) を参照してください。

## スキルアップ要素

このプロジェクトを通じて習得を目指す具体的なスキルアップ要素については [docs/skill_development.md](docs/skill_development.md) にまとめています。

## ライセンス

[TODO: プロジェクトのライセンスを記載]

## 貢献

貢献は大歓迎です！Issue の作成やプルリクエストの送信については、[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

---
