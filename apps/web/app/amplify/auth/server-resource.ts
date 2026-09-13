import { amplifyBaseConfig } from "@/components/amplify-provider";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";


const TenantConfig = {
    ...amplifyBaseConfig,
    Auth: {
        ...amplifyBaseConfig.Auth,
        Cognito: {
            ...amplifyBaseConfig.Auth.Cognito,
            userPoolClientId: process.env.NEXT_PUBLIC_BASIC_USER_CLIENT_ID!,
        }
    },

}

const SuperAdminConfig = {
    ...amplifyBaseConfig,
    Auth: {
        ...amplifyBaseConfig.Auth,
        Cognito: {
            ...amplifyBaseConfig.Auth.Cognito,
            userPoolClientId: process.env.NEXT_PUBLIC_SUPERADMIN_CLIENT_ID!,
        }
    },

}


// Export runners tailored to your tenant architecture context
export const { runWithAmplifyServerContext: runBasicAuthServer } = createServerRunner({
    config: TenantConfig,
    runtimeOptions: {
        cookies: {
            domain: 'localhost', // making cookies available to all subdomains
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }
    }
});

export const { runWithAmplifyServerContext: runSuperadminServer } = createServerRunner({
    config: SuperAdminConfig,
    runtimeOptions: {
        cookies: {
            domain: 'localhost', // making cookies available to all subdomains
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }
    }
});