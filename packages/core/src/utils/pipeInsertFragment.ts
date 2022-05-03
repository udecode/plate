import { withoutNormalizing } from '../slate/editor/withoutNormalizing';
import { TDescendant } from '../slate/types/TDescendant';
import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe preInsert then insertFragment.
 */
export const pipeInsertFragment = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  injectedPlugins: InjectedPlugin<V, T>[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: TDescendant[] }
) => {
  withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return p.editor?.insertData?.preInsert?.(fragment, options) === true;
    });

    editor.insertFragment(fragment);
  });
};
