import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CognitoCustomMessageService } from './custom-message.service';
import {
  CreateAuthChallengeTriggerEvent,
  CustomMessageTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PostConfirmationTriggerEvent,
  PreSignUpTriggerEvent,
  PreTokenGenerationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { AuthChallengeService } from './auth-challenge.service';
import { PreTokenGenerationService } from './pre-token.service';
import { PostConfirmationService } from './post-confirmation.service';
import { PreSignUpService } from './pre-signup.service';

type CognitoTriggerEvent =
  | CustomMessageTriggerEvent
  | DefineAuthChallengeTriggerEvent
  | CreateAuthChallengeTriggerEvent
  | VerifyAuthChallengeResponseTriggerEvent
  | PreTokenGenerationTriggerEvent
  | PostConfirmationTriggerEvent
  | PreSignUpTriggerEvent;
let cachedAppContext: INestApplicationContext;

async function bootstrapContext(): Promise<INestApplicationContext> {
  if (!cachedAppContext) {
    cachedAppContext = await NestFactory.createApplicationContext(AppModule);
  }
  return cachedAppContext;
}

export const handler = async (
  event: CognitoTriggerEvent,
): Promise<CognitoTriggerEvent> => {
  const appContext = await bootstrapContext();
  const trigger = event.triggerSource;
  //Custom Message Trigger
  if (trigger.startsWith('CustomMessage_')) {
    const service = appContext.get(CognitoCustomMessageService);
    return service.handleCustomMessage(event as CustomMessageTriggerEvent);
  }

  if (trigger === 'DefineAuthChallenge_Authentication') {
    const service = appContext.get(AuthChallengeService);
    return service.handleDefineAuthChallenge(event);
  }

  if (trigger === 'CreateAuthChallenge_Authentication') {
    const service = appContext.get(AuthChallengeService);
    return service.handleCreateAuth(event);
  }

  if (trigger === 'VerifyAuthChallengeResponse_Authentication') {
    const service = appContext.get(AuthChallengeService);
    return service.handleVerifyAuthChallenge(event);
  }
  if (trigger.startsWith('PreTokenGeneration_')) {
    const service = appContext.get(PreTokenGenerationService);
    return service.handlePreTokenGeneration(
      event as PreTokenGenerationTriggerEvent,
    );
  }

  if (trigger.startsWith('PostConfirmation_')) {
    const service = appContext.get(PostConfirmationService);
    return service.handlePostConfirmation(
      event as PostConfirmationTriggerEvent,
    );
  }

  if (trigger.startsWith('PreSignUp_')) {
    const service = appContext.get(PreSignUpService);
    return service.handlePreSignUp(event as PreSignUpTriggerEvent);
  }

  return event;
};
