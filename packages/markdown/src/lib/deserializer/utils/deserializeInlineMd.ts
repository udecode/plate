import type { BaseEditor } from '@platejs/core';
import { type Descendant, ElementApi } from '@platejs/plite';

import {
  type DeserializeMdOptions,
  markdownToSlateNodes,
} from '../deserializeMd';

import { stripMarkdownBlocks } from './stripMarkdown';

const LEADING_SPACES_REGEX = /^\s*/;
const TRAILING_SPACES_REGEX = /\s*$/;

export const deserializeInlineMd = (
  editor: BaseEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  const trimmedText = text.trim();
  const leadingSpaces = LEADING_SPACES_REGEX.exec(text)?.[0] || '';
  const trailingSpaces = TRAILING_SPACES_REGEX.exec(text)?.[0] || '';

  const strippedText = stripMarkdownBlocks(trimmedText);

  if (!strippedText) {
    return text ? [{ text }] : [];
  }

  const fragment: Descendant[] = [];

  if (leadingSpaces) {
    fragment.push({ text: leadingSpaces });
  }

  const result = markdownToSlateNodes(editor, strippedText, options)[0];

  if (result) {
    const nodes = ElementApi.isElement(result) ? result.children : [result];
    fragment.push(...nodes);
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};
