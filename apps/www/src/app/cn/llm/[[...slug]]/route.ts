import { notFound } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';

import { getPlateLLMPageMarkdown, processMdxForLLMs } from '@/lib/llm';
import { source } from '@/lib/source';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const page = source.getPage(slug ?? [], 'cn');

  if (!page) {
    notFound();
  }

  const content = getPlateLLMPageMarkdown({
    content: processMdxForLLMs(await page.data.getText('raw')),
    docUrl: `https://platejs.org${page.url}`,
    title: page.data.title,
  });

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}

export function generateStaticParams() {
  return [];
}
