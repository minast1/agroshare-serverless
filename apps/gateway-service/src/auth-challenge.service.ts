import { Injectable, Logger } from '@nestjs/common';
//import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { ResendService } from 'nestjs-resend';

@Injectable()
export class AuthChallengeService {
  private readonly logger = new Logger(AuthChallengeService.name);
  constructor(private readonly resend: ResendService) {}

  handleDefineAuthChallenge(event: DefineAuthChallengeTriggerEvent) {
    this.logger.log('Auth Define Trigger: ' + JSON.stringify(event, null, 2));
    const session = event.request.session;
    // Step A: If the user just started logging in, issue the email OTP challenge
    if (session.length === 0) {
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
    // Step B: If they submitted an OTP and passed verification, issue final JWT tokens
    else if (
      session.length === 1 &&
      session[0].challengeName === 'CUSTOM_CHALLENGE' &&
      session[0].challengeResult === true
    ) {
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    }
    return event;
  }

  async handleCreateAuth(event: CreateAuthChallengeTriggerEvent) {
    this.logger.log('Auth Create Trigger: ' + JSON.stringify(event, null, 2));
    if (event.request.challengeName === 'CUSTOM_CHALLENGE') {
      try {
        // Generate a secure, pseudo-random 6-digit OTP code string
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Save this OTP inside Cognito's metadata so the "Verify" Lambda can check it later
        console.log(`\n======================================================`);
        console.log(
          `[LOCAL DEV OTP] TARGET: ${event.request.userAttributes.email}`,
        );
        console.log(`[LOCAL DEV OTP] YOUR 6-DIGIT SIGN-IN PIN IS: ${otpCode}`);
        console.log(`======================================================\n`);
        event.response.privateChallengeParameters = { secretOTP: otpCode };

        // 3. Inject it into the public parameter payload so your custom message template can read it
        event.response.publicChallengeParameters = {
          email: event.request.userAttributes.email,
        };
        await this.sendOTPEmail(event.request.userAttributes.email, otpCode);
        return event;
      } catch (error) {
        throw new Error(
          (error as Error).message || 'Error Creating auth challenge',
        );
      }
    }
    return event;
  }

  handleVerifyAuthChallenge(event: VerifyAuthChallengeResponseTriggerEvent) {
    this.logger.log('Auth Verify Trigger: ' + JSON.stringify(event, null, 2));
    const expectedCode = event.request.privateChallengeParameters.secretOTP;
    const userSuppliedCode = event.request.challengeAnswer;
    event.response.answerCorrect = expectedCode === userSuppliedCode;
    return event;
  }

  private async sendOTPEmail(email: string, otpCode: string) {
    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Your 6-digit access code is: <strong>${otpCode}</strong></p>`,
      });
    } catch (error: unknown) {
      this.logger.error((error as Error).message || 'Error sending OTP email');
      this.logger.error(`[RESEND API FAILURE]: ${(error as Error).message}`);

      console.log(`\n======================================================`);
      console.log(
        `[FALLBACK LOG] RESEND FAILED. YOUR LOGIN PIN IS: ${otpCode}`,
      );
      console.log(`======================================================\n`);
    }
  }
}
