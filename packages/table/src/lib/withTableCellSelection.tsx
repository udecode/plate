import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
import {
  type Location,
  type Path,
  ElementApi,
  NodeApi,
  PathApi,
  RangeApi,
  TextApi,
} from '@platejs/plite';

import type { TableConfig } from './BaseTablePlugin';

import { getTableGridAbove } from './queries';

const isTargetingSelectedCell = (
  editor: BaseEditor,
  target: Location,
  cellPaths: Path[]
) => {
  if (PathApi.isPath(target)) {
    return cellPaths.some((cellPath) => PathApi.isCommon(cellPath, target));
  }

  const range = editor.read.ranges.get(target);

  if (!range) return false;

  return cellPaths.some((cellPath) => {
    const cellRange = editor.read.ranges.get(cellPath);

    return (
      !!cellRange &&
      (RangeApi.includes(cellRange, range.anchor) ||
        RangeApi.includes(cellRange, range.focus) ||
        RangeApi.includes(range, cellRange))
    );
  });
};

export const withTableCellSelection: ExtendPlateEditorExtension<
  TableConfig
> = ({ editor }) => ({
  queries: {
    marks: {
      get({ next }) {
        const selection = editor.read.selection();

        if (!selection || editor.read.selection.isCollapsed()) return next();

        const cells = getTableGridAbove(editor, { format: 'cell' });

        if (cells.length <= 1) return next();

        const markCounts: Record<string, number> = {};
        const marks: Record<string, unknown> = {};
        let textCount = 0;

        cells.forEach(([, cellPath]) => {
          editor.read.nodes
            .toArray({ at: cellPath, match: (node) => TextApi.isText(node) })
            .forEach(([text]) => {
              textCount++;

              Object.keys(text).forEach((key) => {
                if (key === 'text') return;

                markCounts[key] = (markCounts[key] ?? 0) + 1;
                marks[key] = text[key];
              });
            });
        });

        Object.keys(markCounts).forEach((key) => {
          if (markCounts[key] !== textCount) delete marks[key];
        });

        return marks;
      },
    },
  },
  transforms: {
    addMark({ key, next, tx, value }) {
      if (!editor.read.selection() || editor.read.selection.isCollapsed()) {
        return next();
      }

      const cells = getTableGridAbove(editor, { format: 'cell' });

      if (cells.length <= 1) return next();

      cells.forEach(([, cellPath]) => {
        tx.nodes.set({ [key]: value }, { at: cellPath, marks: true });
      });

      return true;
    },
    removeMark({ key, next, tx }) {
      if (!editor.read.selection() || editor.read.selection.isCollapsed()) {
        return next();
      }

      const cells = getTableGridAbove(editor, { format: 'cell' });

      if (cells.length <= 1) return next();

      cells.forEach(([, cellPath]) => {
        tx.nodes.unset(key, {
          at: cellPath,
          match: (node) => TextApi.isText(node),
        });
      });

      return true;
    },
    setNodes({ next, options, props }) {
      if (options?.marks) return next();

      if (!editor.read.selection() || editor.read.selection.isCollapsed()) {
        return next();
      }

      const cells = getTableGridAbove(editor, { format: 'cell' });

      if (cells.length <= 1) return next();

      const cellPaths = cells.map(([, cellPath]) => cellPath);

      if (
        options?.at &&
        !isTargetingSelectedCell(editor, options.at, cellPaths)
      ) {
        return next();
      }

      const optionMatch = options?.match;
      const optionAt = options?.at;

      return next({
        options: {
          ...options,
          match: (node, path) => {
            if (
              !cellPaths.some((cellPath) => PathApi.isCommon(cellPath, path))
            ) {
              return false;
            }

            if (optionMatch) return NodeApi.matches(node, optionMatch, path);
            if (optionAt && PathApi.isPath(optionAt)) {
              return PathApi.equals(path, optionAt);
            }

            return (
              ElementApi.isElement(node) && editor.read.nodes.isBlock(node)
            );
          },
        },
        props,
      });
    },
  },
});
