import type {
  DescendantIn,
  EditorUpdateTransaction,
  ValueOf,
} from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/PluginConfig';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { getEditorPlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = <TEditor extends BaseEditor>(
  editor: TEditor,
  tx: EditorUpdateTransaction<ValueOf<TEditor>>,
  injectedPlugins: AnyBasePlugin[],
  {
    fragment,
    ...options
  }: ParserOptions & { fragment: DescendantIn<ValueOf<TEditor>>[] }
) => {
  injectedPlugins.some(
    (p) =>
      p.parser?.preInsert?.({
        ...getEditorPlugin(editor, p),
        fragment,
        ...options,
      }) === true
  );

  tx.fragment.insert(fragment);
};
