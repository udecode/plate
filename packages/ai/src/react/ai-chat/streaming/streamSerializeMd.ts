import type { PlateEditor } from 'platejs/react';

import { type SerializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import {
  type Descendant,
  ElementApi,
  getPluginKey,
  KEYS,
  TextApi,
} from 'platejs';

import {
  getChunkTrimmed,
  isCompleteCodeBlock,
  isCompleteMath,
} from './utils/utils';

// fixes test: should serialize heading with tailing line break
// fixes test: incomplete line breaks
const trimEndHeading = (
  editor: PlateEditor,
  value: Descendant[]
): { trimmedText: string; value: Descendant[] } => {
  const headingKeys = new Set([
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
    headingKeys.has(
      (getPluginKey(editor, lastBlock.type as string) ?? lastBlock.type) as any
    ) &&
    ElementApi.isElement(lastBlock)
  ) {
    const lastTextNode = lastBlock.children.at(-1);

    if (TextApi.isText(lastTextNode)) {
      const trimmedText = getChunkTrimmed(lastTextNode?.text as string);

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
        trimmedText: trimmedText,
        value: [...value.slice(0, -1), newLastBlock],
      };
    }
  }

  return { trimmedText: '', value };
};

export const streamSerializeMd = (
  editor: PlateEditor,
  options: SerializeMdOptions,
  chunk: string
) => {
  const { value: optionsValue, ...restOptions } = options;
  const { value } = trimEndHeading(editor, optionsValue ?? editor.children);

  let result = '';

  result = editor.getApi(MarkdownPlugin).markdown.serialize({
    preserveEmptyParagraphs: false,
    value: value,
    ...restOptions,
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
