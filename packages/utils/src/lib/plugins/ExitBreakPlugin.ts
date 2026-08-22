import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import { ElementApi, PathApi, type Node, type Path } from '@platejs/plite';

import { PLUGINS } from '../plate-keys';

type ExitBreakNodeMatch = (node: Node, path: Path) => boolean;

type ExitBreakOptions = {
  match?: ExitBreakNodeMatch;
  reverse?: boolean;
};

/**
 * Inserts an exit block before or after the current block structure.
 */
export const ExitBreakPlugin = defineBasePlugin(PLUGINS.exitBreak, {
  editOnly: true,
  update: ({ editor, tx }) => {
    const insertExitBreak = ({ match, reverse }: ExitBreakOptions = {}) => {
      const selection = tx.selection();

      if (!selection || !tx.selection.isCollapsed()) return undefined;

      const block = tx.nodes.block();

      if (!block) return undefined;

      const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;

      const target = tx.nodes.above({
        at: block[1],
        match: (node, path) => {
          if (match && !match(node, path)) return false;
          if (path.length === 1) return true;

          const parent = tx.nodes.parent(path);

          return (
            !!parent &&
            ElementApi.isElement(parent[0]) &&
            tx.schema.allowsElementType(parent[0].type, paragraphType)
          );
        },
      });
      const ancestorPath = target?.[1] ?? block[1];
      const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);

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
      insert: (options: Omit<ExitBreakOptions, 'reverse'> = {}) =>
        insertExitBreak(options),
      insertBefore: (options: Omit<ExitBreakOptions, 'reverse'> = {}) =>
        insertExitBreak({ ...options, reverse: true }),
    };
  },
});
