import type { TDescendant } from '@udecode/slate';

import type {
  AnyEditorPlugin,
  PlateEditor,
  PlatePluginInsertDataOptions,
} from '../types';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = (
  editor: PlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  {
    fragment,
    ...options
  }: { fragment: TDescendant[] } & PlatePluginInsertDataOptions
) => {
  plugins.forEach((p) => {
    const transformFragment = p.editor?.insertData?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      editor,
      plugin: p as any,
    });
  });

  return fragment;
};
