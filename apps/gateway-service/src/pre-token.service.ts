import { Injectable, Logger } from '@nestjs/common';
import { PreTokenGenerationTriggerEvent } from 'aws-lambda';

@Injectable()
export class PreTokenGenerationService {
  private readonly logger = new Logger(PreTokenGenerationService.name);
  constructor() {}

  handlePreTokenGeneration(event: PreTokenGenerationTriggerEvent) {
    this.logger.log('PreTokenGeneration Trigger: ', event);
    const userAttributes = event.request.userAttributes || {};
    const tenantId = userAttributes['custom:tenant_id'] || 'unknown';
    const tenantType = userAttributes['custom:tenant_type'] || 'unknown';
    const role = userAttributes['custom:role'] || 'basic';
    event.response = {
      claimsOverrideDetails: {
        claimsToAddOrOverride: {
          tenant_id: tenantId,
          tenant_type: tenantType,
          role: role,
        },
      },
    };
    return event;
  }
}
