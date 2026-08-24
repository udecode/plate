'use client';

import { useTheme } from 'next-themes';
import type { InitialValue } from 'platejs';
import { Plate, usePlateEditor, usePlateViewEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorView } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { useObjectUrl } from '@/registry/hooks/use-object-url';

import { FixedToolbarPlugin } from './fixed-toolbar';
import { FloatingToolbarPlugin } from './floating-toolbar';
import { PlateToHtmlClientSchemaKit } from './plate-to-html-client-kit';
import { PlateToHtmlEditorKit } from './plate-to-html-kit';

function useThemedHtml(html: string, serverTheme?: string) {
  const { resolvedTheme } = useTheme();

  return React.useMemo(() => {
    if (typeof window === 'undefined') return html;
    // Only parse and update if theme differs from server
    if (serverTheme === resolvedTheme) return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const htmlElement = doc.documentElement;

    htmlElement.classList.toggle('dark', resolvedTheme === 'dark');

    return doc.documentElement.outerHTML;
  }, [html, resolvedTheme, serverTheme]);
}

export function ExportHtmlButton({
  className,
  html,
  serverTheme,
}: {
  html: string;
  className?: string;
  serverTheme?: string;
}) {
  const themedHtml = useThemedHtml(html, serverTheme);
  const blob = React.useMemo(
    () => new Blob([themedHtml], { type: 'text/html' }),
    [themedHtml]
  );
  const url = useObjectUrl(blob);

  return (
    <Button asChild className={className}>
      <a
        download="export-plate.html"
        href={url ?? undefined}
        rel="noopener noreferrer"
      >
        Export HTML
      </a>
    </Button>
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
  const content = useThemedHtml(html, serverTheme);

  return (
    <iframe
      title="Preview"
      sandbox="allow-same-origin"
      srcDoc={content}
      {...props}
    />
  );
}

export function EditorClient({ value }: { value: InitialValue }) {
  const editor = usePlateEditor({
    plugins: [
      ...PlateToHtmlClientSchemaKit,
      ...EditorKit,
      FixedToolbarPlugin.configure({ enabled: false }),
      FloatingToolbarPlugin.configure({ enabled: false }),
    ],
    initialValue: value,
  });

  return (
    <Plate readOnly editor={editor}>
      <Editor variant="none" />
    </Plate>
  );
}

export const EditorViewClient = ({ value }: { value: InitialValue }) => {
  const editor = usePlateViewEditor({
    plugins: PlateToHtmlEditorKit,
    initialValue: value,
  });

  return <EditorView variant="none" editor={editor} />;
};
