import type { EElementOrText, Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  plugins: InjectedPlugin<{}, V, E>[],
  {
    fragment,
    ...options
  }: { fragment: EElementOrText<V>[] } & PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment(fragment, options);
  });

  return fragment;
};
