import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

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
          api: editor.api,
          editor,
          fragment,
          plugin: p as any,
          ...options,
        }) === true
      );
    });

    editor.insertFragment(fragment);
  });
};
