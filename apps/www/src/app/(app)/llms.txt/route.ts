/* oxlint-disable typescript/no-unsafe-argument -- This owner crosses an erased generated, provider, or editor-runtime boundary; runtime validation or the external contract is the evidence, and fabricating local types would launder it. */
import { llms } from 'fumadocs-core/source';
import { NextResponse } from 'next/server';

import { getPlateLLMSource } from '@/lib/llm-source';

export const revalidate = false;
export const dynamic = 'force-static';

export async function GET() {
  const source = getPlateLLMSource();

  return new NextResponse(llms(source as any).index('en'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
