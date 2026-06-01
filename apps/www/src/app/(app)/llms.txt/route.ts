import { NextResponse } from 'next/server';
import { llms } from 'fumadocs-core/source';

import { getPlateLLMSource } from '@/lib/llm-source';

export const revalidate = false;
export const dynamic = 'force-static';

export async function GET() {
  const source = await getPlateLLMSource();

  return new NextResponse(llms(source as any).index('en'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
