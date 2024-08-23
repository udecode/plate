import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { ParserOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getPluginContext } from '../plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: SlateEditor,
  injectedPlugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: { fragment: TDescendant[] } & ParserOptions
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return (
        p.parser?.preInsert?.({
          ...getPluginContext(editor, p as any),
          fragment,
          ...options,
        }) === true
      );
    });

    editor.insertFragment(fragment);
  });
};
