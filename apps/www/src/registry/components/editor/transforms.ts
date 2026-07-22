'use client';

import type { PlateEditor } from 'platejs/react';
import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
  Path,
} from '@platejs/plite';
import { insertCallout } from '@platejs/callout';
import { BaseCodeBlockPlugin, insertCodeBlock } from '@platejs/code-block';
import { insertCodeDrawing } from '@platejs/code-drawing';
import { BaseDatePlugin } from '@platejs/date';
import { insertExcalidraw } from '@platejs/excalidraw';
import { BaseFootnoteReferencePlugin } from '@platejs/footnote';
import { BaseColumnItemPlugin, insertColumnGroup } from '@platejs/layout';
import { triggerFloatingLink } from '@platejs/link/react';
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

const runFootnoteAction = (editor: PlateEditor) =>
  editor
    .plugin(BaseFootnoteReferencePlugin)
    .update.insert.footnote({ select: true });

const createBlock = ({
  type,
  ...props
}: { type: string } & Record<string, unknown>): Element =>
  ({
    children: [{ text: '' }],
    type,
    ...props,
  }) as Element;

const createBlockquote = (): Element => ({
  children: [createBlock({ type: KEYS.p })],
  type: KEYS.blockquote,
});

const insertBlockMap: Record<
  string,
  (editor: PlateEditor, tx: EditorUpdateTransaction, type: string) => void
> = {
  [KEYS.listTodo]: (_editor, tx, type) =>
    tx.nodes.insert(
      createBlock({ indent: 1, listStyleType: type, type: KEYS.p }),
      { select: true }
    ),
  [KEYS.ol]: (_editor, tx, type) =>
    tx.nodes.insert(
      createBlock({ indent: 1, listStyleType: type, type: KEYS.p }),
      { select: true }
    ),
  [KEYS.ul]: (_editor, tx, type) =>
    tx.nodes.insert(
      createBlock({ indent: 1, listStyleType: type, type: KEYS.p }),
      { select: true }
    ),
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
  [KEYS.codeDrawing]: (editor, tx) =>
    insertCodeDrawing(
      tx,
      editor.getType(KEYS.codeDrawing),
      {},
      { select: true }
    ),
  [KEYS.equation]: (editor, tx) =>
    insertEquation(tx, editor.getType(KEYS.equation), { select: true }),
  [KEYS.excalidraw]: (editor, tx) =>
    insertExcalidraw(tx, editor.getType(KEYS.excalidraw), {}, { select: true }),
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

type InsertBlockOptions = {
  upsert?: boolean;
};

export const insertBlock = (
  editor: PlateEditor,
  type: string,
  options: InsertBlockOptions = {}
) => {
  const { upsert = false } = options;

  const block = editor.read.nodes.block();

  if (!block) return;

  const [currentNode, path] = block;
  const isCurrentBlockEmpty = editor.read.nodes.isEmpty(currentNode);
  const currentBlockType = getBlockType(currentNode);
  const nodeType = editor.getType(type);

  const isSameBlockType = nodeType === currentBlockType;

  if (upsert && isCurrentBlockEmpty && isSameBlockType) {
    return;
  }

  if (type === KEYS.blockquote) {
    const insertPath = PathApi.next(path);

    editor.update((tx) => {
      tx.nodes.insert(createBlockquote(), { at: insertPath });

      if (!isSameBlockType && isCurrentBlockEmpty) {
        editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
          tx.nodes.remove({ at: path });
        });
      }

      const start = tx.points.start(
        (isCurrentBlockEmpty && !isSameBlockType ? path : insertPath).concat([
          0,
        ])
      );

      if (start) tx.selection.set(start);
    });

    return;
  }
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
      tx.nodes.insert(createBlock({ type: nodeType }), {
        at: PathApi.next(path),
        select: true,
      });
    }

    if (!isSameBlockType && isCurrentBlockEmpty) {
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

const setList = (
  tx: EditorUpdateTransaction,
  type: string,
  entry: NodeEntry<Element>
) => {
  tx.nodes.set(
    {
      indent: 1,
      listStyleType: type,
      type: KEYS.p,
    },
    {
      at: entry[1],
    }
  );
};

const setBlockMap: Record<
  string,
  (tx: EditorUpdateTransaction, type: string, entry: NodeEntry<Element>) => void
> = {
  [KEYS.listTodo]: setList,
  [KEYS.ol]: setList,
  [KEYS.ul]: setList,
};

const setBlockActionMap: Record<string, (editor: PlateEditor) => void> = {
  [ACTION_THREE_COLUMNS]: (editor) =>
    editor.plugin(BaseColumnItemPlugin).update.toggle({ columns: 3 }),
  [KEYS.codeBlock]: toggleCodeBlock,
};

export const setBlockType = (
  editor: PlateEditor,
  type: string,
  { at }: { at?: Path } = {}
) => {
  if (type in setBlockActionMap) {
    setBlockActionMap[type](editor);
    return;
  }

  const nodeType = editor.getType(type);

  editor.update((tx) => {
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;

      if ((node as Element & Record<string, unknown>)[KEYS.listType]) {
        tx.nodes.unset([KEYS.listType, 'indent'], { at: path });
      }
      if (type in setBlockMap) {
        return setBlockMap[type](tx, type, entry);
      }
      if (type === KEYS.blockquote) {
        const isActive =
          node.type === nodeType ||
          !!tx.nodes.above({
            at: path,
            match: { type: nodeType },
          });

        if (!isActive) {
          tx.nodes.wrap({ children: [], type: nodeType } as Element, {
            at: path,
          });
        }

        return;
      }
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

    const entries = tx.nodes.toArray<Element>({
      match: (node) => ElementApi.isElement(node) && tx.schema.isBlock(node),
      mode: 'lowest',
    });

    entries.forEach((entry) => {
      setEntry(entry);
    });
  });
};

export const getBlockType = (block: Element) => {
  if (block[KEYS.listType]) {
    if (block[KEYS.listType] === KEYS.ol) {
      return KEYS.ol;
    }
    if (block[KEYS.listType] === KEYS.listTodo) {
      return KEYS.listTodo;
    }
    return KEYS.ul;
  }

  return block.type;
};
