import { App } from "aws-cdk-lib";
import { TechleStack } from "./techle-stack.js";

const app = new App();

new TechleStack(app, "TechleStack", {
  env: {
    region: process.env.CDK_DEFAULT_REGION ?? "eu-central-1",
  },
});

app.synth();
