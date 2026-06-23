import {
  combinePlateMatchOptions,
  createEditorPlugin,
  getPluginByType,
  type InsertExitBreakOptions,
  type PlateNodeMatch,
  type PluginConfig,
} from '@platejs/core';
import { PathApi } from '@platejs/plite';

import { KEYS } from '../plate-keys';

export type ExitBreakConfig = PluginConfig<
  'exitBreak',
  {},
  {},
  {},
  {},
  {
    exitBreak: {
      insert: (
        options: Omit<InsertExitBreakOptions, 'reverse'>
      ) => boolean | void;
      insertBefore: (
        options: Omit<InsertExitBreakOptions, 'reverse'>
      ) => boolean | void;
    };
  }
>;

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createEditorPlugin<ExitBreakConfig>({
  key: KEYS.exitBreak,
  editOnly: true,
}).extendTxGroup('exitBreak', ({ editor }) => (tx) => {
  const insertExitBreak = ({ match, reverse }: InsertExitBreakOptions = {}) => {
    if (!editor.selection || !editor.api.isCollapsed()) return;

    const block = editor.api.block();

    if (!block) return;

    const target = editor.api.above({
      at: block[1],
      match: combinePlateMatchOptions(
        (node, path) =>
          path.length === 1 ||
          (path.length > 1 &&
            typeof node === 'object' &&
            node !== null &&
            'type' in node &&
            typeof node.type === 'string' &&
            !getPluginByType(editor, node.type)?.node.isStrictSiblings),
        match as PlateNodeMatch
      ),
    });
    const ancestorPath = target?.[1] ?? block[1];
    const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);

    tx.nodes.insert(editor.api.create.block(), {
      at: targetPath,
      select: true,
    });

    return true;
  };

  return {
    insert: (options: Omit<InsertExitBreakOptions, 'reverse'>) =>
      insertExitBreak(options),
    insertBefore: (options: Omit<InsertExitBreakOptions, 'reverse'>) =>
      insertExitBreak({ ...options, reverse: true }),
  };
});
