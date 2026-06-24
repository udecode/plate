import type { Descendant } from '@platejs/plite';

import type { BasePlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/EditorPlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: BasePlateEditor,
  injectedPlugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  editor.update((tx) => {
    injectedPlugins.some(
      (p) =>
        p.parser?.preInsert?.({
          ...getEditorPlugin(editor, p as any),
          fragment,
          ...options,
        }) === true
    );

    tx.fragment.insert(fragment);
  });
};
