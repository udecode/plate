import type { PlateEditor } from '@udecode/plate/react';

import {
  type SerializeMdOptions,
  serializeMd as BaseSerializeMd,
} from '@udecode/plate-markdown';

import { getChunkTrimmed, isCompleteCodeBlock } from './utils';
import { getRemarkPluginsWithoutMdx } from './utils/getRemarkPlugin';

export const streamSerializeMd = (
  editor: PlateEditor,
  options: SerializeMdOptions,
  chunk: string
) => {
  let result = BaseSerializeMd(editor, {
    remarkPlugins: getRemarkPluginsWithoutMdx(editor),
    ...options,
  });

  const trimedChunk = getChunkTrimmed(chunk);

  if (isCompleteCodeBlock(result)) {
    result = result.trimEnd().slice(0, -3) + trimedChunk;
  }

  // 清理 HTML 空格和零宽字符
  result = result.replace(/&#x20;/g, ' ');
  result = result.replace(/&#x200B;/g, ' ');

  // remove extra \n but not include \n itself
  // FIXME 两个以上的\n可能会失败
  if (trimedChunk !== '\n\n') {
    result = result.trimEnd() + trimedChunk;
  }

  // replace &#x20; to real space

  // 去掉 Markdown 转义符号（包括 chunk 中可能新加入的）
  result = result.replace(/\\([\\`*_{}\\[\]()#+\-\\.!~<>|])/g, '$1');

  return result;
};
