import type { EditorCoreStateView } from '@platejs/plite';

import type { HtmlParserOptions } from '../../lib/plugin/PluginConfig';
import {
  createHtmlPluginContext,
  type PreparedHtmlPluginEntry,
} from './prepareHtmlRegistry';

/** Pipe insert-data transformData hooks. */
export const pipeTransformData = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  { data, ...options }: HtmlParserOptions
) => {
  plugins.forEach((p) => {
    const { transformData } = p;

    if (!transformData) return;

    data = transformData({
      data,
      ...options,
      ...createHtmlPluginContext(p, state),
    });
  });

  return data;
};
