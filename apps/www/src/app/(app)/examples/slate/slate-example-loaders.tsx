'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

const createSlateExampleLoader = (
  loader: () => Promise<{ default: ComponentType }>
) =>
  dynamic(loader, {
    loading: () => null,
    ssr: false,
  }) as ComponentType;

export const slateExampleComponents = {
  'android-tests': createSlateExampleLoader(
    () => import('./_examples/android-tests')
  ),
  'check-lists': createSlateExampleLoader(
    () => import('./_examples/check-lists')
  ),
  'code-highlighting': createSlateExampleLoader(
    () => import('./_examples/code-highlighting')
  ),
  'comment-mode': createSlateExampleLoader(
    () => import('./_examples/comment-mode')
  ),
  'custom-placeholder': createSlateExampleLoader(
    () => import('./_examples/custom-placeholder')
  ),
  'decorations-async': createSlateExampleLoader(
    () => import('./_examples/decorations-async')
  ),
  'document-state': createSlateExampleLoader(
    () => import('./_examples/document-state')
  ),
  'dom-coverage-boundaries': createSlateExampleLoader(
    () => import('./_examples/dom-coverage-boundaries')
  ),
  'editable-voids': createSlateExampleLoader(
    () => import('./_examples/editable-voids')
  ),
  embeds: createSlateExampleLoader(() => import('./_examples/embeds')),
  'forced-layout': createSlateExampleLoader(
    () => import('./_examples/forced-layout')
  ),
  'hidden-content-blocks': createSlateExampleLoader(
    () => import('./_examples/hidden-content-blocks')
  ),
  'hovering-toolbar': createSlateExampleLoader(
    () => import('./_examples/hovering-toolbar')
  ),
  'huge-document': createSlateExampleLoader(
    () => import('./_examples/huge-document')
  ),
  iframe: createSlateExampleLoader(() => import('./_examples/iframe')),
  images: createSlateExampleLoader(() => import('./_examples/images')),
  inlines: createSlateExampleLoader(() => import('./_examples/inlines')),
  linting: createSlateExampleLoader(() => import('./_examples/linting')),
  'markdown-preview': createSlateExampleLoader(
    () => import('./_examples/markdown-preview')
  ),
  'markdown-shortcuts': createSlateExampleLoader(
    () => import('./_examples/markdown-shortcuts')
  ),
  mentions: createSlateExampleLoader(() => import('./_examples/mentions')),
  'multi-root-document': createSlateExampleLoader(
    () => import('./_examples/multi-root-document')
  ),
  pagination: createSlateExampleLoader(() => import('./_examples/pagination')),
  'paste-html': createSlateExampleLoader(
    () => import('./_examples/paste-html')
  ),
  'persistent-annotation-anchors': createSlateExampleLoader(
    () => import('./_examples/persistent-annotation-anchors')
  ),
  plaintext: createSlateExampleLoader(() => import('./_examples/plaintext')),
  'read-only': createSlateExampleLoader(() => import('./_examples/read-only')),
  richtext: createSlateExampleLoader(() => import('./_examples/richtext')),
  'search-highlighting': createSlateExampleLoader(
    () => import('./_examples/search-highlighting')
  ),
  'shadow-dom': createSlateExampleLoader(
    () => import('./_examples/shadow-dom')
  ),
  styling: createSlateExampleLoader(() => import('./_examples/styling')),
  'synced-blocks': createSlateExampleLoader(
    () => import('./_examples/synced-blocks')
  ),
  tables: createSlateExampleLoader(() => import('./_examples/tables')),
  'yjs-collaboration': createSlateExampleLoader(
    () => import('./_examples/yjs-collaboration')
  ),
  'yjs-hocuspocus': createSlateExampleLoader(
    () => import('./_examples/yjs-hocuspocus')
  ),
} satisfies Record<string, ComponentType>;

export type SlateExampleId = keyof typeof slateExampleComponents;
