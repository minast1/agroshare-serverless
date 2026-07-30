import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, Logger } from '@nestjs/common';
import { PostAuthenticationTriggerEvent } from 'aws-lambda';

const cognitoClient = new CognitoIdentityProviderClient({});
@Injectable()
export class PostAuthService {
  private readonly logger = new Logger(PostAuthService.name);

  async handlePostAuth(event: PostAuthenticationTriggerEvent) {
    this.logger.log('PostAuthentication Trigger: ', event);
    const currentAttributes = event.request.userAttributes || {};
    const currentTenantId = currentAttributes['custom:tenant_id'];
    const currentTenantType = currentAttributes['custom:tenant_type'];
    const currentRole = currentAttributes['custom:role'];
    const poolId = event.userPoolId;
    const username = event.userName;
    let incomingTenantId = null;
    let incomingTenantType = null;
    let incomingRole = null;

    //Admins Google Social Login
    if (
      event.triggerSource === 'PostAuthentication_Authentication' &&
      event.request.clientMetadata?.customState //this would be coming from amplify when using google auth
    ) {
      try {
        console.log('Processing Google Social logni..');
        const state = JSON.parse(
          event.request.clientMetadata.customState,
        ) as Record<string, string>;
        incomingTenantId = state.tenant_id;
        incomingTenantType = state.tenant_type;
        incomingRole = state.role ?? 'admin';
      } catch (error) {
        this.logger.error('Error parsing customState:', error);
      }
    }

    // Email OTP /CUSTOM AUTH FLOW (For Both Admins)
    else if (
      event.triggerSource === 'PostAuthentication_Authentication' &&
      event.request.clientMetadata?.tenantId
    ) {
      console.log('Processing Email OTP / Custom Auth login...');

      incomingTenantId = event.request.clientMetadata.tenantId;
      incomingTenantType = event.request.clientMetadata.tenantType;
      incomingRole = event.request.clientMetadata.role ?? 'admin';
    }
    //Email & Password (Super-Admin)
    else {
      // Super-admins already have their custom fields saved permanently in the database.
      console.log(
        'Standard Email/Password auth detected. Skipping profile write (Super-admin).',
      );
      return event;
    }
    // Write Metadata back to Cognito Profile Database
    if (incomingTenantId && incomingTenantType && incomingRole) {
      if (
        currentTenantId === incomingTenantId &&
        currentTenantType === incomingTenantType &&
        currentRole === incomingRole
      ) {
        console.log('No changes detected in profile data.');
        return event;
      }
      try {
        console.log(
          `Saving to profile database -> Tenant: ${incomingTenantId}, Role: ${incomingRole}`,
        );
        const command = new AdminUpdateUserAttributesCommand({
          UserPoolId: poolId,
          Username: username,
          UserAttributes: [
            {
              Name: 'custom:tenant_id',
              Value: incomingTenantId,
            },
            {
              Name: 'custom:tenant_type',
              Value: incomingTenantType,
            },
            {
              Name: 'custom:role',
              Value: incomingRole,
            },
          ],
        });
        await cognitoClient.send(command);
        this.logger.log('Profile data saved successfully.');
      } catch (error) {
        this.logger.error('Error saving profile data to Cognito:', error);
      }
    }
    return event;
  }
}
