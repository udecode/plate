import { Editor } from 'slate';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePluginInjectedPlugin } from '../types/plugins/PlatePluginInjectedPlugin';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { TDescendant } from '../types/slate/TDescendant';

/**
 * Pipe preInsert then insertFragment.
 */
export const pipeInsertFragment = <T = {}>(
  editor: PlateEditor<T>,
  injectedPlugins: PlatePluginInjectedPlugin[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: TDescendant[] }
) => {
  Editor.withoutNormalizing(editor, () => {
    injectedPlugins.some(
      ({ preInsert }) => preInsert?.(fragment, options) === true
    );

    editor.insertFragment(fragment);
  });
};
