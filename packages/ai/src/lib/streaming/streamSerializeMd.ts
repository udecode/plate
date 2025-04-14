import type { PlateEditor } from '@udecode/plate/react';

import { type Descendant, ElementApi, TextApi } from '@udecode/plate';
import {
  type SerializeMdOptions,
  serializeMd as BaseSerializeMd,
} from '@udecode/plate-markdown';

import { getChunkTrimmed, isCompleteCodeBlock } from './utils';
import { getRemarkPluginsWithoutMdx } from './utils/getRemarkPlugin';

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

  let result = BaseSerializeMd(editor, {
    remarkPlugins: getRemarkPluginsWithoutMdx(editor),
    value: value,
    ...restOptions,
  });

  const trimmedChunk = getChunkTrimmed(chunk);

  if (isCompleteCodeBlock(result)) {
    result = result.trimEnd().slice(0, -3) + trimmedChunk;
  }

  // 清理 HTML 空格和零宽字符
  result = result.replace(/&#x20;/g, ' ');
  result = result.replace(/&#x200B;/g, ' ');

  // remove extra \n but not include \n itself
  // FIXME 两个以上的\n可能会失败
  if (trimmedChunk !== '\n\n') {
    result = result.trimEnd() + trimmedChunk;
  }

  // replace &#x20; to real space

  // 去掉 Markdown 转义符号（包括 chunk 中可能新加入的）
  result = result.replace(/\\([\\`*_{}\\[\]()#+\-\\.!~<>|])/g, '$1');

  return result;
};
