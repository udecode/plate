import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
import {
  type Descendant,
  type Element,
  type Range,
  NodeApi,
  PathApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { getHighestEmptyList } from './queries/getHighestEmptyList';
import { hasListChild } from './queries';
import { isAcrossListItems } from './queries/isAcrossListItems';

const getLiStart = (editor: BaseEditor, selection: Range) => {
  const start = editor.read.points.start(selection);

  return start
    ? editor.read.nodes.above({
        at: start,
        match: { type: editor.getType(KEYS.li) },
      })
    : undefined;
};

export const withDeleteFragmentList: ExtendPlateEditorExtension<ListConfig> = ({
  editor,
}) => ({
  priority: 100,
  transforms: {
    deleteFragment({ next, options, tx }) {
      const selection = editor.read.selection();

      if (!selection || !isAcrossListItems(editor)) return next({ options });

      const end = editor.read.points.end(selection);
      const liEnd = end
        ? editor.read.nodes.above<Element>({
            at: end,
            match: { type: editor.getType(KEYS.li) },
          })
        : undefined;
      const liStartBeforeDelete = getLiStart(editor, selection);

      if (!liStartBeforeDelete || !liEnd) return next({ options });

      if (PathApi.isAncestor(liStartBeforeDelete[1], liEnd[1])) {
        const startContent = editor.read.nodes.get<Element>([
          ...liStartBeforeDelete[1],
          0,
        ]);
        const endContent = editor.read.nodes.get<Element>([...liEnd[1], 0]);

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

          tx.nodes.replaceChildren(children, {
            at: startContent[1],
            newSelection: { anchor: point, focus: point },
          });
          tx.nodes.remove({ at: PathApi.parent(liEnd[1]) });

          return true;
        }
      }

      const liEndPathRef = !hasListChild(editor, liEnd[0])
        ? tx.refs.path(liEnd[1])
        : undefined;

      next({ options });

      if (liEndPathRef) {
        const liEndPath = liEndPathRef.unref();

        if (liEndPath) {
          const liStart = getLiStart(editor, editor.read.selection()!);
          const listStart = liStart
            ? editor.read.nodes.parent(liStart[1])
            : undefined;
          const deletePath = getHighestEmptyList(editor, {
            diffListPath: listStart?.[1],
            liPath: liEndPath,
          });

          if (deletePath) tx.nodes.remove({ at: deletePath });
        }
      }

      return true;
    },
  },
});
