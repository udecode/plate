import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type {
  AnyEditorPlugin,
  PlateEditor,
  PlatePluginInsertDataOptions,
} from '../types';

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
