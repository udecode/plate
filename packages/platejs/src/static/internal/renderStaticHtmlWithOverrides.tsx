import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server.edge';

import { createProjectedEditorView } from '../../internal/createProjectedEditorView';
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
  const renderDocument = projected.document;
  const renderEditor = createProjectedEditorView(editor, renderDocument);

  if (overrides) setStaticComponentOverrides(renderEditor, overrides);
  const html = renderToStaticMarkup(
    React.createElement(Component, { editor: renderEditor, ...props })
  );

  return Object.freeze({
    data: html,
    diagnostics: projected.diagnostics,
  });
};
