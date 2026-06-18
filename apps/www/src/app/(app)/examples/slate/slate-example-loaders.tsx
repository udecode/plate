'use client';

import dynamic from 'next/dynamic';

const loading = () => (
  <div className="rounded-md border bg-background px-5 py-4 text-sm text-muted-foreground">
    Loading Slate example...
  </div>
);

export const slateExampleComponents = {
  'android-tests': dynamic(() => import('./_examples/android-tests'), {
    loading,
    ssr: false,
  }),
  'check-lists': dynamic(() => import('./_examples/check-lists'), {
    loading,
    ssr: false,
  }),
  'code-highlighting': dynamic(() => import('./_examples/code-highlighting'), {
    loading,
    ssr: false,
  }),
  'comment-mode': dynamic(() => import('./_examples/comment-mode'), {
    loading,
    ssr: false,
  }),
  'custom-placeholder': dynamic(
    () => import('./_examples/custom-placeholder'),
    { loading, ssr: false }
  ),
  'decorations-async': dynamic(() => import('./_examples/decorations-async'), {
    loading,
    ssr: false,
  }),
  'document-state': dynamic(() => import('./_examples/document-state'), {
    loading,
    ssr: false,
  }),
  'dom-coverage-boundaries': dynamic(
    () => import('./_examples/dom-coverage-boundaries'),
    { loading, ssr: false }
  ),
  'editable-voids': dynamic(() => import('./_examples/editable-voids'), {
    loading,
    ssr: false,
  }),
  embeds: dynamic(() => import('./_examples/embeds'), { loading, ssr: false }),
  'forced-layout': dynamic(() => import('./_examples/forced-layout'), {
    loading,
    ssr: false,
  }),
  'hidden-content-blocks': dynamic(
    () => import('./_examples/hidden-content-blocks'),
    { loading, ssr: false }
  ),
  'hovering-toolbar': dynamic(() => import('./_examples/hovering-toolbar'), {
    loading,
    ssr: false,
  }),
  'huge-document': dynamic(() => import('./_examples/huge-document'), {
    loading,
    ssr: false,
  }),
  iframe: dynamic(() => import('./_examples/iframe'), { loading, ssr: false }),
  images: dynamic(() => import('./_examples/images'), { loading, ssr: false }),
  inlines: dynamic(() => import('./_examples/inlines'), {
    loading,
    ssr: false,
  }),
  linting: dynamic(() => import('./_examples/linting'), {
    loading,
    ssr: false,
  }),
  'markdown-preview': dynamic(() => import('./_examples/markdown-preview'), {
    loading,
    ssr: false,
  }),
  'markdown-shortcuts': dynamic(
    () => import('./_examples/markdown-shortcuts'),
    { loading, ssr: false }
  ),
  mentions: dynamic(() => import('./_examples/mentions'), {
    loading,
    ssr: false,
  }),
  'multi-root-document': dynamic(
    () => import('./_examples/multi-root-document'),
    { loading, ssr: false }
  ),
  pagination: dynamic(() => import('./_examples/pagination'), {
    loading,
    ssr: false,
  }),
  'paste-html': dynamic(() => import('./_examples/paste-html'), {
    loading,
    ssr: false,
  }),
  'persistent-annotation-anchors': dynamic(
    () => import('./_examples/persistent-annotation-anchors'),
    { loading, ssr: false }
  ),
  plaintext: dynamic(() => import('./_examples/plaintext'), {
    loading,
    ssr: false,
  }),
  'read-only': dynamic(() => import('./_examples/read-only'), {
    loading,
    ssr: false,
  }),
  richtext: dynamic(() => import('./_examples/richtext'), {
    loading,
    ssr: false,
  }),
  'search-highlighting': dynamic(
    () => import('./_examples/search-highlighting'),
    { loading, ssr: false }
  ),
  'shadow-dom': dynamic(() => import('./_examples/shadow-dom'), {
    loading,
    ssr: false,
  }),
  styling: dynamic(() => import('./_examples/styling'), {
    loading,
    ssr: false,
  }),
  'synced-blocks': dynamic(() => import('./_examples/synced-blocks'), {
    loading,
    ssr: false,
  }),
  tables: dynamic(() => import('./_examples/tables'), { loading, ssr: false }),
  'yjs-collaboration': dynamic(() => import('./_examples/yjs-collaboration'), {
    loading,
    ssr: false,
  }),
  'yjs-hocuspocus': dynamic(() => import('./_examples/yjs-hocuspocus'), {
    loading,
    ssr: false,
  }),
} as const;

export type SlateExampleId = keyof typeof slateExampleComponents;
