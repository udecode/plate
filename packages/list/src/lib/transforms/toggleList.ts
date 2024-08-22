import {
  ParagraphPlugin,
  type SlateEditor,
  type TElement,
  findNode,
  getBlockAbove,
  getCommonNode,
  getNodeEntries,
  isCollapsed,
  isElement,
  isRangeAcrossBlocks,
  setElements,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';
import { Range } from 'slate';

import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '../ListPlugin';
import { getListItemEntry, getListTypes } from '../queries/index';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SlateEditor, { type }: { type: string }) =>
  withoutNormalizing(editor, () => {
    if (!editor.selection) {
      return;
    }

    const { validLiChildrenTypes } = editor.getOptions(ListPlugin);

    if (isCollapsed(editor.selection) || !isRangeAcrossBlocks(editor)) {
      // selection is collapsed
      const res = getListItemEntry(editor);

      if (res) {
        const { list } = res;

        if (list[0].type === type) {
          unwrapList(editor);
        } else {
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
        }
      } else {
        const list = { children: [], type };
        wrapNodes<TElement>(editor, list);

        const _nodes = getNodeEntries(editor, {
          match: { type: editor.getType(ParagraphPlugin) },
        });
        const nodes = Array.from(_nodes);

        const blockAbove = getBlockAbove(editor, {
          match: { type: validLiChildrenTypes },
        });

        if (!blockAbove) {
          setElements(editor, {
            type: editor.getType(ListItemContentPlugin),
          });
        }

        const listItem = {
          children: [],
          type: editor.getType(ListItemPlugin),
        };

        for (const [, path] of nodes) {
          wrapNodes<TElement>(editor, listItem, {
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
        (commonEntry[0] as TElement).type === editor.getType(ListItemPlugin)
      ) {
        if ((commonEntry[0] as TElement).type === type) {
          unwrapList(editor);
        } else {
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
        }
      } else {
        const rootPathLength = commonEntry[1].length;
        const _nodes = getNodeEntries<TElement>(editor, {
          mode: 'all',
        });
        const nodes = Array.from(_nodes).filter(
          ([, path]) => path.length === rootPathLength + 1
        );

        nodes.forEach((n) => {
          if (getListTypes(editor).includes(n[0].type)) {
            setElements(
              editor,
              { type },
              {
                at: n[1],
                match: (_n) =>
                  isElement(_n) && getListTypes(editor).includes(_n.type),
                mode: 'all',
              }
            );
          } else {
            if (!validLiChildrenTypes?.includes(n[0].type)) {
              setElements(
                editor,
                { type: editor.getType(ListItemContentPlugin) },
                { at: n[1] }
              );
            }

            const listItem = {
              children: [],
              type: editor.getType(ListItemPlugin),
            };
            wrapNodes<TElement>(editor, listItem, {
              at: n[1],
            });

            const list = { children: [], type };
            wrapNodes<TElement>(editor, list, { at: n[1] });
          }
        });
      }
    }
  });

export const toggleBulletedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(BulletedListPlugin) });

export const toggleNumberedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(NumberedListPlugin) });
