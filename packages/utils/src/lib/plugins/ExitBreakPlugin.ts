import {
  createEditorPlugin,
  getPluginByType,
  type PluginConfig,
} from '@platejs/core';
import { PathApi, type Location, type Node, type Path } from '@platejs/plite';

import { KEYS } from '../plate-keys';

export type ExitBreakConfig = PluginConfig<
  'exitBreak',
  {},
  {},
  {},
  {},
  {
    exitBreak: {
      insert: (options: Omit<ExitBreakOptions, 'reverse'>) => boolean | void;
      insertBefore: (
        options: Omit<ExitBreakOptions, 'reverse'>
      ) => boolean | void;
    };
  }
>;

type ExitBreakNodeMatch = (node: Node, path: Path) => boolean;

type ExitBreakOptions = {
  at?: Location;
  match?: ExitBreakNodeMatch | Record<string, readonly unknown[] | unknown>;
  reverse?: boolean;
};

const createExitBreakNodeMatch = (
  match: unknown
): ExitBreakNodeMatch | null => {
  if (!match) return null;
  if (typeof match === 'function') return match as ExitBreakNodeMatch;
  if (typeof match !== 'object' || Array.isArray(match)) return null;

  return (node) =>
    typeof node === 'object' &&
    node !== null &&
    Object.entries(match).every(([key, expected]) => {
      const actual = (node as Record<string, unknown>)[key];

      return Array.isArray(expected)
        ? expected.includes(actual)
        : actual === expected;
    });
};

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createEditorPlugin<ExitBreakConfig>({
  key: KEYS.exitBreak,
  editOnly: true,
}).extendTxGroup('exitBreak', ({ editor }) => (tx) => {
  const insertExitBreak = ({ match, reverse }: ExitBreakOptions = {}) => {
    if (!editor.selection || !editor.api.isCollapsed()) return;

    const block = editor.api.block();

    if (!block) return;

    const optionMatch = createExitBreakNodeMatch(match);
    const target = editor.api.above({
      at: block[1],
      match: (node: Node, path: Path) =>
        (path.length === 1 ||
          (path.length > 1 &&
            typeof node === 'object' &&
            node !== null &&
            'type' in node &&
            typeof node.type === 'string' &&
            !getPluginByType(editor, node.type)?.node.isStrictSiblings)) &&
        (!optionMatch || optionMatch(node, path)),
    });
    const ancestorPath = target?.[1] ?? block[1];
    const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);
    const paragraphType = editor.plugins.p ? editor.getType('p') : 'p';

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
