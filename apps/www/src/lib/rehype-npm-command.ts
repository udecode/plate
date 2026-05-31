import type { UnistNode, UnistTree } from '@/types/unist';

import { visit } from 'unist-util-visit';

import { getNpmCommands } from './npm-command';

export function rehypeNpmCommand() {
  return (tree: UnistTree) => {
    visit(tree as any, (node: UnistNode) => {
      if (node.type !== 'element' || node?.tagName !== 'pre') {
        return;
      }

      const commands = getNpmCommands(node.properties?.__rawString__);

      if (commands) {
        node.properties ??= {};
        Object.assign(node.properties, commands);
      }
    });
  };
}
