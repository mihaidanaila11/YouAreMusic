import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  // console.log('Token:', token)
  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  return NextResponse.next()
}
 
export const config = {
  matcher: '/synth/:path*',
}