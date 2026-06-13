import { NextResponse } from 'next/server';

import {
  getRegistryChangelogEvent,
  getRegistryChangelogIndex,
} from '@/lib/registry-changelog';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return getRegistryChangelogIndex().events.map((event) => ({
    event: `${event.id}.json`,
  }));
}

export async function GET(_: Request, { params }: any) {
  const { event } = await params;
  const changelogEvent = getRegistryChangelogEvent(event);

  if (!changelogEvent) {
    return NextResponse.json(
      { error: `Unknown registry changelog event: ${event}` },
      { status: 404 }
    );
  }

  return NextResponse.json(changelogEvent);
}
