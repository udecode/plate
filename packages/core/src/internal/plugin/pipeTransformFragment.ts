import type { Descendant } from '@udecode/slate';

import type { SlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/SlatePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe editor.tf.insertData.transformFragment */
export const pipeTransformFragment = (
  editor: SlateEditor,
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
