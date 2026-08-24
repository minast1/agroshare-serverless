import { Amplify } from 'aws-amplify'
import React from 'react'

export const amplifyBaseConfig = {
    auth: {
        
            user_pool_id: process.env.NEXT_PUBLIC_USER_POOL_ID,
           
            aws_region: 'us-east-1',
            user_pool_endpoint:'http://localhost:4566',
            
        },
        oauth: {
            providers: ['Google'],
            domain: process.env.NEXT_PUBLIC_DOMAIN,
            redirect_sign_in_uri: `${process.env.NEXT_PUBLIC_SITE_URL}`,
            redirect_sign_out_uri: `${process.env.NEXT_PUBLIC_SITE_URL}`,
            response_type: 'code',
        }
    }
        
Amplify.configure({
    ...amplifyBaseConfig,
    auth:{
        ...amplifyBaseConfig.auth,
       user_pool_client_id: process.env.NEXT_PUBLIC_BASIC_USER_CLIENT_ID,
    }
}, {ssr: true})
const AmplifyProvider = ({children}: {children: React.ReactNode}) => {
  return (
      <>{children}</>
  )
}

export default AmplifyProvider