import { PlatePluginInjectedPlugin } from '../types/plugins/PlatePluginInjectedPlugin';
import { PlatePluginInsertDataOptions } from '../types/plugins/PlatePluginInsertData';
import { TDescendant } from '../types/slate/TDescendant';

/**
 * Pipe injectPlugins.transformFragment
 */
export const pipeTransformFragment = (
  injectedPlugins: PlatePluginInjectedPlugin[],
  {
    fragment,
    ...options
  }: PlatePluginInsertDataOptions & { fragment: TDescendant[] }
) => {
  injectedPlugins.forEach(({ transformFragment }) => {
    if (!transformFragment) return;

    fragment = transformFragment(fragment, options);
  });

  return fragment;
};
