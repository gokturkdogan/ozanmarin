import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  // Admin routes are handled separately - allow all admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/products', '/products/[slug]', '/about', '/contact', '/cart', '/checkout', '/orders']
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[')) {
      // Dynamic route
      const baseRoute = route.split('/[')[0]
      return request.nextUrl.pathname.startsWith(baseRoute)
    }
    return request.nextUrl.pathname === route
  })

  // If it's a public route or admin route, allow access
  if (isPublicRoute || isAdminRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // For admin routes, we'll check admin status in the API routes instead
    // This avoids Prisma connection issues in middleware
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
