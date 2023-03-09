import {
  getEndPoint,
  getPluginType,
  getStartPoint,
  isRangeInSameBlock,
  PlateEditor,
  select,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { ELEMENT_TABLE } from './createTablePlugin';
import { getTableGridAbove } from './queries';

export const withAddMarkTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { addMark } = editor;

  editor.addMark = (key, value) => {
    if (
      isRangeInSameBlock(editor, {
        match: (n) => n.type === getPluginType(editor, ELEMENT_TABLE),
      })
    ) {
      const cellEntries = getTableGridAbove(editor, { format: 'cell' });
      if (cellEntries.length > 1) {
        withoutNormalizing(editor, () => {
          cellEntries.forEach(([, cellPath]) => {
            select(editor, cellPath);
            addMark(key, value);
          });

          // set back the selection
          select(editor, {
            anchor: getStartPoint(editor, cellEntries[0][1]),
            focus: getEndPoint(editor, cellEntries[cellEntries.length - 1][1]),
          });
        });

        return;
      }
    }

    addMark(key, value);
  };

  return editor;
};
