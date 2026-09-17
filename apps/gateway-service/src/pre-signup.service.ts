import { Injectable, Logger } from '@nestjs/common';
import { PreSignUpTriggerEvent } from 'aws-lambda';

@Injectable()
export class PreSignUpService {
  private readonly logger = new Logger(PreSignUpService.name);
  constructor() { }

  handlePreSignUp(event: PreSignUpTriggerEvent) {
    const triggerSource = event.triggerSource as string;

    if (triggerSource === 'PreSignUp_SignUpWithExternalProvider') {
      this.logger.log(
        `Social Federation Account Detected via Provider Identity : ${event.request.validationData?.provider || 'Google'} `,
      );
      event.response.autoVerifyEmail = true;
      event.response.autoConfirmUser = true;

      const customStateStr = event.request.clientMetadata?.customState;
      if (customStateStr) {
        try {
          const parsedState = JSON.parse(customStateStr) as {
            tenant_id: string;
            role: string;
            tenant_type: string;
          };
          event.request.userAttributes['custom:tenant_id'] =
            parsedState.tenant_id;
          event.request.userAttributes['custom:role'] = parsedState.role;
          event.request.userAttributes['custom:tenant_type'] =
            parsedState.tenant_type;
        } catch (error) {
          this.logger.error(
            'Failed to parse incoming customState data fields metadata.',
            error,
          );
        }
      }
    }
    // if (triggerSource === 'PreSignUp_SignUp') {
    //   this.logger.log('Sign Up: ', event);
    //   event.response.autoConfirmUser = true;
    //   event.response.autoVerifyEmail = true;
    // }

    return event;
  }
}
