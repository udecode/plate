import type {
  Construct,
  Chunk,
  ContainerState,
  Extension,
  Point,
  ParseContext,
  State,
  Token,
  TokenizeContext,
} from 'micromark-util-types';

import { parse, preprocess } from 'micromark';
import { blockQuote, list } from 'micromark-core-commonmark';

export type MdxView = { end: number; skips: Map<number, Point> };

function overrideSyntax<T extends object>(
  original: T,
  overrides: Partial<T>
): T {
  const copy: T = Object.create(
    original,
    Object.getOwnPropertyDescriptors(overrides)
  );
  return new Proxy(copy, {
    get(target, key, receiver) {
      return Object.hasOwn(target, key)
        ? Reflect.get(target, key, receiver)
        : Reflect.get(original, key, original);
    },
  });
}

export function createMdxSource(input: string) {
  const source = input.startsWith('\uFEFF') ? input.slice(1) : input;
  const lines: { start: number; chunks: Chunk[] }[] = [
    { start: 0, chunks: [] },
  ];
  const entries: { chunk: Chunk; start: number; end: number; line: number }[] =
    [];
  const keys = new Set(['null']);
  let offset = 0;
  for (const chunk of preprocess()(input, undefined, true)) {
    lines.at(-1)!.chunks.push(chunk);
    if (typeof chunk === 'string') {
      for (let index = 0; index < chunk.length; index++)
        keys.add(String(chunk.charCodeAt(index)));
    } else if (chunk !== null) keys.add(String(chunk));
    const size =
      typeof chunk === 'string'
        ? chunk.length
        : chunk === -3
          ? 2
          : chunk === -1 || chunk === null
            ? 0
            : 1;
    entries.push({
      chunk,
      start: offset,
      end: offset + size,
      line: lines.length,
    });
    offset += size;
    if (chunk === -3 || chunk === -4 || chunk === -5)
      lines.push({ start: offset, chunks: [] });
  }
  return { source, lines, entries, keys };
}

export type MdxSource = ReturnType<typeof createMdxSource>;

export function createMdxContext(
  input: MdxSource,
  bind: (parser: ParseContext) => void
) {
  const { source, lines, keys } = input;
  let root: TokenizeContext | undefined;
  const contexts = new Set<TokenizeContext>();
  const chains = new Map<number, Token>();
  const containers = new Map<
    Token,
    { construct: Construct; state: ContainerState }
  >();
  const views = new WeakMap<TokenizeContext, MdxView>();
  const textContexts = new WeakSet<TokenizeContext>();
  const flowViews = new WeakMap<TokenizeContext, MdxView>();
  type ContinuationResult = 'continued' | 'failed';
  const continuations = new WeakMap<
    ContainerState,
    Map<number, ContinuationResult>
  >();
  function recordContinuation(
    state: ContainerState | undefined,
    line: number,
    result: ContinuationResult
  ) {
    if (!state) return;
    let history = continuations.get(state);
    if (!history) {
      history = new Map();
      continuations.set(state, history);
    }
    history.set(line, result);
  }
  const observe = (construct: Construct): Construct =>
    overrideSyntax(construct, {
      continuation:
        construct.continuation &&
        overrideSyntax(construct.continuation, {
          tokenize(effects, ok, nok) {
            const state = this.containerState;
            const line = this.now().line;
            return construct.continuation!.tokenize.call(
              this,
              effects,
              (code) => {
                recordContinuation(state, line, 'continued');
                return ok(code);
              },
              (code) => {
                recordContinuation(state, line, 'failed');
                return nok(code);
              }
            );
          },
        }),
      tokenize(effects, ok, nok) {
        const state = this.containerState;
        return construct.tokenize.call(
          this,
          {
            ...effects,
            enter(type, fields) {
              const token = effects.enter(type, fields);
              if (token._container && state)
                containers.set(token, { construct, state });
              return token;
            },
          },
          ok,
          nok
        );
      },
    });
  const quote = observe(blockQuote);
  const item = observe(list);
  const observer: Extension = {
    document: { 62: quote, 42: item, 43: item, 45: item },
  };
  for (let code = 48; code <= 57; code++) observer.document![code] = item;

  const initialize: Construct = {
    partial: true,
    tokenize(_effects, _ok, nok) {
      if (!root) {
        root = this;
        contexts.add(this);
        bind(this.parser);
        for (const kind of ['flow', 'content', 'text'] as const) {
          const create = this.parser[kind];
          this.parser[kind] = (point) => {
            if (kind === 'text' && point && !chains.has(point.offset)) {
              for (const context of contexts)
                for (const [action, token] of context.events)
                  if (action === 'enter' && token.contentType === 'text')
                    chains.set(token.start.offset, token);
            }
            const context = create(point);
            contexts.add(context);
            if (kind === 'text') textContexts.add(context);
            if (kind === 'text' && point) {
              let token = chains.get(point.offset);
              if (token) {
                const skips = new Map<number, Point>();
                let end = token.end.offset;
                while (token) {
                  skips.set(token.start.line, token.start);
                  end = token.end.offset;
                  token = token.next;
                }
                views.set(context, { end, skips });
              }
            }
            return context;
          };
        }
      }
      return nok;
    },
  };
  const initializer: Extension = {
    document: Object.fromEntries([...keys].map((key) => [key, initialize])),
  };

  function flowView(context: TokenizeContext): MdxView | undefined {
    if (!root) return;
    const active: Token[] = [];
    for (const [action, token] of root.events) {
      if (!token._container) continue;
      if (action === 'enter') active.push(token);
      else active.pop();
    }
    const from = context.now();
    let actual: TokenizeContext | null = context;
    while (actual && !contexts.has(actual))
      actual = Object.getPrototypeOf(actual);
    const chunk = root.events.findLast(
      (event) =>
        event[0] === 'enter' &&
        event[1].type === 'chunkFlow' &&
        event[1]._tokenizer === actual &&
        event[1].start.line === from.line
    )?.[1];
    const lineStart = chunk?.start.offset ?? from.offset;
    const keepsLazyContainers =
      context.parser.lazy[from.line] &&
      context.events.some(
        (event) =>
          event[1].start.offset < lineStart &&
          (!event[1].end || event[1].end.offset > lineStart)
      );
    const owners: { construct: Construct; state: ContainerState }[] = [];
    for (const token of active) {
      const owner = containers.get(token);
      if (!owner) return;
      const continued =
        continuations.get(owner.state)?.get(from.line) === 'continued';
      if (token.start.line !== from.line && !continued && !keepsLazyContainers)
        break;
      owners.push(owner);
    }
    const states = owners.map((owner) => ({ ...owner.state }));
    const skips = new Map<number, Point>();
    let end = source.length;
    const start = lines[from.line]?.start ?? source.length;
    if (start >= source.length || !owners.length) return { end, skips };
    class Complete {}
    const continuation: Construct = {
      tokenize(effects) {
        let index = 0;
        let lineStart = start;
        const stop = () => {
          end = lineStart;
          throw new Complete();
        };
        const next: State = (code) => {
          if (index && states[index - 1]._closeFlow) return stop();
          if (index < owners.length) {
            this.containerState = states[index];
            const construct = owners[index++]!.construct.continuation!;
            return effects.attempt(construct, next, stop)(code);
          }
          skips.set(this.now().line, this.now());
          effects.enter('data');
          return inside(code);
        };
        const inside: ReturnType<Construct['tokenize']> = (code) => {
          if (code === null) {
            effects.exit('data');
            throw new Complete();
          }
          effects.consume(code);
          if (code === -3 || code === -4 || code === -5) {
            effects.exit('data');
            index = 0;
            lineStart = this.now().offset;
            return next;
          }
          return inside;
        };
        return next;
      },
    };
    const first = lines[from.line].chunks.find(
      (chunk) => typeof chunk !== 'string' || chunk.length
    );
    const record = {
      [typeof first === 'string' ? first.charCodeAt(0) : (first ?? 'null')]:
        continuation,
    };
    const parser = parse({
      extensions: [
        {
          text: record,
          disable: {
            null: [...(context.parser.constructs.disable.null ?? [])],
          },
        },
      ],
    });
    try {
      const tokenizer = parser.text({
        offset: start,
        line: from.line + 1,
        column: 1,
      });
      for (let line = from.line; line < lines.length; line++)
        tokenizer.write(lines[line].chunks);
    } catch (error) {
      if (!(error instanceof Complete)) throw error;
    }
    return { end, skips };
  }

  return {
    observer,
    initializer,
    view(context: TokenizeContext) {
      for (
        let current: TokenizeContext | null = context;
        current;
        current = Object.getPrototypeOf(current)
      ) {
        const saved = views.get(current) ?? flowViews.get(current);
        if (saved) return saved;
        if (textContexts.has(current)) return;
      }
      const projected = flowView(context);
      if (projected) flowViews.set(context, projected);
      return projected;
    },
  };
}
