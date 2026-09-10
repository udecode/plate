'use client';

import {
  BaseBlockquotePlugin,
  BaseCodeBlockPlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  PLUGINS,
  type PlatePluginTransaction,
  type Element,
  type HeadingLevel,
} from 'platejs';
import { BaseCalloutPlugin } from 'platejs/callout';
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';
import { BaseDatePlugin } from 'platejs/date';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import { BaseFootnotePlugin } from 'platejs/footnote';
import { BaseColumnPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import {
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
} from 'platejs/media';
import type { Editor } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';

import { linkPlugin } from '@/registry/components/editor/link';

const headingLevels: Record<string, HeadingLevel | undefined> = {
  'heading-1': 1,
  'heading-2': 2,
  'heading-3': 3,
  'heading-4': 4,
  'heading-5': 5,
  'heading-6': 6,
};
const listTypes = {
  decimal: 'numbered',
  disc: 'bulleted',
  todo: 'task',
} as const;
const getListType = (action: string) =>
  listTypes[action as keyof typeof listTypes];

const insertBlockMap: Record<
  string,
  (
    tx: PlatePluginTransaction,
    options: { replaceEmpty: boolean; select: boolean }
  ) => void
> = {
  [PLUGINS.paragraph]: (tx, options) =>
    tx.plugin(BaseParagraphPlugin).insert({}, options),
  [PLUGINS.blockquote]: (tx, options) =>
    tx.plugin(BaseBlockquotePlugin).insert({}, options),
  [PLUGINS.horizontalRule]: (tx, options) =>
    tx.plugin(BaseHorizontalRulePlugin).insert({}, options),
  [PLUGINS.codeBlock]: (tx, options) =>
    tx.plugin(BaseCodeBlockPlugin).insert({}, options),
  [PLUGINS.callout]: (tx, options) =>
    tx.plugin(BaseCalloutPlugin).insert({}, options),
  [PLUGINS.codeDrawing]: (tx, options) =>
    tx.plugin(BaseCodeDrawingPlugin).insert({}, options),
  [PLUGINS.details]: (tx, options) =>
    tx.plugin(BaseDetailsPlugin).insert({}, options),
  [PLUGINS.equation]: (tx, options) =>
    tx.plugin(BaseEquationPlugin).insert({}, options),
  [PLUGINS.excalidraw]: (tx, options) =>
    tx.plugin(BaseExcalidrawPlugin).insert({}, options),
  [PLUGINS.table]: (tx, options) =>
    tx.plugin(BaseTablePlugin).insert({}, options),
  [PLUGINS.toc]: (tx, options) => tx.plugin(BaseTocPlugin).insert({}, options),
};

export const insertBlock = (
  editor: Editor,
  action: string,
  { upsert = false, tx }: { upsert?: boolean; tx?: PlatePluginTransaction } = {}
) => {
  const state = tx ?? editor.read;
  const block = state.nodes.block();
  if (!block) return;
  const currentAction = getBlockType(editor, block[0]);
  const sameAction =
    currentAction === action ||
    (action === 'action_three_columns' &&
      currentAction === editor.plugin(BaseColumnPlugin).schema.type);
  if (upsert && sameAction && state.nodes.isEmpty(block[0])) return;

  const options = { replaceEmpty: !sameAction, select: true };
  const listType = getListType(action);
  const level = headingLevels[action];
  if (action === PLUGINS.image || action === PLUGINS.mediaEmbed) {
    const media = editor.plugin(
      action === PLUGINS.image ? BaseImagePlugin : BaseMediaEmbedPlugin
    );
    void media.api.insertUrl(
      // oxlint-disable-next-line no-alert -- This copied menu owns its URL input policy.
      () => window.prompt(`Enter the URL of the ${action}`),
      options
    );
    return;
  }

  const insert: (transaction: PlatePluginTransaction) => void = (
    transaction
  ) => {
    if (listType) {
      transaction.plugin(BaseListPlugin).insert({ type: listType }, options);
    } else if (level) {
      transaction.plugin(BaseHeadingPlugin).insert({ level }, options);
    } else if (action === 'action_three_columns') {
      transaction.plugin(BaseColumnPlugin).insert({ columns: 3 }, options);
    } else if (
      action === PLUGINS.audio ||
      action === PLUGINS.file ||
      action === PLUGINS.video
    ) {
      transaction
        .plugin(BasePlaceholderPlugin)
        .insert({ mediaType: action }, options);
    } else {
      insertBlockMap[action]?.(transaction, options);
    }
  };

  if (tx) insert(tx);
  else editor.update(insert);
};

const insertInlineMap: Record<string, (tx: PlatePluginTransaction) => void> = {
  [PLUGINS.date]: (tx) =>
    tx.plugin(BaseDatePlugin).insert({}, { select: true }),
  action_footnote: (tx) =>
    tx.plugin(BaseFootnotePlugin).insert({}, { select: true }),
  [PLUGINS.inlineEquation]: (tx) =>
    tx.plugin(BaseInlineEquationPlugin).insert({}, { select: true }),
};

export const insertInlineElement = (
  editor: Editor,
  action: string,
  tx?: PlatePluginTransaction
) => {
  if (action === PLUGINS.link) {
    const link = editor.plugin(linkPlugin);
    link.store.set({ text: editor.read.text.string() });
    link.api.show('insert', editor.id);
    return;
  }
  const insert = insertInlineMap[action];
  if (!insert) return;
  if (tx) insert(tx);
  else editor.update(insert);
};

export const applyBlockAction = (editor: Editor, action: string) => {
  if (action === 'action_three_columns') {
    editor.plugin(BaseColumnPlugin).update.toggle({ columns: 3 });
  } else if (action === PLUGINS.codeBlock) {
    editor.plugin(BaseCodeBlockPlugin).update.toggle();
  } else if (action === PLUGINS.details) {
    editor.plugin(BaseDetailsPlugin).update.wrap();
  } else {
    editor.update((tx) => {
      if (editor.plugin(BaseListPlugin).installed) {
        tx.plugin(BaseListPlugin).clear();
      }
      const listType = getListType(action);
      const level = headingLevels[action];
      if (listType) {
        tx.blocks.set({ type: editor.plugin(BaseParagraphPlugin).schema.type });
        tx.plugin(BaseListPlugin).toggle({ type: listType });
      } else if (action === PLUGINS.blockquote) {
        tx.plugin(BaseBlockquotePlugin).wrap();
      } else {
        tx.blocks.set(
          level
            ? { type: editor.plugin(BaseHeadingPlugin).schema.type, level }
            : { type: editor.plugin(action).schema.type }
        );
      }
    });
  }
};

export const getBlockType = (editor: Editor, block: Element) => {
  if (block.listType) {
    return block.listType === 'numbered'
      ? 'decimal'
      : block.listType === 'task'
        ? 'todo'
        : 'disc';
  }
  if (
    block.type === editor.plugin(BaseHeadingPlugin).schema.type &&
    typeof block.level === 'number'
  ) {
    return `heading-${block.level}`;
  }
  return block.type;
};
