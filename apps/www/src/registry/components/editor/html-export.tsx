'use client';

import { useTheme } from 'next-themes';
import type { InitialValue } from 'platejs';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorView } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { useObjectUrl } from '@/registry/hooks/use-object-url';

import { FixedToolbarPlugin } from './fixed-toolbar';
import { FloatingToolbarPlugin } from './floating-toolbar';
import { HtmlExportKit } from './html-export-kit';
import { HtmlExportSchemaKit } from './html-export-schema-kit';

const subscribeNever = () => () => {};

function useThemedHtml(html: string, serverTheme?: string) {
  const { resolvedTheme } = useTheme();
  const hydrated = React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  return React.useMemo(() => {
    if (!hydrated) return html;

    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.body.className = document.body.className;
    if (serverTheme !== resolvedTheme) {
      doc.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    }

    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  }, [html, hydrated, resolvedTheme, serverTheme]);
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
        download="editor-export.html"
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
  const editor = useCreateEditor({
    plugins: [
      ...HtmlExportSchemaKit,
      ...EditorKit,
      FixedToolbarPlugin.configure({ enabled: false }),
      FloatingToolbarPlugin.configure({ enabled: false }),
    ],
    initialValue: value,
  });

  return (
    <EditorRoot readOnly editor={editor}>
      <Editor variant="none" />
    </EditorRoot>
  );
}

export const EditorViewClient = ({ value }: { value: InitialValue }) => {
  const editor = useCreateEditor({
    plugins: HtmlExportKit,
    initialValue: value,
  });

  return <EditorView variant="none" editor={editor} />;
};
