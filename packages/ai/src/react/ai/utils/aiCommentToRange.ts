import { deserializeMd } from '@platejs/markdown';
import {
  type NodeEntry,
  type Range,
  type SlateEditor,
  type TElement,
  NodeApi,
} from 'platejs';

import type { TComment } from '../../ai-chat/internal/types';

import { findTextRangeInBlock } from './findTextRangeInBlock';

export const aiCommentToRange = (
  editor: SlateEditor,
  aiComment: TComment
): Range | undefined => {
  const { blockId, content } = aiComment;

  const contentNodes = deserializeMd(editor, content);

  let firstBlock: NodeEntry<TElement> | undefined;

  const ranges: Range[] = [];
  contentNodes.forEach((node, index) => {
    let currentBlock: NodeEntry<TElement> | undefined;

    if (index === 0) {
      firstBlock = editor.api.node<TElement>({ id: blockId, at: [] });
      currentBlock = firstBlock;
    } else {
      if (!firstBlock) return;

      const [_, firstBlockPath] = firstBlock;

      const blockPath = [firstBlockPath[0] + index];
      currentBlock = editor.api.node(blockPath);
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
    const endRange = ranges.at(-1)!;

    return {
      anchor: startRange.anchor,
      focus: endRange.focus,
    };
  }

  if (ranges.length === 1) {
    return ranges[0];
  }
};
