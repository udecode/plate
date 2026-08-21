'use client';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseDatePlugin } from '@platejs/date';
import { BaseFootnotePlugin } from '@platejs/footnote';
import { BaseColumnPlugin } from '@platejs/layout';
import { BaseListPlugin } from '@platejs/list-classic';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import { BasePlaceholderPlugin } from '@platejs/media';
import { insertMediaUrl } from '@platejs/media/react';
import type { Element, NodeEntry, Path } from '@platejs/plite';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { BaseTablePlugin } from '@platejs/table';
import { BaseTocPlugin } from '@platejs/toc';
import { PLUGINS } from '@platejs/utils';
import { ElementApi, PathApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { linkPlugin } from '@/registry/components/editor/link';

const ACTION_THREE_COLUMNS = 'action_three_columns';
const ACTION_FOOTNOTE = 'action_footnote';
const HEADING_ACTION_RE = /^heading-([1-6])$/;
const getHeadingLevel = (action: string) => {
  const match = HEADING_ACTION_RE.exec(action);

  return match ? Number(match[1]) : undefined;
};

const toggleCodeBlock = (editor: PlateEditor) =>
  editor.plugin(BaseCodeBlockPlugin).update.toggle();

const createBlock = ({
  type,
  ...properties
}: { type: string } & Record<string, unknown>): Element => ({
  ...properties,
  children: [{ text: '' }],
  type,
});

const runFootnoteAction = (editor: PlateEditor) =>
  editor.plugin(BaseFootnotePlugin).update.insert({}, { select: true });

const getActionType = (editor: PlateEditor, action: string) => {
  if (action === ACTION_THREE_COLUMNS) {
    return editor.plugin(BaseColumnPlugin).schema.type;
  }
  if (getHeadingLevel(action)) {
    return editor.plugin(PLUGINS.heading).schema.type;
  }

  const plugin = editor.plugin(action);

  return plugin.schema.type;
};

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
  [PLUGINS.date]: (editor) =>
    editor.plugin(BaseDatePlugin).update.insert({}, { select: true }),
  [ACTION_FOOTNOTE]: runFootnoteAction,
  [PLUGINS.inlineEquation]: (editor) =>
    editor.plugin(BaseInlineEquationPlugin).update.insert({}, { select: true }),
  [PLUGINS.link]: (editor) => {
    const link = editor.plugin(linkPlugin);

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
  const actionType = getActionType(editor, action);

  if (action === PLUGINS.codeBlock) {
    editor.plugin(BaseCodeBlockPlugin).update.insert();

    return;
  }
  if (action === PLUGINS.toc) {
    editor
      .plugin(BaseTocPlugin)
      .update.insert({}, { at: PathApi.next(path), select: true });
    removeEmptySourceAfterInsert(
      editor,
      editor.plugin(BaseTocPlugin).schema.type,
      path,
      currentBlockType
    );

    return;
  }
  if (action === PLUGINS.image || action === PLUGINS.mediaEmbed) {
    void insertMediaUrl(editor, {
      at: PathApi.next(path),
      select: true,
      type: actionType,
    }).then(() => {
      removeEmptySourceAfterInsert(editor, actionType, path, currentBlockType);
    });

    return;
  }
  if (
    action === PLUGINS.audio ||
    action === PLUGINS.file ||
    action === PLUGINS.video
  ) {
    editor
      .plugin(BasePlaceholderPlugin)
      .update.insert(
        { mediaType: action },
        { at: PathApi.next(path), select: true }
      );
    removeEmptySourceAfterInsert(
      editor,
      editor.plugin(BasePlaceholderPlugin).schema.type,
      path,
      currentBlockType
    );
    return;
  }
  if (action === PLUGINS.table) {
    editor.plugin(BaseTablePlugin).update.insert({}, { select: true });

    if (currentBlockType !== actionType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === ACTION_THREE_COLUMNS) {
    editor
      .plugin(BaseColumnPlugin)
      .update.insert({ columns: 3 }, { at: PathApi.next(path), select: true });

    if (currentBlockType !== actionType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.callout) {
    editor.plugin(BaseCalloutPlugin).update.insert({}, { select: true });

    if (currentBlockType !== actionType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.equation) {
    editor.plugin(BaseEquationPlugin).update.insert({}, { select: true });

    if (currentBlockType !== actionType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  editor.update((tx) => {
    const headingLevel = getHeadingLevel(action);

    tx.nodes.insert(
      createBlock({
        ...(headingLevel ? { level: headingLevel } : {}),
        type: actionType,
      }),
      {
        at: PathApi.next(path),
        select: true,
      }
    );

    if (currentBlockType !== actionType && isCurrentBlockEmpty) {
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
    editor.plugin(BaseColumnPlugin).update.toggle({ columns: 3 }),
  [PLUGINS.codeBlock]: toggleCodeBlock,
  [PLUGINS.numberedList]: (editor) =>
    editor.plugin(BaseListPlugin).update.toggle({
      type: editor.plugin(PLUGINS.numberedList).schema.type,
    }),
  [PLUGINS.taskList]: (editor) =>
    editor.plugin(BaseListPlugin).update.toggle({
      type: editor.plugin(PLUGINS.taskList).schema.type,
    }),
  [PLUGINS.bulletedList]: (editor) =>
    editor.plugin(BaseListPlugin).update.toggle({
      type: editor.plugin(PLUGINS.bulletedList).schema.type,
    }),
};

export const applyBlockAction = (
  editor: PlateEditor,
  action: string,
  { at }: { at?: Path } = {}
) => {
  if (action in setBlockMap) {
    setBlockMap[action](editor);
    return;
  }

  editor.update((tx) => {
    const actionType = getActionType(editor, action);
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;
      const headingLevel = getHeadingLevel(action);

      if (headingLevel) {
        tx.nodes.set({ level: headingLevel, type: actionType }, { at: path });
        return;
      }

      if (node.type !== actionType) {
        tx.nodes.set({ type: actionType }, { at: path });
      }
    };

    if (at) {
      const entry = tx.nodes.find({
        at,
        match: (node): node is Element => ElementApi.isElement(node),
      });

      if (entry) {
        setEntry(entry);
        return;
      }
    }

    tx.nodes
      .toArray({
        match: (node): node is Element =>
          ElementApi.isElement(node) && tx.schema.isBlock(node),
        mode: 'lowest',
      })
      .forEach((entry) => {
        setEntry(entry);
      });
  });
};

export const getBlockType = (block: Element) =>
  block.type === PLUGINS.heading && typeof block.level === 'number'
    ? `heading-${block.level}`
    : block.type;
