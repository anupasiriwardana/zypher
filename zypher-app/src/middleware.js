import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*"], // Match all routes
};

export async function middleware(req) {
  let pathname = req.nextUrl.pathname.replace(/\/+$/, "");
  if (pathname === "") pathname = "/";

  const excludedPaths = [
    "/about",
    "/features",
    "/pricing",
    "/login",
    "/signup",
    "/see-how-it-works",
    "/unauthorized",
    "/favicon.ico",
    "/_next",   // Next.js static files

    //API routes
    "/api/auth",  // Auth routes
  ];

  const isExcluded =
    pathname === "/" ||  // Home page
    excludedPaths.some(path => pathname.startsWith(path));

  if (isExcluded) return NextResponse.next();

  const protectedRoutes = {
    // auth routes
    '/signup-success': [],

    // Dashboard routes -> primary-user only
    '/knowledge-base': ['primary-user'],
    '/rules': ['primary-user'],
    '/scan-results': ['primary-user'],
    '/start-a-scan': ['primary-user'],
    '/user-settings': ['primary-user'],

    // Dashboard routes -> rule-maintainer
    '/custom-rules': ['rule-maintainer'],
    '/rule-maintainer-settings': ['rule-maintainer'],
    '/view-requests': ['rule-maintainer'],
    '/testing-workspace': ['rule-maintainer'],

    // Dashboard routes -> rule-developer
    '/assigned-rules': ['rule-developer'],
    '/development-workspace': ['rule-developer'],
    '/rule-developer-settings': ['rule-developer'],

    // Dashboard routes -> rule-implementor
    '/rules-to-test': ['rule-implementer'],

    // Dashboard routes -> educator
    '/add-knowledge': ['educator'],
    '/educator-requests': ['educator'],
    '/educator-settings': ['educator'],

    //dashboard routes -> manager
    '/subscription-plans': ['manager'],
    '/income-analytics': ['manager'],

    // Dashboard routes -> admin

    // API routes
    '/api/scan-tool': ['primary-user'],
    '/api/scan-individual-file': ['primary-user'],
    '/api/rule-metadata': ['primary-user'],
    '/api/scan-results': ['primary-user'],
    '/api/custom-rule-request': ['primary-user', 'rule-maintainer', 'rule-developer'],
    '/api/custom-rule-metadata': ['rule-developer', 'rule-maintainer'],
    '/api/custom-rule-file': ['rule-developer', 'rule-maintainer'],
    '/api/user/rule-developer': ['rule-maintainer'],
    '/api/custom-rule-test-scan': ['rule-maintainer', 'rule-developer'],
    '/api/custom-rule-file-reject': ['rule-maintainer'],
    '/api/custom-rule-file-publish': ['rule-maintainer'],
    '/api/custom-rule-request-start-test': ['rule-maintainer'],
  };

  // Find the most specific matching route
  const matchingRoute = Object.keys(protectedRoutes)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  // If not a protected route, continue
  if (!matchingRoute) {
    return NextResponse.next();
  }

  const requiredRoles = protectedRoutes[matchingRoute];
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has required role
  if (!requiredRoles.includes(token.role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Add user role to request headers for API routes
  if (pathname.startsWith('/api')) {
    const headers = new Headers(req.headers);
    headers.set('x-user-id', token.id);
    headers.set('x-user-role', token.role);

    return NextResponse.next({
      request: { headers },
    });
  }

  return NextResponse.next();
}