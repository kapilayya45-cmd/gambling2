import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // కేవలం /admin పేజీకి మాత్రమే ఇది పనిచేస్తుంది
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse('Authentication Required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Panel"',
        },
      });
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    // ఇక్కడ User: admin, Password: మీరు సెట్ చేసిన ADMIN_PASSWORD
    if (user === 'admin' && pass === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }

    return new NextResponse('Invalid Credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel"',
      },
    });
  }

  return NextResponse.next();
}
