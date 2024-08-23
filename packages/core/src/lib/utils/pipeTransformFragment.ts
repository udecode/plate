import type { TDescendant } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { ParserOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getPluginContext } from '../plugin';

/** Pipe editor.insertData.transformFragment */
export const pipeTransformFragment = (
  editor: SlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: { fragment: TDescendant[] } & ParserOptions
) => {
  plugins.forEach((p) => {
    const transformFragment = p.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      fragment,
      ...options,
      ...getPluginContext(editor, p as any),
    });
  });

  return fragment;
};
