import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import type { DeserializeMdOptions } from '../deserializeMd';

export const remarkSplitLineBreaks: Plugin<
  [DeserializeMdOptions?],
  Root,
  Root
> = function ({ splitLineBreaks = false } = {}) {
  if (!splitLineBreaks) return;

  return function transformer(tree: Root) {
    const processNode = (node: any) => {
      if (!node.position) return node;

      if (node.children) {
        const newChildren: any[] = [];
        let lastLine = node.position.start.line;

        node.children.forEach((child: any, index: number) => {
          const isFirstChild = index === 0;
          const isLastChild = index === node.children.length - 1;

          // Add empty paragraphs for line breaks before the child
          const emptyLinesBefore =
            child.position.start.line -
            (isFirstChild ? lastLine : lastLine + 1);
          if (emptyLinesBefore > 0) {
            for (let i = 0; i < emptyLinesBefore; i++) {
              newChildren.push({
                children: [{ type: 'text', value: '' }],
                position: {
                  end: { column: 1, line: lastLine + i + 1 },
                  start: { column: 1, line: lastLine + i + 1 },
                },
                type: 'paragraph',
              });
            }
          }

          // Add the child node
          newChildren.push(processNode(child));

          // Add empty paragraphs for line breaks after the last child
          if (isLastChild) {
            const emptyLinesAfter =
              node.position.end.line - child.position.end.line - 1;
            if (emptyLinesAfter > 0) {
              for (let i = 0; i < emptyLinesAfter; i++) {
                newChildren.push({
                  children: [{ type: 'text', value: '' }],
                  position: {
                    end: { column: 1, line: child.position.end.line + i + 1 },
                    start: {
                      column: 1,
                      line: child.position.end.line + i + 1,
                    },
                  },
                  type: 'paragraph',
                });
              }
            }
          }

          lastLine = child.position.end.line;
        });

        node.children = newChildren;
      }

      return node;
    };

    return processNode(tree);
  };
};
