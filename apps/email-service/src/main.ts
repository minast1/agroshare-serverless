import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { SQSEvent, SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event: SQSEvent) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const emailService = appContext.get(AppService);

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body) as {
        to: string;
        templateType: string;
        data: any;
      };
      await emailService.sendApplicationEmail(
        payload.to,
        payload.templateType,
        payload.data,
      );
    } catch (error) {
      console.error(
        `Execution fault encountered inside message tracking block: ${record.messageId}`,
        error,
      );
      // Throwing inside the loop marks the batch item failed to prevent item deletion from SQS
      throw error;
    }
  }
};
