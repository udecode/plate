import type {
  Element,
  Path,
  PluginReference,
  SelectionInputRuleContext,
} from '../../../core';
import {
  BaseParagraphPlugin,
  createBlockFenceInputRule,
  defineInputRule,
  PathApi,
  SelectionApi,
  TextApi,
} from '../../../core';
import { canPlaceBlocksAtPath } from '../../../facade';
import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

const WHITESPACE_RE = /\s/;

type CodeBlockFenceMatch = {
  block: Element;
  language: string | undefined;
  path: Path;
  root: string | undefined;
};

const resolveSelectionRoot = (editor: SelectionInputRuleContext['editor']) => {
  const selection = editor.read.selection();

  return (
    (selection ? SelectionApi.root(selection) : undefined) ??
    editor.read.view.root()
  );
};

const isUniformFence = (fence: string) =>
  fence.length > 0 && Array.from(fence).every((char) => char === fence[0]);

const canPlaceCodeBlock = (
  editor: SelectionInputRuleContext['editor'],
  path: Path,
  language: string | undefined,
  root: string | undefined
) => {
  const codeBlockPlugin = editor.plugin(BaseCodeBlockPlugin);
  const index = path.at(-1);

  if (!codeBlockPlugin.installed || index === undefined) return false;

  return canPlaceBlocksAtPath(
    editor.read.schema,
    path,
    [
      {
        children: [{ text: '' }],
        ...(language ? { language } : {}),
        type: codeBlockPlugin.schema.type,
      },
    ],
    {
      removing: [index],
      root,
    }
  );
};

const resolveCodeBlockFence = (
  context: SelectionInputRuleContext,
  {
    block,
    fence,
    normalizeLanguage,
  }: {
    block: PluginReference | string;
    fence: string;
    normalizeLanguage?: (language: string) => string | undefined;
  }
): CodeBlockFenceMatch | undefined => {
  const { editor } = context;
  const selection = editor.read.selection();

  if (!context.isCollapsed || !selection) return undefined;

  const blockEntry = context.getBlockEntry();

  if (!blockEntry) return undefined;

  const [blockNode, path] = blockEntry;

  if (block) {
    const plugin = editor.plugin(block);

    if (!plugin.installed || !plugin.schema || !('type' in plugin.schema)) {
      return undefined;
    }

    if (blockNode.type !== plugin.schema.type) return undefined;
  }

  const [leaf] = blockNode.children;

  if (
    blockNode.children.length !== 1 ||
    !TextApi.isText(leaf) ||
    !PathApi.equals(selection.focus.path, [...path, 0]) ||
    selection.focus.offset !== leaf.text.length
  ) {
    return undefined;
  }

  const root = resolveSelectionRoot(editor);
  const blockText = context.getBlockStartText();

  if (blockText === undefined || !blockText.startsWith(fence)) {
    return undefined;
  }

  const rawLanguage = blockText.slice(fence.length);

  if (
    WHITESPACE_RE.test(rawLanguage) ||
    (isUniformFence(fence) && rawLanguage.startsWith(fence[0])) ||
    (fence.includes('`') && rawLanguage.includes('`'))
  ) {
    return undefined;
  }

  const normalized =
    rawLanguage.length > 0
      ? normalizeLanguage
        ? normalizeLanguage(rawLanguage)
        : rawLanguage
      : undefined;
  const language = normalized?.trim() || undefined;

  if (!canPlaceCodeBlock(editor, path, language, root)) return undefined;

  return {
    block: blockNode,
    language,
    path,
    root,
  };
};

export const CodeBlockRules = {
  /**
   * Promote a fenced Markdown line into a code block.
   *
   * - `on: 'match'` converts a bare fence on its closing character.
   * - `on: 'space'` converts `<fence>[lang]` on Space (revertible with Backspace).
   * - `on: 'break'` converts `<fence>[lang]` on Enter (revertible with undo).
   */
  markdown: ({
    block = BaseParagraphPlugin,
    enabled,
    fence = '```',
    normalizeLanguage,
    on,
    priority = 100,
  }: {
    block?: PluginReference | string;
    enabled?: (context: SelectionInputRuleContext) => boolean;
    fence?: string;
    /** Map a typed fence language token to a canonical slug, or omit `language` when returning `undefined` or `''`. */
    normalizeLanguage?: (language: string) => string | undefined;
    on: 'break' | 'match' | 'space';
    priority?: number;
  }) => {
    if (!fence) {
      throw new Error('CodeBlockRules.markdown requires a non-empty fence.');
    }

    if (on === 'match') {
      return createBlockFenceInputRule({
        block,
        enabled: (context) => {
          if (enabled && !enabled(context)) return false;

          const blockEntry = context.getBlockEntry();

          if (!blockEntry) return false;

          const [blockNode, path] = blockEntry;

          if (
            blockNode.children.length !== 1 ||
            !TextApi.isText(blockNode.children[0])
          ) {
            return false;
          }

          return canPlaceCodeBlock(
            context.editor,
            path,
            undefined,
            resolveSelectionRoot(context.editor)
          );
        },
        fence,
        on: 'match',
        priority,
        apply: ({ decline, editor, getBlockEntry, tx }, match) => {
          const root = resolveSelectionRoot(editor);
          const blockNode = getBlockEntry()?.[0];

          if (
            !tx.nodes.replace(
              {
                children: [{ text: '' }],
                type: editor.plugin(BaseCodeBlockPlugin).schema.type,
              },
              { at: blockNode ?? match.path }
            )
          ) {
            return decline();
          }

          tx.selection.set({
            offset: 0,
            path: [...match.path, 0],
            ...(root ? { root } : {}),
          });

          return undefined;
        },
      });
    }

    if (on === 'break') {
      return defineInputRule({
        enabled,
        priority,
        target: 'insertBreak',
        resolve: (context) =>
          resolveCodeBlockFence(context, { block, fence, normalizeLanguage }),
        apply: ({ decline, editor, tx }, match) => {
          if (
            !tx.nodes.replace(
              {
                children: [{ text: '' }],
                ...(match.language ? { language: match.language } : {}),
                type: editor.plugin(BaseCodeBlockPlugin).schema.type,
              },
              { at: match.block }
            )
          ) {
            return decline();
          }

          tx.selection.set({
            offset: 0,
            path: [...match.path, 0],
            ...(match.root ? { root: match.root } : {}),
          });

          return undefined;
        },
      });
    }

    return defineInputRule({
      enabled,
      priority,
      target: 'insertText',
      trigger: ' ',
      resolve: (context) => {
        if (context.text !== ' ') return undefined;

        return resolveCodeBlockFence(context, {
          block,
          fence,
          normalizeLanguage,
        });
      },
      apply: ({ decline, editor, tx }, match) => {
        if (
          !tx.nodes.replace(
            {
              children: [{ text: '' }],
              ...(match.language ? { language: match.language } : {}),
              type: editor.plugin(BaseCodeBlockPlugin).schema.type,
            },
            { at: match.block }
          )
        ) {
          return decline();
        }

        tx.selection.set({
          offset: 0,
          path: [...match.path, 0],
          ...(match.root ? { root: match.root } : {}),
        });

        return undefined;
      },
    });
  },
};
