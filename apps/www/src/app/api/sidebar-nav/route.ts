import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSidebarNavFromPageTree } from '@/lib/docs-page-tree';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') === 'cn' ? 'cn' : 'en';

  return NextResponse.json(await getSidebarNav(locale), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

// oxlint-disable-next-line typescript/require-await -- Next.js requires inline `use cache` functions to be async even when their source is synchronous.
async function getSidebarNav(locale: 'cn' | 'en') {
  'use cache';
  cacheLife('hours');

  return getSidebarNavFromPageTree(locale);
}
