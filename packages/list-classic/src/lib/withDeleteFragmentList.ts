import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Descendant,
  type EditorStateView,
  type Element,
  type Range,
  editorCommands,
  NodeApi,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { getHighestEmptyList } from './queries/getHighestEmptyList';
import { hasListChild } from './queries';
import { isAcrossListItems } from './queries/isAcrossListItems';

const getLiStart = (
  editor: BaseEditor,
  selection: Range,
  state: Pick<EditorStateView, 'nodes' | 'points'>
) => {
  const start = state.points.start(selection);

  return start
    ? state.nodes.above({
        at: start,
        match: { type: editor.getType(KEYS.li) },
      })
    : undefined;
};

export const withDeleteFragmentList = ({
  editor,
}: {
  editor: BaseEditor;
}): PlateEditorExtension => ({
  priority: 100,
  commands: ({ around }) => [
    around(editorCommands.deleteFragment, ({ input, state, next }) => {
      const selection =
        input.at === undefined ? state.selection() : state.ranges.get(input.at);

      if (!selection || !isAcrossListItems(editor, selection, state)) {
        return false;
      }

      const end = state.points.end(selection);
      const liEnd = end
        ? state.nodes.above<Element>({
            at: end,
            match: { type: editor.getType(KEYS.li) },
          })
        : undefined;
      const liStartBeforeDelete = getLiStart(editor, selection, state);

      if (!liStartBeforeDelete || !liEnd) return false;

      if (PathApi.isAncestor(liStartBeforeDelete[1], liEnd[1])) {
        const startContent = state.nodes.get<Element>([
          ...liStartBeforeDelete[1],
          0,
        ]);
        const endContent = state.nodes.get<Element>([...liEnd[1], 0]);

        if (startContent && endContent) {
          const children = structuredClone(
            startContent[0].children
          ) as Descendant[];

          for (const child of endContent[0].children as Descendant[]) {
            const previous = children.at(-1);

            if (
              previous &&
              TextApi.isText(previous) &&
              TextApi.isText(child) &&
              TextApi.equals(previous, child, { loose: true })
            ) {
              previous.text += child.text;
            } else {
              children.push(structuredClone(child));
            }
          }

          const [lastText, lastPath] = NodeApi.last(
            { ...startContent[0], children },
            []
          );
          const point = {
            offset: NodeApi.string(lastText).length,
            path: [...startContent[1], ...lastPath],
          };

          return state.transaction((tx) => {
            tx.nodes.replaceChildren(children, {
              at: startContent[1],
              newSelection: { kind: 'text', anchor: point, focus: point },
            });
            tx.nodes.remove({ at: PathApi.parent(liEnd[1]) });
          });
        }
      }

      const liEndRuntimeId = !hasListChild(editor, liEnd[0])
        ? state.runtime.idAt(liEnd[1])
        : undefined;
      const result = next();

      if (result === false || !liEndRuntimeId) return result;

      return state.transaction.extend(result, (tx) => {
        const liEndPath = tx.runtime.pathOf(liEndRuntimeId);
        const nextSelection = tx.selection();

        if (!liEndPath || !nextSelection) return;

        const liStart = getLiStart(editor, nextSelection, tx);
        const listStart = liStart ? tx.nodes.parent(liStart[1]) : undefined;
        const deletePath = getHighestEmptyList(
          editor,
          {
            diffListPath: listStart?.[1],
            liPath: liEndPath,
          },
          tx
        );

        if (deletePath) tx.nodes.remove({ at: deletePath });
      });
    }),
  ],
});
