import {
  ELEMENT_DEFAULT,
  findNode,
  getNodes,
  isCollapsed,
  setNodes,
  wrapNodes,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { Editor, Node, NodeEntry, Path, Range } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../defaults';
import { getListItemEntry, getListTypes } from '../queries';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SPEditor, { type }: { type: string }) => {
  if (!editor.selection) {
    return;
  }

  Editor.withoutNormalizing(editor, () => {
    if (isCollapsed(editor.selection)) {
      // selection is collapsed
      const res = getListItemEntry(editor);

      if (res) {
        const { list } = res;
        if (list[0].type !== type) {
          setNodes(
            editor,
            { type },
            {
              at: editor.selection as Range,
              match: (n) => getListTypes(editor).includes(n.type),
              mode: 'lowest',
            }
          );
        } else {
          unwrapList(editor);
        }
      } else {
        const list = { type, children: [] };
        wrapNodes(editor, list);

        const nodes = [
          ...getNodes(editor, {
            match: { type: getPlatePluginType(editor, ELEMENT_DEFAULT) },
          }),
        ];
        setNodes(editor, { type: getPlatePluginType(editor, ELEMENT_LIC) });

        const listItem = {
          type: getPlatePluginType(editor, ELEMENT_LI),
          children: [],
        };

        for (const [, path] of nodes) {
          wrapNodes(editor, listItem, {
            at: path,
          });
        }
      }
    } else {
      // selection is a range
      const [statPoint, endPoint] = Range.edges(editor.selection!);

      const commonEntry: NodeEntry<Node> = Node.common(
        editor,
        statPoint.path,
        endPoint.path
      );

      if (
        getListTypes(editor).includes((commonEntry[0] as TElement).type) ||
        (commonEntry[0] as TElement).type ===
          getPlatePluginType(editor, ELEMENT_LI)
      ) {
        if ((commonEntry[0] as TElement).type !== type) {
          const startList = findNode(editor, {
            at: Range.start(editor.selection as Range).path,
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const endList = findNode(editor, {
            at: Range.end(editor.selection as Range).path,
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const rangeLength = Math.min(
            startList![1].length,
            endList![1].length
          );
          setNodes(
            editor,
            { type },
            {
              at: editor.selection as Range,
              match: (n: TElement, path: Path) =>
                getListTypes(editor).includes(n.type) &&
                path.length >= rangeLength,
              mode: 'all',
            }
          );
        } else {
          unwrapList(editor);
        }
      } else {
        const rootPathLength = commonEntry[1].length;
        const nodes = (Array.from(
          getNodes(editor, {
            mode: 'all',
          })
        ) as NodeEntry<TElement>[])
          .filter(([, path]) => path.length === rootPathLength + 1)
          .reverse();

        nodes.forEach((n) => {
          if (getListTypes(editor).includes(n[0].type)) {
            setNodes(editor, { type }, { at: n[1] });
          } else {
            setNodes(
              editor,
              { type: getPlatePluginType(editor, ELEMENT_LIC) },
              { at: n[1] }
            );

            const listItem = {
              type: getPlatePluginType(editor, ELEMENT_LI),
              children: [],
            };
            wrapNodes(editor, listItem, {
              at: n[1],
            });

            const list = { type, children: [] };
            wrapNodes(editor, list, { at: n[1] });
          }
        });
      }
    }
  });
};
