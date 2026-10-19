import { NextResponse } from 'next/server';

import { getRegistryChangelogComponents } from '@/lib/registry-changelog';

export function GET() {
  return NextResponse.json(getRegistryChangelogComponents());
}
