import { NextResponse } from 'next/server';

import { getSidebarNavFromPageTree } from '@/lib/docs-page-tree';

export const revalidate = 3600;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') === 'cn' ? 'cn' : 'en';

  return NextResponse.json(getSidebarNavFromPageTree(locale), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
