import type { TDescendant } from '@udecode/slate';

import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';
import type { InjectedPlugin } from './getInjectedPlugins';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = (
  plugins: InjectedPlugin[],
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment(fragment, options);
  });

  return fragment;
};
