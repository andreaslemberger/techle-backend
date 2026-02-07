import { App } from "aws-cdk-lib";
import { TechleStack } from "./techle-stack.js";

process.loadEnvFile();

const app = new App();

new TechleStack(app, "TechleStack", {
  env: {
    region: process.env.CDK_DEFAULT_REGION ?? "eu-central-1",
  },
  hostedZoneId: process.env.HOSTED_ZONE_ID!,
  domainName: process.env.DOMAIN_NAME!,
  apiSubdomain: process.env.API_SUBDOMAIN!,
});

app.synth();
