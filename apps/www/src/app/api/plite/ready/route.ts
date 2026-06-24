import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    devSource: process.env.PLATE_WWW_DEV_SOURCE === '1',
    plite: process.env.PLATE_WWW_PLITE === '1',
  });
}
