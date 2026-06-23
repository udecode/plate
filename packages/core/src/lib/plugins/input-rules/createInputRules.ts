import type { Point } from '@platejs/plite';
import type { BasePlateEditor } from '../../editor';

import {
  deleteEditorText,
  getEditorPointBefore,
  getEditorPointEnd,
  getEditorRange,
  getEditorString,
  isEditorBlock,
  isEditorEnd,
  isEditorSelectionCollapsed,
} from '../../../internal/utils/runtimeEditorQueries';
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

const isPreviousCharacterEmpty = (editor: BasePlateEditor, at: Point) => {
  const range = getEditorRange(editor, 'before', at);

  if (!range) return true;

  const text = getEditorString(editor, range);

  return text ? !noWhiteSpaceRegex.exec(text) : true;
};

const selectEditor = (editor: BasePlateEditor, target: unknown) => {
  editor.update((tx) => {
    tx.selection.set(target as never);
  });
};

const collapseEditor = (
  editor: BasePlateEditor,
  options: { edge?: 'anchor' | 'end' | 'focus' | 'start' }
) => {
  editor.update((tx) => {
    tx.selection.collapse(options);
  });
};

const insertEditorText = (
  editor: BasePlateEditor,
  text: string,
  options?: { at?: unknown }
) => {
  editor.update((tx) => {
    tx.text.insert(text, options as never);
  });
};

const setEditorNodes = (
  editor: BasePlateEditor,
  props: Record<string, unknown>,
  options?: Record<string, unknown>
) => {
  editor.update((tx) => {
    tx.nodes.set(props as never, options as never);
  });
};

const toggleEditorBlock = (editor: BasePlateEditor, type: string) => {
  setEditorNodes(
    editor,
    { type },
    {
      match: (node: unknown) => isEditorBlock(editor, node),
    }
  );
};

const getMarkMatch = (
  editor: BasePlateEditor,
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
    beforeEndMatchPoint = getEditorPointBefore(editor, selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  const afterStartMatchPoint = getEditorPointBefore(
    editor,
    beforeEndMatchPoint,
    {
      afterMatch: true,
      matchString: start,
      skipInvalid: true,
    }
  );

  if (!afterStartMatchPoint) return;

  const beforeStartMatchPoint = getEditorPointBefore(
    editor,
    beforeEndMatchPoint,
    {
      matchString: start,
      skipInvalid: true,
    }
  );

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
        !isEditorSelectionCollapsed(editor)
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
      const matchText = getEditorString(editor, range);

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
        deleteEditorText(editor, {
          at: {
            anchor: match.beforeEndMatchPoint,
            focus: editor.selection!.anchor,
          },
        });
      }

      selectEditor(editor, {
        anchor: match.afterStartMatchPoint,
        focus: match.beforeEndMatchPoint,
      });

      marks.forEach((mark) => {
        const key = editor.getType(mark);

        editor.update((tx) => {
          tx.marks.add(key, true);
        });
      });

      collapseEditor(editor, { edge: 'end' });

      const markKeys = marks.map((mark) => editor.getType(mark));

      editor.update((tx) => {
        markKeys.forEach((key) => {
          tx.marks.remove(key);
        });
      });
      deleteEditorText(editor, {
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
        deleteEditorText(editor, { at: defaultMatch.range });
      }

      const node = editor.getType(config.node ?? pluginKey);

      if (config.mode === 'wrap') {
        editor.update((tx) => {
          tx.nodes.wrap({ children: [], type: node } as never, {
            match: (entryNode) => isEditorBlock(editor, entryNode),
          });
        });
        return true;
      }

      if (config.mode === 'toggle') {
        toggleEditorBlock(editor, node);
        return true;
      }

      setEditorNodes(
        editor,
        { type: node },
        {
          match: (entryNode: unknown) => isEditorBlock(editor, entryNode),
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
  const endPoint = getEditorPointEnd(editor, path);

  if (config.block && blockNode.type !== editor.getType(config.block)) return;
  if (!endPoint || !isEditorEnd(editor, selection.focus, path)) return;

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

  if (nextChar && followRe && nextChar && !followRe.test(nextChar)) return;

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
  editor: BasePlateEditor,
  { end, start }: { end: string; start: string }
): TextSubstitutionMatch['points'] | undefined => {
  const { selection } = editor;

  if (!selection) return;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = getEditorPointBefore(editor, selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint: Point | undefined;
  let beforeStartMatchPoint: Point | undefined;

  if (start) {
    afterStartMatchPoint = getEditorPointBefore(editor, beforeEndMatchPoint, {
      afterMatch: true,
      matchString: start,
      skipInvalid: true,
    });

    if (!afterStartMatchPoint) return;

    beforeStartMatchPoint = getEditorPointBefore(editor, beforeEndMatchPoint, {
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
  editor: BasePlateEditor;
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
  editor: BasePlateEditor,
  match: TextSubstitutionMatch | undefined
) => {
  const selection = editor.selection;

  if (!selection || !match) return false;

  if (match.end) {
    deleteEditorText(editor, {
      at: {
        anchor: match.points.beforeEndMatchPoint,
        focus: selection.anchor,
      },
    });
  }

  const formatEnd = Array.isArray(match.pattern.format)
    ? match.pattern.format[1]
    : match.pattern.format;

  insertEditorText(editor, formatEnd);

  if (match.points.beforeStartMatchPoint && match.points.afterStartMatchPoint) {
    const formatStart = Array.isArray(match.pattern.format)
      ? match.pattern.format[0]
      : match.pattern.format;

    deleteEditorText(editor, {
      at: {
        anchor: match.points.beforeStartMatchPoint,
        focus: match.points.afterStartMatchPoint,
      },
    });
    insertEditorText(editor, formatStart, {
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
      if (!editor.selection || !isEditorSelectionCollapsed(editor)) return;

      const candidates = patternsByTrigger.get(text);

      if (!candidates) return;

      return resolveTextSubstitution({ candidates, editor });
    },
    apply: ({ editor }, match: TextSubstitutionMatch) =>
      applyTextSubstitution(editor, match),
  });
};
