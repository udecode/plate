import type { BaseEditor } from '@platejs/core';
import { type Element, ElementApi, NodeApi, RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig, ListTransaction } from '../BaseListPlugin';
import { getListItemEntry, getListTypes, getPropsIfTaskList } from '../queries';
import { unwrapList } from './unwrapList';

type ToggleListOptions = { type: string; checked?: boolean };

const _toggleList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { checked = false, type }: ToggleListOptions
) => {
  const selection = editor.read.selection();

  if (!selection) return;

  const { validLiChildrenTypes } = editor
    .plugin<ListConfig>(KEYS.listClassic)
    .getOptions();

  if (
    editor.read.selection.isCollapsed() ||
    !editor.read.selection.isAcrossBlocks()
  ) {
    const res = getListItemEntry(editor);

    if (res) {
      if (res.list[0].type === type) {
        unwrapList(editor, tx);
      } else {
        tx.nodes.set(
          { type },
          {
            at: selection,
            match: { type: getListTypes(editor) },
            mode: 'lowest',
          }
        );
      }

      return;
    }

    tx.nodes.wrap({ children: [], type });

    const nodes = Array.from(
      editor.read.nodes.entries({ match: { type: editor.getType(KEYS.p) } })
    );
    const blockAbove = editor.read.nodes.block({
      match: { type: validLiChildrenTypes },
    });

    if (!blockAbove) {
      tx.nodes.set({ type: editor.getType(KEYS.lic) });
    }

    for (const [, path] of nodes) {
      tx.nodes.wrap(
        {
          children: [],
          ...getPropsIfTaskList(editor, type, { checked }),
          type: editor.getType(KEYS.li),
        },
        { at: path }
      );
    }

    return;
  }

  const [startPoint, endPoint] = RangeApi.edges(selection);
  const commonEntry = NodeApi.common(editor, startPoint.path, endPoint.path);

  if (!commonEntry) return;

  if (
    ElementApi.isElement(commonEntry[0]) &&
    (getListTypes(editor).includes(commonEntry[0].type) ||
      commonEntry[0].type === editor.getType(KEYS.li))
  ) {
    if (commonEntry[0].type === type) {
      unwrapList(editor, tx);
      return;
    }

    const startList = editor.read.nodes.find({
      at: RangeApi.start(selection),
      match: { type: getListTypes(editor) },
      mode: 'lowest',
    });
    const endList = editor.read.nodes.find({
      at: RangeApi.end(selection),
      match: { type: getListTypes(editor) },
      mode: 'lowest',
    });

    if (!startList || !endList) return;

    const rangeLength = Math.min(startList[1].length, endList[1].length);

    tx.nodes.set(
      { type },
      {
        at: selection,
        match: (node, path) =>
          ElementApi.isElement(node) &&
          getListTypes(editor).includes(node.type) &&
          path.length >= rangeLength,
        mode: 'all',
      }
    );

    return;
  }

  const rootPathLength = commonEntry[1].length;
  const nodes = Array.from(
    editor.read.nodes.entries<Element>({ mode: 'all' })
  ).filter(([, path]) => path.length === rootPathLength + 1);

  for (const [node, path] of nodes) {
    if (getListTypes(editor).includes(node.type)) {
      tx.nodes.set(
        { type },
        { at: path, match: { type: getListTypes(editor) }, mode: 'all' }
      );
      continue;
    }

    if (!validLiChildrenTypes?.includes(node.type)) {
      tx.nodes.set({ type: editor.getType(KEYS.lic) }, { at: path });
    }

    tx.nodes.wrap(
      {
        children: [],
        ...getPropsIfTaskList(editor, type, { checked }),
        type: editor.getType(KEYS.li),
      },
      { at: path }
    );
    tx.nodes.wrap({ children: [], type }, { at: path });
  }
};

export const toggleList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { type }: { type: string }
) => _toggleList(editor, tx, { type });

export const toggleBulletedList = (editor: BaseEditor, tx: ListTransaction) =>
  toggleList(editor, tx, { type: editor.getType(KEYS.ulClassic) });

export const toggleTaskList = (
  editor: BaseEditor,
  tx: ListTransaction,
  defaultChecked = false
) =>
  _toggleList(editor, tx, {
    checked: defaultChecked,
    type: editor.getType(KEYS.taskList),
  });

export const toggleNumberedList = (editor: BaseEditor, tx: ListTransaction) =>
  toggleList(editor, tx, { type: editor.getType(KEYS.olClassic) });
