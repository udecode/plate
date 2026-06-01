import { notFound } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';

import {
  getPlateLLMPageMarkdownFromPage,
  stripMarkdownSuffixFromSlug,
} from '@/lib/llm';
import { getPlateLLMSource } from '@/lib/llm-source';
import { hrefWithLocale } from '@/lib/withLocale';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const pageSlug = stripMarkdownSuffixFromSlug(slug);
  const source = await getPlateLLMSource();
  const page = source.getPage(pageSlug, 'cn') ?? source.getPage(pageSlug, 'en');

  if (!page) {
    notFound();
  }

  const content = await getPlateLLMPageMarkdownFromPage({
    docUrl: `https://platejs.org${hrefWithLocale(page.url, 'cn')}`,
    page,
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
