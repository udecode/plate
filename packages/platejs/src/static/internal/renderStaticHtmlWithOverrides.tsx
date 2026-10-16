import React from 'react';

import { createEditorView } from '../../facade';
import type { Editor } from '../../lib';
import { projectPlateFormatDocument } from '../../lib/editor/withPlite';
import { EditorStatic } from '../components/PlateStatic';
import type {
  RenderStaticHtmlOptions,
  StaticHtmlResult,
} from '../renderStaticHtml';
import {
  bindStaticPresentation,
  type StaticComponentOverrides,
} from './staticPresentation';

// The browser build keeps a plain Node process alive through its MessagePort.
// Next's webpack bundles, server ones included, stub the edge build's legacy
// renderers, and Next rejects the bare `react-dom/server` specifier in server
// components. `process.env.NEXT_RUNTIME` stays bare so bundlers inline it, and
// stays after the Node check so a browser bundle never reads `process`.
const loadStaticRenderer = () =>
  (globalThis as { process?: { versions?: { node?: string } } }).process
    ?.versions?.node && !process.env.NEXT_RUNTIME
    ? import('react-dom/server.edge')
    : import('react-dom/server.browser');

export const renderStaticHtmlWithOverrides = async (
  editor: Editor,
  {
    component: Component = EditorStatic,
    document = editor.read.value(),
    presentation,
    projection,
    props = {},
  }: RenderStaticHtmlOptions = {},
  overrides?: StaticComponentOverrides
): Promise<StaticHtmlResult> => {
  const appearance = { ...props };

  for (const key of ['document', 'editor'] as const) {
    if (appearance[key] !== undefined) {
      throw new TypeError(
        `Static HTML props cannot include "${key}". Pass the editor to render as the first argument and another document as the document option.`
      );
    }
  }
  const projected = projectPlateFormatDocument(editor, document, projection);
  const renderEditor = createEditorView(editor, {
    document: projected.document,
  }) as unknown as Editor;

  const missing = bindStaticPresentation(renderEditor, {
    components: overrides,
    plugins: presentation,
  });
  const { renderToStaticMarkup } = await loadStaticRenderer();
  const html = renderToStaticMarkup(
    React.createElement(Component, { ...appearance, editor: renderEditor })
  );

  return Object.freeze({
    data: html,
    diagnostics: Object.freeze([
      ...projected.diagnostics,
      ...Array.from(missing, (plugin) =>
        Object.freeze({
          code: 'missing-static-presentation' as const,
          message: `Plugin "${plugin}" has no drawing in the presentation, so its content was drawn without it.`,
          plugin,
          severity: 'warning' as const,
        })
      ),
    ]),
  });
};
