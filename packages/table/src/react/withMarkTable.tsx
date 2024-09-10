import type { ExtendEditor } from '@udecode/plate-common/react';

import {
  type TElement,
  getNodeEntries,
  isCollapsed,
  isText,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';

import type { TableConfig } from '../lib';

import { getTableGridAbove } from './queries';

export const withMarkTable: ExtendEditor<TableConfig> = ({ editor }) => {
  const { addMark, getMarks, removeMark } = editor;

  editor.addMark = (key, value) => {
    const { selection } = editor;

    if (!selection || isCollapsed(selection)) return addMark(key, value);

    const matchesCell = getTableGridAbove(editor, { format: 'cell' });

    if (matchesCell.length <= 1) return addMark(key, value);

    matchesCell.forEach(([_cell, cellPath]) => {
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

  editor.removeMark = (key) => {
    const { selection } = editor;

    if (!selection || isCollapsed(selection)) return removeMark(key);

    const matchesCell = getTableGridAbove(editor, { format: 'cell' });

    if (matchesCell.length === 0) return removeMark(key);

    matchesCell.forEach(([_cell, cellPath]) => {
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

    matchesCell.forEach(([_cell, cellPath]) => {
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
