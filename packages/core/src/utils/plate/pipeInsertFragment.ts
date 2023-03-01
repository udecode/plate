import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { withoutNormalizing } from '../../../../slate-utils/src/slate/editor/withoutNormalizing';
import { EElementOrText } from '../../../../slate-utils/src/slate/element/TElement';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlatePluginInsertDataOptions } from '../../types/plugin/PlatePluginInsertData';
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
