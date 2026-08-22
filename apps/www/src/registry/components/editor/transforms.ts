'use client';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseCodeDrawingPlugin } from '@platejs/code-drawing';
import { BaseDatePlugin } from '@platejs/date';
import { BaseExcalidrawPlugin } from '@platejs/excalidraw';
import { BaseFootnotePlugin } from '@platejs/footnote';
import { BaseColumnPlugin } from '@platejs/layout';
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
const LIST_ACTIONS = new Set(['decimal', 'disc', 'todo']);
const HEADING_ACTION_RE = /^heading-([1-6])$/;
const getHeadingLevel = (action: string) => {
  const match = HEADING_ACTION_RE.exec(action);

  return match ? Number(match[1]) : undefined;
};
const getListType = (action: string) =>
  action === 'todo'
    ? ('task' as const)
    : action === 'decimal'
      ? ('numbered' as const)
      : ('bulleted' as const);

const toggleCodeBlock = (editor: PlateEditor) => {
  editor.plugin(BaseCodeBlockPlugin).update.toggle();
};

const runFootnoteAction = (editor: PlateEditor) => {
  editor.plugin(BaseFootnotePlugin).update.insert({}, { select: true });
};

const createBlock = ({
  type,
  ...props
}: { type: string } & Record<string, unknown>): Element => ({
  ...props,
  children: [{ text: '' }],
  type,
});

const createBlockquote = (editor: PlateEditor): Element => ({
  children: [
    createBlock({
      type: editor.plugin(PLUGINS.paragraph).schema.type,
    }),
  ],
  type: editor.plugin(PLUGINS.blockquote).schema.type,
});

const getActionType = (editor: PlateEditor, action: string) => {
  if (LIST_ACTIONS.has(action)) {
    return action;
  }
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
  [PLUGINS.date]: (editor) => {
    editor.plugin(BaseDatePlugin).update.insert({}, { select: true });
  },
  [ACTION_FOOTNOTE]: runFootnoteAction,
  [PLUGINS.inlineEquation]: (editor) => {
    editor.plugin(BaseInlineEquationPlugin).update.insert({}, { select: true });
  },
  [PLUGINS.link]: (editor) => {
    const link = editor.plugin(linkPlugin);

    link.store.set({ text: editor.read.text.string() });
    link.api.show('insert', editor.id);
  },
};

type InsertBlockOptions = {
  upsert?: boolean;
};

export const insertBlock = (
  editor: PlateEditor,
  action: string,
  options: InsertBlockOptions = {}
) => {
  const { upsert = false } = options;

  const block = editor.read.nodes.block();

  if (!block) return;

  const [currentNode, path] = block;
  const isCurrentBlockEmpty = editor.read.nodes.isEmpty(currentNode);
  const currentBlockType = getBlockType(currentNode);
  const actionType = getActionType(editor, action);
  const isSameBlockType = actionType === currentBlockType;

  if (upsert && isCurrentBlockEmpty && isSameBlockType) {
    return;
  }

  if (action === PLUGINS.blockquote) {
    const insertPath = PathApi.next(path);

    editor.update((tx) => {
      tx.nodes.insert(createBlockquote(editor), { at: insertPath });

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
  if (action === ACTION_THREE_COLUMNS) {
    editor
      .plugin(BaseColumnPlugin)
      .update.insert({ columns: 3 }, { at: PathApi.next(path), select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.table) {
    editor.plugin(BaseTablePlugin).update.insert({}, { select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.callout) {
    editor.plugin(BaseCalloutPlugin).update.insert({}, { select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.codeDrawing) {
    editor.plugin(BaseCodeDrawingPlugin).update.insert({}, { select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.equation) {
    editor.plugin(BaseEquationPlugin).update.insert({}, { select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  if (action === PLUGINS.excalidraw) {
    editor.plugin(BaseExcalidrawPlugin).update.insert({}, { select: true });

    if (!isSameBlockType && isCurrentBlockEmpty) {
      editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
        editor.update({ history: 'merge' }).nodes.remove({ at: path });
      });
    }

    return;
  }
  editor.update((tx) => {
    const headingLevel = getHeadingLevel(action);
    const insertByAction: Record<string, () => void> = {
      todo: () => {
        tx.nodes.insert(
          createBlock({
            indent: 1,
            listType: getListType(action),
            type: editor.plugin(PLUGINS.paragraph).schema.type,
          }),
          { select: true }
        );
      },
      decimal: () => {
        tx.nodes.insert(
          createBlock({
            indent: 1,
            listType: getListType(action),
            type: editor.plugin(PLUGINS.paragraph).schema.type,
          }),
          { select: true }
        );
      },
      disc: () => {
        tx.nodes.insert(
          createBlock({
            indent: 1,
            listType: getListType(action),
            type: editor.plugin(PLUGINS.paragraph).schema.type,
          }),
          { select: true }
        );
      },
    };
    const insert = headingLevel
      ? () => {
          tx.nodes.insert(
            createBlock({ level: headingLevel, type: actionType }),
            { select: true }
          );
        }
      : insertByAction[action];

    if (insert) {
      insert();
    } else {
      tx.nodes.insert(createBlock({ type: actionType }), {
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

export const insertInlineElement = (editor: PlateEditor, action: string) => {
  insertInlineMap[action]?.(editor);
};

const setBlockActionMap: Record<string, (editor: PlateEditor) => void> = {
  [ACTION_THREE_COLUMNS]: (editor) => {
    editor.plugin(BaseColumnPlugin).update.toggle({ columns: 3 });
  },
  [PLUGINS.codeBlock]: toggleCodeBlock,
};

export const applyBlockAction = (
  editor: PlateEditor,
  action: string,
  { at }: { at?: Path } = {}
) => {
  if (action in setBlockActionMap) {
    setBlockActionMap[action](editor);
    return;
  }

  editor.update((tx) => {
    const actionType = getActionType(editor, action);
    const setEntry = (entry: NodeEntry<Element>) => {
      const [node, path] = entry;

      if (node.listType) {
        const properties: string[] = [
          'checked',
          'indent',
          'listRestart',
          'listStart',
          'listStyle',
          'listType',
        ];

        tx.nodes.unset(properties, { at: path });
      }
      const headingLevel = getHeadingLevel(action);

      if (headingLevel) {
        tx.nodes.set(
          {
            level: headingLevel,
            type: editor.plugin(PLUGINS.heading).schema.type,
          },
          { at: path }
        );
        return;
      }
      if (action === 'todo' || action === 'decimal' || action === 'disc') {
        tx.nodes.set(
          {
            indent: 1,
            listType: getListType(action),
            type: editor.plugin(PLUGINS.paragraph).schema.type,
          },
          { at: path }
        );

        return;
      }
      if (action === PLUGINS.blockquote) {
        const isActive =
          node.type === actionType ||
          !!tx.nodes.above({
            at: path,
            type: BaseBlockquotePlugin,
          });

        if (!isActive) {
          tx.nodes.wrap(
            { children: [], type: actionType },
            {
              at: path,
            }
          );
        }

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

    const entries = tx.nodes.toArray({
      match: (node): node is Element =>
        ElementApi.isElement(node) && tx.schema.isBlock(node),
      mode: 'lowest',
    });

    entries.forEach((entry) => {
      setEntry(entry);
    });
  });
};

export const getBlockType = (block: Element) => {
  if (block.listType) {
    if (block.listType === 'numbered') {
      return 'decimal';
    }
    if (block.listType === 'task') {
      return 'todo';
    }
    return 'disc';
  }
  if (block.type === PLUGINS.heading && typeof block.level === 'number') {
    return `heading-${block.level}`;
  }

  return block.type;
};
