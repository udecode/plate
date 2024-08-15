import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

import { getPluginContext } from '../plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: PlateEditor,
  injectedPlugins: Partial<AnyEditorPlugin>[],
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return (
        p.editor?.insertData?.preInsert?.({
          ...getPluginContext(editor, p as any),
          fragment,
          ...options,
        }) === true
      );
    });

    editor.insertFragment(fragment);
  });
};
