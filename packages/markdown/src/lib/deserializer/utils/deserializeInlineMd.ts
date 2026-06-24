import { type Descendant, type BasePlateEditor, ElementApi } from 'platejs';

import type { DeserializeMdOptions } from '../deserializeMd';
import type { MarkdownConfig } from '../../MarkdownPlugin';

import { stripMarkdownBlocks } from './stripMarkdown';

const LEADING_SPACES_REGEX = /^\s*/;
const TRAILING_SPACES_REGEX = /\s*$/;

export const deserializeInlineMd = (
  editor: BasePlateEditor,
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

  const markdownApi = (editor.api as unknown as MarkdownConfig['api']).markdown;
  const result = markdownApi.deserialize(strippedText, options)[0];

  if (result) {
    const nodes = ElementApi.isElement(result) ? result.children : [result];
    fragment.push(...nodes);
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};
