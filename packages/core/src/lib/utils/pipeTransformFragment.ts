import type { TDescendant } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { PlatePluginInsertDataOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getSlatePluginContext } from '../plugin';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = (
  editor: SlateEditor,
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
      ...getSlatePluginContext(editor, p as any),
    });
  });

  return fragment;
};
