import { Injectable, Logger } from '@nestjs/common';
import { PreTokenGenerationAuthenticationV2TriggerEvent } from 'aws-lambda';

@Injectable()
export class PreTokenGenerationService {
  private readonly logger = new Logger(PreTokenGenerationService.name);
  constructor() {}

  handlePreTokenGeneration(
    event: PreTokenGenerationAuthenticationV2TriggerEvent,
  ) {
    this.logger.log('PreTokenGeneration Trigger: ', event);
    const userAttributes = event.request.userAttributes || {};
    const tenantId = userAttributes['custom:tenant_id'] || 'unknown';
    const tenantType = userAttributes['custom:tenant_type'] || 'unknown';
    const role = userAttributes['custom:role'] || 'basic';

    event.response = {
      claimsAndScopeOverrideDetails: {
        accessTokenGeneration: {
          // Injecting directly into the Access Token enables clean API authorization validation
          claimsToAddOrOverride: {
            tenant_id: tenantId,
            tenant_type: tenantType,
            role: role,
          },
        },
        idTokenGeneration: {
          // These keys completely bypass the forced 'custom:' prefix rules!
          claimsToAddOrOverride: {
            // tenant_id: tenantId,
            //  tenant_type: tenantType,
            role: role,
          },
          claimsToSuppress: [
            'custom:tenant_id',
            'custom:tenant_type',
            'custom:role',
          ],
        },
      },
    };

    return event;
  }
}
