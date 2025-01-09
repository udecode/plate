import type { SlateEditor } from '@udecode/plate';

import { deleteSuggestion } from './deleteSuggestion';

export const deleteFragmentSuggestion = (
  editor: SlateEditor,
  { reverse }: { reverse?: boolean } = {}
) => {
  editor.tf.withoutNormalizing(() => {
    const selection = editor.selection!;

    const [start, end] = editor.api.edges(selection)!;

    if (reverse) {
      editor.tf.collapse({ edge: 'end' });
      deleteSuggestion(
        editor,
        { anchor: end, focus: start },
        { reverse: true }
      );
    } else {
      editor.tf.collapse({ edge: 'start' });
      deleteSuggestion(editor, { anchor: start, focus: end });
    }
  });
};
