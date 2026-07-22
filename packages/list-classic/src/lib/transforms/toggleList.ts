import type { BaseEditor, PluginConfig } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Location,
  type Node,
  type Path,
  ElementApi,
  PathApi,
  RangeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type {
  ListPluginConfiguration,
  ListTransaction,
} from '../BaseListPlugin';
import { getListItemEntry, getListTypes, getPropsIfTaskList } from '../queries';
import { unwrapList } from './unwrapList';

type ToggleListOptions = { type: string; checked?: boolean };

type ListConfigurationContract = PluginConfig<
  'listClassic',
  {},
  {},
  {},
  {},
  {},
  readonly [],
  ListPluginConfiguration
>;

const setListType = (
  editor: BaseEditor,
  tx: ListTransaction,
  [list, path]: ElementEntry,
  { checked, type }: Required<ToggleListOptions>
) => {
  const listItemType = editor.getType(KEYS.li);
  const taskListType = editor.getType(KEYS.taskList);
  const listItemPaths = list.children.flatMap((child, index) =>
    ElementApi.isElement(child) && child.type === listItemType
      ? [path.concat(index)]
      : []
  );

  if (list.type === taskListType && type !== taskListType) {
    for (const itemPath of listItemPaths) {
      tx.nodes.unset('checked', { at: itemPath });
    }
  }

  tx.nodes.set({ type }, { at: path });

  if (type === taskListType) {
    for (const itemPath of listItemPaths) {
      tx.nodes.set({ checked }, { at: itemPath });
    }
  }
};

const setListTreeType = (
  editor: BaseEditor,
  tx: ListTransaction,
  at: Location,
  { checked, type }: Required<ToggleListOptions>
) => {
  const listItemType = editor.getType(KEYS.li);
  const taskListType = editor.getType(KEYS.taskList);
  const isTaskListItem = (node: Node, path: Path) =>
    ElementApi.isElement(node) &&
    node.type === listItemType &&
    tx.nodes.parent<Element>(path)?.[0].type === taskListType;

  if (type !== taskListType) {
    tx.nodes.unset('checked', {
      at,
      match: isTaskListItem,
      mode: 'all',
    });
  }

  tx.nodes.set(
    { type },
    { at, match: { type: getListTypes(editor) }, mode: 'all' }
  );

  if (type === taskListType) {
    tx.nodes.set({ checked }, { at, match: isTaskListItem, mode: 'all' });
  }
};

const _toggleList = (
  editor: BaseEditor,
  tx: ListTransaction,
  { checked = false, type }: ToggleListOptions
) => {
  const selection = tx.selection();

  if (!selection) return;

  const { validLiChildren } = editor.plugin<ListConfigurationContract>(
    KEYS.listClassic
  ).plugin.config;
  const validLiChildrenTypes = validLiChildren?.map(({ key }) =>
    editor.getType(key)
  );

  if (tx.selection.isCollapsed() || !tx.selection.isAcrossBlocks()) {
    const res = getListItemEntry(editor, { at: selection }, tx);

    if (res) {
      if (res.list[0].type === type) {
        unwrapList(editor, tx);
      } else {
        setListType(editor, tx, res.list, { checked, type });
      }

      return;
    }

    tx.nodes.wrap({ children: [], type });

    const nodes = Array.from(
      tx.nodes.entries({ match: { type: editor.getType(KEYS.p) } })
    );
    const blockAbove = tx.nodes.block({
      match: { type: validLiChildrenTypes },
    });

    if (blockAbove) {
      tx.nodes.wrap(
        {
          children: [],
          ...getPropsIfTaskList(editor, type, { checked }),
          type: editor.getType(KEYS.li),
        },
        { at: blockAbove[1] }
      );

      return;
    }

    tx.nodes.set({ type: editor.getType(KEYS.lic) });

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
  const commonEntry = tx.nodes.get(
    PathApi.common(startPoint.path, endPoint.path)
  );

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

    const startList = tx.nodes.find({
      at: RangeApi.start(selection),
      match: { type: getListTypes(editor) },
      mode: 'lowest',
    });
    const endList = tx.nodes.find({
      at: RangeApi.end(selection),
      match: { type: getListTypes(editor) },
      mode: 'lowest',
    });

    if (!startList || !endList) return;

    setListTreeType(editor, tx, selection, { checked, type });

    return;
  }

  const rootPathLength = commonEntry[1].length;
  const nodes = Array.from(tx.nodes.entries<Element>({ mode: 'all' })).filter(
    ([, path]) => path.length === rootPathLength + 1
  );

  for (const [node, path] of nodes) {
    if (getListTypes(editor).includes(node.type)) {
      setListTreeType(editor, tx, path, { checked, type });
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
