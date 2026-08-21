'use client';

import { useTheme } from 'next-themes';
import type { InitialValue } from 'platejs';
import { Plate, usePlateEditor, usePlateViewEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorView } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { FixedToolbarPlugin } from './fixed-toolbar';
import { FloatingToolbarPlugin } from './floating-toolbar';
import { BaseEditorKit } from './plugins-static';

function useThemedHtml(html: string, serverTheme?: string) {
  const { resolvedTheme } = useTheme();

  return React.useMemo(() => {
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
  const [url, setUrl] = React.useState<string>();

  React.useEffect(() => {
    const blob = new Blob([themedHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    // Track browser object URL lifecycle for the generated export blob.
    setUrl(blobUrl);

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [themedHtml]);

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
  const content = useThemedHtml(html, serverTheme);

  return <iframe title="Preview" srcDoc={content} {...props} />;
}

export function EditorClient({ value }: { value: InitialValue }) {
  const editor = usePlateEditor({
    plugins: [
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
    plugins: BaseEditorKit,
    initialValue: value,
  });

  return <EditorView variant="none" editor={editor} />;
};
