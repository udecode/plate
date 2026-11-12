import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    devSource: process.env.PLATE_WWW_DEV_SOURCE === '1',
    dynamicDocs: process.env.PLATE_WWW_DYNAMIC_DOCS === '1',
    plite: process.env.PLATE_WWW_PLITE === '1',
    root: process.env.NODE_ENV === 'development' ? process.cwd() : undefined,
  });
}
