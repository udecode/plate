import type React from 'react';

import type { AuthoredProjectionDiagnostic } from '../authored';
import type { EditorDocumentValue } from '../facade';
import type { Editor } from '../lib';
import type { EditorStaticProps } from './components/PlateStatic';
import { renderStaticHtmlWithOverrides } from './internal/renderStaticHtmlWithOverrides';

export type StaticHtmlDiagnostic = AuthoredProjectionDiagnostic;

export type StaticHtmlResult = Readonly<{
  data: string;
  diagnostics: readonly StaticHtmlDiagnostic[];
}>;

export type RenderStaticHtmlOptions<
  T extends EditorStaticProps = EditorStaticProps,
> = {
  /** Component used to render the captured document. */
  component?: React.ComponentType<T>;
  /** Complete document to render. Defaults to the editor's current document. */
  document?: EditorDocumentValue;
  /** Required when the captured document contains authored changes. */
  projection?: 'accepted' | 'proposed';
  /** Props passed to the static editor component. */
  props?: Partial<T>;
};

/** Render one captured document through the editor's configured static components. */
export const renderStaticHtml = async <
  T extends EditorStaticProps = EditorStaticProps,
>(
  editor: Editor,
  options: RenderStaticHtmlOptions<T> = {}
): Promise<StaticHtmlResult> =>
  renderStaticHtmlWithOverrides(editor, options as RenderStaticHtmlOptions);
