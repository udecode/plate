import type { Point } from '../../../facade';
import type {
  InsertTextInputRuleReadContext,
  MarkInputRuleConfig,
  MarkInputRuleMatch,
} from './types';

export const NON_WHITESPACE = /\S+/;

export type MarkSpanAcceptor = (span: {
  content: string;
  context: InsertTextInputRuleReadContext;
  previousChar: string;
  start: Point;
}) => boolean;

export const resolveMarkSpan = (
  context: InsertTextInputRuleReadContext,
  config: Pick<MarkInputRuleConfig, 'end' | 'start' | 'trim'>,
  acceptSpan?: MarkSpanAcceptor
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
  const matchText = editor.read.text.string({
    anchor: afterStartMatchPoint,
    focus: beforeEndMatchPoint,
  });

  if (
    acceptSpan
      ? !acceptSpan({
          content: matchText,
          context,
          previousChar: previousText,
          start: beforeStartMatchPoint,
        })
      : NON_WHITESPACE.test(previousText)
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
