import { type BaseEditor, createRuleFactory } from '@platejs/core';
import type { EditorUpdateTransaction, Range } from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseLinkPlugin } from './BaseLinkPlugin';
import { upsertLink } from './transforms';
import { validateUrl } from './utils';

type LinkAutomdMatch = {
  range: Range;
  text: string;
  url: string;
};

type LinkPasteAutolinkMatch = {
  shouldLink: boolean;
  text: string;
  url: string;
};

type LinkTextAutolinkMatch = {
  range: Range;
  url: string;
};

const LINK_AUTOMD_REGEX = /\[([^\]\n]+)]\((\S+)$/;
const MARKDOWN_LINK_SOURCE_RE = /!?\[[^\]\n]*]\([^)\n]*$/;

const getRangeFromBlockStart = (editor: BaseEditor, range: Range) => {
  const block = editor.read.nodes.block({ at: range });
  const start = block && editor.read.points.start(block[1]);

  if (!start) return;

  return { anchor: start, focus: range.anchor };
};

const shouldAutoLinkPasteByDefault = (
  editor: BaseEditor,
  { textBefore }: { textBefore: string }
) => {
  const selection = editor.read.selection();

  if (!selection) return false;

  if (
    editor.read.nodes.above({
      at: selection,
      match: { type: editor.getType(KEYS.codeBlock) },
    })
  ) {
    return false;
  }

  if (!editor.read.selection.isCollapsed()) return true;

  return !MARKDOWN_LINK_SOURCE_RE.test(textBefore);
};

const getLinkAutomdMatch = (
  editor: BaseEditor
): LinkAutomdMatch | undefined => {
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return;
  if (
    editor.read.nodes.above({
      at: selection,
      match: {
        type: [editor.getType(KEYS.codeBlock), editor.getType(KEYS.link)],
      },
    })
  ) {
    return;
  }

  const blockRange = getRangeFromBlockStart(editor, selection);

  if (!blockRange) return;

  const textBefore = editor.read.text.string(blockRange);
  const match = LINK_AUTOMD_REGEX.exec(textBefore);

  if (!match) return;

  const [, linkText, rawUrl] = match;
  const { transformInput } = editor.plugin(BaseLinkPlugin).getOptions();
  const url = transformInput ? (transformInput(rawUrl) ?? '') : rawUrl;

  if (!url || !validateUrl(editor, url)) return;

  const startPoint = editor.read.points.before(selection, {
    distance: match[0].length,
    unit: 'character',
  });

  if (!startPoint) return;

  return {
    range: { anchor: startPoint, focus: selection.anchor },
    text: linkText,
    url,
  };
};

const getAutolinkMatch = (
  editor: BaseEditor
): LinkTextAutolinkMatch | undefined => {
  const { getUrlHref, isUrl, rangeBeforeOptions } = editor
    .plugin(BaseLinkPlugin)
    .getOptions();
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return;

  const before = editor.read.points.before(selection, rangeBeforeOptions);
  const beforeWordRange = before
    ? { anchor: before, focus: selection.anchor }
    : getRangeFromBlockStart(editor, selection);

  if (!beforeWordRange) return;
  if (
    editor.read.nodes.some({
      at: beforeWordRange,
      match: { type: editor.getType(KEYS.link) },
    })
  ) {
    return;
  }

  const text = editor.read.text.string(beforeWordRange);
  const url = getUrlHref?.(text) ?? text;

  if (!isUrl?.(url)) return;

  return { range: beforeWordRange, url };
};

const applyAutolinkMatch = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  match: LinkTextAutolinkMatch
) => {
  tx.selection.set(match.range);

  if (!upsertLink(editor, tx, { url: match.url })) return false;

  tx.selection.collapse({ edge: 'end' });

  return true;
};

const moveSelectionAfterLink = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const selection = tx.selection();

  if (!selection || !tx.selection.isCollapsed()) return;

  const linkEntry = tx.nodes.above({
    match: { type: editor.getType(KEYS.link) },
  });

  if (!linkEntry || !tx.points.isEnd(selection.focus, linkEntry[1])) return;

  const nextPoint = tx.points.after(linkEntry[1]);

  if (nextPoint) {
    tx.selection.set(nextPoint);

    return;
  }

  const nextPath = PathApi.next(linkEntry[1]);

  tx.nodes.insert({ text: '' }, { at: nextPath });
  tx.selection.set({ offset: 0, path: nextPath });
};

const markdownLinkRule = createRuleFactory<{}, {}, LinkAutomdMatch>({
  type: 'insertText',
  trigger: ')',
  resolve: (context) => {
    if (context.text !== ')' || context.options?.at) return;

    return getLinkAutomdMatch(context.editor);
  },
  apply: (context, match) => {
    const inserted = upsertLink(context.editor, context.tx, {
      insertNodesOptions: { at: match.range, select: true },
      skipValidation: true,
      text: match.text,
      url: match.url,
    });

    if (inserted) {
      moveSelectionAfterLink(context.editor, context.tx);

      return true;
    }

    context.insertText(context.text, context.options);

    return true;
  },
});

const breakAutolinkRule = createRuleFactory<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertBreak',
  resolve: ({ editor }) => getAutolinkMatch(editor),
  apply: ({ editor, insertBreak, tx }, match) => {
    if (!applyAutolinkMatch(editor, tx, match)) return;

    moveSelectionAfterLink(editor, tx);
    insertBreak();

    return true;
  },
});

const pasteAutolinkRule = createRuleFactory<{}, {}, LinkPasteAutolinkMatch>({
  type: 'insertData',
  resolve: (context) => {
    if (!context.text) return;

    const { getUrlHref } = context.editor.plugin(BaseLinkPlugin).getOptions();
    const url = getUrlHref?.(context.text) ?? context.text;

    if (!validateUrl(context.editor, url)) return;

    return {
      shouldLink: shouldAutoLinkPasteByDefault(context.editor, {
        textBefore: context.getBlockTextBeforeSelection(),
      }),
      text: context.text,
      url,
    };
  },
  apply: (context, match) => {
    if (match.shouldLink) {
      const { keepSelectedTextOnPaste } = context.editor
        .plugin(BaseLinkPlugin)
        .getOptions();
      const inserted = upsertLink(context.editor, context.tx, {
        insertTextInLink: true,
        text: keepSelectedTextOnPaste ? undefined : match.url,
        url: match.url,
      });

      if (inserted) return true;
    }

    context.tx.text.insert(match.text);

    return true;
  },
});

const spaceAutolinkRule = createRuleFactory<{}, {}, LinkTextAutolinkMatch>({
  type: 'insertText',
  trigger: ' ',
  resolve: (context) => {
    if (context.text !== ' ') return;

    return getAutolinkMatch(context.editor);
  },
  apply: (context, match) => {
    if (!applyAutolinkMatch(context.editor, context.tx, match)) return;

    moveSelectionAfterLink(context.editor, context.tx);
    context.insertText(context.text, context.options);

    return true;
  },
});

type LinkAutolinkOptions =
  | ({ variant: 'break' } & NonNullable<
      Parameters<typeof breakAutolinkRule>[0]
    >)
  | ({ variant: 'paste' } & NonNullable<
      Parameters<typeof pasteAutolinkRule>[0]
    >)
  | ({ variant: 'space' } & NonNullable<
      Parameters<typeof spaceAutolinkRule>[0]
    >);

export const LinkRules = {
  markdown: markdownLinkRule,
  autolink: (options: LinkAutolinkOptions) => {
    const runtime = {
      enabled: options.enabled,
      priority: options.priority,
    };

    if (options.variant === 'break') return breakAutolinkRule(runtime);
    if (options.variant === 'paste') return pasteAutolinkRule(runtime);

    return spaceAutolinkRule(runtime);
  },
};
