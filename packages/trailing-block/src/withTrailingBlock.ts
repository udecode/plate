import {
  type WithOverride,
  getLastNodeByLevel,
  insertElements,
  queryNode,
} from '@udecode/plate-common';
import { Path } from 'slate';

import type { TrailingBlockPluginOptions } from './TrailingBlockPlugin';

/**
 * Add a trailing block when the last node type is not `type` and when the
 * editor has .
 */
export const withTrailingBlock: WithOverride<TrailingBlockPluginOptions> = ({
  editor,
  plugin: {
    options: { level, type, ...query },
  },
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (currentPath.length === 0) {
      const lastChild = getLastNodeByLevel(editor, level!);

      const lastChildNode = lastChild?.[0];

      if (
        !lastChildNode ||
        (lastChildNode.type !== type && queryNode(lastChild, query))
      ) {
        const at = lastChild ? Path.next(lastChild[1]) : [0];

        insertElements(editor, editor.blockFactory({ type }, at), { at });

        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
