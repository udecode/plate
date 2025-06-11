import type { PlateEditor } from 'platejs/react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import { type TElement, KEYS, TextApi } from 'platejs';

import { getChunkTrimmed } from './utils';
import { escapeInput } from './utils/escapeInput';

export const streamDeserializeMd = (
  editor: PlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const input = escapeInput(data);

  let blocks = [];

  blocks = editor.getApi(MarkdownPlugin).markdown.deserialize(input, options);

  const trimmedData = getChunkTrimmed(data);

  const lastBlock = blocks.at(-1) as TElement | undefined;

  const addNewLine = trimmedData === '\n\n';
  const unshiftNewLine =
    getChunkTrimmed(data, { direction: 'left' }) === '\n\n';

  const isCodeBlockOrTable =
    lastBlock?.type === 'code_block' || lastBlock?.type === 'table';

  let result = blocks;

  /**
   * Deserialize the sting like `123\n\n` will be `123` base on markdown spec
   * but we want to keep the `\n\n`
   */

  if (
    lastBlock &&
    !isCodeBlockOrTable &&
    trimmedData.length > 0 &&
    !addNewLine
  ) {
    const textNode = [
      {
        text: trimmedData,
      },
    ];

    const lastChild = lastBlock.children.at(-1);

    /** It’s like normalizing and merging the text nodes. */
    if (
      lastChild &&
      TextApi.isText(lastChild) &&
      Object.keys(lastChild).length === 1
    ) {
      lastBlock.children.pop();

      const textNode = [
        {
          text: lastChild.text + trimmedData,
        },
      ];

      lastBlock.children.push(...textNode);
    } else {
      lastBlock.children.push(...textNode);
    }

    result = [...blocks.slice(0, -1), lastBlock];
  }

  if (addNewLine && !isCodeBlockOrTable) {
    result.push({
      children: [{ text: '' }],
      type: KEYS.p,
    });
  }

  if (unshiftNewLine && !isCodeBlockOrTable) {
    result.unshift({
      children: [{ text: '' }],
      type: KEYS.p,
    });
  }

  return result;
};
