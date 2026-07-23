import type { EditorCoreStateView } from '@platejs/plite';

import type { ParserOptions } from '../../lib/plugin/PluginConfig';
import {
  createParserPluginContext,
  type PreparedParserPluginEntry,
} from './prepareParserRegistry';

/** Pipe insert-data transformData hooks. */
export const pipeTransformData = (
  state: EditorCoreStateView,
  plugins: readonly PreparedParserPluginEntry[],
  { data, ...options }: ParserOptions
) => {
  plugins.forEach((p) => {
    const transformData = p.parser?.transformData;

    if (!transformData) return;

    data = transformData({
      data,
      ...options,
      ...createParserPluginContext(p, state),
    });
  });

  return data;
};
