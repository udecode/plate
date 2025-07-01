import {
  type SlateEditor,
  type TElement,
  ElementApi,
  KEYS,
  NodeApi,
  RangeApi,
} from 'platejs';

import { BaseListPlugin } from '../BaseListPlugin';
import {
  getListItemEntry,
  getListTypes,
  getPropsIfCheckList,
} from '../queries/index';
import { unwrapList } from './unwrapList';

type ToggleListOptions = { type: string; checked?: boolean };

const _toggleList = (
  editor: SlateEditor,
  { checked = false, type }: ToggleListOptions
) =>
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
              mode: 'lowest',
              match: (n) =>
                ElementApi.isElement(n) &&
                getListTypes(editor).includes(n.type),
            }
          );
        }
      } else {
        const list = { children: [], type };
        editor.tf.wrapNodes<TElement>(list);

        const _nodes = editor.api.nodes({
          match: { type: editor.getType(KEYS.p) },
        });
        const nodes = Array.from(_nodes);

        const blockAbove = editor.api.block({
          match: { type: validLiChildrenTypes },
        });

        if (!blockAbove) {
          editor.tf.setNodes({
            type: editor.getType(KEYS.lic),
          });
        }

        const listItem = {
          children: [],
          ...getPropsIfCheckList(editor, type, { checked }),
          type: editor.getType(KEYS.li),
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
        (commonEntry[0] as TElement).type === editor.getType(KEYS.li)
      ) {
        if ((commonEntry[0] as TElement).type === type) {
          unwrapList(editor);
        } else {
          const startList = editor.api.node({
            at: RangeApi.start(editor.selection),
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          });
          const endList = editor.api.node({
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
              mode: 'all',
              match: (n, path) =>
                ElementApi.isElement(n) &&
                getListTypes(editor).includes(n.type) &&
                path.length >= rangeLength,
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
                mode: 'all',
                match: (_n) =>
                  ElementApi.isElement(_n) &&
                  getListTypes(editor).includes(_n.type),
              }
            );
          } else {
            if (!validLiChildrenTypes?.includes(n[0].type)) {
              editor.tf.setNodes(
                { type: editor.getType(KEYS.lic) },
                { at: n[1] }
              );
            }

            const listItem = {
              children: [],
              ...getPropsIfCheckList(editor, type, { checked }),
              type: editor.getType(KEYS.li),
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

export const toggleList = (editor: SlateEditor, { type }: { type: string }) =>
  _toggleList(editor, { type });

export const toggleBulletedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(KEYS.ulClassic) });

export const toggleCheckList = (editor: SlateEditor, defaultChecked = false) =>
  _toggleList(editor, {
    checked: defaultChecked,
    type: editor.getType(KEYS.checklist),
  });

export const toggleNumberedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(KEYS.olClassic) });
