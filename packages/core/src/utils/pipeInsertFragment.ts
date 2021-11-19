import { Editor } from 'slate';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { TDescendant } from '../types/slate/TDescendant';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe preInsert then insertFragment.
 */
export const pipeInsertFragment = <T = {}>(
  editor: PlateEditor<T>,
  injectedPlugins: InjectedPlugin<T>[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: TDescendant[] }
) => {
  Editor.withoutNormalizing(editor, () => {
    injectedPlugins.some((p) => {
      return p.editor?.insertData?.preInsert?.(fragment, options) === true;
    });

    editor.insertFragment(fragment);
  });
};
