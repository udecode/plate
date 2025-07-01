'use client';

import type { PlateEditor } from 'platejs/react';

import { insertCallout } from '@platejs/callout';
import { insertCodeBlock, toggleCodeBlock } from '@platejs/code-block';
import { insertDate } from '@platejs/date';
import { insertColumnGroup, toggleColumnGroup } from '@platejs/layout';
import { triggerFloatingLink } from '@platejs/link/react';
import { toggleList } from '@platejs/list-classic';
import { insertEquation, insertInlineEquation } from '@platejs/math';
import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertMedia,
  insertVideoPlaceholder,
} from '@platejs/media';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { TablePlugin } from '@platejs/table/react';
import { insertToc } from '@platejs/toc';
import {
  type NodeEntry,
  type Path,
  type TElement,
  KEYS,
  PathApi,
} from 'platejs';

import { insertList, setList } from './transforms';

const ACTION_THREE_COLUMNS = 'action_three_columns';

export const insertBlock = (editor: PlateEditor, type: string) => {
  editor.tf.withoutNormalizing(() => {
    const block = editor.api.block();

    if (!block) return;
    const blockMap: Record<string, () => void> = {
      [ACTION_THREE_COLUMNS]: () =>
        insertColumnGroup(editor, { columns: 3, select: true }),
      [KEYS.audio]: () => insertAudioPlaceholder(editor, { select: true }),
      [KEYS.callout]: () => insertCallout(editor, { select: true }),
      [KEYS.codeBlock]: () => insertCodeBlock(editor, { select: true }),
      [KEYS.equation]: () => insertEquation(editor, { select: true }),
      [KEYS.file]: () => insertFilePlaceholder(editor, { select: true }),
      [KEYS.img]: () =>
        insertMedia(editor, {
          select: true,
          type: KEYS.img,
        }),
      [KEYS.mediaEmbed]: () =>
        insertMedia(editor, {
          select: true,
          type: KEYS.mediaEmbed,
        }),
      [KEYS.olClassic]: () => insertList(editor, KEYS.olClassic),
      [KEYS.table]: () =>
        editor.getTransforms(TablePlugin).insert.table({}, { select: true }),
      [KEYS.taskList]: () => insertList(editor, KEYS.taskList),
      [KEYS.toc]: () => insertToc(editor, { select: true }),
      [KEYS.ulClassic]: () => insertList(editor, KEYS.ulClassic),
      [KEYS.video]: () => insertVideoPlaceholder(editor, { select: true }),
    };

    if (type in blockMap) {
      blockMap[type]();
    } else {
      editor.tf.insertNodes(editor.api.create.block({ type }), {
        at: PathApi.next(block[1]),
        select: true,
      });
    }
    if (getBlockType(block[0]) !== type) {
      editor.getApi(SuggestionPlugin).suggestion.withoutSuggestions(() => {
        editor.tf.removeNodes({ previousEmptyBlock: true });
      });
    }
  });
};

export const insertInlineElement = (editor: PlateEditor, type: string) => {
  const inlineMap: Record<string, () => void> = {
    [KEYS.date]: () => insertDate(editor, { select: true }),
    [KEYS.inlineEquation]: () =>
      insertInlineEquation(editor, '', { select: true }),
    [KEYS.link]: () => triggerFloatingLink(editor, { focused: true }),
  };

  if (inlineMap[type]) {
    inlineMap[type]();
  }
};

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  editor.tf.withoutNormalizing(() => {
    const setEntry = (entry: NodeEntry<TElement>) => {
      const [node, path] = entry;
      const blockMap: Record<string, () => void> = {
        [ACTION_THREE_COLUMNS]: () => toggleColumnGroup(editor, { columns: 3 }),
        [KEYS.codeBlock]: () => toggleCodeBlock(editor),
        [KEYS.olClassic]: () =>
          toggleList(editor, { type: editor.getType(KEYS.olClassic) }),
        [KEYS.taskList]: () =>
          toggleList(editor, { type: editor.getType(KEYS.taskList) }),
        [KEYS.ulClassic]: () =>
          toggleList(editor, { type: editor.getType(KEYS.ulClassic) }),
      };

      if (node[KEYS.listType]) {
        editor.tf.unsetNodes([KEYS.listType, 'indent'], { at: path });
      }
      if (type in blockMap) {
        return blockMap[type]();
      }
      if (node.type !== type) {
        editor.tf.setNodes({ type }, { at: path });
      }
    };

    if (at) {
      const entry = editor.api.node<TElement>(at);

      if (entry) {
        setEntry(entry);

        return;
      }
    }

    const entries = editor.api.blocks({ mode: 'lowest' });

    entries.forEach((entry) => setEntry(entry));
  });
};

export const getBlockType = (block: TElement) => {
  if (block[KEYS.listType]) {
    if (block[KEYS.listType] === KEYS.ol) {
      return KEYS.ol;
    } else if (block[KEYS.listType] === KEYS.listTodo) {
      return KEYS.listTodo;
    } else {
      return KEYS.ul;
    }
  }

  return block.type;
};