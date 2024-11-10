import {
  type ReplaceNodeChildrenOptions,
  type SlateEditor,
  type TElement,
  getBlockAbove,
  getStartPoint,
  replaceNode,
  select,
} from '@udecode/plate-common';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

export const toggleColumnGroup = (
  editor: SlateEditor,
  {
    at,
    layout = 2,
  }: Partial<Omit<ReplaceNodeChildrenOptions<TElement>, 'nodes'>> & {
    layout?: number[] | number;
  } = {}
) => {
  const entry = getBlockAbove(editor, { at });

  if (!entry) return;

  const [node] = entry;

  const columnLayout = Array.isArray(layout)
    ? layout
    : Array(layout).fill(Math.floor(100 / layout));

  const nodes = {
    children: columnLayout.map((width, index) => ({
      children: [index === 0 ? node : editor.api.create.block()],
      type: BaseColumnItemPlugin.key,
      width: `${width}%`,
    })),
    layout: columnLayout,
    type: BaseColumnPlugin.key,
  } as TElement;

  replaceNode(editor, {
    at: entry[1],
    nodes,
  });

  select(editor, getStartPoint(editor, entry[1].concat([0])));
};
