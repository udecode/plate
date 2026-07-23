import type { BaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

/** Select inserted blocks from the last commit. */
export const selectInsertedBlocks = (editor: BaseEditor) => {
  const { setOption } = editor.plugin(BlockSelectionPlugin);
  const ids = new Set<string>();
  const commit = editor.read.lastCommit();

  if (commit) {
    for (const runtimeId of commit.changed.runtimeIds('node')) {
      if (commit.before.index.pathOf(runtimeId)) continue;

      const path = commit.after.index.pathOf(runtimeId);
      const node = path ? editor.read.nodes.get(path)?.[0] : undefined;

      if (node?.id && editor.read.schema.isBlock(node)) {
        ids.add(node.id as string);
      }
    }
  }

  setOption('selectedIds', ids);
};
