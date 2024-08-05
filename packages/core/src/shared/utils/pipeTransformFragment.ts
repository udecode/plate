import type { TDescendant } from '@udecode/slate';

import type { PlateEditor, PlatePluginList } from '../types';
import type { PlatePluginInsertDataOptions } from '../types/plugin/PlatePluginInsertData';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = (
  editor: PlateEditor,
  plugins: PlatePluginList,
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({ fragment, ...options, editor, plugin: p });
  });

  return fragment;
};
