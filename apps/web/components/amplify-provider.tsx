import React from 'react'

export const amplifyBaseConfig = {
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
            awsRegion: 'us-east-1',
            userPoolEndpoint: process.env.NODE_ENV === 'development' ? 'http://localhost:4566' : 'https://amazonaws.com',
            identityPoolId: '',
            loginWith: {
                email: true,
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