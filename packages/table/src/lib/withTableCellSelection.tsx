import {
  type At,
  type Path,
  type OverrideEditor,
  combineTransformMatchOptions,
  PathApi,
  RangeApi,
  TextApi,
} from 'platejs';

import type { TableConfig } from '.';

import { getTableGridAbove } from './queries';

const isTargetingSelectedCell = (
  editor: Parameters<OverrideEditor<TableConfig>>[0]['editor'],
  target: At,
  cellPaths: Path[]
) => {
  if (PathApi.isPath(target)) {
    return cellPaths.some((cellPath) => PathApi.isCommon(cellPath, target));
  }

  const range = editor.api.range(target);

  if (!range) return false;

  return cellPaths.some((cellPath) => {
    const cellRange = editor.api.range(cellPath);

    if (!cellRange) return false;

    return (
      RangeApi.includes(cellRange, range.anchor) ||
      RangeApi.includes(cellRange, range.focus) ||
      RangeApi.includes(range, cellRange)
    );
  });
};

export const withTableCellSelection: OverrideEditor<TableConfig> = ({
  api: { marks },
  editor,
  tf: { addMark, removeMark, setNodes },
}) => ({
  api: {
    marks() {
      const apply = () => {
        const { selection } = editor;

        if (!selection || editor.api.isCollapsed()) return;

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });

        if (matchesCell.length <= 1) return;

        const markCounts: Record<string, number> = {};
        const totalMarks: Record<string, any> = {};
        let totalNodes = 0;

        matchesCell.forEach(([_cell, cellPath]) => {
          const textNodeEntry = editor.api.nodes({
            at: cellPath,
            match: (n) => TextApi.isText(n),
          });

          Array.from(textNodeEntry, (item) => item[0]).forEach((item) => {
            totalNodes++;
            const keys = Object.keys(item);

            if (keys.length === 1) return;

            keys.splice(keys.indexOf('text'), 1);

            keys.forEach((k) => {
              markCounts[k] = (markCounts[k] || 0) + 1;
              totalMarks[k] = item[k];
            });
          });
        });

        Object.keys(markCounts).forEach((mark) => {
          if (markCounts[mark] !== totalNodes) {
            delete totalMarks[mark];
          }
        });

        return totalMarks;
      };

      const result = apply();
      if (result) return result;

      return marks();
    },
  },
  transforms: {
    addMark(key, value) {
      const apply = () => {
        const { selection } = editor;

        if (!selection || editor.api.isCollapsed() || editor.meta.isNormalizing)
          return;

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });

        if (matchesCell.length <= 1) return;

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

        return true;
      };

      if (apply()) return;

      return addMark(key, value);
    },

    removeMark(key: string) {
      const apply = () => {
        const { selection } = editor;

        if (!selection || editor.api.isCollapsed() || editor.meta.isNormalizing)
          return;

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });

        if (matchesCell.length <= 1) return;

        matchesCell.forEach(([_cell, cellPath]) => {
          editor.tf.setNodes(
            { [key]: null },
            {
              at: cellPath,
              split: true,
              voids: true,
              match: (n) => TextApi.isText(n),
            }
          );
        });

        return true;
      };

      if (apply()) return;

      return removeMark(key);
    },

    setNodes(props, options) {
      const apply = () => {
        const { selection } = editor;

        if (
          !selection ||
          editor.api.isCollapsed() ||
          editor.meta.isNormalizing
        ) {
          return;
        }

        const matchesCell = getTableGridAbove(editor, { format: 'cell' });
        if (matchesCell.length <= 1) return;

        if (options?.at) {
          const cellPaths = matchesCell.map(([, cellPath]) => cellPath);

          if (!isTargetingSelectedCell(editor, options.at, cellPaths)) {
            return;
          }
        }

        setNodes(props, {
          ...options,
          match: combineTransformMatchOptions(
            editor,
            (_, p) =>
              matchesCell.some(([_, cellPath]) =>
                PathApi.isCommon(cellPath, p)
              ),
            options
          ),
        });

        return true;
      };

      if (apply()) return;

      return setNodes(props, options);
    },
  },
});
