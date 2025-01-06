import {
  type SlateEditor,
  type TElement,
  BaseParagraphPlugin,
  ElementApi,
  NodeApi,
  RangeApi,
} from '@udecode/plate-common';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '../BaseListPlugin';
import { getListItemEntry, getListTypes } from '../queries/index';
import { unwrapList } from './unwrapList';

export const toggleList = (editor: SlateEditor, { type }: { type: string }) =>
  editor.tf.withoutNormalizing(() => {
    if (!editor.selection) {
      return;
    }

    const { validLiChildrenTypes } = editor.getOptions(BaseListPlugin);

    if (editor.api.isCollapsed() || !editor.api.isAt({ blocks: true })) {
      // selection is collapsed
      const res = getListItemEntry(editor);

      if (res) {
        const { list } = res;

        if (list[0].type === type) {
          unwrapList(editor);
        } else {
          editor.tf.setNodes(
            { type },
            {
              at: editor.selection,
              match: (n) =>
                ElementApi.isElement(n) &&
                getListTypes(editor).includes(n.type),
              mode: 'lowest',
            }
          );
        }
      } else {
        const list = { children: [], type };
        editor.tf.wrapNodes<TElement>(list);

        const _nodes = editor.api.nodes({
          match: { type: editor.getType(BaseParagraphPlugin) },
        });
        const nodes = Array.from(_nodes);

        const blockAbove = editor.api.block({
          match: { type: validLiChildrenTypes },
        });

        if (!blockAbove) {
          editor.tf.setNodes({
            type: editor.getType(BaseListItemContentPlugin),
          });
        }

        const listItem = {
          children: [],
          type: editor.getType(BaseListItemPlugin),
        };

        for (const [, path] of nodes) {
          editor.tf.wrapNodes<TElement>(listItem, {
            at: path,
          });
        }
      }
    } else {
      // selection is a range

      const [startPoint, endPoint] = RangeApi.edges(editor.selection!);
      const commonEntry = NodeApi.common<TElement>(
        editor,
        startPoint.path,
        endPoint.path
      )!;

      if (
        getListTypes(editor).includes(commonEntry[0].type) ||
        (commonEntry[0] as TElement).type === editor.getType(BaseListItemPlugin)
      ) {
        if ((commonEntry[0] as TElement).type === type) {
          unwrapList(editor);
        } else {
          const startList = editor.api.find({
            at: RangeApi.start(editor.selection),
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const endList = editor.api.find({
            at: RangeApi.end(editor.selection),
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const rangeLength = Math.min(
            startList![1].length,
            endList![1].length
          );
          editor.tf.setNodes(
            { type },
            {
              at: editor.selection,
              match: (n, path) =>
                ElementApi.isElement(n) &&
                getListTypes(editor).includes(n.type) &&
                path.length >= rangeLength,
              mode: 'all',
            }
          );
        }
      } else {
        const rootPathLength = commonEntry[1].length;
        const _nodes = editor.api.nodes<TElement>({
          mode: 'all',
        });
        const nodes = Array.from(_nodes).filter(
          ([, path]) => path.length === rootPathLength + 1
        );

        nodes.forEach((n) => {
          if (getListTypes(editor).includes(n[0].type)) {
            editor.tf.setNodes(
              { type },
              {
                at: n[1],
                match: (_n) =>
                  ElementApi.isElement(_n) &&
                  getListTypes(editor).includes(_n.type),
                mode: 'all',
              }
            );
          } else {
            if (!validLiChildrenTypes?.includes(n[0].type)) {
              editor.tf.setNodes(
                { type: editor.getType(BaseListItemContentPlugin) },
                { at: n[1] }
              );
            }

            const listItem = {
              children: [],
              type: editor.getType(BaseListItemPlugin),
            };
            editor.tf.wrapNodes<TElement>(listItem, {
              at: n[1],
            });

            const list = { children: [], type };
            editor.tf.wrapNodes<TElement>(list, { at: n[1] });
          }
        });
      }
    }
  });

export const toggleBulletedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(BaseBulletedListPlugin) });

export const toggleNumberedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(BaseNumberedListPlugin) });
