import { Value } from '@udecode/plate-common/server';

import { remarkTransformNode } from './remarkTransformNode';
import { MdastNode, RemarkPluginOptions } from './types';

export function remarkPlugin<V extends Value>(options: RemarkPluginOptions<V>) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    return node.children.flatMap((child) =>
      remarkTransformNode(child, options)
    );
  };

  // @ts-ignore
  this.Compiler = compiler;
}
