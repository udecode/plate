'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';
import { Plate, usePlateEditor, usePlateViewEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { Editor, EditorView } from '@/registry/ui/editor';

import { BaseEditorKit } from './editor-base-kit';

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
  className,
  html,
  serverTheme,
}: {
  html: string;
  className?: string;
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
      className={className}
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

export function EditorClient({ value }: { value: any }) {
  const editor = usePlateEditor({
    override: {
      enabled: {
        'fixed-toolbar': false,
        'floating-toolbar': false,
      },
    },
    plugins: EditorKit,
    value,
  });

  return (
    <Plate readOnly editor={editor}>
      <Editor variant="none" />
    </Plate>
  );
}

export const EditorViewClient = ({ value }: { value: any }) => {
  const editor = usePlateViewEditor({
    plugins: BaseEditorKit,
    value,
  });

  return <EditorView variant="none" editor={editor} />;
};
