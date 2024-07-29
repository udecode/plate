import { type TDescendant, withoutNormalizing } from '@udecode/slate';

import type { PlateEditor } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: PlateEditor,
  injectedPlugins: InjectedPlugin[],
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return p.editor?.insertData?.preInsert?.(fragment, options) === true;
    });

    editor.insertFragment(fragment);
  });
};
