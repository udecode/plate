import { NextResponse } from 'next/server';

import { getPlateLLMFullMarkdown } from '@/lib/llm';
import { getPlateLLMSource } from '@/lib/llm-source';

export const revalidate = false;
export const dynamic = 'force-static';

export async function GET() {
  const source = getPlateLLMSource();

  return new NextResponse(
    await getPlateLLMFullMarkdown(source.getPages('en')),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
}
