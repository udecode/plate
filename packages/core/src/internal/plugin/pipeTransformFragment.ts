import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginBase';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getBasePlugin } from '../../lib/plugin';

/** Pipe insert-data transformFragment hooks. */
export const pipeTransformFragment = (
  editor: BaseEditor,
  plugins: Partial<AnyBasePlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...getBasePlugin(editor, p as any),
    });
  });

  return fragment;
};
