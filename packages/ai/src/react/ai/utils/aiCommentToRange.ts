import { deserializeMd } from '@platejs/markdown';
import {
  type Element,
  type NodeEntry,
  type Range,
  NodeApi,
} from '@platejs/plite';
import type { PlateEditor } from '@platejs/core/react';

import type { TComment } from '../../ai-chat/internal/types';

import { findTextRangeInBlock } from './findTextRangeInBlock';

export const aiCommentToRange = (
  editor: PlateEditor,
  aiComment: TComment
): Range | undefined => {
  const { blockId, content } = aiComment;

  const contentNodes = deserializeMd(editor, content);

  let firstBlock: NodeEntry<Element> | undefined;

  const ranges: Range[] = [];
  contentNodes.forEach((node, index) => {
    let currentBlock: NodeEntry<Element> | undefined;

    if (index === 0) {
      firstBlock = editor.read.nodes.find<Element>({
        at: [],
        match: { id: blockId },
      });
      currentBlock = firstBlock;
    } else {
      if (!firstBlock) return;

      const [, firstBlockPath] = firstBlock;

      const blockPath = [firstBlockPath[0] + index];
      currentBlock = editor.read.nodes.get<Element>(blockPath);
    }

    if (!currentBlock) return;

    const range = findTextRangeInBlock({
      block: currentBlock,
      findText: NodeApi.string(node),
    });

    if (!range) return;

    ranges.push(range);
  });

  if (ranges.length === 0) return;

  if (ranges.length > 1) {
    const startRange = ranges[0];
    const endRange = ranges.at(-1);

    if (!endRange) return;

    return {
      anchor: startRange.anchor,
      focus: endRange.focus,
    };
  }

  if (ranges.length === 1) {
    return ranges[0];
  }
};
