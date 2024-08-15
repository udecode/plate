import type { TDescendant } from '@udecode/slate';

import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

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
      api: editor.api,
      editor,
      plugin: p as any,
    });
  });

  return fragment;
};
