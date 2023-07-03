import { EElementOrText, Value, withoutNormalizing } from '@udecode/slate';

import { PlateEditor } from '../types';
import { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe preInsert then insertFragment.
 */
export const pipeInsertFragment = <V extends Value>(
  editor: PlateEditor<V>,
  injectedPlugins: InjectedPlugin<{}, V>[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: EElementOrText<V>[] }
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return p.editor?.insertData?.preInsert?.(fragment, options) === true;
    });

    editor.insertFragment(fragment);
  });
};
