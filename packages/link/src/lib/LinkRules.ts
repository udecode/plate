import type { SlateEditor, TRange, TText } from 'platejs';

import { createRuleFactory, KEYS, PathApi } from 'platejs';

import { BaseLinkPlugin } from './BaseLinkPlugin';
import { upsertLink } from './transforms';
import { validateUrl } from './utils';

type LinkAutomdMatch = {
  range: TRange;
  text: string;
  url: string;
};

type LinkPasteAutolinkMatch = {
  shouldLink: boolean;
  text: string;
  url: string;
};

type LinkTextAutolinkMatch = {
  range: TRange;
  url: string;
};

const LINK_AUTOMD_REGEX = /\[([^\]\n]+)]\((\S+)$/;
const MARKDOWN_LINK_SOURCE_RE = /!?\[[^\]\n]*]\([^)\n]*$/;

const shouldAutoLinkPasteByDefault = (
  editor: SlateEditor,
  { textBefore }: { textBefore: string }
) => {
  if (
    editor.api.some({
      match: {
        type: [editor.getType(KEYS.codeBlock)],
      },
    })
  ) {
    return false;
  }

  if (!editor.api.isCollapsed()) return true;

  return !MARKDOWN_LINK_SOURCE_RE.test(textBefore);
};

const getLinkAutomdMatch = (
  editor: SlateEditor
): LinkAutomdMatch | undefined => {
  const { selection } = editor;

  if (!selection || !editor.api.isCollapsed()) return;
  if (
    editor.api.some({
      match: {
        type: [editor.getType(KEYS.codeBlock), editor.getType(KEYS.link)],
      },
    })
  ) {
    return;
  }

  const blockRange = editor.api.range('start', selection);

  if (!blockRange) return;

  const textBefore = editor.api.string(blockRange);
  const match = LINK_AUTOMD_REGEX.exec(textBefore);

  if (!match) return;

  const [, linkText, rawUrl] = match;
  const { transformInput } = editor.getOptions(BaseLinkPlugin);
  const url = transformInput ? (transformInput(rawUrl) ?? '') : rawUrl;

  if (!url || !validateUrl(editor, url)) return;

  const startPoint = editor.api.before(selection, {
    distance: match[0].length,
    unit: 'character',
  });

  if (!startPoint) return;

  return {
    range: {
      anchor: startPoint,
      focus: selection.anchor,
    },
    text: linkText,
    url,
  };
};

const getAutolinkMatch = (
  editor: SlateEditor
): LinkTextAutolinkMatch | undefined => {
  const { getUrlHref, isUrl, rangeBeforeOptions } =
    editor.getOptions(BaseLinkPlugin);
  const { selection } = editor;

  if (!selection || !editor.api.isCollapsed()) return;

  let beforeWordRange = editor.api.range('before', selection, {
    before: rangeBeforeOptions,
  });

  if (!beforeWordRange) {
    beforeWordRange = editor.api.range('start', selection);
  }
  if (!beforeWordRange) return;

  const hasLink = editor.api.some({
    at: beforeWordRange,
    match: { type: editor.getType(KEYS.link) },
  });

  if (hasLink) return;

  let beforeWordText = editor.api.string(beforeWordRange);

  beforeWordText = getUrlHref?.(beforeWordText) ?? beforeWordText;

  if (!isUrl?.(beforeWordText)) return;

  return {
    range: beforeWordRange,
    url: beforeWordText,
  };
};

const applyAutolinkMatch = (
  editor: SlateEditor,
  match: LinkTextAutolinkMatch
) => {
  editor.tf.select(match.range);

  const inserted = upsertLink(editor, {
    url: match.url,
  });

  if (!inserted) return false;

  editor.tf.collapse({ edge: 'end' });

  return true;
};

const moveSelectionAfterLink = (editor: SlateEditor) => {
  const { selection } = editor;

  if (!selection || !editor.api.isCollapsed()) return;

  const linkEntry = editor.api.above({
    match: { type: editor.getType(KEYS.link) },
  });

  if (!linkEntry) return;

  const [, linkPath] = linkEntry;

  if (!editor.api.isEnd(selection.focus, linkPath)) return;

  const nextPoint = editor.api.start(linkPath, { next: true });

  if (nextPoint) {
    editor.tf.select(nextPoint);

    return;
  }

  const nextPath = PathApi.next(linkPath);

  editor.tf.insertNodes({ text: '' } as TText, { at: nextPath });
  editor.tf.select(nextPath);
};

export const LinkRules = {
  markdown: createRuleFactory<{}, {}, LinkAutomdMatch>({
    type: 'insertText',
    trigger: ')',
    resolve: (context) => {
      if (context.text !== ')' || context.options?.at) return;

      return getLinkAutomdMatch(context.editor);
    },
    apply: (context, match) => {
      const inserted = upsertLink(context.editor, {
        insertNodesOptions: {
          at: match.range,
          select: true,
        },
        skipValidation: true,
        text: match.text,
        url: match.url,
      });

      if (inserted) {
        moveSelectionAfterLink(context.editor);

        return true;
      }

      context.insertText(context.text, context.options);

      return true;
    },
  }),
  autolink: createRuleFactory<{ variant: 'break' | 'paste' | 'space' }>(
    (options) =>
      options.variant === 'break'
        ? {
            type: 'insertBreak',
            resolve: ({ editor }) => getAutolinkMatch(editor),
            apply: ({ editor }, match) => {
              const autolinkMatch = match as LinkTextAutolinkMatch;

              if (!applyAutolinkMatch(editor, autolinkMatch)) return;

              moveSelectionAfterLink(editor);
              editor.tf.insertBreak();

              return true;
            },
          }
        : options.variant === 'paste'
          ? {
              type: 'insertData',
              resolve: (context) => {
                if (!context.text) return;

                const { getUrlHref } =
                  context.editor.getOptions(BaseLinkPlugin);
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
                const autolinkMatch = match as LinkPasteAutolinkMatch;

                if (autolinkMatch.shouldLink) {
                  const { keepSelectedTextOnPaste } =
                    context.editor.getOptions(BaseLinkPlugin);
                  const inserted = upsertLink(context.editor, {
                    insertTextInLink: true,
                    text: keepSelectedTextOnPaste
                      ? undefined
                      : autolinkMatch.url,
                    url: autolinkMatch.url,
                  });

                  if (inserted) return true;
                }

                context.editor.tf.insertText(autolinkMatch.text);

                return true;
              },
            }
          : {
              type: 'insertText',
              trigger: ' ',
              resolve: (context) => {
                if (context.text !== ' ') return;

                return getAutolinkMatch(context.editor);
              },
              apply: (context, match) => {
                const autolinkMatch = match as LinkTextAutolinkMatch;

                if (!applyAutolinkMatch(context.editor, autolinkMatch)) return;

                moveSelectionAfterLink(context.editor);
                context.insertText(context.text, context.options);

                return true;
              },
            }
  ),
};
