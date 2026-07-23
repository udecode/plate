import type { Descendant, EditorCoreStateView } from '@platejs/plite';

import type { ParserOptions } from '../../lib/plugin/PluginConfig';
import {
  createParserPluginContext,
  type PreparedParserPluginEntry,
} from './prepareParserRegistry';

/** Pipe insert-data transformFragment hooks. */
export const pipeTransformFragment = (
  state: EditorCoreStateView,
  plugins: readonly PreparedParserPluginEntry[],
  { fragment, ...options }: ParserOptions & { fragment: readonly Descendant[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...createParserPluginContext(p, state),
    });
  });

  return fragment;
};
