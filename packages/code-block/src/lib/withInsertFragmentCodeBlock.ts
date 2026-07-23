import type { ExtendPlateEditorExtension } from '@platejs/core';
import {
  ContentSlice,
  editorCommands,
  ElementApi,
  type Element,
  NodeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

const extractCodeLinesFromCodeBlock = (node: Element) =>
  node.children.filter((child): child is Element =>
    ElementApi.isElement(child)
  );

export const withInsertFragmentCodeBlock: ExtendPlateEditorExtension<
  CodeBlockConfig
> = ({ editor, type: codeBlockType }) => ({
  commands: ({ around }) => [
    around(editorCommands.replaceSlice, ({ input, state, next }) => {
      const { options, slice } = input;
      const fragment = [...slice.content];
      const target = options?.at;
      const at =
        target === undefined
          ? (state.selection() ?? undefined)
          : NodeApi.isNode(target)
            ? state.nodes.path(target)
            : target;
      const codeLineType = editor.getType(KEYS.codeLine);

      if (target !== undefined && at === undefined) {
        return next();
      }

      const isInCodeBlock = Boolean(
        state.nodes.block({
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

      return next({
        ...input,
        slice: ContentSlice.withContent(slice, codeLines, { open: 'closed' }),
      });
    }),
  ],
});
