import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { EElementOrText } from '../../../../slate-utils/src/slate/element/TElement';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlatePluginInsertDataOptions } from '../../types/plugin/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformFragment
 */
export const pipeTransformFragment = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  plugins: InjectedPlugin<{}, V, E>[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: EElementOrText<V>[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;
    if (!transformFragment) return;

    fragment = transformFragment(fragment, options);
  });

  return fragment;
};
