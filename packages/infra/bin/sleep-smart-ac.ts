#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DataStack } from "../lib/stacks/data-stack.js";

const app = new cdk.App();
new DataStack(app, "InfraStack"); // env を削除（自動検出される）
