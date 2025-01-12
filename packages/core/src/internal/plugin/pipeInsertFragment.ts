import type { Descendant } from '@udecode/slate';

import type { SlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/SlatePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: SlateEditor,
  injectedPlugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  editor.tf.withoutNormalizing(() => {
    injectedPlugins.some((p) => {
      return (
        p.parser?.preInsert?.({
          ...getEditorPlugin(editor, p as any),
          fragment,
          ...options,
        }) === true
      );
    });

    editor.tf.insertFragment(fragment);
  });
};
