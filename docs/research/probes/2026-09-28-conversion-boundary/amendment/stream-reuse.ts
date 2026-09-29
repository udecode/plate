// Amendment probe for D9/D10 of docs/plans/2026-09-28-conversion-boundary-adoption.md.
// Candidate: split the accumulated source at blank lines whose container state is
// closed, convert each completed segment once, reparse only the open tail, and
// publish by splicing the changed tail instead of replacing the whole value.
// Oracles: every incremental preview deep-equals a fresh partial parse of the same
// prefix (content and diagnostics), and the spliced editor equals a fully replaced one.
// Run from the repository root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/amendment/stream-reuse.ts [--correctness-only]

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import path from 'node:path';

import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { compileMarkdownMappings } from '../../../../../packages/platejs/src/markdown/lib/internal/markdownMappings';

const out = import.meta.dir;
const save = (name: string, value: unknown) =>
  writeFileSync(path.join(out, name), `${JSON.stringify(value, null, 2)}\n`);
const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

const options = { lossPolicy: 'allow', partial: true } as const;
const editor = createTestEditor();
type Result = ReturnType<typeof editor.api.markdown.parseSlice>;
const full = (source: string): Result =>
  editor.api.markdown.parseSlice(source, options);

const blockTags = [...compileMarkdownMappings(editor as never).tags]
  .filter(([, kind]) => kind === 'block')
  .map(([name]) => name);
const tagOpen = new RegExp(`<(${blockTags.join('|')})(?=[\\s>/])[^>]*?(/?)>`, 'g');
const tagClose = new RegExp(`</(${blockTags.join('|')})\\s*>`, 'g');

const LIST = /^ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|$)/;
const INDENTED = /^(?: {4}|\t)/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const MATH = /^ {0,3}\$\$/;
const RAW_HTML = /^ {0,3}<(!--|pre|script|style|textarea)(?=[\s>]|$)/i;
const RAW_HTML_END: Record<string, RegExp> = {
  '!--': /-->/,
  pre: /<\/pre>/i,
  script: /<\/script>/i,
  style: /<\/style>/i,
  textarea: /<\/textarea>/i,
};
const DEFINITION = /(^|\n) {0,3}\[[^\]\n]+\]:/;

type ScanState = {
  fence: { char: string; length: number } | null;
  math: boolean;
  rawEnd: RegExp | null;
  tagDepth: number;
  previousNonBlank: string | null;
};
const cleanState = (): ScanState => ({
  fence: null,
  math: false,
  previousNonBlank: null,
  rawEnd: null,
  tagDepth: 0,
});

/**
 * Scan `source` from `from` (a known clean boundary) and return the offsets of
 * blank-line boundaries where a split cannot change the parse: no open fence,
 * math block, raw HTML block or registered block tag, and no list or indented
 * content before the blank line that a following block could continue.
 */
const findBoundaries = (source: string, from: number) => {
  const state = cleanState();
  const boundaries: number[] = [];
  let pendingBlank = false;
  let offset = from;

  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const end = newline === -1 ? source.length : newline + 1;
    const line = source.slice(offset, end).replace(/\r?\n$/, '');
    const blank = line.trim() === '';

    // A boundary needs a following non-blank line, even one still arriving.
    if (!blank && pendingBlank && boundaryAllowed(state)) {
      boundaries.push(offset);
    }
    pendingBlank = blank;
    if (!blank) scanLine(state, line);
    offset = end;
  }

  return boundaries;
};

const boundaryAllowed = (state: ScanState) =>
  state.previousNonBlank !== null &&
  !state.fence &&
  !state.math &&
  !state.rawEnd &&
  state.tagDepth === 0 &&
  !LIST.test(state.previousNonBlank) &&
  !INDENTED.test(state.previousNonBlank);

const scanLine = (state: ScanState, line: string) => {
  state.previousNonBlank = line;
  if (state.fence) {
    const close = FENCE.exec(line);

    if (
      close &&
      close[1][0] === state.fence.char &&
      close[1].length >= state.fence.length &&
      line.trim() === close[1]
    ) {
      state.fence = null;
    }

    return;
  }
  if (state.math) {
    if (MATH.test(line)) state.math = false;

    return;
  }
  if (state.rawEnd) {
    if (state.rawEnd.test(line)) state.rawEnd = null;

    return;
  }
  const fence = FENCE.exec(line);

  if (fence) {
    state.fence = { char: fence[1][0], length: fence[1].length };

    return;
  }
  if (MATH.test(line) && !/\$\$.*\$\$/.test(line.trim())) {
    state.math = true;

    return;
  }
  const raw = RAW_HTML.exec(line);

  if (raw) {
    const endPattern = RAW_HTML_END[raw[1].toLowerCase()];

    if (!endPattern.test(line.slice(raw.index + raw[0].length))) {
      state.rawEnd = endPattern;
    }

    return;
  }
  for (const match of line.matchAll(tagOpen)) {
    if (match[2] !== '/') state.tagDepth += 1;
  }
  for (const _ of line.matchAll(tagClose)) {
    state.tagDepth = Math.max(0, state.tagDepth - 1);
  }
};

type Segment = Readonly<{
  content: readonly unknown[];
  diagnostics: readonly unknown[];
  end: number;
}>;
type Checkpoint = Readonly<{
  fallback: boolean;
  segments: readonly Segment[];
  source: string;
  stableEnd: number;
}>;

const lineOffset = (source: string, offset: number) => {
  let lines = 0;

  for (let index = 0; index < offset; index += 1) {
    if (source.charCodeAt(index) === 10) lines += 1;
  }

  return lines;
};

const shiftPoint = (point: any, lines: number, offset: number) =>
  point
    ? {
        ...point,
        line: point.line + lines,
        ...(point.offset === undefined ? {} : { offset: point.offset + offset }),
      }
    : point;
const shiftDiagnostics = (
  diagnostics: readonly any[],
  lines: number,
  offset: number
) =>
  lines === 0 && offset === 0
    ? diagnostics
    : diagnostics.map((diagnostic) =>
        diagnostic.source
          ? {
              ...diagnostic,
              source: {
                ...diagnostic.source,
                end: shiftPoint(diagnostic.source.end, lines, offset),
                start: shiftPoint(diagnostic.source.start, lines, offset),
              },
            }
          : diagnostic
      );

export const createIncrementalParser = () => {
  const checkpoints = new WeakMap<object, Checkpoint>();

  return (source: string, previous?: Result) => {
    const old = previous ? checkpoints.get(previous) : undefined;
    const valid = !!old && source.startsWith(old.source);
    const fallback = (valid && old.fallback) || DEFINITION.test(source);
    let parsedBytes = 0;
    const parse = (text: string) => {
      parsedBytes += text.length;

      return full(text);
    };

    if (fallback) {
      const result = parse(source);

      checkpoints.set(result, {
        fallback: true,
        segments: [],
        source,
        stableEnd: 0,
      });

      return { fallback: true, parsedBytes, result, stableSegments: 0 };
    }

    const segments = valid ? [...old.segments] : [];
    let stableEnd = valid ? old.stableEnd : 0;
    const boundaries = findBoundaries(source, stableEnd);
    // Blocks before the last boundary are complete; the text after it is the
    // open tail and is reparsed on every call.
    const lastBoundary = boundaries.at(-1);

    for (const boundary of boundaries) {
      if (boundary === lastBoundary) break;
      const text = source.slice(stableEnd, boundary);
      const segmentResult = parse(text);

      if (!segmentResult.ok) return fullFallback();
      const lines = lineOffset(source, stableEnd);

      segments.push({
        content: segmentResult.slice.content,
        diagnostics: shiftDiagnostics(segmentResult.diagnostics, lines, stableEnd),
        end: boundary,
      });
      stableEnd = boundary;
    }

    const tailStart =
      lastBoundary !== undefined && lastBoundary > stableEnd
        ? lastBoundary
        : stableEnd;

    if (tailStart > stableEnd) {
      const text = source.slice(stableEnd, tailStart);
      const segmentResult = parse(text);

      if (!segmentResult.ok) return fullFallback();
      segments.push({
        content: segmentResult.slice.content,
        diagnostics: shiftDiagnostics(
          segmentResult.diagnostics,
          lineOffset(source, stableEnd),
          stableEnd
        ),
        end: tailStart,
      });
      stableEnd = tailStart;
    }

    const tail = parse(source.slice(stableEnd));

    if (!tail.ok) return fullFallback();
    const result = {
      ...tail,
      diagnostics: [
        ...segments.flatMap((segment) => segment.diagnostics),
        ...shiftDiagnostics(tail.diagnostics, lineOffset(source, stableEnd), stableEnd),
      ],
      slice: {
        ...tail.slice,
        content: [
          ...segments.flatMap((segment) => segment.content),
          ...tail.slice.content,
        ],
      },
    } as Result;

    checkpoints.set(result, { fallback: false, segments, source, stableEnd });

    return { fallback: false, parsedBytes, result, stableSegments: segments.length };

    // An invalid prefix (for example a columnGroup with one column so far) is
    // answered by the full parser; the next call starts reuse again from zero.
    function fullFallback() {
      const result = full(source);

      checkpoints.set(result, { fallback: false, segments: [], source, stableEnd: 0 });

      return { fallback: true, parsedBytes: parsedBytes + source.length, result, stableSegments: 0 };
    }
  };
};

const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const cjkUnit = (i: number) =>
  `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const makeSource = (kind: 'cjk' | 'rich', size: number) =>
  Array.from({ length: 2000 }, (_, i) =>
    kind === 'rich' ? answerUnit(i) : cjkUnit(i)
  )
    .join('\n')
    .slice(0, size);

const fixtures: Record<string, string> = {
  paragraphs: 'First independent paragraph.\n\nSecond paragraph, still plain.\n\nThird paragraph.\n',
  headings: '# First\n\nPlain paragraph.\n\n## Second\n\nAnother plain paragraph.\n',
  reference: '[read][later]\n\nPlain.\n\n[later]: https://example.com "title"\n',
  shortcut: '[label]\n\nOther.\n\n[label]: /url\n\n[label]: /ignored\n',
  footnote: 'Note[^a].\n\nOther paragraph.\n\n[^a]: Footnote body.\n\n    Continued body.\n',
  fence: '```js\nconst a = 1;\n\nconst b = 2;\n```\n\nAfter.\n',
  tildeFence: '~~~~\nalpha\n\nbeta\n~~~~\n\nAfter.\n',
  list: '- one\n\n  continuation\n\n- two\n  - nested\n\nAfter.\n',
  ordered: '1. one\n\n2. two\n\n   continued\n\nAfter.\n',
  tags: '<callout icon="x">\n\nFirst.\n\nSecond.\n\n</callout>\n\nAfter.\n',
  inlineTags: 'Before <u>underlined</u> and <kbd>Ctrl</kbd>.\n\nAfter.\n',
  nestedTags: '<columnGroup>\n<column width="50%">\n\nLeft.\n\n</column>\n<column width="50%">\nRight.\n</column>\n</columnGroup>\n\nAfter.\n',
  table: '| a | b |\n| - | - |\n| x | y |\n\nAfter.\n',
  setext: 'Title\n---\n\nParagraph\n===\n',
  quote: '> first\n>\n> second\n\nAfter.\n',
  inline: 'A **bold** word, _italic_, `code`, [link](/url), ![alt](/image.png).\n\nAfter.\n',
  math: '$$\nx^2\n\n+y\n$$\n\nInline $a+b$.\n',
  unicode: 'Café and 🚀.\r\n\r\nSecond paragraph.\n',
  unknownTag: 'Before.\n\n<unknown>body</unknown>\n',
  incompleteTag: 'Before.\n\n<callout icon="x',
  indentedCode: 'Para.\n\n    code\n\n    more\n\nAfter.\n',
  htmlComment: 'Before.\n\n<!--\n\nhidden\n\n-->\n\nAfter.\n',
  emoji: ':rocket: launch\n\nnext :tada:\n',
  details: '<details>\n\n<summary>Title *x*</summary>\n\nBody.\n\n</details>\n\nAfter.\n',
  cjkRich: cjkUnit(1) + '\n' + cjkUnit(2),
  rich: answerUnit(1) + '\n' + answerUnit(2),
};

const chunks = (source: string, size: number, seed?: number) => {
  let n = seed ?? 1;
  const parts: string[] = [];

  for (let i = 0; i < source.length; ) {
    n = (Math.imul(n, 1_664_525) + 1_013_904_223) >>> 0;
    const next = seed === undefined ? size : 1 + (n % size);

    parts.push(source.slice(i, i + next));
    i += next;
  }

  return parts;
};

const correctness = () => {
  const rows: unknown[] = [];
  let previews = 0;

  for (const [name, source] of Object.entries(fixtures)) {
    let reusedObjects = 0;
    let fallbacks = 0;
    let checked = 0;
    const chunkings: [string, string[]][] = [
      ['one-character', chunks(source, 1)],
      ['64', chunks(source, 64)],
      ...Array.from({ length: 24 }, (_, i): [string, string[]] => [
        `seed-${i + 1}`,
        chunks(source, 73, i + 1),
      ]),
    ];

    for (const [label, parts] of chunkings) {
      const parse = createIncrementalParser();
      let previous: Result | undefined;
      let prefix = '';

      for (const part of parts) {
        prefix += part;
        const step = parse(prefix, previous);

        assert.deepEqual(step.result, full(prefix), `${name}/${label}/${prefix.length}`);
        if (previous?.ok && step.result.ok) {
          reusedObjects += previous.slice.content.filter(
            (node, index) => node === step.result.slice.content[index]
          ).length;
        }
        fallbacks += Number(step.fallback);
        checked += 1;
        previous = step.result;
      }
    }
    previews += checked;
    rows.push({ checked, fallbacks, name, reusedObjects });
  }
  save('stream-correctness.json', { previews, rows });
  console.log(`correctness: ${previews} prefix previews equal a fresh partial parse`);
};

const publishSplice = (target: any, previous: readonly unknown[], next: readonly unknown[]) => {
  let index = 0;
  const shared = Math.min(previous.length, next.length);

  while (index < shared && previous[index] === next[index]) index += 1;
  if (index === 0) {
    target.update({ history: 'skip' }).value.replace({ children: next });

    return;
  }
  target.update({ history: 'skip' }, (tx: any) => {
    for (let at = previous.length - 1; at >= index; at -= 1) {
      tx.nodes.remove({ at: [at] });
    }
    if (next.length > index) tx.nodes.insert(next.slice(index), { at: [index] });
  });
};

const summary = (samples: number[]) => {
  const sorted = [...samples].sort((a, b) => a - b);

  return {
    last10Mean: samples.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, samples.length),
    p50: sorted[Math.ceil(sorted.length * 0.5) - 1],
    p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
    sum: samples.reduce((a, b) => a + b, 0),
  };
};

const runStream = (source: string, candidate: boolean) => {
  const parse = createIncrementalParser();
  const target = createTestEditor() as any;
  const parseTimes: number[] = [];
  const publishTimes: number[] = [];
  const outputs: string[] = [];
  let previous: Result | undefined;
  let published: readonly unknown[] = [];
  let parsedBytes = 0;
  let fallbacks = 0;
  let prefix = '';

  for (const part of chunks(source, 64)) {
    prefix += part;
    const t0 = performance.now();
    const step = candidate
      ? parse(prefix, previous)
      : { fallback: false, parsedBytes: prefix.length, result: full(prefix) };

    parseTimes.push(performance.now() - t0);
    assert(step.result.ok);
    parsedBytes += step.parsedBytes;
    fallbacks += Number(step.fallback);
    const nodes = step.result.slice.content;
    const t1 = performance.now();

    if (candidate) publishSplice(target, published, nodes);
    else target.update({ history: 'skip' }).value.replace({ children: nodes });
    publishTimes.push(performance.now() - t1);
    published = nodes;
    outputs.push(hash(JSON.stringify(step.result)));
    previous = step.result;
  }

  return {
    candidate,
    chunks: parseTimes.length,
    fallbacks,
    finalValue: JSON.stringify(target.read.children()),
    outputHash: hash(outputs.join()),
    parse: summary(parseTimes),
    parsedBytes,
    publish: summary(publishTimes),
  };
};

const benchmark = () => {
  const packets: unknown[] = [];

  for (const kind of ['rich', 'cjk'] as const) {
    for (const size of [10_000, 50_000]) {
      const source = makeSource(kind, size);
      const pairs = size === 10_000 ? 3 : 1;

      if (size === 10_000) {
        runStream(source, false);
        runStream(source, true);
      }
      for (let pair = 0; pair < pairs; pair += 1) {
        const order = pair % 2 === 0 ? [false, true] : [true, false];
        const results: Record<string, any> = {};

        for (const candidate of order) {
          results[candidate ? 'candidate' : 'baseline'] = runStream(source, candidate);
        }
        assert.equal(results.candidate.outputHash, results.baseline.outputHash, `${kind}/${size} previews`);
        assert.equal(results.candidate.finalValue, results.baseline.finalValue, `${kind}/${size} published value`);
        for (const role of ['baseline', 'candidate']) delete results[role].finalValue;
        const row = { kind, pair, size, sourceHash: hash(source), ...results };

        packets.push(row);
        console.log(
          `${kind} ${size} pair ${pair}: parse ${results.baseline.parse.sum.toFixed(0)} -> ${results.candidate.parse.sum.toFixed(0)} ms, publish ${results.baseline.publish.sum.toFixed(0)} -> ${results.candidate.publish.sum.toFixed(0)} ms, last-10 chunk mean ${(results.baseline.parse.last10Mean + results.baseline.publish.last10Mean).toFixed(1)} -> ${(results.candidate.parse.last10Mean + results.candidate.publish.last10Mean).toFixed(1)} ms, parsed bytes ${results.baseline.parsedBytes} -> ${results.candidate.parsedBytes}`
        );
        save('stream-benchmark.json', {
          environment: { arch: arch(), bun: Bun.version, cpu: cpus()[0]?.model, platform: platform() },
          packets,
          sampling: { chunkBytes: 64, note: 'Headless synchronous elapsed time on a shared host; 10 KB uses one warmup and three alternating pairs, 50 KB one pair.' },
        });
      }
    }
  }
};

if (import.meta.main) {
  correctness();
  if (!process.argv.includes('--correctness-only')) benchmark();
}
