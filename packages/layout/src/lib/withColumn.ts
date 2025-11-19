import {
  type OverrideEditor,
  type TColumnElement,
  type TColumnGroupElement,
  ElementApi,
  KEYS,
  PathApi,
} from 'platejs';

export const withColumn: OverrideEditor = ({
  editor,
  tf: { normalizeNode, selectAll },
  type,
}) => ({
  transforms: {
    normalizeNode([n, path]) {
      // If it's a column group, ensure it has valid children
      if (
        ElementApi.isElement(n) &&
        n.type === editor.getType(KEYS.columnGroup)
      ) {
        const node = n as TColumnGroupElement;

        // If the first child is a p, unwrap it
        const firstChild = node.children[0];
        if (
          node.children.length === 1 &&
          firstChild.type === editor.getType(KEYS.p)
        ) {
          editor.tf.unwrapNodes({ at: PathApi.child(path, 0) });
        }

        // If no columns found, unwrap the column group
        if (
          !node.children.some(
            (child) => ElementApi.isElement(child) && child.type === type
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
      if (ElementApi.isElement(n) && n.type === type) {
        const node = n as TColumnElement;

        // node.children.forEach((child, index) => {
        //   if (TextApi.isText(child)) {
        //     editor.tf.wrapNodes(
        //       { children: [], type: editor.getType(KEYS.p) },
        //       {
        //         at: PathApi.child(path, index),
        //       }
        //     );
        //   }
        // });

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
          match: { type },
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
