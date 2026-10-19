import { type Point, RangeApi } from '../../../facade';
import { defineInputRule } from './defineInputRule';
import type {
  InsertTextInputRule,
  InsertTextInputRuleReadContext,
  MarkInputRuleConfig,
  MarkInputRuleMatch,
} from './types';

export const NON_WHITESPACE = /\S+/;

export type IntraWordMarkAcceptor = (options: {
  content: string;
  context: InsertTextInputRuleReadContext;
  previousChar: string;
  start: Point;
}) => boolean;

export const resolveMarkSpan = (
  context: InsertTextInputRuleReadContext,
  config: Pick<MarkInputRuleConfig, 'end' | 'start' | 'trim'>,
  acceptIntraWord?: IntraWordMarkAcceptor
): MarkInputRuleMatch | undefined => {
  const { editor } = context;
  const selection = editor.read.selection();

  if (!selection || !editor.read.selection.isCollapsed()) return undefined;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (config.end) {
    beforeEndMatchPoint = editor.read.points.before(selection, {
      matchString: config.end,
    });
  }

  if (!beforeEndMatchPoint) return undefined;

  const afterStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
    afterMatch: true,
    matchString: config.start,
    skipInvalid: true,
  });
  const beforeStartMatchPoint = editor.read.points.before(beforeEndMatchPoint, {
    matchString: config.start,
    skipInvalid: true,
  });

  if (!afterStartMatchPoint || !beforeStartMatchPoint) return undefined;

  const pointBeforeStart = editor.read.points.before(beforeStartMatchPoint);
  const previousText = pointBeforeStart
    ? editor.read.text.string({
        anchor: pointBeforeStart,
        focus: beforeStartMatchPoint,
      })
    : '';
  const isIntraWord = NON_WHITESPACE.test(previousText);

  if (isIntraWord && !acceptIntraWord) return undefined;

  const matchText = editor.read.text.string({
    anchor: afterStartMatchPoint,
    focus: beforeEndMatchPoint,
  });

  if (
    isIntraWord &&
    !acceptIntraWord?.({
      content: matchText,
      context,
      previousChar: previousText,
      start: beforeStartMatchPoint,
    })
  ) {
    return undefined;
  }

  if (config.trim !== 'allow' && matchText.trim() !== matchText) {
    return undefined;
  }

  return {
    afterStartMatchPoint,
    beforeEndMatchPoint,
    beforeStartMatchPoint,
    end: config.end,
  };
};

export const createMarkSpanInputRule = (
  config: MarkInputRuleConfig,
  acceptIntraWord?: IntraWordMarkAcceptor
): InsertTextInputRule<MarkInputRuleMatch> =>
  defineInputRule({
    enabled: config.enabled,
    priority: config.priority,
    target: 'insertText',
    trigger: config.trigger,
    resolve: (context) =>
      context.text === config.trigger
        ? resolveMarkSpan(context, config, acceptIntraWord)
        : undefined,
    apply: ({ editor, plugin, tx }, match) => {
      const marks = config.marks ? [...config.marks] : [config.mark ?? plugin];
      const markKeys: string[] = [];

      for (const mark of marks) {
        const portal = editor.plugin(mark);
        if (!portal.installed) return undefined;
        const { schema } = portal;

        if (!('key' in schema)) return undefined;
        markKeys.push(schema.key);
      }

      const selection = tx.selection();

      if (selection) {
        const end = {
          anchor: match.beforeEndMatchPoint,
          focus: selection.anchor,
        };

        if (!RangeApi.isCollapsed(end)) tx.text.delete({ at: end });
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
      return undefined;
    },
  });
