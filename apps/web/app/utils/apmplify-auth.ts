import { amplifyBaseConfig } from "@/components/amplify-provider"
import { Amplify } from "aws-amplify"


export function configureAuthForRole(role: 'basic' | 'superadmin') {
    const clientId = role === 'superadmin'
    ? process.env.NEXT_PUBLIC_SUPERADMIN_CLIENT_ID!
    : process.env.NEXT_PUBLIC_BASIC_USER_CLIENT_ID!

    Amplify.configure({
        ...amplifyBaseConfig,
        auth:{
            ...amplifyBaseConfig.auth,
            user_pool_client_id: clientId,
        }
    }, {ssr: true})
}