import { type OverrideEditor, TextApi } from '@udecode/plate';

import type { TableConfig } from '.';

import { getTableGridAbove } from './queries';

export const withMarkTable: OverrideEditor<TableConfig> = ({
  api: { marks },
  editor,
  tf: { addMark, removeMark },
}) => ({
  api: {
    marks() {
      const { selection } = editor;

      if (!selection || editor.api.isCollapsed()) return marks();

      const matchesCell = getTableGridAbove(editor, { format: 'cell' });

      if (matchesCell.length === 0) return marks();

      const totalMarks: Record<string, any> = {};

      matchesCell.forEach(([_cell, cellPath]) => {
        const textNodeEntry = editor.api.nodes({
          at: cellPath,
          match: (n) => TextApi.isText(n),
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
    },
  },
  transforms: {
    addMark(key: string, value: any) {
      const { selection } = editor;

      if (!selection || editor.api.isCollapsed()) return addMark(key, value);

      const matchesCell = getTableGridAbove(editor, { format: 'cell' });

      if (matchesCell.length <= 1) return addMark(key, value);

      matchesCell.forEach(([_cell, cellPath]) => {
        editor.tf.setNodes(
          {
            [key]: value,
          },
          {
            at: cellPath,
            split: true,
            voids: true,
            match: (n) => TextApi.isText(n),
          }
        );
      });
    },

    removeMark(key: string) {
      const { selection } = editor;

      if (!selection || editor.api.isCollapsed()) return removeMark(key);

      const matchesCell = getTableGridAbove(editor, { format: 'cell' });

      if (matchesCell.length === 0) return removeMark(key);

      matchesCell.forEach(([_cell, cellPath]) => {
        editor.tf.unsetNodes(key, {
          at: cellPath,
          split: true,
          voids: true,
          match: (n) => TextApi.isText(n),
        });
      });
    },
  },
});
