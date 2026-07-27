'use client';

import type { Element, NodeEntry, Path } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseDatePlugin } from '@platejs/date';
import { BaseFootnotePlugin } from '@platejs/footnote';
import { BaseColumnItemPlugin } from '@platejs/layout';
import { LinkPlugin } from '@platejs/link/react';
import { BaseListPlugin } from '@platejs/list-classic';
import { BaseInlineEquationPlugin, insertEquation } from '@platejs/math';
import { BasePlaceholderPlugin } from '@platejs/media';
import { insertMediaUrl } from '@platejs/media/react';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { BaseTablePlugin } from '@platejs/table';
import { BaseTocPlugin } from '@platejs/toc';
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
  editor.plugin(BaseFootnotePlugin).update.insert({ select: true });

const removeEmptySourceAfterInsert = (
  editor: PlateEditor,
  insertedType: string,
  path: Path,
  currentBlockType: string
) => {
  const inserted = editor.read.nodes.get(PathApi.next(path));
  const source = editor.read.nodes.get(path);

  if (
    !inserted ||
    !ElementApi.isElement(inserted[0]) ||
    inserted[0].type !== editor.getType(insertedType) ||
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
  [KEYS.link]: (editor) =>
    editor.plugin(LinkPlugin).api.trigger({ focused: true }),
};

export const insertBlock = (editor: PlateEditor, type: string) => {
  const block = editor.read.nodes.block();

  if (!block) return;

  const [currentNode, path] = block;
  const isCurrentBlockEmpty = editor.read.nodes.isEmpty(currentNode);
  const currentBlockType = getBlockType(currentNode);
  const nodeType = editor.getType(type);

  if (type === KEYS.codeBlock) {
    editor.plugin(BaseCodeBlockPlugin).update.insert();

    return;
  }
  if (type === KEYS.toc) {
    editor
      .plugin(BaseTocPlugin)
      .update.insert({ at: PathApi.next(path), select: true });
    removeEmptySourceAfterInsert(editor, type, path, currentBlockType);

    return;
  }
  if (type === KEYS.img || type === KEYS.mediaEmbed) {
    void insertMediaUrl(editor, {
      at: PathApi.next(path),
      select: true,
      type,
    }).then(() => {
      removeEmptySourceAfterInsert(editor, type, path, currentBlockType);
    });

    return;
  }
  if (type === KEYS.audio || type === KEYS.file || type === KEYS.video) {
    editor
      .plugin(BasePlaceholderPlugin)
      .update.insert(type, { at: PathApi.next(path), select: true });
    removeEmptySourceAfterInsert(
      editor,
      KEYS.placeholder,
      path,
      currentBlockType
    );
    return;
  }
  if (type === KEYS.table) {
    editor.plugin(BaseTablePlugin).update.insert({}, { select: true });

    if (currentBlockType !== nodeType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (type === ACTION_THREE_COLUMNS) {
    editor.plugin(BaseColumnItemPlugin).update.insertGroup({
      at: PathApi.next(path),
      columns: 3,
      select: true,
    });

    if (currentBlockType !== nodeType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (type === KEYS.callout) {
    editor.plugin(BaseCalloutPlugin).update.insert({ select: true });

    if (currentBlockType !== nodeType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  editor.update((tx) => {
    const insertByType: Record<string, () => void> = {
      [KEYS.equation]: () =>
        insertEquation(tx, editor.getType(KEYS.equation), { select: true }),
    };
    const insert = insertByType[type];

    if (insert) {
      insert();
    } else {
      tx.nodes.insert(createBlock({ type: nodeType }), {
        at: PathApi.next(path),
        select: true,
      });
    }

    if (currentBlockType !== nodeType && isCurrentBlockEmpty) {
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
        .update.toggle({ type: editor.getType(KEYS.olClassic) }),
    [KEYS.taskList]: (editor) =>
      editor
        .plugin(BaseListPlugin)
        .update.toggle({ type: editor.getType(KEYS.taskList) }),
    [KEYS.ulClassic]: (editor) =>
      editor
        .plugin(BaseListPlugin)
        .update.toggle({ type: editor.getType(KEYS.ulClassic) }),
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

  const nodeType = editor.getType(type);

  editor.update((tx) => {
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;

      if (node.type !== nodeType) {
        tx.nodes.set({ type: nodeType }, { at: path });
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
