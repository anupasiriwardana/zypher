// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for:
//      * - api/auth (NextAuth API routes)
//      * - static files (/_next/static)
//      * - public folder
//      * - login/signup pages
//      */
//     "/((?!api/auth|_next/static|_next/image|favicon.ico|login|signup|unauthorized).*)",
//   ],
// };

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;
  
//   // Define protected routes and their required roles
//   const protectedRoutes = {
//     '/dashboard': ['primary-user', 'admin', 'editor'],
//     '/admin': ['admin'],
//     '/editor': ['editor', 'admin'],
//     '/api/protected': ['primary-user', 'admin', 'editor'],
//     '/api/admin': ['admin'],
//   };
  
//   // Find the most specific matching route
//   const matchingRoute = Object.keys(protectedRoutes)
//     .filter(route => pathname.startsWith(route))
//     .sort((a, b) => b.length - a.length)[0];
  
//   // If not a protected route, continue
//   if (!matchingRoute) {
//     return NextResponse.next();
//   }
  
//   const requiredRoles = protectedRoutes[matchingRoute];
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
//   // Redirect to login if not authenticated
//   if (!token) {
//     const loginUrl = new URL('/login', req.url);
//     loginUrl.searchParams.set('callbackUrl', req.url);
//     return NextResponse.redirect(loginUrl);
//   }
  
//   // Check if user has required role
//   if (!requiredRoles.includes(token.role)) {
//     return NextResponse.redirect(new URL('/unauthorized', req.url));
//   }
  
//   // Add user role to request headers for API routes
//   if (pathname.startsWith('/api')) {
//     const headers = new Headers(req.headers);
//     headers.set('x-user-id', token.id);
//     headers.set('x-user-role', token.role);
    
//     return NextResponse.next({
//       request: { headers },
//     });
//   }
  
//   return NextResponse.next();
// }