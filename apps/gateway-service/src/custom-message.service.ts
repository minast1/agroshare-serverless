import { Injectable, Logger } from '@nestjs/common';
import { CustomMessageTriggerEvent } from 'aws-lambda';

@Injectable()
export class CognitoCustomMessageService {
  private readonly logger = new Logger(CognitoCustomMessageService.name);
  constructor() {}

  handleCustomMessage(event: CustomMessageTriggerEvent) {
    const triggerSource = event.triggerSource;
    const code = event.request.codeParameter;

    if (triggerSource === 'CustomMessage_SignUp') {
      event.response.emailSubject = 'Welcome! Activate Your AgroShare Account';
      event.response.emailMessage = this.getSignUpTemplate(code);
    }

    if (triggerSource === 'CustomMessage_ForgotPassword') {
      event.response.emailSubject = 'Reset Your Password - AgroShare';
      event.response.emailMessage = this.getForgotPasswordTemplate(code);
    }

    if (triggerSource === 'CustomMessage_ResendCode') {
      console.log('Resend Code Trigger');
    }
    return event;
  }

  private getSignUpTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Thank you for registering!</h2>
        <p>Please use the verification code below to complete your registration:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${code}
        </div>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  }

  private getForgotPasswordTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the following temporary code:</p>
        <div style="background: #fff3cd; color: #856404; padding: 15px; font-size: 24px; font-weight: bold; text-align: center;">
          ${code}
        </div>
      </div>
    `;
  }
}
