import { createBasePlugin, getPluginByType } from '@platejs/core';
import { ElementApi, PathApi, type Node, type Path } from '@platejs/plite';

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
}).extendTxGroup('exitBreak', ({ editor }) => (tx) => {
  const insertExitBreak = ({ match, reverse }: ExitBreakOptions = {}) => {
    const selection = editor.read.selection();

    if (!selection || !editor.read.selection.isCollapsed()) return;

    const block = editor.read.nodes.block();

    if (!block) return;

    const target = editor.read.nodes.above({
      at: block[1],
      match: (node, path) =>
        (path.length === 1 ||
          (path.length > 1 &&
            ElementApi.isElement(node) &&
            !getPluginByType(editor, node.type)?.node.isStrictSiblings)) &&
        (!match || match(node, path)),
    });
    const ancestorPath = target?.[1] ?? block[1];
    const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);
    const paragraphType = editor.plugins[KEYS.p]
      ? editor.getType(KEYS.p)
      : KEYS.p;

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
});
