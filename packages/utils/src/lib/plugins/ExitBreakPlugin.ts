import { createBasePlugin } from '@platejs/core';
import { PathApi, type Element, type Node, type Path } from '@platejs/plite';

import { KEYS } from '../plate-keys';

type ExitBreakNodeMatch = (node: Node, path: Path) => boolean;

type ExitBreakOptions = {
  match?: ExitBreakNodeMatch;
  reverse?: boolean;
};

/**
 * Inserts an exit block before or after the current block structure.
 */
export const ExitBreakPlugin = createBasePlugin({
  key: KEYS.exitBreak,

  editOnly: true,
  extension: ({ editor }) => ({
    tx: {
      exitBreak: (tx) => {
        const insertExitBreak = ({ match, reverse }: ExitBreakOptions = {}) => {
          const selection = tx.selection();

          if (!selection || !tx.selection.isCollapsed()) return;

          const block = tx.nodes.block();

          if (!block) return;

          const paragraphType = editor.getType(KEYS.p);

          const target = tx.nodes.above({
            at: block[1],
            match: (node, path) => {
              if (match && !match(node, path)) return false;
              if (path.length === 1) return true;

              const parent = tx.nodes.parent<Element>(path);

              return (
                !!parent &&
                tx.schema.allowsElementType(parent[0].type, paragraphType)
              );
            },
          });
          const ancestorPath = target?.[1] ?? block[1];
          const targetPath = reverse
            ? ancestorPath
            : PathApi.next(ancestorPath);

          tx.nodes.insert(
            {
              children: [{ text: '' }],
              type: paragraphType,
            },
            {
              at: targetPath,
              select: true,
            }
          );

          return true;
        };

        return {
          insert: (options: Omit<ExitBreakOptions, 'reverse'>) =>
            insertExitBreak(options),
          insertBefore: (options: Omit<ExitBreakOptions, 'reverse'>) =>
            insertExitBreak({ ...options, reverse: true }),
        };
      },
    },
  }),
});
