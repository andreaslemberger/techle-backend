import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, HttpMethod, CorsHttpMethod, DomainName } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TechleStackProps extends StackProps {
  hostedZoneId: string;
  domainName: string;
  apiSubdomain: string;
}

export class TechleStack extends Stack {
  constructor(scope: Construct, id: string, props: TechleStackProps) {
    super(scope, id, props);

    const fullDomain = `${props.apiSubdomain}.${props.domainName}`;

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    const certificate = new Certificate(this, "Certificate", {
      domainName: fullDomain,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    const customDomain = new DomainName(this, "DomainName", {
      domainName: fullDomain,
      certificate,
    });

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
      defaultDomainMapping: {
        domainName: customDomain,
      },
    });

    httpApi.addRoutes({
      path: "/daily-word",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("DailyWordIntegration", dailyWordFn),
    });

    new ARecord(this, "ApiAliasRecord", {
      zone: hostedZone,
      recordName: props.apiSubdomain,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          customDomain.regionalDomainName,
          customDomain.regionalHostedZoneId,
        ),
      ),
    });

    new CfnOutput(this, "ApiUrl", {
      value: `https://${fullDomain}`,
      description: "URL of the Techle API",
    });
  }
}
