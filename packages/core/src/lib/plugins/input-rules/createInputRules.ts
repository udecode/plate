import { ElementApi, type Point } from '@platejs/plite';

import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
} from '../../../internal/plugin/compilePlateModel';
import { defineInputRule } from './defineInputRule';
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

const NON_WHITESPACE = /\S+/;

export const createMarkInputRule = (
  config: MarkInputRuleConfig
): ReturnType<InputRuleBuilder['mark']> =>
  defineInputRule({
    enabled: config.enabled,
    priority: config.priority,
    target: 'insertText',
    trigger: config.trigger,
    resolve: ({ editor, text }) => {
      const selection = editor.read.selection();

      if (
        text !== config.trigger ||
        !selection ||
        !editor.read.selection.isCollapsed()
      ) {
        return;
      }

      let beforeEndMatchPoint: Point | undefined = selection.anchor;

      if (config.end) {
        beforeEndMatchPoint = editor.read.points.before(selection, {
          matchString: config.end,
        });
      }

      if (!beforeEndMatchPoint) return;

      const afterStartMatchPoint = editor.read.points.before(
        beforeEndMatchPoint,
        {
          afterMatch: true,
          matchString: config.start,
          skipInvalid: true,
        }
      );
      const beforeStartMatchPoint = editor.read.points.before(
        beforeEndMatchPoint,
        {
          matchString: config.start,
          skipInvalid: true,
        }
      );

      if (!afterStartMatchPoint || !beforeStartMatchPoint) return;

      const pointBeforeStart = editor.read.points.before(beforeStartMatchPoint);
      const previousText = pointBeforeStart
        ? editor.read.text.string({
            anchor: pointBeforeStart,
            focus: beforeStartMatchPoint,
          })
        : '';

      if (previousText && NON_WHITESPACE.test(previousText)) return;

      const range = {
        anchor: afterStartMatchPoint,
        focus: beforeEndMatchPoint,
      };
      const matchText = editor.read.text.string(range);

      if (config.trim !== 'allow' && matchText.trim() !== matchText) return;

      return {
        afterStartMatchPoint,
        beforeEndMatchPoint,
        beforeStartMatchPoint,
        end: config.end,
      };
    },
    apply: ({ editor, plugin, tx }, match) => {
      const marks = config.marks ? [...config.marks] : [config.mark ?? plugin];
      const markKeys: string[] = [];

      for (const mark of marks) {
        const portal = editor.plugin(mark);

        if (!portal.installed) return;
        const resolved = getCompiledPlatePlugin(editor, portal.name);
        const binding = resolved
          ? getCompiledPlateModelBinding(editor, resolved)
          : undefined;

        if (binding?.kind !== 'mark' || !binding.propertyKey) return;
        markKeys.push(binding.propertyKey);
      }

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

      markKeys.forEach((key) => {
        tx.marks.add(key, config.value === undefined ? true : config.value);
      });

      tx.selection.collapse({ edge: 'end' });

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

      const { editor, plugin, tx } = context;
      const defaultMatch = match as BlockStartInputRuleMatch;
      const target = config.node ?? plugin;
      const portal = editor.plugin(target);

      if (!portal.installed) return;
      const type = portal.schema.type;

      if (config.removeMatchedText !== false) {
        tx.text.delete({ at: defaultMatch.range });
      }

      if (config.mode === 'wrap') {
        tx.blocks.toggle(type, {
          wrap: true,
        });
        return true;
      }

      if (config.mode === 'toggle') {
        tx.blocks.toggle(type);
        return true;
      }

      tx.nodes.set(
        { type },
        {
          match: (entryNode) =>
            ElementApi.isElement(entryNode) && tx.schema.isBlock(entryNode),
        }
      );

      return true;
    },
  });

const matchBlockFence = <
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

  if (config.block) {
    const plugin = editor.plugin(config.block);

    if (!plugin.installed) return;

    const blockType = plugin.schema.type;

    if (blockNode.type !== blockType) return;
  }
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

export const createTextSubstitutionInputRule = ({
  enabled,
  patterns,
  priority,
}: TextSubstitutionInputRuleConfig) => {
  const patternsByTrigger = new Map<
    string,
    Array<{
      end: string;
      pattern: TextSubstitutionPattern;
      start: string;
    }>
  >();

  for (const pattern of patterns) {
    const matches = Array.isArray(pattern.match)
      ? pattern.match
      : [pattern.match];
    const isPaired = Array.isArray(pattern.format);

    for (const match of matches) {
      const triggers = pattern.trigger
        ? Array.isArray(pattern.trigger)
          ? [...pattern.trigger]
          : [pattern.trigger]
        : [match.slice(-1)];
      const compiled = {
        end: isPaired ? '' : pattern.trigger ? match : match.slice(0, -1),
        pattern,
        start: isPaired ? match : '',
      };

      for (const trigger of triggers) {
        const list = patternsByTrigger.get(trigger);

        if (list) {
          list.push(compiled);
        } else {
          patternsByTrigger.set(trigger, [compiled]);
        }
      }
    }
  }

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

      for (const { end, pattern, start } of candidates) {
        const selection = editor.read.selection();

        if (!selection) return;

        let beforeEndMatchPoint: Point | undefined = selection.anchor;

        if (end) {
          beforeEndMatchPoint = editor.read.points.before(selection, {
            matchString: end,
          });

          if (!beforeEndMatchPoint) continue;
        }

        let afterStartMatchPoint: Point | undefined;
        let beforeStartMatchPoint: Point | undefined;

        if (start) {
          afterStartMatchPoint = editor.read.points.before(
            beforeEndMatchPoint,
            {
              afterMatch: true,
              matchString: start,
              skipInvalid: true,
            }
          );
          beforeStartMatchPoint = editor.read.points.before(
            beforeEndMatchPoint,
            {
              matchString: start,
              skipInvalid: true,
            }
          );

          if (!afterStartMatchPoint || !beforeStartMatchPoint) continue;

          const pointBeforeStart = editor.read.points.before(
            beforeStartMatchPoint
          );
          const previousText = pointBeforeStart
            ? editor.read.text.string({
                anchor: pointBeforeStart,
                focus: beforeStartMatchPoint,
              })
            : '';

          if (previousText && NON_WHITESPACE.test(previousText)) continue;
        }

        return {
          end,
          pattern,
          points: {
            afterStartMatchPoint,
            beforeEndMatchPoint,
            beforeStartMatchPoint,
          },
        };
      }
    },
    apply: ({ tx }, match: TextSubstitutionMatch) => {
      const selection = tx.selection();

      if (!selection) return false;

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

      if (
        match.points.beforeStartMatchPoint &&
        match.points.afterStartMatchPoint
      ) {
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
    },
  });
};
