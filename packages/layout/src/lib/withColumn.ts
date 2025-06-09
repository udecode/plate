import {
  type OverrideEditor,
  type TColumnElement,
  type TColumnGroupElement,
  ElementApi,
  KEYS,
  PathApi,
} from '@udecode/plate';

export const withColumn: OverrideEditor = ({
  editor,
  tf: { normalizeNode, selectAll },
}) => ({
  transforms: {
    normalizeNode([n, path]) {
      // If it's a column group, ensure it has valid children
      if (
        ElementApi.isElement(n) &&
        n.type === editor.getType(KEYS.columnGroup)
      ) {
        const node = n as TColumnGroupElement;

        // If no columns found, unwrap the column group
        if (
          !node.children.some(
            (child) =>
              ElementApi.isElement(child) &&
              child.type === editor.getType(KEYS.column)
          )
        ) {
          editor.tf.removeNodes({ at: path });

          return;
        }
        // If only one column remains, unwrap the group (optional logic)
        if (node.children.length < 2) {
          editor.tf.withoutNormalizing(() => {
            editor.tf.unwrapNodes({ at: path });
            editor.tf.unwrapNodes({ at: path });
          });

          return;
        }

        // PERF: only run when the number of columns changes
        editor.tf.withoutNormalizing(() => {
          // Add new width normalization logic
          const totalColumns = node.children.length;
          let widths = node.children.map((col) => {
            const parsed = Number.parseFloat(col.width);

            return Number.isNaN(parsed) ? 0 : parsed;
          });

          const sum = widths.reduce((acc, w) => acc + w, 0);

          if (sum !== 100) {
            const diff = 100 - sum;
            const adjustment = diff / totalColumns;

            widths = widths.map((w) => w + adjustment);

            // Update the columns with the new widths
            widths.forEach((w, i) => {
              const columnPath = path.concat([i]);
              editor.tf.setNodes<TColumnElement>(
                { width: `${w}%` },
                { at: columnPath }
              );
            });
          }
        });
      }
      // If it's a column, ensure it has at least one block (optional)
      if (ElementApi.isElement(n) && n.type === editor.getType(KEYS.column)) {
        const node = n as TColumnElement;

        if (node.children.length === 0) {
          editor.tf.removeNodes({ at: path });

          return;
        }
      }

      return normalizeNode([n, path]);
    },
    selectAll: () => {
      const apply = () => {
        const at = editor.selection;

        if (!at) return;

        const column = editor.api.above({
          match: { type: editor.getType(KEYS.column) },
        });

        if (!column) return;

        let targetPath = column[1];

        if (
          editor.api.isStart(editor.api.start(at), targetPath) &&
          editor.api.isEnd(editor.api.end(at), targetPath)
        ) {
          targetPath = PathApi.parent(targetPath);
        }

        if (targetPath.length === 0) return;

        editor.tf.select(targetPath);

        return true;
      };

      if (apply()) return true;

      return selectAll();
    },
  },
});
