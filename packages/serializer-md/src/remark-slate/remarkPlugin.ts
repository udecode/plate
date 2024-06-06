/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Value } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export function remarkPlugin<V extends Value>(options: RemarkPluginOptions<V>) {
  const compiler = (node: { children: MdastNode[] }) => {
    return node.children.flatMap((child) =>
      remarkTransformNode(child, options)
    );
  };

  // @ts-ignore
  this.Compiler = compiler;
}
