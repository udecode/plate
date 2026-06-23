import type { Descendant } from '@platejs/plite';

import type { BasePlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/EditorPlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe insert-data transformFragment hooks. */
export const pipeTransformFragment = (
  editor: BasePlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...getEditorPlugin(editor, p as any),
    });
  });

  return fragment;
};
