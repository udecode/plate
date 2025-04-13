import type { TElement } from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';

import {
  type DeserializeMdOptions,
  deserializeMd as BaseDeserializeMd,
} from '@udecode/plate-markdown';

import { getChunkTrimmed } from './utils';
import { getRemarkPluginsWithoutMdx } from './utils/getRemarkPlugin';

export const streamDeserializeMd = (
  editor: PlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const blocks = BaseDeserializeMd(editor, data, {
    remarkPlugins: getRemarkPluginsWithoutMdx(editor),
    ...options,
  });

  const trimmedData = getChunkTrimmed(data);

  const lastBlock = blocks.at(-1) as TElement | undefined;

  const addNewLine = trimmedData === '\n\n';
  const unshiftNewLine =
    getChunkTrimmed(data, { direction: 'left' }) === '\n\n';

  const isCodeBlockOrTable =
    lastBlock?.type === 'code_block' || lastBlock?.type === 'table';

  /**
   * Deserialize the sting like `123\n\n` will be `123` base on markdown spec
   * but we want to keep the `\n\n`
   */

  let result = blocks;

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

    lastBlock.children.push(...textNode);

    result = [...blocks.slice(0, -1), lastBlock];
  }

  if (addNewLine && !isCodeBlockOrTable) {
    result.push({
      children: [{ text: '' }],
      type: 'p',
    });
  }

  if (unshiftNewLine && !isCodeBlockOrTable) {
    result.unshift({
      children: [{ text: '' }],
      type: 'p',
    });
  }

  return result;
};
