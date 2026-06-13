import { NextResponse } from 'next/server';

import { getRegistryChangelogComponents } from '@/lib/registry-changelog';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(getRegistryChangelogComponents());
}
