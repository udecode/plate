'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';

import { Button } from '@/registry/default/plate-ui/button';

function useThemedHtml(html: string, serverTheme?: string) {
  const { resolvedTheme } = useTheme();

  const getThemedHtml = React.useCallback(() => {
    if (typeof window === 'undefined') return html;
    // Only parse and update if theme differs from server
    if (serverTheme === resolvedTheme) return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const htmlElement = doc.documentElement;

    if (resolvedTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    return doc.documentElement.outerHTML;
  }, [html, resolvedTheme, serverTheme]);

  return { getThemedHtml };
}

export function ExportHtmlButton({
  html,
  serverTheme,
}: {
  html: string;
  serverTheme?: string;
}) {
  const { getThemedHtml } = useThemedHtml(html, serverTheme);
  const [url, setUrl] = React.useState<string>();

  React.useEffect(() => {
    const updatedHtml = getThemedHtml();
    const blob = new Blob([updatedHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [getThemedHtml]);

  return (
    <a
      download="export-plate.html"
      href={url}
      rel="noopener noreferrer"
      role="button"
    >
      <Button>Export HTML</Button>
    </a>
  );
}

export function HtmlIframe({
  html,
  serverTheme,
  ...props
}: {
  html: string;
  serverTheme?: string;
} & React.ComponentProps<'iframe'>) {
  const { getThemedHtml } = useThemedHtml(html, serverTheme);
  const [content, setContent] = React.useState(html);

  React.useEffect(() => {
    setContent(getThemedHtml());
  }, [getThemedHtml]);

  return <iframe title="Preview" srcDoc={content} {...props} />;
}
