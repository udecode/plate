'use client';

import * as React from 'react';

import { Mdx } from './mdx-components';

interface FrameworkDocsProps extends React.HTMLAttributes<HTMLDivElement> {
  data: string;
}

const docCache = new Map<string, string>();

export function FrameworkDocs({ data }: FrameworkDocsProps) {
  const [code, setCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!data) return;
    const slug = `docs/components/installation/${data}`;
    const cached = docCache.get(slug);
    if (cached) {
      setCode(cached);
      return;
    }

    let canceled = false;

    const load = async () => {
      try {
        const res = await fetch(`/docs-data/${slug}.json`);
        if (!res.ok) return;
        const payload = (await res.json()) as { body?: { code?: string } };
        const nextCode = payload?.body?.code;
        if (!nextCode || canceled) return;
        docCache.set(slug, nextCode);
        setCode(nextCode);
      } catch (_error) {
        // ignore
      }
    };

    void load();

    return () => {
      canceled = true;
    };
  }, [data]);

  if (!code) {
    return null;
  }

  return <Mdx code={code} />;
}
