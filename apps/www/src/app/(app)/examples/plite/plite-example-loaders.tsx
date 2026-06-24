'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

const createPliteExampleLoader = (
  loader: () => Promise<{ default: ComponentType }>
) =>
  dynamic(loader, {
    loading: () => null,
    ssr: false,
  }) as ComponentType;

export const pliteExampleComponents = {
  'android-tests': createPliteExampleLoader(
    () => import('./_examples/android-tests')
  ),
  'check-lists': createPliteExampleLoader(
    () => import('./_examples/check-lists')
  ),
  'code-highlighting': createPliteExampleLoader(
    () => import('./_examples/code-highlighting')
  ),
  'comment-mode': createPliteExampleLoader(
    () => import('./_examples/comment-mode')
  ),
  'custom-placeholder': createPliteExampleLoader(
    () => import('./_examples/custom-placeholder')
  ),
  'decorations-async': createPliteExampleLoader(
    () => import('./_examples/decorations-async')
  ),
  'document-state': createPliteExampleLoader(
    () => import('./_examples/document-state')
  ),
  'dom-coverage-boundaries': createPliteExampleLoader(
    () => import('./_examples/dom-coverage-boundaries')
  ),
  'editable-voids': createPliteExampleLoader(
    () => import('./_examples/editable-voids')
  ),
  embeds: createPliteExampleLoader(() => import('./_examples/embeds')),
  'forced-layout': createPliteExampleLoader(
    () => import('./_examples/forced-layout')
  ),
  'hidden-content-blocks': createPliteExampleLoader(
    () => import('./_examples/hidden-content-blocks')
  ),
  'hovering-toolbar': createPliteExampleLoader(
    () => import('./_examples/hovering-toolbar')
  ),
  'huge-document': createPliteExampleLoader(
    () => import('./_examples/huge-document')
  ),
  iframe: createPliteExampleLoader(() => import('./_examples/iframe')),
  images: createPliteExampleLoader(() => import('./_examples/images')),
  inlines: createPliteExampleLoader(() => import('./_examples/inlines')),
  linting: createPliteExampleLoader(() => import('./_examples/linting')),
  'markdown-preview': createPliteExampleLoader(
    () => import('./_examples/markdown-preview')
  ),
  'markdown-shortcuts': createPliteExampleLoader(
    () => import('./_examples/markdown-shortcuts')
  ),
  mentions: createPliteExampleLoader(() => import('./_examples/mentions')),
  'multi-root-document': createPliteExampleLoader(
    () => import('./_examples/multi-root-document')
  ),
  pagination: createPliteExampleLoader(() => import('./_examples/pagination')),
  'paste-html': createPliteExampleLoader(
    () => import('./_examples/paste-html')
  ),
  'persistent-annotation-anchors': createPliteExampleLoader(
    () => import('./_examples/persistent-annotation-anchors')
  ),
  plaintext: createPliteExampleLoader(() => import('./_examples/plaintext')),
  'read-only': createPliteExampleLoader(() => import('./_examples/read-only')),
  richtext: createPliteExampleLoader(() => import('./_examples/richtext')),
  'search-highlighting': createPliteExampleLoader(
    () => import('./_examples/search-highlighting')
  ),
  'shadow-dom': createPliteExampleLoader(
    () => import('./_examples/shadow-dom')
  ),
  styling: createPliteExampleLoader(() => import('./_examples/styling')),
  'synced-blocks': createPliteExampleLoader(
    () => import('./_examples/synced-blocks')
  ),
  tables: createPliteExampleLoader(() => import('./_examples/tables')),
  'yjs-collaboration': createPliteExampleLoader(
    () => import('./_examples/yjs-collaboration')
  ),
  'yjs-hocuspocus': createPliteExampleLoader(
    () => import('./_examples/yjs-hocuspocus')
  ),
} satisfies Record<string, ComponentType>;

export type PliteExampleId = keyof typeof pliteExampleComponents;
