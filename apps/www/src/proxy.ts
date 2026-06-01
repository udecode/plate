import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { type NextRequest, NextResponse } from 'next/server';

const MARKDOWN_EXTENSION_REGEX = /\.md$/;
const markdownRewrites = [
  rewritePath('/cn/docs{/*path}', '/cn/llm{/*path}'),
  rewritePath('/docs{/*path}', '/llm{/*path}'),
];

export function getMarkdownRewrite(pathname: string) {
  const hasMarkdownExtension = MARKDOWN_EXTENSION_REGEX.test(pathname);
  const docsPathname = hasMarkdownExtension
    ? pathname.replace(MARKDOWN_EXTENSION_REGEX, '')
    : pathname;

  for (const { rewrite } of markdownRewrites) {
    const rewrittenPathname = rewrite(docsPathname);

    if (rewrittenPathname) {
      return hasMarkdownExtension
        ? `${rewrittenPathname}.md`
        : rewrittenPathname;
    }
  }

  return null;
}

export function proxy(request: NextRequest) {
  const pathname = getMarkdownRewrite(request.nextUrl.pathname);

  if (
    !pathname ||
    (!MARKDOWN_EXTENSION_REGEX.test(request.nextUrl.pathname) &&
      !isMarkdownPreferred(request))
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/docs', '/docs/:path*', '/cn/docs', '/cn/docs/:path*'],
};
