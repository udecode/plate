import type { Descendant } from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';

import type { DeserializeMdOptions } from '../deserializeMd';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { stripMarkdownBlocks } from './stripMarkdown';

export const deserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  const leadingSpaces = /^\s*/.exec(text)?.[0] || '';
  const trailingSpaces = /\s*$/.exec(text)?.[0] || '';

  const strippedText = stripMarkdownBlocks(text.trim());

  const fragment: Descendant[] = [];

  if (leadingSpaces) {
    fragment.push({ text: leadingSpaces });
  }
  if (strippedText) {
    fragment.push(
      ...editor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(strippedText, options)[0].children
    );
  }
  if (trailingSpaces) {
    fragment.push({ text: trailingSpaces });
  }

  return fragment;
};
