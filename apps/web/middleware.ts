import { NextResponse, type NextRequest } from "next/server";
import { runBasicAuthServer, runSuperadminServer } from "./app/amplify/auth/server-resource";
import { fetchAuthSession } from "aws-amplify/auth/server";



export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next({ request });
    const PUBLIC_ROUTES = ["/"]
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.match(/\.(svg|png|jpg|jpeg|json|ico)$/)
    ) {
        return response;
    }

    const pathSegments = pathname.split('/').filter(Boolean); //(["", "dashboard","tenant-type", "tenant-id"])
    const isSuperAdminPath = pathname.startsWith('/superadmin-dashboard');
    const targetTenantTypeFromUrl = pathSegments[2];
    const targetTenantIdFromUrl = pathSegments[3];

    const runWithContext = isSuperAdminPath ? runSuperadminServer : runBasicAuthServer;

    try {
        const session = await runWithContext({
            nextServerContext: { request, response },
            operation: (contextSpec) => fetchAuthSession(contextSpec)
        })
        const tokenPayload = session.tokens?.accessToken?.payload

        if (tokenPayload) {
            const userRole = tokenPayload['role'] as string;
            const userTenantType = tokenPayload['tenant_type'] as string;
            const userTenantId = tokenPayload['tenant_id'] as string;

            if (pathname === '/' || pathname.startsWith('/auth')) {
                const destination = userRole === 'superadmin' ? '/superadmin-dashboard' : `/dashboard/${userTenantType}/${userTenantId}`;
                const redirectRes = NextResponse.redirect(new URL(destination, request.url));
                redirectRes.headers.set('x-middleware-cache', 'no-cache');
                return redirectRes;
            }


            // CASE A: Accessing Superadmin dashboard
            if (isSuperAdminPath && userRole !== 'superadmin') {
                return NextResponse.redirect(new URL('/auth/admin/login?error=forbidden', request.url));
            }

            // CASE B: Accessing standard Tenant dashboards (/dashboard/[tenantId])
            if (pathname.startsWith('/dashboard')) {
                if (targetTenantTypeFromUrl !== userTenantType) {
                    console.warn(`Tenant Type Mismatch. User tenant type: ${userTenantType}, URL target tenant type: ${targetTenantTypeFromUrl}`);
                    return NextResponse.redirect(new URL(`/dashboard/${userTenantType}/${userTenantId}`, request.url));
                }

                if (targetTenantIdFromUrl !== userTenantId) {
                    console.warn(`Tenant ID Mismatch. User tenant ID: ${userTenantId}, URL target tenant ID: ${targetTenantIdFromUrl}`);
                    return NextResponse.redirect(new URL(`/dashboard/${userTenantType}/${userTenantId}`, request.url));
                }
                return response;
            }
            return response;
        }

    } catch (error) {
        console.log('User session evaluation empty/expired.');
    }

    if (PUBLIC_ROUTES.includes(pathname)) {
        return response;
    }

    // Otherwise, if they are trying to peek at a protected /dashboard or /superadmin-dashboard route,
    // kick them back to login securely.
    const loginUrl = new URL('/auth/tenant/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);

    const finalRedirect = NextResponse.redirect(loginUrl);
    finalRedirect.headers.set('x-middleware-cache', 'no-cache'); //
    return finalRedirect;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth).*)'
    ]
};