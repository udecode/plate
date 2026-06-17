import { NextResponse } from 'next/server';

import { plateRegistryDirectory } from '@/lib/plate-registry-config';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(plateRegistryDirectory);
}
