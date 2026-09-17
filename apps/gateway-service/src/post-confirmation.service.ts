import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, Logger } from '@nestjs/common';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

const cognitoClient = new CognitoIdentityProviderClient({});
@Injectable()
export class PostConfirmationService {
  private readonly logger = new Logger(PostConfirmationService.name);

  async handlePostConfirmation(event: PostConfirmationTriggerEvent) {
    this.logger.log('PostConfirmation Trigger: ', event);

    /// THIS WOULLD BE WHERE WE WOULD BE SAVING USER DATA IN DYNAMODB DATABASE 

    // const poolId = event.userPoolId;
    // const username = event.userName;
    // let tenantId = null;
    // let tenantType = null;
    // let role = null;

    // //Admins Google Social Login
    // if (
    //   event.triggerSource === 'PostConfirmation_ConfirmSignUp' &&
    //   event.request.clientMetadata?.customState //this would be coming from amplify when using google auth
    // ) {
    //   try {
    //     console.log('Processing Google Social logni..');
    //     const state = JSON.parse(
    //       event.request.clientMetadata.customState,
    //     ) as Record<string, string>;
    //     tenantId = state.tenant_id;
    //     tenantType = state.tenant_type;
    //     role = state.role ?? 'admin';
    //   } catch (error) {
    //     this.logger.error('Error parsing customState:', error);
    //   }
    // }

    // // Email OTP /CUSTOM AUTH FLOW (For Both Admins)
    // else if (
    //   event.triggerSource === 'PostConfirmation_ConfirmSignUp' &&
    //   event.request.clientMetadata?.tenantId
    // ) {
    //   console.log('Processing Email OTP / Custom Auth login...');

    //   tenantId = event.request.clientMetadata.tenantId;
    //   tenantType = event.request.clientMetadata.tenantType;
    //   role = event.request.clientMetadata.role ?? 'admin';
    // }
    // //Email & Password (Super-Admin)
    // else {
    //   // Super-admins already have their custom fields saved permanently in the database.
    //   console.log(
    //     'Standard Email/Password auth detected. Skipping profile write (Super-admin).',
    //   );
    //   return event;
    // }
    // // Write Metadata back to Cognito Profile Database
    // if (tenantId && tenantType && role) {
    //   try {
    //     console.log(
    //       `Saving to profile database -> Tenant: ${tenantId}, Role: ${role}`,
    //     );
    //     const command = new AdminUpdateUserAttributesCommand({
    //       UserPoolId: poolId,
    //       Username: username,
    //       UserAttributes: [
    //         {
    //           Name: 'custom:tenant_id',
    //           Value: tenantId,
    //         },
    //         {
    //           Name: 'custom:tenant_type',
    //           Value: tenantType,
    //         },
    //         {
    //           Name: 'custom:role',
    //           Value: role,
    //         },
    //       ],
    //     });

    //     this.logger.log('Profile data saved successfully.');
    //   } catch (error: unknown) {
    //     this.logger.error('Error saving profile data to Cognito:', error);
    //     throw new Error(
    //       (error as Error).message || 'Error saving profile data to Cognito',
    //     );
    //   }
    // }
    return event;
  }
}
