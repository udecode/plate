/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export function remarkPlugin(options: RemarkPluginOptions) {
  const compiler = (node: { children: MdastNode[] }) => {
    return node.children.flatMap((child) =>
      remarkTransformNode(child, options)
    );
  };

  // @ts-ignore
  this.Compiler = compiler;
}
