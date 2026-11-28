import type {
  Path,
  PluginReference,
  SelectionInputRuleContext,
} from '../../../core';
import {
  BaseParagraphPlugin,
  createBlockFenceInputRule,
  defineInputRule,
  TextApi,
} from '../../../core';
import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

const WHITESPACE_RE = /\s/;

type CodeBlockFenceMatch = {
  language: string | undefined;
  path: Path;
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

  if (
    blockNode.children.length !== 1 ||
    !TextApi.isText(blockNode.children[0])
  ) {
    return undefined;
  }

  if (!editor.read.points.isEnd(selection.focus, path)) return undefined;

  const blockText = context.getBlockStartText();

  if (blockText === undefined || !blockText.startsWith(fence)) {
    return undefined;
  }

  const rawLanguage = blockText.slice(fence.length);

  if (
    WHITESPACE_RE.test(rawLanguage) ||
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

  return {
    language: normalized || undefined,
    path,
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
        enabled,
        fence,
        on: 'match',
        priority,
        apply: ({ decline, editor, tx }, match) => {
          if (
            !tx.nodes.replace(
              {
                children: [{ text: '' }],
                type: editor.plugin(BaseCodeBlockPlugin).schema.type,
              },
              { at: match.path }
            )
          ) {
            return decline();
          }

          const start = tx.points.start(match.path);

          if (start) {
            tx.selection.set(start);
          }

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
              { at: match.path }
            )
          ) {
            return decline();
          }

          const start = tx.points.start(match.path);

          if (start) {
            tx.selection.set(start);
          }

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
            { at: match.path }
          )
        ) {
          return decline();
        }

        const start = tx.points.start(match.path);

        if (start) {
          tx.selection.set(start);
        }

        return undefined;
      },
    });
  },
};
