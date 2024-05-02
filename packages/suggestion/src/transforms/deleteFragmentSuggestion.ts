import {
  collapseSelection,
  getEdgePoints,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import { deleteSuggestion } from './deleteSuggestion';

export const deleteFragmentSuggestion = <V extends Value>(
  editor: PlateEditor<V>,
  { reverse }: { reverse?: boolean } = {}
) => {
  withoutNormalizing(editor, () => {
    const selection = editor.selection!;

    const [start, end] = getEdgePoints(editor, selection);

    if (reverse) {
      collapseSelection(editor, { edge: 'end' });
      deleteSuggestion(
        editor,
        { anchor: end, focus: start },
        { reverse: true }
      );
    } else {
      collapseSelection(editor, { edge: 'start' });
      deleteSuggestion(editor, { anchor: start, focus: end });
    }
  });
};
