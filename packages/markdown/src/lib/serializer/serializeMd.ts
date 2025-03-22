import type { Descendant, SlateEditor } from '@udecode/plate';

import remarkGfm from 'remark-gfm';
import math from 'remark-math';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { mdast } from './types';

import { convertNodes } from './convertNodes';

/** Serialize the editor value to Markdown. */
export const serializeMd = (editor: SlateEditor, options?: any) => {
  const toRemarkProcessor = unified()
    .use(remarkGfm)
    .use(math)
    .use(remarkStringify);

  // const plugins = editor.pluginList.filter(
  //   (p) => p.node.isElement || p.node.isLeaf
  // );

  // const pluginNodes = plugins.reduce(
  //   (acc, plugin) => {
  //     (acc as any)[plugin.key] = {
  //       isLeaf: plugin.node.isLeaf,
  //       isVoid: plugin.node.isVoid,
  //       type: plugin.node.type,
  //     } as SerializeMdNodeOptions;

  //     return acc;
  //   },
  //   {} as SerializeMdOptions['nodes']
  // );

  const nodesToSerialize = options?.value ?? editor.children;

  return toRemarkProcessor.stringify(slateToMdast(nodesToSerialize));
};

const slateToMdast = (nodes: Descendant[], overrides?: any): mdast.Root => {
  const r = {
    children: convertNodes(
      nodes as Descendant[],
      overrides
    ) as mdast.Root['children'],
    type: 'root',
  };
  return r as mdast.Root;
};
