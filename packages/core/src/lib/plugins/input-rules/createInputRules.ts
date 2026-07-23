import { ElementApi, type Point } from '@platejs/plite';
import type { BaseEditor } from '../../editor';

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
  InsertTextInputRuleContext,
  SelectionInputRuleContext,
  TextSubstitutionInputRuleConfig,
  TextSubstitutionMatch,
  TextSubstitutionPattern,
} from './types';

import { defineInputRule } from './defineInputRule';

const noWhiteSpaceRegex = /\S+/;

const isPreviousCharacterEmpty = (editor: BaseEditor, at: Point) => {
  const before = editor.read.points.before(at);

  if (!before) return true;

  const text = editor.read.text.string({ anchor: before, focus: at });

  return text ? !noWhiteSpaceRegex.exec(text) : true;
};

const getMarkMatch = (
  editor: BaseEditor,
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
  const selection = editor.read.selection();

  if (!selection) return;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = editor.read.points.before(selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  const afterStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
    afterMatch: true,
    matchString: start,
    skipInvalid: true,
  });

  if (!afterStartMatchPoint) return;

  const beforeStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
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
        !editor.read.selection() ||
        !editor.read.selection.isCollapsed()
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
      const matchText = editor.read.text.string(range);

      if (config.trim !== 'allow' && matchText.trim() !== matchText) return;

      return {
        ...match,
        end: config.end,
      };
    },
    apply: ({ editor, pluginKey, tx }, match) => {
      const marks = config.marks
        ? [...config.marks]
        : [config.mark ?? pluginKey];

      const selection = tx.selection();

      if (selection && match.beforeEndMatchPoint !== selection.anchor) {
        tx.text.delete({
          at: {
            anchor: match.beforeEndMatchPoint,
            focus: selection.anchor,
          },
        });
      }

      tx.selection.set({
        anchor: match.afterStartMatchPoint,
        focus: match.beforeEndMatchPoint,
      });

      marks.forEach((mark) => {
        const key = editor.getType(mark);

        tx.marks.add(key, true);
      });

      tx.selection.collapse({ edge: 'end' });

      const markKeys = marks.map((mark) => editor.getType(mark));

      markKeys.forEach((key) => {
        tx.marks.remove(key);
      });
      tx.text.delete({
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

      const { editor, pluginKey, tx } = context;
      const defaultMatch = match as BlockStartInputRuleMatch;

      if (config.removeMatchedText !== false) {
        tx.text.delete({ at: defaultMatch.range });
      }

      const node = editor.getType(config.node ?? pluginKey);

      if (config.mode === 'wrap') {
        tx.blocks.toggle(node, {
          wrap: true,
        });
        return true;
      }

      if (config.mode === 'toggle') {
        tx.blocks.toggle(node);
        return true;
      }

      tx.nodes.set(
        { type: node },
        {
          match: (entryNode) =>
            ElementApi.isElement(entryNode) && tx.schema.isBlock(entryNode),
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
  const selection = editor.read.selection();

  if (!context.isCollapsed || !selection) return;

  const blockEntry = context.getBlockEntry();

  if (!blockEntry) return;

  const [blockNode, path] = blockEntry;
  const endPoint = editor.read.points.end(path);

  if (config.block && blockNode.type !== editor.getType(config.block)) return;
  if (!endPoint || !editor.read.points.isEnd(selection.focus, path)) return;

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
  if (!context.isCollapsed) return;

  const blockRange = context.getBlockStartRange();
  const textBefore = context.getBlockStartText();

  if (!blockRange || textBefore === undefined) return;

  const openingDelimiter = open;
  const closingDelimiter = close ?? open;
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

  const nextChar = context.getCharAfter();

  if (nextChar && followRe && !followRe.test(nextChar)) return;

  const startPoint = {
    offset: blockRange.focus.offset - content.length - openingDelimiter.length,
    path: blockRange.focus.path,
  };

  if (startPoint.offset < 0) return;

  return {
    content,
    deleteRange: {
      anchor: startPoint,
      focus: blockRange.focus,
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
  const triggers = trigger
    ? Array.isArray(trigger)
      ? [...trigger]
      : [trigger]
    : [match.slice(-1)];

  return {
    end: trigger ? match : match.slice(0, -1),
    start: match,
    triggers,
  };
};

const getTextSubstitutionMatchPoints = (
  editor: BaseEditor,
  { end, start }: { end: string; start: string }
): TextSubstitutionMatch['points'] | undefined => {
  const selection = editor.read.selection();

  if (!selection) return;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = editor.read.points.before(selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint: Point | undefined;
  let beforeStartMatchPoint: Point | undefined;

  if (start) {
    afterStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
      afterMatch: true,
      matchString: start,
      skipInvalid: true,
    });

    if (!afterStartMatchPoint) return;

    beforeStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
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

type CompiledPattern = {
  end: string;
  pattern: TextSubstitutionPattern;
  start: string;
};

const compilePatternsByTrigger = (
  patterns: TextSubstitutionPattern[]
): Map<string, CompiledPattern[]> => {
  const byTrigger = new Map<string, CompiledPattern[]>();

  for (const pattern of patterns) {
    const matches = Array.isArray(pattern.match)
      ? pattern.match
      : [pattern.match];
    const isPaired = Array.isArray(pattern.format);

    for (const match of matches) {
      const { end, start, triggers } = getTextSubstitutionMatchRange({
        match,
        trigger: pattern.trigger,
      });

      const compiled: CompiledPattern = {
        end: isPaired ? '' : end,
        pattern,
        start: isPaired ? start : '',
      };

      for (const trigger of triggers) {
        let list = byTrigger.get(trigger);

        if (!list) {
          list = [];
          byTrigger.set(trigger, list);
        }

        list.push(compiled);
      }
    }
  }

  return byTrigger;
};

const resolveTextSubstitution = ({
  candidates,
  editor,
}: {
  candidates: CompiledPattern[];
  editor: BaseEditor;
}): TextSubstitutionMatch | undefined => {
  for (const { end, pattern, start } of candidates) {
    const points = getTextSubstitutionMatchPoints(editor, { end, start });

    if (!points) continue;

    return {
      end,
      pattern,
      points,
    };
  }
};

const applyTextSubstitution = (
  tx: InsertTextInputRuleContext['tx'],
  match: TextSubstitutionMatch | undefined
) => {
  const selection = tx.selection();

  if (!selection || !match) return false;

  if (match.end) {
    tx.text.delete({
      at: {
        anchor: match.points.beforeEndMatchPoint,
        focus: selection.anchor,
      },
    });
  }

  const formatEnd = Array.isArray(match.pattern.format)
    ? match.pattern.format[1]
    : match.pattern.format;

  tx.text.insert(formatEnd);

  if (match.points.beforeStartMatchPoint && match.points.afterStartMatchPoint) {
    const formatStart = Array.isArray(match.pattern.format)
      ? match.pattern.format[0]
      : match.pattern.format;

    tx.text.delete({
      at: {
        anchor: match.points.beforeStartMatchPoint,
        focus: match.points.afterStartMatchPoint,
      },
    });
    tx.text.insert(formatStart, {
      at: match.points.beforeStartMatchPoint,
    });
  }

  return true;
};

export const createTextSubstitutionInputRule = ({
  enabled,
  patterns,
  priority,
}: TextSubstitutionInputRuleConfig) => {
  const patternsByTrigger = compilePatternsByTrigger(patterns);
  const triggers = Array.from(patternsByTrigger.keys());

  return defineInputRule({
    enabled,
    priority,
    target: 'insertText',
    trigger: triggers,
    resolve: ({ editor, text }) => {
      if (!editor.read.selection() || !editor.read.selection.isCollapsed()) {
        return;
      }

      const candidates = patternsByTrigger.get(text);

      if (!candidates) return;

      return resolveTextSubstitution({ candidates, editor });
    },
    apply: ({ tx }, match: TextSubstitutionMatch) =>
      applyTextSubstitution(tx, match),
  });
};
