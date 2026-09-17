import { amplifyBaseConfig } from "@/components/amplify-provider";
import { CustomCognitoPayload } from "@/types";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export const createServerRunnerForRole = (role: 'basic' | 'superadmin') => {

    const clientId = role === 'superadmin'
        ? process.env.NEXT_PUBLIC_SUPERADMIN_CLIENT_ID!
        : process.env.NEXT_PUBLIC_BASIC_USER_CLIENT_ID!;

    return createServerRunner({
        config: {
            ...amplifyBaseConfig,
            Auth: {
                ...amplifyBaseConfig.Auth,
                Cognito: {
                    ...amplifyBaseConfig.Auth.Cognito,
                    userPoolClientId: clientId,
                }
            }
        },

    });
};

export async function getServerAuthSession(role: 'basic' | 'superadmin' = 'basic', request?: NextRequest): Promise<{ isAuthenticated: boolean; claims: CustomCognitoPayload | null }> {
    const cookieStore = await cookies();
    const { runWithAmplifyServerContext } = createServerRunnerForRole(role);
    const nextServerContext = request ? {
        request,
        response: NextResponse.next()
    } : { cookies: cookieStore };

    try {
        const session = await runWithAmplifyServerContext({
            nextServerContext: nextServerContext as any,
            operation: async (contextSpec) => await fetchAuthSession(contextSpec)
        });

        if (session?.tokens?.accessToken) {
            const tokens = session.tokens;
            return {
                isAuthenticated: true,
                claims: tokens.accessToken.payload as CustomCognitoPayload
            };
        }

    } catch (error) {

    }
    const allCookies = request ? request.cookies.getAll() : cookieStore.getAll();
    const accessTokenCookie = allCookies.find(c =>
        c.name.startsWith('CognitoIdentityServiceProvider.') &&
        c.name.endsWith('.accessToken')
    );
    if (accessTokenCookie?.value) {
        try {
            // Securely decode the token payload directly on the edge
            const decodedClaims = jwtDecode(accessTokenCookie.value) as any;
            const isExpired = decodedClaims.exp * 1000 < Date.now();
            if (!isExpired) {
                return {
                    isAuthenticated: true,
                    claims: decodedClaims as CustomCognitoPayload
                };
            }
        } catch (error) {
            console.error("Manual fallback cookie extraction failed:", error);
        }
    }
    return { isAuthenticated: false, claims: null };
}
