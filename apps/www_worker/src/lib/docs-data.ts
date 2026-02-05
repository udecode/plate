import { headers } from 'next/headers';

import { siteConfig } from '@/config/site';

export type DocsData = {
  body: {
    code: string;
    raw: string;
  };
  component?: boolean;
  description?: string;
  docs?: { route?: string; title?: string }[];
  featured?: boolean;
  links?: { api?: string; doc?: string };
  published?: boolean;
  slug: string;
  slugAsParams: string;
  title: string;
  toc?: boolean;
};

export function getDocsDataPath(slugAsParams: string) {
  return `/docs-data/${slugAsParams}.json`;
}

function getBaseUrl() {
  const hdrs = headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';

  if (host) {
    return `${proto}://${host}`;
  }

  return siteConfig.url;
}

export async function fetchDocData(slugAsParams: string) {
  const baseUrl = getBaseUrl();
  const url = new URL(getDocsDataPath(slugAsParams), baseUrl);
  const res = await fetch(url.toString());

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as DocsData;
}
