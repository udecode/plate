import type { PlateEditor } from '@udecode/plate-common/react';

import { type TDescendant, getNodeString } from '@udecode/plate-common';
import { MarkdownPlugin, serializeMdNodes } from '@udecode/plate-markdown';

import { stripMarkdownBlocks } from '../../ai';

// TODO: move to markdown plugin
export const deserializeInlineMd = (editor: PlateEditor, text: string) => {
  const leadingSpaces = /^\s*/.exec(text)?.[0] || '';
  const trailingSpaces = /\s*$/.exec(text)?.[0] || '';

  const strippedText = stripMarkdownBlocks(text.trim());

  const fragment: TDescendant[] = [];

  if (leadingSpaces) {
    fragment.push({ text: leadingSpaces });
  }
  if (strippedText) {
    fragment.push(
      ...editor.getApi(MarkdownPlugin).markdown.deserialize(strippedText)[0]
        .children
    );
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};

// TODO: add keepLeadingSpaces option to serializeMdNodes
export const serializeInlineMd = (nodes: TDescendant[]) => {
  if (nodes.length === 0) return '';

  let leadingSpaces = '';

  // Check for leading spaces in the first node
  const firstNodeText = getNodeString(nodes[0]);
  const leadingMatch = /^\s*/.exec(firstNodeText);
  leadingSpaces = leadingMatch ? leadingMatch[0] : '';

  // Serialize the content
  const serializedContent = serializeMdNodes(nodes);

  return leadingSpaces + serializedContent;
};
