import { Module } from '@nestjs/common';
import { AuthChallengeService } from './auth-challenge.service';
import { CognitoCustomMessageService } from './custom-message.service';
import { ResendModule } from 'nestjs-resend';

@Module({
  imports: [
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY!,
    }),
  ],
  providers: [AuthChallengeService, CognitoCustomMessageService],
})
export class AppModule {}
