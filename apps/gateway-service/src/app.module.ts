import { Module } from '@nestjs/common';
import { AuthChallengeService } from './auth-challenge.service';
import { CognitoCustomMessageService } from './custom-message.service';
import { PreTokenGenerationService } from './pre-token.service';
import { PostConfirmationService } from './post-confirmation.service';
import { PreSignUpService } from './pre-signup.service';
import { ResendModule } from 'nestjs-resend';

@Module({
  imports: [
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY!,
    }),
  ],
  providers: [
    AuthChallengeService,
    CognitoCustomMessageService,
    PreTokenGenerationService,
    PostConfirmationService,
    PreSignUpService,
  ],
})
export class AppModule {}
