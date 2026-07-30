import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CognitoCustomMessageService } from './custom-message.service';
import {
  CreateAuthChallengeTriggerEvent,
  CustomMessageTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PostAuthenticationTriggerEvent,
  PreTokenGenerationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { AuthChallengeService } from './auth-challenge.service';
import { PreTokenGenerationService } from './pre-token.service';
import { PostAuthService } from './post-auth.service';

type CognitoTriggerEvent =
  | CustomMessageTriggerEvent
  | DefineAuthChallengeTriggerEvent
  | CreateAuthChallengeTriggerEvent
  | VerifyAuthChallengeResponseTriggerEvent
  | PreTokenGenerationTriggerEvent
  | PostAuthenticationTriggerEvent;
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

  if (trigger.startsWith('PostAuthentication_')) {
    const service = appContext.get(PostAuthService);
    return service.handlePostAuth(event as PostAuthenticationTriggerEvent);
  }

  return event;
};
