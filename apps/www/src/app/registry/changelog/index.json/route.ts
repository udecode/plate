import { NextResponse } from 'next/server';

import { getRegistryChangelogIndex } from '@/lib/registry-changelog';

export function GET() {
  return NextResponse.json(getRegistryChangelogIndex());
}
