import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoJwtVerifierSingleUserPool } from "aws-jwt-verify/cognito-verifier";
import { createMiddleware } from "hono/factory";

let verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: "access";
    clientId: string;
}> | null = null

const cognitoAuth = createMiddleware(async (c, next) => {

    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({
            success: false,
            message: "Unauthorized"
        }, 401)
    }

    const token = authHeader.split(" ")[1];

    try {
        if (verifier === null) {
            verifier = CognitoJwtVerifier.create({
                userPoolId: c.env.COGNITO_USER_POOL_ID,
                tokenUse: "access",
                clientId: c.env.COGNITO_CLIENT_ID,
            })
        }
        const payload = await verifier.verify(token);
        c.set("user", payload)
        await next();

    } catch (error) {
        console.log(error)
        return c.json({
            success: false,
            message: "Unauthorized"
        }, 401)
    }

});

export default cognitoAuth;

