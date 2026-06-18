import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    devSource: process.env.PLATE_WWW_DEV_SOURCE === '1',
    slate: process.env.PLATE_WWW_SLATE === '1',
  });
}
