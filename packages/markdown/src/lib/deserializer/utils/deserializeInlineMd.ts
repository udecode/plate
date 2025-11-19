import { type Descendant, type SlateEditor, ElementApi } from 'platejs';

import type { DeserializeMdOptions } from '../deserializeMd';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { stripMarkdownBlocks } from './stripMarkdown';

const LEADING_SPACES_REGEX = /^\s*/;
const TRAILING_SPACES_REGEX = /\s*$/;

export const deserializeInlineMd = (
  editor: SlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  const leadingSpaces = LEADING_SPACES_REGEX.exec(text)?.[0] || '';
  const trailingSpaces = TRAILING_SPACES_REGEX.exec(text)?.[0] || '';

  const strippedText = stripMarkdownBlocks(text.trim());

  const fragment: Descendant[] = [];

  if (leadingSpaces) {
    fragment.push({ text: leadingSpaces });
  }

  if (strippedText) {
    const result = editor
      .getApi(MarkdownPlugin)
      .markdown.deserialize(strippedText, options)[0];

    if (result) {
      const nodes = ElementApi.isElement(result) ? result.children : [result];
      fragment.push(...nodes);
    }
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};
