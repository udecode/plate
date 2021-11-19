import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { TDescendant } from '../types/slate/TDescendant';
import { InjectedPlugin } from './getInjectedPlugins';

/**
 * Pipe editor.insertData.transformFragment
 */
export const pipeTransformFragment = <T = {}>(
  plugins: InjectedPlugin<T>[],
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
