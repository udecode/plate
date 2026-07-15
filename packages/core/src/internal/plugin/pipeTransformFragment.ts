import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginConfig';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe insert-data transformFragment hooks. */
export const pipeTransformFragment = (
  editor: BaseEditor,
  plugins: AnyBasePlugin[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...getEditorPlugin(editor, p),
    });
  });

  return fragment;
};
