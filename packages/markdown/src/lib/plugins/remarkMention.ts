import type { Node, Parent, RootContent, Text } from 'mdast';
import type { Plugin } from 'unified';

import { visit } from 'unist-util-visit';

export interface MentionNode {
  children: { type: 'text'; value: string }[];
  type: 'mention';
  username: string;
  displayText?: string;
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    mention: MentionNode;
  }
}

/**
 * A remark plugin that converts @username patterns and [display
 * text](mention:id) patterns in text nodes into mention nodes. This plugin runs
 * after remark-gfm and transforms mention patterns into special mention nodes
 * that can be later converted into Plate mention elements.
 *
 * Supports two formats:
 *
 * - @username - Simple mention format (no spaces allowed)
 * - [display text](mention:id) - Markdown link-style format (supports spaces)
 */
export const remarkMention: Plugin = function () {
  return (tree: Node) => {
    // First, convert link nodes with mention: protocol to mention nodes
    visit(
      tree,
      'link',
      (node: any, index: number, parent: Parent | undefined) => {
        if (!parent || typeof index !== 'number') return;

        // Check if this is a mention link
        if (node.url?.startsWith('mention:')) {
          let username = node.url.slice('mention:'.length);
          // Decode URL-encoded spaces and special characters
          username = decodeURIComponent(username);
          const displayText = node.children?.[0]?.value || username;

          const mentionNode: MentionNode = {
            children: [{ type: 'text', value: displayText }],
            displayText: displayText,
            type: 'mention',
            username: username,
          };

          parent.children[index] = mentionNode as any;
        }
      }
    );

    // Then process text nodes for @mentions
    visit(
      tree,
      'text',
      (node: Text, index: number, parent: Parent | undefined) => {
        if (!parent || typeof index !== 'number') return;

        // Skip processing @mentions within link nodes
        // Links should remain as links, not be converted to mentions
        if (parent.type === 'link') return;

        // Pattern for @username mentions (no spaces)
        // Matches @username but excludes trailing punctuation
        const atMentionPattern = /(?:^|\s)@([a-zA-Z0-9_-]+)(?=[\s.,;:!?)]|$)/g;

        const parts: (MentionNode | Text)[] = [];
        let lastIndex = 0;

        const text = node.value;
        const allMatches: { end: number; node: MentionNode; start: number }[] =
          [];

        // Find all @username mentions
        let match;
        while ((match = atMentionPattern.exec(text)) !== null) {
          const mentionStart = match[0].startsWith(' ')
            ? match.index + 1
            : match.index;
          const mentionEnd =
            mentionStart + match[0].length - (match[0].startsWith(' ') ? 1 : 0);

          allMatches.push({
            end: mentionEnd,
            node: {
              children: [{ type: 'text', value: `@${match[1]}` }],
              type: 'mention',
              username: match[1],
            },
            start: mentionStart,
          });
        }

        // Sort matches by start position
        allMatches.sort((a, b) => a.start - b.start);

        // Build the parts array
        for (const matchInfo of allMatches) {
          if (matchInfo.start > lastIndex) {
            parts.push({
              type: 'text',
              value: text.slice(lastIndex, matchInfo.start),
            });
          }
          parts.push(matchInfo.node);
          lastIndex = matchInfo.end;
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
