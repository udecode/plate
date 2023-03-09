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

export const withRemoveMarkTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { removeMark, marks } = editor;

  editor.removeMark = (key) => {
    console.log('removeMark', key);
    console.log('marks', marks);

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
            removeMark(key);
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

    removeMark(key);
  };

  return editor;
};
