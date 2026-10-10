import type React from 'react';

import type { AuthoredProjectionDiagnostic } from '../authored';
import type { EditorDocumentValue } from '../facade';
import type { BasePluginInput, Editor } from '../lib';
import type { EditorStaticProps } from './components/PlateStatic';
import { renderStaticHtmlWithOverrides } from './internal/renderStaticHtmlWithOverrides';

export type StaticHtmlDiagnostic =
  | AuthoredProjectionDiagnostic
  | Readonly<{
      code: 'missing-static-presentation';
      message: string;
      /**
       * Name of the plugin whose element, mark or slot drawing the
       * presentation lacked.
       */
      plugin: string;
      severity: 'warning';
    }>;

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
  /**
   * Static plugins that draw the render, such as the app's static kit. Each
   * element component, mark component and `wrapNode`, `wrapNodeChildren` or
   * `afterNodeChildren` function an installed plugin declares is drawn by the
   * plugin of the same name here, unless the installed plugin's `editOnly`
   * leaves it out. The editor keeps the document and every other plugin
   * setting. A drawing this list lacks is left out, so the content renders
   * plainly, and adds a `missing-static-presentation` diagnostic; an installed
   * tag name, such as `component: 'p'`, stays instead. An element no installed
   * plugin renders still draws the installed `afterNodeChildren` slots. A
   * drawing reads plugin state through its `editor` prop; one created in a
   * `configure((ctx) => ...)` callback reads the separate editor this list is
   * compiled in. Pass a stable array: each new array is compiled again.
   */
  presentation?: readonly BasePluginInput[];
  /** Required when the captured document contains authored changes. */
  projection?: 'accepted' | 'proposed';
  /**
   * Appearance props passed to the static editor component, such as `style`.
   * Pass the editor as the first argument and another document as `document`.
   */
  props?: Partial<Omit<T, 'document' | 'editor'>> & {
    document?: never;
    editor?: never;
  };
};

/**
 * Render one captured document through the editor's components, or through
 * `presentation` when given.
 */
export const renderStaticHtml = async <
  T extends EditorStaticProps = EditorStaticProps,
>(
  editor: Editor,
  options: RenderStaticHtmlOptions<T> = {}
): Promise<StaticHtmlResult> =>
  renderStaticHtmlWithOverrides(editor, options as RenderStaticHtmlOptions);
