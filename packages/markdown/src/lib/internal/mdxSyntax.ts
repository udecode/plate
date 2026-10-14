import type {} from 'micromark-extension-mdx-jsx';
import type {
  Construct,
  Effects,
  Event,
  ParseContext,
  Point,
  TokenizeContext,
} from 'micromark-util-types';
import type { Options as MdxOptions } from 'micromark-extension-mdxjs';

import { Parser } from 'acorn';
import acornJsx from 'acorn-jsx';
import { parse } from 'micromark';
import { autolink } from 'micromark-core-commonmark';
import { mdxjs } from 'micromark-extension-mdxjs';
import { eventsToAcorn } from 'micromark-util-events-to-acorn';
import type { MdxSource, MdxView } from './mdxContext';

type SourcePoint = Omit<Point, '_index' | '_bufferIndex'>;
type ProbeResult =
  | {
      ok: true;
      context: TokenizeContext;
      start?: number;
    }
  | { ok: false; context: TokenizeContext; error?: unknown };
type Classification = { kind: 'ordinary' } | { kind: 'autolink' | 'jsx' };
class ProbeComplete {
  readonly result: ProbeResult;
  constructor(result: ProbeResult) {
    this.result = result;
  }
}
function hasDiagnostic(
  error: unknown
): error is { source: string; ruleId: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'source' in error &&
    typeof error.source === 'string' &&
    'ruleId' in error &&
    typeof error.ruleId === 'string'
  );
}
export const nativeAutolink = { ...autolink, name: 'plateAutolink' };
export function createMdxDocument(
  input: MdxSource,
  options?: MdxOptions | null,
  actualView?: (context: TokenizeContext) => MdxView | undefined
) {
  const settings = {
    acorn: Parser.extend(acornJsx()),
    acornOptions: { ecmaVersion: 2024, sourceType: 'module' },
    addResult: true,
    ...options,
  } satisfies MdxOptions;
  settings.acornOptions = {
    ecmaVersion: 2024,
    sourceType: 'module',
    ...settings.acornOptions,
    locations: true,
    onToken: undefined,
    onComment: undefined,
    onTrailingComma: undefined,
    onInsertedSemicolon: undefined,
  };
  const syntax = mdxjs(settings);
  const jsx = Object.values(syntax.text ?? {})
    .flat()
    .find((construct) => construct?.name === 'mdxJsxTextTag');
  if (!jsx) throw new Error('MDX JSX text syntax is missing');
  const { source, entries } = input;
  const lastBrace = source.lastIndexOf('}');
  const lastCommentClose = source.lastIndexOf('*/');
  function expressionPrefix(context: TokenizeContext) {
    const events = context.events;
    const index = events.findLastIndex(
      (event) =>
        event[0] === 'enter' &&
        (event[1].type === 'mdxJsxTextTagExpressionAttribute' ||
          event[1].type === 'mdxJsxTextTagAttributeValueExpression')
    );
    if (
      index < 0 ||
      events.some(
        (event) => event[0] === 'exit' && event[1] === events[index][1]
      )
    )
      return;
    const end = context.now();
    const spread = events[index][1].type === 'mdxJsxTextTagExpressionAttribute';
    const valueType = spread
      ? 'mdxJsxTextTagExpressionAttributeValue'
      : 'mdxJsxTextTagAttributeValueExpressionValue';
    const parts = events
      .slice(index)
      .filter(
        (event) => event[1].type === valueType || event[1].type === 'lineEnding'
      )
      .map(
        (event): Event =>
          event[1].end ? event : [event[0], { ...event[1], end }, event[2]]
      );

    const acorn = settings.acorn;
    if (!acorn) return;
    try {
      return {
        open: events[index][1],
        ...eventsToAcorn(parts, {
          ...settings,
          acorn,
          expression: true,
          allowEmpty: !spread,
          prefix: spread ? '({' : '',
          suffix: spread ? '})' : '',
          tokenTypes: [valueType],
          start: events[index][1].start,
        }),
      };
    } catch {
      return;
    }
  }
  function irreversibleExpression(
    expression: ReturnType<typeof expressionPrefix>
  ) {
    return Boolean(
      expression?.error &&
        (!expression.swallow ||
          (expression.error.message === 'Unterminated comment' &&
            lastCommentClose < expression.error.pos))
    );
  }
  function rejectedExpression(
    expression: ReturnType<typeof expressionPrefix>,
    end: number
  ) {
    return Boolean(
      expression && (lastBrace < end || irreversibleExpression(expression))
    );
  }
  function wrapper(original: Construct, checkPrefix = false): Construct {
    return {
      ...original,
      tokenize(effects) {
        const context = this;
        let next = 128;
        const start = context.now().offset;
        const callbacks: Effects = {
          ...effects,
          consume(code) {
            effects.consume(code);
            if (
              checkPrefix &&
              !options?.acorn &&
              code === 62 &&
              context.now().offset - start >= next
            ) {
              next = (context.now().offset - start) * 2;
              const prefix = expressionPrefix(context);
              if (prefix?.error && !prefix.swallow)
                throw new ProbeComplete({ ok: false, context });
            }
          },
        };
        return original.tokenize.call(
          context,
          callbacks,
          () => {
            throw new ProbeComplete({ ok: true, context, start });
          },
          () => {
            throw new ProbeComplete({ ok: false, context });
          }
        );
      },
    };
  }
  const autoParser = parse({
    extensions: [{ text: { 60: wrapper(nativeAutolink) } }],
  });
  const jsxParser = parse({
    extensions: [{ text: { 60: wrapper(jsx, true) } }],
  });
  let commentEnds: number[] | undefined;
  let lineBreaks: number[] = [];
  const commentChains = new Map<number, number>();
  const upperBound = (values: number[], value: number) => {
    let lo = 0,
      hi = values.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (values[mid] <= value) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  function commentGap(expression: ReturnType<typeof expressionPrefix>) {
    if (options?.acorn || expression?.error?.message !== 'Unterminated comment')
      return;
    if (!commentEnds) {
      commentEnds = [];
      for (
        let index = source.indexOf('*/');
        index >= 0;
        index = source.indexOf('*/', index + 1)
      ) {
        commentEnds.push(index);
      }
      lineBreaks = Array.from(
        source.matchAll(/[\r\n\u2028\u2029]/g),
        (match) => match.index
      );
    }
    let end = commentEnds[upperBound(commentEnds, expression.error.pos + 1)];
    if (end === undefined) return;
    const nextComment = /\s*\/\*/y;
    const chain: number[] = [];
    while (!commentChains.has(end)) {
      chain.push(end);
      nextComment.lastIndex = end + 2;
      const match = nextComment.exec(source);
      if (!match) break;
      const nextEnd =
        commentEnds[upperBound(commentEnds, nextComment.lastIndex - 1)];
      if (nextEnd === undefined) break;
      end = nextEnd;
    }
    end = commentChains.get(end) ?? end;
    for (const close of chain) commentChains.set(close, end);
    const lineBreak = lineBreaks[upperBound(lineBreaks, expression.error.pos)];
    return {
      start: expression.error.pos + 2,
      end,
      lineBreak: lineBreak !== undefined && lineBreak < end,
    };
  }
  function probe(
    parser: ParseContext,
    kind: 'text',
    point: SourcePoint,
    end = source.length,
    view?: Map<number, Point>,
    gap?: { start: number; end: number; lineBreak: boolean }
  ): ProbeResult {
    const tokenizer = parser[kind](point);
    let skipLine = 0;
    let from = point.offset;
    let elided = false;
    let lo = 0,
      hi = entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].end <= point.offset) lo = mid + 1;
      else hi = mid;
    }
    try {
      for (let i = lo; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.start >= end) break;
        if (view && !gap && entry.line !== skipLine) {
          skipLine = entry.line;
          const current = view.get(entry.line),
            next = view.get(entry.line + 1);
          if (current) tokenizer.defineSkip(current);
          if (next) tokenizer.defineSkip(next);
        }
        if (typeof entry.chunk === 'string') {
          const skip = view?.get(entry.line)?.offset ?? 0;
          const start = Math.max(from, entry.start, skip) - entry.start;
          let limit = Math.min(end, entry.end) - entry.start;
          if (
            gap &&
            !elided &&
            entry.end > gap.start &&
            entry.start < gap.end
          ) {
            limit = Math.min(limit, gap.start - entry.start);
          }
          for (let j = start; j < limit; j += 128) {
            const value = entry.chunk.slice(j, Math.min(j + 128, limit));

            tokenizer.write([value]);
          }
        } else if (
          entry.chunk !== null &&
          (!gap || elided || entry.start < gap.start) &&
          entry.start >= (view?.get(entry.line)?.offset ?? 0)
        ) {
          tokenizer.write([entry.chunk]);
        }
        if (gap && !elided && entry.end >= gap.start && entry.start < gap.end) {
          if (gap.lineBreak) tokenizer.write([-4]);
          let next = i,
            high = entries.length;
          while (next < high) {
            const mid = (next + high) >> 1;
            if (entries[mid].end <= gap.end) next = mid + 1;
            else high = mid;
          }
          i = next - 1;
          from = gap.end;
          elided = true;
        }
      }
      tokenizer.write([null]);
      return { ok: false, context: tokenizer };
    } catch (error) {
      if (error instanceof ProbeComplete) {
        const result = error.result;
        return result.ok && result.start !== point.offset
          ? { ok: false, context: result.context }
          : result;
      }
      return { ok: false, error, context: tokenizer };
    }
  }
  function classify(
    point: SourcePoint,
    actual?: TokenizeContext
  ): Classification {
    const auto = probe(autoParser, 'text', point);
    if (!auto.ok) {
      const result: Classification = { kind: 'ordinary' };
      return result;
    }
    const actualInput = actual && actualView?.(actual);
    if (actual && actualView && !actualInput) return { kind: 'ordinary' };
    const end = actualInput?.end ?? source.length;
    if (auto.context.now().offset > end) return { kind: 'ordinary' };
    const prefix = probe(jsxParser, 'text', point, auto.context.now().offset);
    let result: Classification;
    if (prefix.ok) result = { kind: 'jsx' };
    else {
      const error = prefix.error;
      let expression: ReturnType<typeof expressionPrefix>;
      let rejected =
        (hasDiagnostic(error) &&
          error.source === 'micromark-extension-mdx-jsx' &&
          error.ruleId === 'unexpected-character') ||
        (hasDiagnostic(error) &&
          error.source === 'micromark-extension-mdx-expression' &&
          [
            'non-spread',
            'spread-extra',
            'unexpected-empty-expression',
          ].includes(error.ruleId));
      if (!rejected) {
        expression = expressionPrefix(prefix.context);
        if (expression) {
          rejected = rejectedExpression(expression, auto.context.now().offset);
        }
      }
      const view = actualInput?.skips;
      const projected = commentGap(expression);
      if (
        !options?.acorn &&
        expression?.error?.message === 'Unterminated comment' &&
        (!projected || projected.end >= end)
      )
        rejected = true;
      const gap = projected && projected.end < end ? projected : undefined;
      const completed = rejected
        ? undefined
        : probe(jsxParser, 'text', point, end, view, gap);
      result = completed?.ok ? { kind: 'jsx' } : { kind: 'autolink' };
    }
    return result;
  }
  return { classify };
}
