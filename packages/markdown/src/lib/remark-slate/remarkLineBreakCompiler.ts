import type { TDescendant, TText } from '@udecode/plate-common';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkTransformNode } from './remarkTransformNode';

export const remarkLineBreakCompiler = (
  node: MdastNode,
  options: RemarkPluginOptions
) => {
  const results: TDescendant[] = [];
  let startLine = node.position!.start.line;

  const addEmptyParagraphs = (count: number) => {
    if (count > 0) {
      results.push(
        ...Array.from({ length: count }).map(() => {
          return {
            children: [{ text: '' } as TText],
            type: options.editor.getType({ key: 'p' }),
          };
        })
      );
    }
  };

  node?.children?.forEach((child, index) => {
    const isFirstChild = index === 0;
    const isLastChild = index === node.children!.length - 1;

    const emptyLinesBefore =
      child.position!.start.line - (isFirstChild ? startLine : startLine + 1);
    addEmptyParagraphs(emptyLinesBefore);

    const transformValue = remarkTransformNode(child, options);
    results.push(
      ...(Array.isArray(transformValue) ? transformValue : [transformValue])
    );

    if (isLastChild) {
      const emptyLinesAfter =
        node.position!.end.line - child.position!.end.line - 1;
      addEmptyParagraphs(emptyLinesAfter);
    }

    startLine = child.position!.end.line;
  });

  return results;
};
