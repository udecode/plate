import type { Descendant } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { ParserOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getEditorPlugin } from '../plugin';

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
