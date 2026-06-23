import type { SlateEditor } from '@platejs/core';
import type { Element } from '@platejs/slate';
import { ElementApi, PathApi, RangeApi } from '@platejs/slate';
import { KEYS } from '@platejs/utils';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { BaseListPlugin } from '../BaseListPlugin';
import {
  getListItemEntry,
  getListTypes,
  getPropsIfTaskList,
} from '../queries/index';
import { unwrapList } from './unwrapList';

type ToggleListOptions = { type: string; checked?: boolean };

const _toggleList = (
  editor: SlateEditor,
  { checked = false, type }: ToggleListOptions
) =>
  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
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
            tx.nodes.set(
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
          tx.nodes.wrap(list);

          const _nodes = editor.api.nodes({
            match: (node) =>
              ElementApi.isElement(node) &&
              node.type === editor.getType(KEYS.p),
          });
          const nodes = Array.from(_nodes);

          const blockAbove = editor.api.block({
            match: (node) =>
              ElementApi.isElement(node) &&
              !!validLiChildrenTypes?.includes(node.type),
          });

          if (!blockAbove) {
            tx.nodes.set({
              type: editor.getType(KEYS.lic),
            });
          }

          const listItem = {
            children: [],
            ...getPropsIfTaskList(editor, type, { checked }),
            type: editor.getType(KEYS.li),
          };

          for (const [, path] of nodes) {
            tx.nodes.wrap(listItem, {
              at: path,
            });
          }
        }
      } else {
        // selection is a range

        const [startPoint, endPoint] = RangeApi.edges(editor.selection!);
        const commonPath = PathApi.common(startPoint.path, endPoint.path);
        const commonEntry = editor.api.node<Element>(commonPath);

        if (!commonEntry) {
          return;
        }

        if (
          getListTypes(editor).includes(commonEntry[0].type) ||
          (commonEntry[0] as Element).type === editor.getType(KEYS.li)
        ) {
          if ((commonEntry[0] as Element).type === type) {
            unwrapList(editor);
          } else {
            const startList = editor.api.node({
              at: RangeApi.start(editor.selection),
              match: (node) =>
                ElementApi.isElement(node) &&
                getListTypes(editor).includes(node.type),
              mode: 'lowest',
            });
            const endList = editor.api.node({
              at: RangeApi.end(editor.selection),
              match: (node) =>
                ElementApi.isElement(node) &&
                getListTypes(editor).includes(node.type),
              mode: 'lowest',
            });
            const rangeLength = Math.min(
              startList![1].length,
              endList![1].length
            );

            tx.nodes.set(
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
          const _nodes = editor.api.nodes<Element>({
            mode: 'all',
          });
          const nodes = Array.from(_nodes).filter(
            ([, path]) => path.length === rootPathLength + 1
          );

          nodes.forEach((n) => {
            if (getListTypes(editor).includes(n[0].type)) {
              tx.nodes.set(
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
                tx.nodes.set({ type: editor.getType(KEYS.lic) }, { at: n[1] });
              }

              const listItem = {
                children: [],
                ...getPropsIfTaskList(editor, type, { checked }),
                type: editor.getType(KEYS.li),
              };
              tx.nodes.wrap(listItem, {
                at: n[1],
              });

              const list = { children: [], type };
              tx.nodes.wrap(list, { at: n[1] });
            }
          });
        }
      }
    });
  });

export const toggleList = (editor: SlateEditor, { type }: { type: string }) =>
  _toggleList(editor, { type });

export const toggleBulletedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(KEYS.ulClassic) });

export const toggleTaskList = (editor: SlateEditor, defaultChecked = false) =>
  _toggleList(editor, {
    checked: defaultChecked,
    type: editor.getType(KEYS.taskList),
  });

export const toggleNumberedList = (editor: SlateEditor) =>
  toggleList(editor, { type: editor.getType(KEYS.olClassic) });
