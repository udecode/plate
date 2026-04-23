import type { Point } from '@platejs/slate';
import type { SlateEditor } from '../../editor';

import type {
  BlockFenceInputRuleConfig,
  BlockFenceInputRuleMatch,
  BlockStartInputRuleConfig,
  BlockStartInputRuleMatch,
  DelimitedInlineInputRuleMatch,
  InputRuleBuilder,
  MarkInputRuleConfig,
  MatchBlockFenceOptions,
  MatchBlockStartOptions,
  MatchDelimitedInlineOptions,
  SelectionInputRuleContext,
  TextSubstitutionInputRuleConfig,
  TextSubstitutionMatch,
  TextSubstitutionPattern,
} from './types';

import { defineInputRule } from './defineInputRule';

const noWhiteSpaceRegex = /\S+/;

const isPreviousCharacterEmpty = (editor: SlateEditor, at: Point) => {
  const range = editor.api.range('before', at);

  if (!range) return true;

  const text = editor.api.string(range);

  return text ? !noWhiteSpaceRegex.exec(text) : true;
};

const getMarkMatch = (
  editor: SlateEditor,
  {
    end = '',
    start,
  }: {
    end?: string;
    start: string;
  }
):
  | {
      afterStartMatchPoint: Point;
      beforeEndMatchPoint: Point;
      beforeStartMatchPoint: Point;
    }
  | undefined => {
  const { selection } = editor;

  if (!selection) return;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = editor.api.before(selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  const afterStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
    afterMatch: true,
    matchString: start,
    skipInvalid: true,
  });

  if (!afterStartMatchPoint) return;

  const beforeStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
    matchString: start,
    skipInvalid: true,
  });

  if (!beforeStartMatchPoint) return;
  if (!isPreviousCharacterEmpty(editor, beforeStartMatchPoint)) return;

  return {
    afterStartMatchPoint,
    beforeEndMatchPoint: beforeEndMatchPoint!,
    beforeStartMatchPoint,
  };
};

export const createMarkInputRule = (
  config: MarkInputRuleConfig
): ReturnType<InputRuleBuilder['mark']> =>
  defineInputRule({
    enabled: config.enabled,
    priority: config.priority,
    target: 'insertText',
    trigger: config.trigger,
    resolve: ({ editor, text }) => {
      if (
        text !== config.trigger ||
        !editor.selection ||
        !editor.api.isCollapsed()
      ) {
        return;
      }

      const match = getMarkMatch(editor, {
        end: config.end,
        start: config.start,
      });

      if (!match) return;

      const range = {
        anchor: match.afterStartMatchPoint,
        focus: match.beforeEndMatchPoint,
      };
      const matchText = editor.api.string(range);

      if (config.trim !== 'allow' && matchText.trim() !== matchText) return;

      return {
        ...match,
        end: config.end,
      };
    },
    apply: ({ editor, pluginKey }, match) => {
      const marks = config.marks
        ? [...config.marks]
        : [config.mark ?? pluginKey];

      if (match.beforeEndMatchPoint !== editor.selection?.anchor) {
        editor.tf.delete({
          at: {
            anchor: match.beforeEndMatchPoint,
            focus: editor.selection!.anchor,
          },
        });
      }

      editor.tf.select({
        anchor: match.afterStartMatchPoint,
        focus: match.beforeEndMatchPoint,
      });

      marks.forEach((mark) => {
        editor.tf.addMark(editor.getType(mark), true);
      });

      editor.tf.collapse({ edge: 'end' });
      editor.tf.removeMarks(
        marks.map((mark) => editor.getType(mark)),
        {
          shouldChange: false,
        }
      );
      editor.tf.delete({
        at: {
          anchor: match.beforeStartMatchPoint,
          focus: match.afterStartMatchPoint,
        },
      });

      return true;
    },
  });

export const matchBlockStart = <
  TMatch extends object = {},
  TContext extends SelectionInputRuleContext = SelectionInputRuleContext,
>(
  context: TContext,
  config: MatchBlockStartOptions<TMatch, TContext>
) => {
  if (!context.isCollapsed) return;

  const pattern =
    typeof config.match === 'function' ? config.match(context) : config.match;

  if (!pattern) return;

  const range = context.getBlockStartRange();
  const blockText = context.getBlockStartText();

  if (!range || blockText === undefined) return;

  const baseMatch: BlockStartInputRuleMatch = {
    range,
    text: blockText,
  };

  if (typeof pattern === 'string') {
    if (blockText !== pattern) return;

    if (config.resolveMatch) {
      const resolved = config.resolveMatch({
        match: pattern,
        range,
        text: blockText,
      });

      if (resolved === undefined) return;

      return {
        ...baseMatch,
        ...resolved,
      } as BlockStartInputRuleMatch & TMatch;
    }

    return baseMatch as BlockStartInputRuleMatch & TMatch;
  }

  const regexMatch = blockText.match(pattern);

  if (!regexMatch) return;

  if (config.resolveMatch) {
    const resolved = config.resolveMatch({
      match: regexMatch,
      range,
      text: blockText,
    });

    if (resolved === undefined) return;

    return {
      ...baseMatch,
      ...resolved,
    } as BlockStartInputRuleMatch & TMatch;
  }

  return baseMatch as BlockStartInputRuleMatch & TMatch;
};

export const createBlockStartInputRule = <TMatch extends object = {}>(
  config: BlockStartInputRuleConfig<TMatch>
) =>
  defineInputRule({
    enabled: config.enabled,
    priority: config.priority,
    target: 'insertText',
    trigger: config.trigger,
    resolve: (context) => matchBlockStart(context, config),
    apply: (context, match) => {
      if (config.apply) return config.apply(context, match);

      const { editor, pluginKey } = context;
      const defaultMatch = match as BlockStartInputRuleMatch;

      if (config.removeMatchedText !== false) {
        editor.tf.delete({ at: defaultMatch.range });
      }

      const node = editor.getType(config.node ?? pluginKey);

      if (config.mode === 'wrap') {
        editor.tf.toggleBlock(node, { wrap: true });
        return true;
      }

      if (config.mode === 'toggle') {
        editor.tf.toggleBlock(node);
        return true;
      }

      editor.tf.setNodes(
        { type: node },
        {
          match: (entryNode) => editor.api.isBlock(entryNode),
        }
      );

      return true;
    },
  });

export const matchBlockFence = <
  TMatch = BlockFenceInputRuleMatch,
  TContext extends SelectionInputRuleContext = SelectionInputRuleContext,
>(
  context: TContext,
  config: MatchBlockFenceOptions<TMatch>
) => {
  const { editor } = context;
  const { selection } = editor;

  if (!context.isCollapsed || !selection) return;

  const blockEntry = context.getBlockEntry();

  if (!blockEntry) return;

  const [blockNode, path] = blockEntry;
  const endPoint = editor.api.end(path);

  if (config.block && blockNode.type !== editor.getType(config.block)) return;
  if (!endPoint || !editor.api.isEnd(selection.focus, path)) return;

  const range = context.getBlockStartRange();
  const blockText = context.getBlockStartText();

  if (!range || blockText === undefined || blockText !== config.fence) return;

  return config.resolveMatch
    ? config.resolveMatch({
        fence: config.fence,
        path,
        range,
        text: blockText,
      })
    : ({ path, range, text: blockText } as TMatch);
};

export function createBlockFenceInputRule<TMatch = BlockFenceInputRuleMatch>(
  config: BlockFenceInputRuleConfig<TMatch>
) {
  if (config.on === 'break') {
    return defineInputRule({
      priority: config.priority,
      target: 'insertBreak',
      enabled: config.enabled,
      resolve: (context) =>
        matchBlockFence(context, {
          block: config.block,
          fence: config.fence,
          resolveMatch: config.resolveMatch,
        }),
      apply: config.apply,
    });
  }

  const trigger = config.fence.at(-1);

  if (!trigger) {
    throw new Error('createBlockFenceInputRule requires a non-empty fence.');
  }

  return defineInputRule({
    priority: config.priority,
    target: 'insertText',
    enabled: config.enabled,
    trigger,
    resolve: (context) => {
      if (context.text !== trigger) return;

      return matchBlockFence(context, {
        block: config.block,
        fence: config.fence.slice(0, -trigger.length),
        resolveMatch: config.resolveMatch,
      });
    },
    apply: config.apply,
  });
}

export const matchDelimitedInline = (
  context: SelectionInputRuleContext,
  {
    boundaryRe,
    close,
    followRe,
    open,
    requireClosingDelimiter = true,
    rejectRepeatedOpen = true,
    trim = 'reject',
  }: MatchDelimitedInlineOptions
): DelimitedInlineInputRuleMatch | undefined => {
  const { editor } = context;
  const { selection } = editor;

  if (!selection || !context.isCollapsed) return;

  const blockRange = context.getBlockStartRange();

  if (!blockRange) return;

  const openingDelimiter = open;
  const closingDelimiter = close ?? open;
  const textBefore = editor.api.string(blockRange);
  const beforeClose = requireClosingDelimiter
    ? (() => {
        const closeLength = closingDelimiter.length;

        if (textBefore.length < closeLength) return;
        if (!textBefore.endsWith(closingDelimiter)) return;

        return textBefore.slice(0, -closeLength);
      })()
    : textBefore;

  if (!beforeClose) return;

  const openIndex = beforeClose.lastIndexOf(openingDelimiter);

  if (openIndex < 0) return;

  const prefix = beforeClose.slice(0, openIndex);
  const content = beforeClose.slice(openIndex + openingDelimiter.length);

  if (!content) return;
  if (trim === 'reject' && content.trim() !== content) return;
  if (
    rejectRepeatedOpen &&
    openingDelimiter === closingDelimiter &&
    prefix.endsWith(openingDelimiter)
  ) {
    return;
  }

  const previousChar = prefix.at(-1);

  if (previousChar && boundaryRe && !boundaryRe.test(previousChar)) return;

  const nextPoint = editor.api.after(selection, {
    distance: 1,
    unit: 'character',
  });

  if (nextPoint && followRe) {
    const nextChar = editor.api.string({
      anchor: selection.anchor,
      focus: nextPoint,
    });

    if (nextChar && !followRe.test(nextChar)) return;
  }

  const startPoint = editor.api.before(selection, {
    distance: content.length + openingDelimiter.length,
    unit: 'character',
  });

  if (!startPoint) return;

  return {
    content,
    deleteRange: {
      anchor: startPoint,
      focus: selection.anchor,
    },
  };
};

const getTextSubstitutionMatchRange = ({
  match,
  trigger,
}: {
  match: string;
  trigger?: readonly string[] | string;
}) => {
  const start = match;
  const reversed = start.split('').reverse().join('');
  const triggers = trigger
    ? Array.isArray(trigger)
      ? [...trigger]
      : [trigger]
    : [reversed.slice(-1)];

  return {
    end: trigger ? reversed : reversed.slice(0, -1),
    start,
    triggers,
  };
};

const getTextSubstitutionMatchPoints = (
  editor: SlateEditor,
  { end, start }: { end: string; start: string }
): TextSubstitutionMatch['points'] | undefined => {
  const { selection } = editor;

  if (!selection) return;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = editor.api.before(selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint: Point | undefined;
  let beforeStartMatchPoint: Point | undefined;

  if (start) {
    afterStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
      afterMatch: true,
      matchString: start,
      skipInvalid: true,
    });

    if (!afterStartMatchPoint) return;

    beforeStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
      matchString: start,
      skipInvalid: true,
    });

    if (!beforeStartMatchPoint) return;
    if (!isPreviousCharacterEmpty(editor, beforeStartMatchPoint)) return;
  }

  return {
    afterStartMatchPoint,
    beforeEndMatchPoint: beforeEndMatchPoint!,
    beforeStartMatchPoint,
  };
};

const getTextSubstitutionTriggers = (patterns: TextSubstitutionPattern[]) =>
  Array.from(
    new Set(
      patterns.flatMap((pattern) => {
        const matches = Array.isArray(pattern.match)
          ? [...pattern.match]
          : [pattern.match];

        return matches.flatMap(
          (match) =>
            getTextSubstitutionMatchRange({
              match,
              trigger: pattern.trigger,
            }).triggers
        );
      })
    )
  );

const resolveTextSubstitution = ({
  editor,
  patterns,
  text,
}: {
  editor: SlateEditor;
  patterns: TextSubstitutionPattern[];
  text: string;
}): TextSubstitutionMatch | undefined => {
  for (const pattern of patterns) {
    const matches = Array.isArray(pattern.match)
      ? [...pattern.match]
      : [pattern.match];

    for (const match of matches) {
      const { end, start, triggers } = getTextSubstitutionMatchRange({
        match,
        trigger: pattern.trigger,
      });

      if (!triggers.includes(text)) continue;

      const points = getTextSubstitutionMatchPoints(editor, {
        end: Array.isArray(pattern.format) ? '' : end,
        start,
      });

      if (!points) continue;

      return {
        end: Array.isArray(pattern.format) ? '' : end,
        pattern,
        points,
      };
    }
  }
};

const applyTextSubstitution = (
  editor: SlateEditor,
  match: TextSubstitutionMatch | undefined
) => {
  const selection = editor.selection;

  if (!selection || !match) return false;

  if (match.end) {
    editor.tf.delete({
      at: {
        anchor: match.points.beforeEndMatchPoint,
        focus: selection.anchor,
      },
    });
  }

  const formatEnd = Array.isArray(match.pattern.format)
    ? match.pattern.format[1]
    : match.pattern.format;

  editor.tf.insertText(formatEnd);

  if (match.points.beforeStartMatchPoint && match.points.afterStartMatchPoint) {
    const formatStart = Array.isArray(match.pattern.format)
      ? match.pattern.format[0]
      : match.pattern.format;

    editor.tf.delete({
      at: {
        anchor: match.points.beforeStartMatchPoint,
        focus: match.points.afterStartMatchPoint,
      },
    });
    editor.tf.insertText(formatStart, {
      at: match.points.beforeStartMatchPoint,
    });
  }

  return true;
};

export const createTextSubstitutionInputRule = ({
  enabled,
  patterns,
  priority,
}: TextSubstitutionInputRuleConfig) =>
  defineInputRule({
    enabled,
    priority,
    target: 'insertText',
    trigger: getTextSubstitutionTriggers(patterns),
    resolve: ({ editor, text }) => {
      if (!editor.selection || !editor.api.isCollapsed()) return;

      return resolveTextSubstitution({
        editor,
        patterns,
        text,
      });
    },
    apply: ({ editor }, match: TextSubstitutionMatch) =>
      applyTextSubstitution(editor, match),
  });
