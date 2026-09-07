import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor() {
    this.sesClient = new SESClient({ region: 'us-east-1' });
    this.fromEmail =
      process.env.FROM_EMAIL || 'Agroshare <no-reply@agroshare.gh>';
  }

  async sendApplicationEmail(
    to: string,
    templateType: string,
    data: any,
  ): Promise<void> {
    let subject = 'Agroshare Notification';
    let htmlContent = '';

    switch (templateType) {
      case 'WELCOME_EMAIL': {
        subject = `Welcome to Agroshare Ghana, ${data.name}`;
        htmlContent = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2e7d32;">Account Created Successfully</h2>
            <p>Hello ${data.name},</p>
            <p>Your platform profile is active. You can now log into your dashboard using your registered administrator credentials.</p>
            <br />
            <p>Best regards,<br/>The Agroshare Team</p>
          </div>`;
        break;
      }

      case 'TENANT_PROVISIONED': {
        subject = `New Tenant Activated: ${data.tenantName}`;
        htmlContent = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Tenant Activation Complete</h2>
            <p>The space for <strong>${data.tenantName}</strong> (ID: ${data.tenantId}) has been successfully provisioned on the cluster.</p>
          </div>`;
        break;
      }

      // case 'SUBSCRIPTION_REMINDER': {
      //   const { farm, daysRemaining } = data;
      //   subject = `Subscription Ending Soon`;
      //   htmlContent = `<h1>Subscription Reminder</h1>
      //                  <p>Your subscription for <strong>${farm.name}</strong> will end in <strong>${daysRemaining} days</strong>.</p>
      //                  <p>Please renew to continue enjoying our services.</p>`;
      //   break;
      // }

      // case 'SUBSCRIPTION_EXPIRED': {
      //   const { farm } = data;
      //   subject = `Subscription Expired`;
      //   htmlContent = `<h1>Subscription Expired</h1>
      //                  <p>Your subscription for <strong>${farm.name}</strong> has expired.</p>
      //                  <p>Please renew your subscription to regain access to premium features.</p>`;
      //   break;
      // }

      case 'PASSWORD_RESET': {
        subject = 'Reset Your Password';
        htmlContent = `<h1>Reset Password</h1>
                       <p>Click the link below to reset your password:</p>
                       <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
                       <p>If you did not request this, please ignore this email.</p>`;
        break;
      }

      default:
        this.logger.warn(`Unknown template type: ${templateType}`);
        return;
    }

    try {
      const params: SendEmailCommandInput = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: htmlContent,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: this.fromEmail,
      };

      await this.sesClient.send(new SendEmailCommand(params));
      this.logger.log(
        `Email sent successfully to ${to} using template ${templateType}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
