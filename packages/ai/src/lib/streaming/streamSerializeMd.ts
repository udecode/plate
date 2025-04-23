import type { PlateEditor } from '@udecode/plate/react';

import { type Descendant, ElementApi, TextApi } from '@udecode/plate';
import {
  type SerializeMdOptions,
  MarkdownPlugin,
} from '@udecode/plate-markdown';

import { getChunkTrimmed, isCompleteCodeBlock, isCompleteMath } from './utils';

// fixes test: should serialize heading with tailing line break
// fixes test: incomplete line breaks
const trimEndHeading = (
  value: Descendant[]
): { trimmedText: string; value: Descendant[] } => {
  const headingKeys = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const lastBlock = value.at(-1);

  if (
    lastBlock &&
    headingKeys.has(lastBlock.type as string) &&
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
  const { value } = trimEndHeading(optionsValue ?? editor.children);

  let result = '';

  result = editor.getApi(MarkdownPlugin).markdown.serialize({
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

  // remove extra \n but not include \n itself
  // FIXME maybe failed when chunk is more than two'\n'
  if (trimmedChunk !== '\n\n') {
    result = result.trimEnd() + trimmedChunk;
  }

  // replace &#x20; to real space

  // remove Markdown escape characters (including those potentially added in the chunk)
  result = result.replace(/\\([\\`*_{}\\[\]()#+\-\\.!~<>|$])/g, '$1');

  return result;
};
