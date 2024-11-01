import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const { ip, nextUrl } = req;
    nextUrl.searchParams.set('clientIp', ip ?? '?');
    
    return NextResponse.rewrite(nextUrl);
};