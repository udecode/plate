import type { PlateEditor } from '@udecode/plate/react';

import { MarkdownPlugin } from '@udecode/plate-markdown';

// FIXME: if user use remark-mdx as the function name it will fail
export const getRemarkPluginsWithoutMdx = (editor: PlateEditor) => {
  return editor.getOption(MarkdownPlugin, 'remarkPlugins').filter((p) => {
    return p.name !== 'remarkMdx';
  });
};
