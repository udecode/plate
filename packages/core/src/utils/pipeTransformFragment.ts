import { TDescendant } from '../slate/node/TDescendant';
import { Value } from '../slate/editor/TEditor';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformFragment
 */
export const pipeTransformFragment = <V extends Value, T = {}>(
  plugins: InjectedPlugin<V, T>[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: TDescendant[] }
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;
    if (!transformFragment) return;

    fragment = transformFragment(fragment, options);
  });

  return fragment;
};
