import {
  defineInputRule,
  ElementApi,
  matchBlockStart,
  SelectionApi,
  type InsertTextInputRuleReadContext,
} from '../../../core';
import { rootedBlockSelection } from '../../../internal/plugin/indentShift';
import type { BaseListPlugin } from './BaseListPlugin';
import { rootedNodeReader } from './listFamily.internal';
import { findContinuedItem, hasNeighborInList } from './listIdentity.internal';
import {
  getDocumentListOrdinal,
  isListItem,
  isListLevels,
} from './listIndex.internal';

type MarkdownListRuleOptions = {
  enabled?: (context: InsertTextInputRuleReadContext) => boolean;
  priority?: number;
};

const readContinuedList = (
  plugin: typeof BaseListPlugin,
  context: InsertTextInputRuleReadContext,
  start: number
) => {
  const entry = context.getBlockEntry();

  if (!entry) return undefined;

  const selection = context.editor.read.selection();
  const root =
    (selection ? SelectionApi.root(selection) : undefined) ??
    context.editor.read.view.root();
  const [node, path] = entry;
  const indent = Number(node.indent ?? 0);
  const previous = findContinuedItem(
    rootedNodeReader(context.editor.read, root),
    [
      {
        ...node,
        indent: isListItem(node) ? Math.max(1, indent || 1) : indent + 1,
        listType: 'numbered',
      },
      path,
    ]
  );

  if (!previous) return undefined;

  const previousOrdinal =
    context.editor.plugin(plugin).read.ordinal(previous) ??
    (root
      ? getDocumentListOrdinal(context.editor.read.value(), root, previous)
      : undefined);

  if (previousOrdinal !== start - 1) {
    return undefined;
  }

  return {
    listId: typeof previous.listId === 'string' ? previous.listId : undefined,
    listLevels: isListLevels(previous.listLevels)
      ? previous.listLevels
      : undefined,
  };
};

export const createListRules = (plugin: typeof BaseListPlugin) => ({
  BulletedListRules: {
    markdown: ({
      enabled,
      priority,
      variant = '-',
    }: MarkdownListRuleOptions & { variant?: '*' | '-' } = {}) =>
      defineInputRule(plugin, {
        target: 'insertText',
        trigger: ' ',
        priority,
        enabled,
        resolve: (context) => matchBlockStart(context, { match: variant }),
        apply: ({ decline, tx }, match) => {
          const blockEntry = tx.nodes.block({ at: match.range.focus });

          if (!blockEntry) return decline();

          const root = SelectionApi.root(match.range) ?? tx.view.root();

          tx.text.delete({ at: match.range });
          if (
            !tx.plugin(plugin).set({
              at: rootedBlockSelection(blockEntry[1], root),
              type: 'bulleted',
            })
          ) {
            return decline();
          }

          return undefined;
        },
      }),
  },
  OrderedListRules: {
    markdown: ({
      enabled,
      priority,
      variant = '.',
    }: MarkdownListRuleOptions & { variant?: '.' | ')' } = {}) =>
      defineInputRule(plugin, {
        target: 'insertText',
        trigger: ' ',
        priority,
        enabled,
        resolve: (context) => {
          const match = matchBlockStart(context, {
            match: new RegExp(`^(\\d+)${variant === ')' ? '\\)' : '\\.'}$`),
            resolveMatch: ({ match: digits }) => ({
              start: Number((digits as RegExpMatchArray)[1]),
            }),
          });

          return (
            match && {
              ...match,
              continued: readContinuedList(plugin, context, match.start),
            }
          );
        },
        apply: ({ decline, tx }, match) => {
          const start = match.start ?? 1;
          const blockEntry = tx.nodes.block({ at: match.range.focus });
          const blockKey = blockEntry ? tx.key(blockEntry[0]) : null;

          if (!blockEntry || !blockKey) return decline();

          const root = SelectionApi.root(match.range) ?? tx.view.root();

          tx.text.delete({ at: match.range });
          const setChanged = tx.plugin(plugin).set({
            at: rootedBlockSelection(blockEntry[1], root),
            type: 'numbered',
          });
          // Re-resolve by key because blockRelease unwraps details titles and
          // shifts their path while keeping the node key.
          const entry = tx.nodes.get(blockKey, { match: ElementApi.isElement });

          if (!entry || entry[0].listType !== 'numbered') {
            return decline();
          }

          const [node] = entry;
          const { continued } = match;
          let extraChanged = false;

          if (
            continued &&
            !hasNeighborInList(rootedNodeReader(tx, root), entry)
          ) {
            if (
              continued.listId !== undefined &&
              node.listId !== continued.listId
            ) {
              tx.nodes.set({ listId: continued.listId }, { at: blockKey });
              extraChanged = true;
            } else if (
              continued.listId === undefined &&
              Object.hasOwn(node, 'listId')
            ) {
              tx.nodes.unset('listId', { at: blockKey });
              extraChanged = true;
            }
            if (
              continued.listLevels !== undefined &&
              node.listLevels !== continued.listLevels
            ) {
              tx.nodes.set(
                { listLevels: continued.listLevels },
                { at: blockKey }
              );
              extraChanged = true;
            }
            if (Object.hasOwn(node, 'listStart')) {
              tx.nodes.unset('listStart', { at: blockKey });
              extraChanged = true;
            }
          } else if (node.listStart !== start) {
            tx.nodes.set({ listStart: start }, { at: blockKey });
            extraChanged = true;
          }

          if (Object.hasOwn(node, 'listRestart')) {
            tx.nodes.unset('listRestart', { at: blockKey });
            extraChanged = true;
          }

          if (!setChanged && !extraChanged) return decline();

          return undefined;
        },
      }),
  },
  TaskListRules: {
    markdown: ({
      checked = false,
      enabled,
      priority,
    }: MarkdownListRuleOptions & { checked?: boolean } = {}) =>
      defineInputRule(plugin, {
        target: 'insertText',
        trigger: ' ',
        priority,
        enabled,
        resolve: (context) =>
          matchBlockStart(context, { match: checked ? '[x]' : '[]' }),
        apply: ({ decline, tx }, match) => {
          const blockEntry = tx.nodes.block({ at: match.range.focus });

          if (!blockEntry) return decline();

          const root = SelectionApi.root(match.range) ?? tx.view.root();

          tx.text.delete({ at: match.range });
          if (
            !tx.plugin(plugin).set({
              at: rootedBlockSelection(blockEntry[1], root),
              checked,
              type: 'task',
            })
          ) {
            return decline();
          }

          return undefined;
        },
      }),
  },
});
