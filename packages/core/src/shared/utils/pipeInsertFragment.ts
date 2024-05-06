import {
  type EElementOrText,
  type Value,
  withoutNormalizing,
} from '@udecode/slate';

import type { PlateEditor } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = <V extends Value>(
  editor: PlateEditor<V>,
  injectedPlugins: InjectedPlugin<{}, V>[],
  {
    fragment,
    ...options
  }: { fragment: EElementOrText<V>[] } & PlatePluginInsertDataOptions
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return p.editor?.insertData?.preInsert?.(fragment, options) === true;
    });

    editor.insertFragment(fragment);
  });
};
