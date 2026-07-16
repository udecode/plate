'use client';

import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
  Path,
} from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';
import { insertCallout } from '@platejs/callout';
import { BaseCodeBlockPlugin, insertCodeBlock } from '@platejs/code-block';
import { BaseDatePlugin } from '@platejs/date';
import { BaseFootnoteReferencePlugin } from '@platejs/footnote';
import { BaseColumnItemPlugin, insertColumnGroup } from '@platejs/layout';
import { triggerFloatingLink } from '@platejs/link/react';
import { BaseListPlugin } from '@platejs/list-classic';
import { BaseInlineEquationPlugin, insertEquation } from '@platejs/math';
import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertMedia,
  insertVideoPlaceholder,
} from '@platejs/media';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { insertTable } from '@platejs/table';
import { insertToc } from '@platejs/toc';
import { ElementApi, KEYS, PathApi } from 'platejs';

const ACTION_THREE_COLUMNS = 'action_three_columns';
const ACTION_FOOTNOTE = 'action_footnote';

const toggleCodeBlock = (editor: PlateEditor) =>
  editor.plugin(BaseCodeBlockPlugin).update.toggle();

const createBlock = ({ type }: { type: string }): Element => ({
  children: [{ text: '' }],
  type,
});

const runFootnoteAction = (editor: PlateEditor) =>
  editor
    .plugin(BaseFootnoteReferencePlugin)
    .update.insert.footnote({ select: true });

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, tx: EditorUpdateTransaction, type: string) => void
> = {
  [ACTION_THREE_COLUMNS]: (editor, tx) =>
    insertColumnGroup(editor, tx, { columns: 3, select: true }),
  [KEYS.audio]: (editor, tx) =>
    insertAudioPlaceholder(tx, editor.getType(KEYS.placeholder), {
      select: true,
    }),
  [KEYS.callout]: (editor, tx) =>
    insertCallout(tx, editor.getType(KEYS.callout), { select: true }),
  [KEYS.codeBlock]: (editor, tx) =>
    insertCodeBlock(editor, tx, { select: true }),
  [KEYS.equation]: (editor, tx) =>
    insertEquation(tx, editor.getType(KEYS.equation), { select: true }),
  [KEYS.file]: (editor, tx) =>
    insertFilePlaceholder(tx, editor.getType(KEYS.placeholder), {
      select: true,
    }),
  [KEYS.table]: (editor, tx) => insertTable(editor, tx, {}, { select: true }),
  [KEYS.toc]: (editor, tx) => insertToc(editor, tx, { select: true }),
  [KEYS.video]: (editor, tx) =>
    insertVideoPlaceholder(tx, editor.getType(KEYS.placeholder), {
      select: true,
    }),
};

const insertAsyncMedia = (editor: PlateEditor, type: string) =>
  insertMedia(editor, { select: true, type });

const insertAsyncMediaAndRemoveEmptySource = async (
  editor: PlateEditor,
  type: string,
  path: Path,
  currentBlockType: string
) => {
  await insertAsyncMedia(editor, type);

  const inserted = editor.read.nodes.get(PathApi.next(path));
  const source = editor.read.nodes.get(path);

  if (
    !inserted ||
    !ElementApi.isElement(inserted[0]) ||
    inserted[0].type !== editor.getType(type) ||
    !source ||
    !ElementApi.isElement(source[0]) ||
    getBlockType(source[0]) !== currentBlockType ||
    !editor.read.nodes.isEmpty(source[0])
  ) {
    return;
  }

  editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
    editor.update({ history: 'merge' }).nodes.remove({ at: path });
  });
};

const insertInlineMap: Record<
  string,
  (editor: PlateEditor, type: string) => void
> = {
  [KEYS.date]: (editor) =>
    editor.plugin(BaseDatePlugin).update.insert({ select: true }),
  [ACTION_FOOTNOTE]: runFootnoteAction,
  [KEYS.inlineEquation]: (editor) =>
    editor.plugin(BaseInlineEquationPlugin).update.insert({ select: true }),
  [KEYS.link]: (editor) => triggerFloatingLink(editor, { focused: true }),
};

export const insertBlock = (editor: PlateEditor, type: string) => {
  const block = editor.read.nodes.block();

  if (!block) return;

  const [currentNode, path] = block;
  const isCurrentBlockEmpty = editor.read.nodes.isEmpty(currentNode);
  const currentBlockType = getBlockType(currentNode);

  if (type === KEYS.img || type === KEYS.mediaEmbed) {
    void insertAsyncMediaAndRemoveEmptySource(
      editor,
      type,
      path,
      currentBlockType
    );
    return;
  }

  editor.update((tx) => {
    if (type in insertBlockMap) {
      insertBlockMap[type](editor, tx, type);
    } else {
      tx.nodes.insert(createBlock({ type }), {
        at: PathApi.next(path),
        select: true,
      });
    }

    if (currentBlockType !== type && isCurrentBlockEmpty) {
      const source = tx.nodes.get(path);

      if (
        !source ||
        !ElementApi.isElement(source[0]) ||
        getBlockType(source[0]) !== currentBlockType
      ) {
        return;
      }

      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        tx.nodes.remove({ at: path });
      });
    }
  });
};

export const insertInlineElement = (editor: PlateEditor, type: string) => {
  if (insertInlineMap[type]) {
    insertInlineMap[type](editor, type);
  }
};

const setBlockMap: Record<string, (editor: PlateEditor, type: string) => void> =
  {
    [ACTION_THREE_COLUMNS]: (editor) =>
      editor.plugin(BaseColumnItemPlugin).update.toggle({ columns: 3 }),
    [KEYS.codeBlock]: toggleCodeBlock,
    [KEYS.olClassic]: (editor) =>
      editor
        .plugin(BaseListPlugin)
        .update.toggle.list({ type: editor.getType(KEYS.olClassic) }),
    [KEYS.taskList]: (editor) =>
      editor
        .plugin(BaseListPlugin)
        .update.toggle.list({ type: editor.getType(KEYS.taskList) }),
    [KEYS.ulClassic]: (editor) =>
      editor
        .plugin(BaseListPlugin)
        .update.toggle.list({ type: editor.getType(KEYS.ulClassic) }),
  };

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  if (type in setBlockMap) {
    setBlockMap[type](editor, type);
    return;
  }

  editor.update((tx) => {
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;

      if (node.type !== type) {
        tx.nodes.set({ type }, { at: path });
      }
    };

    if (at) {
      const entry = tx.nodes.find<Element>({
        at,
        match: (node) => ElementApi.isElement(node),
      });

      if (entry) {
        setEntry(entry);
        return;
      }
    }

    tx.nodes
      .toArray<Element>({
        match: (node) => ElementApi.isElement(node) && tx.schema.isBlock(node),
        mode: 'lowest',
      })
      .forEach((entry) => {
        setEntry(entry);
      });
  });
};

export const getBlockType = (block: Element) => block.type;
