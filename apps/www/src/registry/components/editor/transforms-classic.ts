'use client';
import { NODES } from '@platejs/utils';

import type { Element, NodeEntry, Path } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseDatePlugin } from '@platejs/date';
import { BaseFootnotePlugin } from '@platejs/footnote';
import { BaseColumnItemPlugin } from '@platejs/layout';
import { LinkPlugin } from '@platejs/link/react';
import { BaseListPlugin } from '@platejs/list-classic';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
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
  insertedNodeType: string,
  path: Path,
  currentBlockType: string
) => {
  const inserted = editor.read.nodes.get(PathApi.next(path));
  const source = editor.read.nodes.get(path);

  if (
    !inserted ||
    !ElementApi.isElement(inserted[0]) ||
    inserted[0].type !== insertedNodeType ||
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

const insertInlineMap: Record<string, (editor: PlateEditor) => void> = {
  [NODES.date]: (editor) =>
    editor.plugin(BaseDatePlugin).update.insert({ select: true }),
  [ACTION_FOOTNOTE]: runFootnoteAction,
  [NODES.inlineEquation]: (editor) =>
    editor.plugin(BaseInlineEquationPlugin).update.insert({ select: true }),
  [NODES.link]: (editor) => {
    const link = editor.plugin(LinkPlugin);

    link.store.set({ text: editor.read.text.string() });
    link.api.show('insert', editor.id);
  },
};

export const insertBlock = (editor: PlateEditor, action: string) => {
  const block = editor.read.nodes.block();

  if (!block) return;

  const [currentNode, path] = block;
  const isCurrentBlockEmpty = editor.read.nodes.isEmpty(currentNode);
  const currentBlockType = getBlockType(currentNode);

  if (action === NODES.codeBlock) {
    editor.plugin(BaseCodeBlockPlugin).update.insert();

    return;
  }
  if (action === NODES.toc) {
    editor
      .plugin(BaseTocPlugin)
      .update.insert({ at: PathApi.next(path), select: true });
    removeEmptySourceAfterInsert(editor, NODES.toc, path, currentBlockType);

    return;
  }
  if (action === NODES.img || action === NODES.mediaEmbed) {
    void insertMediaUrl(editor, {
      at: PathApi.next(path),
      select: true,
      type: action,
    }).then(() => {
      removeEmptySourceAfterInsert(editor, action, path, currentBlockType);
    });

    return;
  }
  if (
    action === NODES.audio ||
    action === NODES.file ||
    action === NODES.video
  ) {
    editor
      .plugin(BasePlaceholderPlugin)
      .update.insert(action, { at: PathApi.next(path), select: true });
    removeEmptySourceAfterInsert(
      editor,
      NODES.placeholder,
      path,
      currentBlockType
    );
    return;
  }
  if (action === NODES.table) {
    editor.plugin(BaseTablePlugin).update.insert({}, { select: true });

    if (currentBlockType !== action && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === ACTION_THREE_COLUMNS) {
    editor.plugin(BaseColumnItemPlugin).update.insertGroup({
      at: PathApi.next(path),
      columns: 3,
      select: true,
    });

    if (currentBlockType !== action && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === NODES.callout) {
    editor.plugin(BaseCalloutPlugin).update.insert({ select: true });

    if (currentBlockType !== action && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === NODES.equation) {
    editor.plugin(BaseEquationPlugin).update.insert({ select: true });

    if (currentBlockType !== action && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  editor.update((tx) => {
    tx.nodes.insert(createBlock({ type: action }), {
      at: PathApi.next(path),
      select: true,
    });

    if (currentBlockType !== action && isCurrentBlockEmpty) {
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

export const insertInlineElement = (editor: PlateEditor, action: string) => {
  insertInlineMap[action]?.(editor);
};

const setBlockMap: Record<string, (editor: PlateEditor) => void> = {
  [ACTION_THREE_COLUMNS]: (editor) =>
    editor.plugin(BaseColumnItemPlugin).update.toggle({ columns: 3 }),
  [NODES.codeBlock]: toggleCodeBlock,
  [NODES.olClassic]: (editor) =>
    editor
      .plugin(BaseListPlugin)
      .update.toggle({ type: editor.plugin(KEYS.olClassic).type }),
  [NODES.taskList]: (editor) =>
    editor
      .plugin(BaseListPlugin)
      .update.toggle({ type: editor.plugin(KEYS.taskList).type }),
  [NODES.ulClassic]: (editor) =>
    editor
      .plugin(BaseListPlugin)
      .update.toggle({ type: editor.plugin(KEYS.ulClassic).type }),
};

export const setBlockType = (
  editor: PlateEditor,
  action: string,
  { at }: { at?: Path } = {}
) => {
  if (action in setBlockMap) {
    setBlockMap[action](editor);
    return;
  }

  editor.update((tx) => {
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;

      if (node.type !== action) {
        tx.nodes.set({ type: action }, { at: path });
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
