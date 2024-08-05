import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type { PlateEditor, PlatePluginList } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: PlateEditor,
  injectedPlugins: PlatePluginList,
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return (
        p.editor?.insertData?.preInsert?.({
          editor,
          fragment,
          plugin: p,
          ...options,
        }) === true
      );
    });

    editor.insertFragment(fragment);
  });
};
