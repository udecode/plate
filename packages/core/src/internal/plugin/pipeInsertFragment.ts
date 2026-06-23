import type { Descendant } from '@platejs/plite';

import type { BasePlateEditor } from '../../lib/editor';
import type { ParserOptions } from '../../lib/plugin/BasePlugin';
import type { AnyEditorPlugin } from '../../lib/plugin/EditorPlugin';

import { getCurrentRuntimeTransforms } from '../currentRuntimeBridge';
import { getEditorPlugin } from '../../lib/plugin';

/** Pipe preInsert then insertFragment. */
export const pipeInsertFragment = (
  editor: BasePlateEditor,
  injectedPlugins: Partial<AnyEditorPlugin>[],
  { fragment, ...options }: ParserOptions & { fragment: Descendant[] }
) => {
  const legacyTransforms = getCurrentRuntimeTransforms(editor);

  legacyTransforms.withoutNormalizing(() => {
    injectedPlugins.some(
      (p) =>
        p.parser?.preInsert?.({
          ...getEditorPlugin(editor, p as any),
          fragment,
          ...options,
        }) === true
    );

    legacyTransforms.insertFragment(fragment);
  });
};
