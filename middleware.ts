import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login');

    if (isAdminPath) {
        const auth = request.cookies.get('admin_auth')?.value;
        if (auth !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }
}

export const config = {
    matcher: '/admin/:path*',
};
