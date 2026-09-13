import { Amplify } from 'aws-amplify'
import React from 'react'

export const amplifyBaseConfig = {
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
            awsRegion: 'us-east-1',
            userPoolEndpoint: 'http://localhost:4566',
            loginWith: {
                email: true,
                oauth: {
                    providers: ['Google'] as any,
                    domain: process.env.NEXT_PUBLIC_DOMAIN!,
                    redirectSignIn: [process.env.NEXT_PUBLIC_SITE_URL!],
                    redirectSignOut: [process.env.NEXT_PUBLIC_SITE_URL!],
                    responseType: 'code' as 'code' | 'token',
                    scopes: ['email', 'openid', 'profile'] as any,
                },
                externalProviders: {
                    callbackUrls: [
                        'http://localhost:3000',
                        'http://localhost:3000',
                    ],
                    logoutUrls: [
                        'http://localhost:3000',
                        'http://localhost:3000',
                    ],
                }
            }
        }
    },

}

const AmplifyProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    )
}

export default AmplifyProvider