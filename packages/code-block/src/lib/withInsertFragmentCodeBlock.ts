import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi, type Element, NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

const extractCodeLinesFromCodeBlock = (node: Element) =>
  node.children.filter((child): child is Element =>
    ElementApi.isElement(child)
  );

export const withInsertFragmentCodeBlock: ExtendPlateEditorExtension<
  CodeBlockConfig
> = ({ editor, type: codeBlockType }) => ({
  transforms: {
    insertFragment({ fragment, next, options, tx }) {
      const at = options?.at ?? tx.selection() ?? undefined;
      const codeLineType = editor.getType(KEYS.codeLine);
      const isInCodeBlock = Boolean(
        editor.read.nodes.block({
          at,
          match: { type: [codeBlockType, codeLineType] },
        })
      );

      if (!isInCodeBlock) {
        return next();
      }

      const codeLines = fragment.flatMap((node) => {
        if (ElementApi.isElement(node) && node.type === codeBlockType) {
          return extractCodeLinesFromCodeBlock(node);
        }

        return [
          {
            children: [{ text: NodeApi.string(node) }],
            type: codeLineType,
          },
        ];
      });

      const [firstLine, ...restLines] = codeLines;
      const firstLineText = firstLine ? NodeApi.string(firstLine) : '';

      if (options?.at === undefined) {
        if (firstLineText) {
          tx.text.insert(firstLineText);
        }

        if (restLines.length > 0) {
          tx.nodes.insert(restLines);
        }

        return true;
      }

      const insertionPoint = editor.read.points.start(options.at);

      if (!insertionPoint) return true;

      const insertionRef = tx.refs.point(insertionPoint, {
        affinity: 'forward',
      });

      if (firstLineText) {
        tx.text.insert(firstLineText, options);
      }

      const restAt = insertionRef.unref();

      if (restAt && restLines.length > 0) {
        tx.nodes.insert(restLines, { ...options, at: restAt });
      }

      return true;
    },
  },
});
