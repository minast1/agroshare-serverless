import { Injectable, Logger } from '@nestjs/common';
import { PreSignUpTriggerEvent } from 'aws-lambda';

@Injectable()
export class PreSignUpService {
  private readonly logger = new Logger(PreSignUpService.name);
  constructor() {}

  handlePreSignUp(event: PreSignUpTriggerEvent) {
    if (event.triggerSource === 'PreSignUp_ExternalProvider') {
      this.logger.log('External Provider Sign Up: ', event);
      event.response.autoVerifyEmail = true;
      event.response.autoConfirmUser = true;
    }

    return event;
  }
}
