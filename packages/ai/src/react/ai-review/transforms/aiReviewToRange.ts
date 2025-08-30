import { deserializeMd } from '@platejs/markdown';
import {
  Descendant,
  TText,
  TextApi,
  ElementApi,
  Range,
  KEYS,
  SlateEditor,
} from 'platejs';
import { PlateEditor } from 'platejs/react';

export const aiReviewToRange = (
  editor: SlateEditor,
  aiComment: { blockId: string; comment: string; content: string },
  onComment: (commentWithRange: { comment: string; range: Range }) => void
) => {
  const { blockId, comment, content } = aiComment;

  const contentNodes = deserializeMd(editor, content);
  const texts = visitTextNodes(editor, contentNodes);

  // don't support void node
  if (texts.length === 0) return;

  /*
   * Known limitation:
   * If a block (e.g. a large table / columns) contains repeated content,
   * using only `blockId + content` may be ambiguous,
   * since the same text could appear multiple times within the block.
   *
   * Mitigation:
   * - In practice most blocks (paragraphs, list items, blockquote) are small,
   *   so risk is low.
   * - If needed, tables can be split into smaller blocks (e.g. per <td>).
   * - Future extension: add offset or hash to disambiguate within a block.
   */
  if (texts.length === 1) {
    const findText = texts[0].text;
    const targetRange = findTextRangeInBlock(editor, {
      blockId,
      findText,
    });

    if (!targetRange) return;

    onComment({
      comment: comment,
      range: targetRange,
    });
  } else {
    const firstText = texts[0].text;
    const lastText = texts.at(-1)!.text;

    const targetRange = findTextRangeAcrossBlocks(editor, {
      blockId,
      firstText,
      lastText,
    });

    if (!targetRange) return;

    onComment({
      comment: comment,
      range: targetRange,
    });
  }
};

const visitTextNodes = (
  editor: SlateEditor,
  nodes: Descendant[],
  texts: TText[] = []
) => {
  for (const node of nodes) {
    if (TextApi.isText(node)) {
      texts.push(node);
    } else if (ElementApi.isElement(node)) {
      visitTextNodes(editor, node.children, texts);
    }
  }
  return texts;
};

// Helper function to find text range within a block
const findTextRangeInBlock = (
  editor: SlateEditor,
  { blockId, findText }: { blockId: string; findText: string }
): Range | null => {
  const blockPath = editor.api.node({ id: blockId, at: [] })![1];

  const targetNodeEntry = editor.api.node<TText>({
    at: blockPath,
    match: (n: any) => TextApi.isText(n) && n.text.includes(findText),
  })!;

  if (!targetNodeEntry) {
    console.warn('targetNode not found');
    return null;
  }

  const [targetNode, targetPath] = targetNodeEntry;
  const text = targetNode.text;
  const startIndex = text.indexOf(findText);
  const endIndex = startIndex + findText.length;

  return {
    anchor: {
      offset: startIndex,
      path: targetPath,
    },
    focus: {
      offset: endIndex,
      path: targetPath,
    },
  };
};

// Helper function to find text range across multiple blocks
const findTextRangeAcrossBlocks = (
  editor: SlateEditor,
  {
    blockId,
    firstText,
    lastText,
  }: { blockId: string; firstText: string; lastText: string }
): Range | null => {
  const firstNodeRange = findTextRangeInBlock(editor, {
    blockId,
    findText: firstText,
  });

  if (!firstNodeRange) {
    console.warn('targetNode not found');
    return null;
  }

  const editorEndPath = editor.api.end([editor.children.length - 1]);

  const findRange = {
    anchor: firstNodeRange.focus,
    focus: editorEndPath!,
  };

  const targetNodeEntry2 = editor.api.node<TText>({
    at: findRange,
    match: (n: any) => TextApi.isText(n) && n.text.includes(lastText),
  })!;

  if (!targetNodeEntry2) {
    console.warn('targetNode not found');
    return null;
  }

  const [targetNode2, targetPath2] = targetNodeEntry2;
  const text2 = targetNode2.text;
  const startIndex2 = text2.indexOf(lastText);
  const endIndex2 = startIndex2 + lastText.length;

  const secondNodeRange: Range = {
    focus: {
      offset: endIndex2,
      path: targetPath2,
    },
    anchor: {
      offset: startIndex2,
      path: targetPath2,
    },
  };

  return {
    anchor: firstNodeRange.anchor,
    focus: secondNodeRange.focus,
  };
};
