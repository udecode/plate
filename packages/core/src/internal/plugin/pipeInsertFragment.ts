import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginConfig';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: BaseEditor,
  injectedPlugins: AnyBasePlugin[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  editor.update((tx) => {
    injectedPlugins.some(
      (p) =>
        p.parser?.preInsert?.({
          ...getEditorPlugin(editor, p),
          fragment,
          ...options,
        }) === true
    );

    tx.fragment.insert(fragment);
  });
};
