import type { PlateEditor } from '@udecode/plate/react';

import {
  type DeserializeMdOptions,
  deserializeInlineMd as BaseDeserializeInlineMd,
} from '@udecode/plate-markdown';

import { getRemarkPluginsWithoutMdx } from './utils/getRemarkPlugin';

export const streamDeserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  const blocks = BaseDeserializeInlineMd(editor, text, {
    remarkPlugins: getRemarkPluginsWithoutMdx(editor),
    ...options,
  });

  return blocks;
};
