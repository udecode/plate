import {
  type PlateEditor,
  type TElement,
  type Value,
  getNodeEntries,
  isCollapsed,
  isText,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common/server';

import { getTableGridAbove } from './queries';

export const withMarkTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { addMark, getMarks, removeMark } = editor;

  editor.addMark = (key: string, value: any) => {
    const { selection } = editor;

    if (!selection || isCollapsed(selection)) return addMark(key, value);

    const matchesCell = getTableGridAbove(editor, { format: 'cell' });

    if (matchesCell.length <= 1) return addMark(key, value);

    matchesCell.forEach(([cell, cellPath]) => {
      setNodes<TElement>(
        editor,
        {
          [key]: value,
        },
        {
          at: cellPath,
          match: (n) => isText(n),
          split: true,
          voids: true,
        }
      );
    });
  };

  editor.removeMark = (key: string) => {
    const { selection } = editor;

    if (!selection || isCollapsed(selection)) return removeMark(key);

    const matchesCell = getTableGridAbove(editor, { format: 'cell' });

    if (matchesCell.length === 0) return removeMark(key);

    matchesCell.forEach(([cell, cellPath]) => {
      unsetNodes(editor, key, {
        at: cellPath,
        match: (n) => isText(n),
        split: true,
        voids: true,
      });
    });
  };

  editor.getMarks = () => {
    const { selection } = editor;

    if (!selection || isCollapsed(selection)) return getMarks();

    const matchesCell = getTableGridAbove(editor, { format: 'cell' });

    if (matchesCell.length === 0) return getMarks();

    const totalMarks: Record<string, any> = {};

    matchesCell.forEach(([cell, cellPath]) => {
      const textNodeEntry = getNodeEntries(editor, {
        at: cellPath,
        match: (n) => isText(n),
      });

      Array.from(textNodeEntry, (item) => item[0]).forEach((item) => {
        const keys = Object.keys(item);

        if (keys.length === 1) return;

        keys.splice(keys.indexOf('text'), 1);

        keys.forEach((k) => {
          totalMarks[k] = item[k];
        });
      });
    });

    return totalMarks;
  };

  return editor;
};
