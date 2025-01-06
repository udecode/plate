import type { Editor, EditorAboveOptions, ValueOf } from '../interfaces';

export const removeEmptyPreviousBlock = <E extends Editor>(
  editor: E,
  options: EditorAboveOptions<ValueOf<E>> = {}
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
