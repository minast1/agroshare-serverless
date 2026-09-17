import { NextResponse, NextRequest } from "next/server";
import { getServerAuthSession } from "./app/amplify/auth/server-resource";


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();
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

    const targetTenantIdFromUrl = pathSegments[1];
    const authRole = isSuperAdminPath ? 'superadmin' : 'basic';

    const { isAuthenticated, claims } = await getServerAuthSession(authRole, request);

    try {

        if (isAuthenticated) {
            const userRole = claims!['role'] as string;
            const userTenantId = claims!['tenant_id'] as string;

            if (pathname === '/' || pathname.startsWith('/auth')) {
                const destination = userRole === 'superadmin' ? '/superadmin-dashboard' : `/dashboard/${userTenantId}`;
                const redirectRes = NextResponse.redirect(new URL(destination, request.url));
                redirectRes.headers.set('x-middleware-cache', 'no-cache');
                return redirectRes;
            }

            //TODO 
            //Add case for when admin is already logged in and lands on index page 

            // CASE A: Accessing Superadmin dashboard
            if (isSuperAdminPath && userRole !== 'superadmin') {
                return NextResponse.redirect(new URL('/auth/admin/login?error=forbidden', request.url));
            }

            // CASE B: Accessing standard Tenant dashboards (/dashboard/[tenantId])
            if (pathname.startsWith('/dashboard')) {

                if (targetTenantIdFromUrl !== userTenantId) {
                    console.warn(`Tenant ID Mismatch. User tenant ID: ${userTenantId}, URL target tenant ID: ${targetTenantIdFromUrl}`);
                    return NextResponse.redirect(new URL(`/dashboard/${userTenantId}`, request.url));
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