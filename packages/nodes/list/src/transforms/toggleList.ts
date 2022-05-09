import {
  ELEMENT_DEFAULT,
  findNode,
  getCommonNode,
  getNodeEntries,
  getPluginType,
  isCollapsed,
  isElement,
  isRangeAcrossBlocks,
  PlateEditor,
  setElements,
  TElement,
  Value,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-core';
import { Range } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';
import { getListItemEntry, getListTypes } from '../queries';
import { unwrapList } from './unwrapList';

export const toggleList = <V extends Value>(
  editor: PlateEditor<V>,
  { type }: { type: string }
) =>
  withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }

    if (isCollapsed(editor.selection) || !isRangeAcrossBlocks(editor)) {
      // selection is collapsed
      const res = getListItemEntry(editor);

      if (res) {
        const { list } = res;
        if (list[0].type !== type) {
          setElements(
            editor,
            { type },
            {
              at: editor.selection,
              match: (n) =>
                isElement(n) && getListTypes(editor).includes(n.type),
              mode: 'lowest',
            }
          );
        } else {
          unwrapList(editor);
        }
      } else {
        const list = { type, children: [] };
        wrapNodes(editor, list);

        const _nodes = getNodeEntries(editor, {
          match: { type: getPluginType(editor, ELEMENT_DEFAULT) },
        });
        const nodes = Array.from(_nodes);
        setElements(editor, {
          type: getPluginType(editor, ELEMENT_LIC),
        });

        const listItem = {
          type: getPluginType(editor, ELEMENT_LI),
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

      const [startPoint, endPoint] = Range.edges(editor.selection!);
      const commonEntry = getCommonNode<TElement>(
        editor,
        startPoint.path,
        endPoint.path
      );

      if (
        getListTypes(editor).includes(commonEntry[0].type) ||
        (commonEntry[0] as TElement).type === getPluginType(editor, ELEMENT_LI)
      ) {
        if ((commonEntry[0] as TElement).type !== type) {
          const startList = findNode(editor, {
            at: Range.start(editor.selection),
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const endList = findNode(editor, {
            at: Range.end(editor.selection),
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const rangeLength = Math.min(
            startList![1].length,
            endList![1].length
          );
          setElements(
            editor,
            { type },
            {
              at: editor.selection,
              match: (n, path) =>
                isElement(n) &&
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
        const _nodes = getNodeEntries<TElement>(editor, {
          mode: 'all',
        });
        const nodes = Array.from(_nodes)
          .filter(([, path]) => path.length === rootPathLength + 1)
          .reverse();

        nodes.forEach((n) => {
          if (getListTypes(editor).includes(n[0].type)) {
            setElements(editor, { type }, { at: n[1] });
          } else {
            setElements(
              editor,
              { type: getPluginType(editor, ELEMENT_LIC) },
              { at: n[1] }
            );

            const listItem = {
              type: getPluginType(editor, ELEMENT_LI),
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
