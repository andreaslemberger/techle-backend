import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TechleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dailyWordFn = new NodejsFunction(this, "DailyWordFunction", {
      entry: path.join(__dirname, "..", "lambda", "get-daily-word.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: Duration.seconds(10),
      bundling: {
        format: OutputFormat.ESM,
        mainFields: ["module", "main"],
        minify: true,
        sourceMap: false,
      },
      environment: {
        TZ: "Europe/Berlin",
      },
    });

    const httpApi = new HttpApi(this, "TechleApi", {
      apiName: "techle-api",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET],
        allowHeaders: ["Content-Type"],
        maxAge: Duration.hours(24),
      },
    });

    httpApi.addRoutes({
      path: "/daily-word",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "DailyWordIntegration",
        dailyWordFn,
      ),
    });

    new CfnOutput(this, "ApiUrl", {
      value: httpApi.url ?? "undefined",
      description: "URL of the Techle API",
    });
  }
}
