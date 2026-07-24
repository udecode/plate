import type { Descendant, EditorCoreStateView } from '@platejs/plite';

import type { HtmlParserOptions } from '../../lib/plugin/PluginConfig';
import {
  createHtmlPluginContext,
  type PreparedHtmlPluginEntry,
} from './prepareHtmlRegistry';

/** Pipe insert-data transformFragment hooks. */
export const pipeTransformFragment = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  {
    fragment,
    ...options
  }: HtmlParserOptions & { fragment: readonly Descendant[] }
) => {
  plugins.forEach((p) => {
    const { transformFragment } = p;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...createHtmlPluginContext(p, state),
    });
  });

  return fragment;
};
