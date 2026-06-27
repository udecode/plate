import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginBase';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getBasePlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: BaseEditor,
  injectedPlugins: Partial<AnyBasePlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  editor.update((tx) => {
    injectedPlugins.some(
      (p) =>
        p.parser?.preInsert?.({
          ...getBasePlugin(editor, p as any),
          fragment,
          ...options,
        }) === true
    );

    tx.fragment.insert(fragment);
  });
};
