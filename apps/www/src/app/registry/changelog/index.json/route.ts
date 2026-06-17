import { NextResponse } from 'next/server';

import { getRegistryChangelogIndex } from '@/lib/registry-changelog';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(getRegistryChangelogIndex());
}
