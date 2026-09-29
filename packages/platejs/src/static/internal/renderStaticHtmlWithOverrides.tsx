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
  setStaticComponentOverrides,
  type StaticComponentOverrides,
} from './staticComponentOverrides';

// Each runtime loads the React server build that works there. The browser
// build keeps a Node process alive through its MessagePort, Next's webpack
// client bundles stub the edge build's legacy renderers, and Next rejects the
// bare `react-dom/server` specifier in server components.
const loadStaticRenderer = () =>
  (globalThis as { process?: { versions?: { node?: string } } }).process
    ?.versions?.node
    ? import('react-dom/server.edge')
    : import('react-dom/server.browser');

export const renderStaticHtmlWithOverrides = async (
  editor: Editor,
  {
    component: Component = EditorStatic,
    document = editor.read.value(),
    projection,
    props = {},
  }: RenderStaticHtmlOptions = {},
  overrides?: StaticComponentOverrides
): Promise<StaticHtmlResult> => {
  if (document.meta?.authored !== undefined && projection === undefined) {
    throw new TypeError(
      'Static HTML serialization requires projection when the document contains authored changes.'
    );
  }
  const projected = projectPlateFormatDocument(
    editor,
    document,
    projection ?? 'proposed'
  );
  const renderEditor = createEditorView(editor, {
    document: projected.document,
  }) as unknown as Editor;

  if (overrides) setStaticComponentOverrides(renderEditor, overrides);
  const { renderToStaticMarkup } = await loadStaticRenderer();
  const html = renderToStaticMarkup(
    React.createElement(Component, { editor: renderEditor, ...props })
  );

  return Object.freeze({
    data: html,
    diagnostics: projected.diagnostics,
  });
};
