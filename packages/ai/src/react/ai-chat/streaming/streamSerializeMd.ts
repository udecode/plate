import type { PlateEditor } from '@platejs/core/react';

import type { MarkdownEditor, SerializeMdOptions } from '@platejs/markdown';
import {
  type Descendant,
  type Element,
  ElementApi,
  TextApi,
  type Value,
} from '@platejs/plite';
import { getPluginKey } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  getChunkTrimmed,
  isCompleteCodeBlock,
  isCompleteMath,
} from './utils/utils';

const STREAM_LINE_BREAK_PLACEHOLDER = '\uE000platejs-stream-line-break\uE000';

// fixes test: should serialize heading with tailing line break
// fixes test: incomplete line breaks
const trimEndHeading = (
  editor: PlateEditor,
  value: Value
): { trimmedText: string; value: Value } => {
  const headingKeys = new Set<string>([
    KEYS.h1,
    KEYS.h2,
    KEYS.h3,
    KEYS.h4,
    KEYS.h5,
    KEYS.h6,
  ]);
  const lastBlock = value.at(-1);

  if (
    lastBlock &&
    ElementApi.isElement(lastBlock) &&
    headingKeys.has(getPluginKey(editor, lastBlock.type) ?? lastBlock.type)
  ) {
    const lastTextNode = lastBlock.children.at(-1);

    if (TextApi.isText(lastTextNode)) {
      const trimmedText = getChunkTrimmed(lastTextNode.text);

      // Create a new lastBlock with immutable operations
      const newChildren = [
        ...lastBlock.children.slice(0, -1),
        { text: lastTextNode.text.trimEnd() },
      ];

      const newLastBlock = {
        ...lastBlock,
        children: newChildren,
      };

      return {
        trimmedText,
        value: [...value.slice(0, -1), newLastBlock],
      };
    }
  }

  return { trimmedText: '', value };
};

const escapeEmbeddedTextLineBreaks = (
  nodes: Descendant[]
): { hasLineBreaks: boolean; value: Descendant[] } => {
  let hasLineBreaks = false;

  const value = nodes.map((node) => {
    if (TextApi.isText(node)) {
      if (node.text !== '\n' && node.text.includes('\n')) {
        hasLineBreaks = true;

        return {
          ...node,
          text: node.text.replaceAll('\n', STREAM_LINE_BREAK_PLACEHOLDER),
        };
      }

      return node;
    }

    if (ElementApi.isElement(node)) {
      const escapedChildren = escapeEmbeddedTextLineBreaks(node.children);

      if (escapedChildren.hasLineBreaks) {
        hasLineBreaks = true;

        return {
          ...node,
          children: escapedChildren.value,
        };
      }
    }

    return node;
  });

  return { hasLineBreaks, value };
};

export const streamSerializeMd = (
  editor: MarkdownEditor<PlateEditor>,
  options: SerializeMdOptions,
  chunk: string
) => {
  const { value: optionsValue, ...restOptions } = options;
  const sourceValue = optionsValue ?? {
    children: [...editor.read.children()],
  };
  const { value: trimmedValue } = trimEndHeading(editor, [
    ...sourceValue.children,
  ]);
  const escapedValue = escapeEmbeddedTextLineBreaks(trimmedValue);

  if (
    !escapedValue.value.every((node): node is Element =>
      ElementApi.isElement(node)
    )
  ) {
    throw new Error('Markdown documents must contain block elements.');
  }

  let result = '';

  result = editor.api.markdown.serialize({
    ...restOptions,
    value: { ...sourceValue, children: escapedValue.value },
  });

  const trimmedChunk = getChunkTrimmed(chunk);

  if (isCompleteCodeBlock(result) && !chunk.endsWith('```')) {
    result = result.trimEnd().slice(0, -3) + trimmedChunk;
  }

  if (isCompleteMath(result) && !chunk.endsWith('$$')) {
    result = result.trimEnd().slice(0, -3) + trimmedChunk;
  }

  // clean HTML spaces and zero-width characters
  result = result.replace(/&#x20;/g, ' ');
  result = result.replace(/&#x200B;/g, ' ');
  result = result.replace(/\u200B/g, '');

  if (escapedValue.hasLineBreaks) {
    result = result.replaceAll(STREAM_LINE_BREAK_PLACEHOLDER, '\n');
  }

  if (trimmedChunk.includes('\n') && trimmedChunk !== '\n\n') {
    const trimmedResult = result.trimEnd();

    if (trimmedResult.endsWith('\n<br />')) {
      result = trimmedResult.slice(0, -'<br />'.length);
    } else {
      const trailingWhitespaceBreakSuffix = `${trimmedChunk}\n`;

      if (result.endsWith(trailingWhitespaceBreakSuffix)) {
        result = result.slice(0, -trailingWhitespaceBreakSuffix.length);
      }
    }
  }

  // remove extra \n but not include \n itself
  // FIXME maybe failed when chunk is more than two'\n'
  if (trimmedChunk !== '\n\n') {
    result = result.trimEnd() + trimmedChunk;
  }

  // Handle empty paragraph case for streaming
  if (chunk.endsWith('\n\n')) {
    if (result === '\n') {
      // Single empty paragraph case
      result = '';
    } else if (result.endsWith('\n\n')) {
      // Multiple paragraphs ending with empty paragraph
      result = result.slice(0, -1);
    }
  }

  // replace &#x20; to real space

  // remove Markdown escape characters (including those potentially added in the chunk)
  result = result.replace(/\\([\\`*_{}\\[\]()#+\-\\.!~<>|$])/g, '$1');

  return result;
};
