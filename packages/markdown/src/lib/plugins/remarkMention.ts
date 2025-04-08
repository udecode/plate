import type { Node, Parent, RootContent, Text } from 'mdast';
import type { Plugin } from 'unified';

import { visit } from 'unist-util-visit';

export interface MentionNode {
  children: { type: 'text'; value: string }[];
  type: 'mention';
  username: string;
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    mention: MentionNode;
  }
}

/**
 * A remark plugin that converts @username patterns in text nodes into mention
 * nodes. This plugin runs after remark-gfm and transforms @username patterns
 * into special mention nodes that can be later converted into Plate mention
 * elements.
 */
export const remarkMention: Plugin = function () {
  return (tree: Node) => {
    visit(
      tree,
      'text',
      (node: Text, index: number, parent: Parent | undefined) => {
        if (!parent || typeof index !== 'number') return;

        const mentionPattern = /(?:^|\s)@([^\s]+)/g;
        const parts: (MentionNode | Text)[] = [];
        let lastIndex = 0;
        let match;

        const text = node.value;
        while ((match = mentionPattern.exec(text)) !== null) {
          const mentionStart = match[0].startsWith(' ')
            ? match.index + 1
            : match.index;

          if (mentionStart > lastIndex) {
            parts.push({
              type: 'text',
              value: text.slice(lastIndex, mentionStart),
            });
          }

          parts.push({
            children: [{ type: 'text', value: `@${match[1]}` }],
            type: 'mention',
            username: match[1],
          });

          lastIndex =
            mentionStart + match[0].length - (match[0].startsWith(' ') ? 1 : 0);
        }

        if (lastIndex < text.length) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex),
          });
        }

        if (parts.length > 0) {
          parent.children.splice(index, 1, ...(parts as RootContent[]));
        }
      }
    );
  };
};
