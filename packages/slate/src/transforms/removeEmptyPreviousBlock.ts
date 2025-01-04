import type { TEditor, ValueOf } from '../interfaces';
import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

export const removeEmptyPreviousBlock = <E extends TEditor>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) => {
  const entry = editor.api.block(options);

  if (!entry) return;

  const prevEntry = editor.api.previous({
    at: entry[1],
    sibling: true,
  });

  if (prevEntry && editor.api.isEmpty(prevEntry[0])) {
    editor.tf.removeNodes({ at: prevEntry[1] });
  }
};
