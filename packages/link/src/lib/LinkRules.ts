import type { EditorStateView, Location, Range, Text } from '@platejs/plite';

import type { BasePlateEditor } from 'platejs';

import {
  createRuleFactory,
  ElementApi,
  KEYS,
  PathApi,
  RangeApi,
} from 'platejs';

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

export type MatchBeforeOptions = {
  afterMatch?: boolean;
  matchBlockStart?: boolean;
  matchString?: string[] | string;
  skipInvalid?: boolean;
};

type RuntimeReadableLinkEditor = BasePlateEditor & {
  read: <T>(fn: (state: EditorStateView) => T) => T;
};

const LINK_AUTOMD_REGEX = /\[([^\]\n]+)]\((\S+)$/;
const MARKDOWN_LINK_SOURCE_RE = /!?\[[^\]\n]*]\([^)\n]*$/;

const readEditor = <T>(
  editor: BasePlateEditor,
  fn: (state: EditorStateView) => T
) => (editor as RuntimeReadableLinkEditor).read(fn);

const isCollapsed = (editor: BasePlateEditor) =>
  !!editor.selection && RangeApi.isCollapsed(editor.selection);

const isType = (types: string[]) => (node: unknown) =>
  ElementApi.isElement(node) && types.includes(node.type);

const hasAncestorType = (editor: BasePlateEditor, types: string[]) =>
  !!editor.api.above({
    at: editor.selection ?? undefined,
    match: isType(types),
  });

const hasTypeInRange = (
  editor: BasePlateEditor,
  range: Range,
  types: string[]
) =>
  Array.from(
    editor.api.nodes({
      at: range,
      match: isType(types),
    })
  ).length > 0;

const getBlockStartRange = (
  editor: BasePlateEditor,
  location: Location
): Range | undefined => {
  const focus = RangeApi.isRange(location)
    ? RangeApi.start(location)
    : Array.isArray(location)
      ? editor.api.start(location)
      : location;

  if (!focus) return;

  const blockEntry = editor.api.block({ at: focus });
  const anchor = blockEntry
    ? editor.api.start(blockEntry[1])
    : editor.api.start([]);

  if (!anchor) return;

  return {
    anchor,
    focus,
  };
};

const getBeforeMatchRange = (
  editor: BasePlateEditor,
  location: Location,
  options?: MatchBeforeOptions
): Range | undefined => {
  const focus = RangeApi.isRange(location)
    ? RangeApi.start(location)
    : Array.isArray(location)
      ? editor.api.start(location)
      : location;

  if (!focus) return;

  const blockRange = getBlockStartRange(editor, location);

  if (!blockRange) return;

  const matchStrings = Array.isArray(options?.matchString)
    ? options.matchString
    : options?.matchString
      ? [options.matchString]
      : [];

  if (matchStrings.length === 0) return blockRange;

  const textBefore = editor.api.string(blockRange);
  let best: { index: number; text: string } | undefined;

  for (const matchText of matchStrings) {
    const index = textBefore.lastIndexOf(matchText);

    if (index >= 0 && (!best || index > best.index)) {
      best = { index, text: matchText };
    }
  }

  if (!best) {
    return options?.matchBlockStart ? blockRange : undefined;
  }

  return {
    anchor: {
      ...focus,
      offset: best.index + (options?.afterMatch ? best.text.length : 0),
    },
    focus,
  };
};

const shouldAutoLinkPasteByDefault = (
  editor: BasePlateEditor,
  { textBefore }: { textBefore: string }
) => {
  if (hasAncestorType(editor, [editor.getType(KEYS.codeBlock)])) {
    return false;
  }

  if (!isCollapsed(editor)) return true;

  return !MARKDOWN_LINK_SOURCE_RE.test(textBefore);
};

const getLinkAutomdMatch = (
  editor: BasePlateEditor
): LinkAutomdMatch | undefined => {
  const { selection } = editor;

  if (!selection || !isCollapsed(editor)) return;
  if (
    hasAncestorType(editor, [
      editor.getType(KEYS.codeBlock),
      editor.getType(KEYS.link),
    ])
  ) {
    return;
  }

  const blockRange = getBlockStartRange(editor, selection);

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
  editor: BasePlateEditor
): LinkTextAutolinkMatch | undefined => {
  const { getUrlHref, isUrl, rangeBeforeOptions } =
    editor.getOptions(BaseLinkPlugin);
  const { selection } = editor;

  if (!selection || !isCollapsed(editor)) return;

  let beforeWordRange = getBeforeMatchRange(
    editor,
    selection,
    rangeBeforeOptions
  );

  if (!beforeWordRange) {
    beforeWordRange = getBlockStartRange(editor, selection);
  }
  if (!beforeWordRange) return;

  const hasLink = hasTypeInRange(editor, beforeWordRange, [
    editor.getType(KEYS.link),
  ]);

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
  editor: BasePlateEditor,
  match: LinkTextAutolinkMatch
) => {
  editor.update((tx) => {
    tx.selection.set(match.range);
  });

  const inserted = upsertLink(editor, {
    url: match.url,
  });

  if (!inserted) return false;

  editor.update((tx) => {
    tx.selection.collapse({ edge: 'end' });
  });

  return true;
};

const moveSelectionAfterLink = (editor: BasePlateEditor) => {
  const { selection } = editor;

  if (!selection || !isCollapsed(editor)) return;

  const linkEntry = editor.api.above({
    match: isType([editor.getType(KEYS.link)]),
  });

  if (!linkEntry) return;

  const [, linkPath] = linkEntry;

  if (
    !readEditor(editor, (state) =>
      state.points.isEnd(selection.focus, linkPath)
    )
  ) {
    return;
  }

  const nextPath = PathApi.next(linkPath);
  const nextPoint = readEditor(editor, (state) =>
    state.nodes.hasPath(nextPath) ? state.points.start(nextPath) : undefined
  );

  if (nextPoint) {
    editor.update((tx) => {
      tx.selection.set({ anchor: nextPoint, focus: nextPoint });
    });

    return;
  }

  editor.update((tx) => {
    tx.nodes.insert({ text: '' } as Text, { at: nextPath });
    const nextPoint = { offset: 0, path: nextPath };

    tx.selection.set({ anchor: nextPoint, focus: nextPoint });
  });
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
            apply: ({ editor, insertBreak }, match) => {
              const autolinkMatch = match as LinkTextAutolinkMatch;

              if (!applyAutolinkMatch(editor, autolinkMatch)) return;

              moveSelectionAfterLink(editor);
              insertBreak();

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

                context.editor.update((tx) => {
                  tx.text.insert(autolinkMatch.text);
                });

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
