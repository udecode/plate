// Lane S4: measure deleting the Markdown joiner (plan S5, D11) under the
// consumer cadence. Both arms receive the same raw 64-character chunks on a
// 10 ms arrival schedule. Arm `joiner` passes them through MarkdownJoiner with
// its transform delays; arm `raw` passes them through unchanged. The consumer is
// the S5 one: first chunk at once, then the latest draft every 32 ms as a
// continued partial `parseSlice` spliced into a preview editor, and one strict
// parse at the end. Virtual time models one client thread: arrivals and joiner
// delays are scheduled, and measured parse and publish CPU advances the clock.
// Run from the repository root:
//   bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/s4/joiner-benchmark.test.ts
import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { arch, cpus, platform } from 'node:os';
import path from 'node:path';

import { createEditor, type Descendant, NodeApi } from 'platejs';
import type { MarkdownSliceParseResult } from 'platejs/markdown';

import { BaseEditorKit } from '../../../../../../apps/www/src/registry/components/editor/plugins-static';

// MarkdownJoiner as deleted from apps/www/src/registry/lib/markdown-joiner-transform.ts
// (HEAD a7750ad388), kept here so the measurement stays reproducible.
const DEFAULT_DELAY_IN_MS = 10;
const NEST_BLOCK_DELAY_IN_MS = 100;

const BOLD_PATTERN = /\*\*.*?\*\*/;
const CODE_LINE_PATTERN = /```[^\s]+/;
const LINK_PATTERN = /^\[.*?\]\(.*?\)$/;
const UNORDERED_LIST_PATTERN = /^[*-]\s+.+/;
const TODO_LIST_PATTERN = /^[*-]\s+\[[ xX]\]\s+.+/;
const ORDERED_LIST_PATTERN = /^\d+\.\s+.+/;
const TAG_PATTERN = /<([A-Za-z][A-Za-z0-9\-_]*)>/;
const DIGIT_PATTERN = /^[0-9]$/;

class MarkdownJoiner {
  delayInMs = DEFAULT_DELAY_IN_MS;

  private buffer = '';
  private documentCharacterCount = 0;
  private isBuffering = false;
  private streamingCodeBlock = false;
  private streamingLargeDocument = false;
  private streamingTable = false;

  private clearBuffer(): void {
    this.buffer = '';
    this.isBuffering = false;
  }
  private isCompleteBold(): boolean {
    return BOLD_PATTERN.test(this.buffer);
  }

  private isCompleteCodeBlockEnd(): boolean {
    return this.buffer.trimEnd() === '```';
  }

  private isCompleteCodeBlockStart(): boolean {
    return CODE_LINE_PATTERN.test(this.buffer);
  }

  private isCompleteLink(): boolean {
    return LINK_PATTERN.test(this.buffer);
  }

  private isCompleteList(): boolean {
    if (UNORDERED_LIST_PATTERN.test(this.buffer) && this.buffer.includes('[')) {
      return TODO_LIST_PATTERN.test(this.buffer);
    }

    return (
      UNORDERED_LIST_PATTERN.test(this.buffer) ||
      ORDERED_LIST_PATTERN.test(this.buffer) ||
      TODO_LIST_PATTERN.test(this.buffer)
    );
  }

  private isCompleteTag(): boolean {
    return TAG_PATTERN.test(this.buffer);
  }

  private isCompleteTableStart(): boolean {
    return this.buffer.startsWith('|') && this.buffer.endsWith('|');
  }

  private isFalsePositive(char: string): boolean {
    // when link is not complete, even if ths buffer is more than 30 characters, it is not a false positive
    if (this.buffer.startsWith('[') && this.buffer.includes('http')) {
      return false;
    }

    return char === '\n' || this.buffer.length > 30;
  }

  private isLargeDocumentStart(): boolean {
    return this.documentCharacterCount > 2500;
  }

  private isListStartChar(char: string): boolean {
    return char === '-' || char === '*' || DIGIT_PATTERN.test(char);
  }

  private isTableExisted(): boolean {
    return this.buffer.length > 10 && !this.buffer.includes('|');
  }

  flush(): string {
    const remaining = this.buffer;
    this.clearBuffer();
    return remaining;
  }

  processText(text: string): string {
    let output = '';

    for (const char of text) {
      if (
        this.streamingCodeBlock ||
        this.streamingTable ||
        this.streamingLargeDocument
      ) {
        this.buffer += char;

        if (char === '\n') {
          output += this.buffer;
          this.clearBuffer();
        }

        if (this.isCompleteCodeBlockEnd() && this.streamingCodeBlock) {
          this.streamingCodeBlock = false;
          this.delayInMs = DEFAULT_DELAY_IN_MS;

          output += this.buffer;
          this.clearBuffer();
        }

        if (this.isTableExisted() && this.streamingTable) {
          this.streamingTable = false;
          this.delayInMs = DEFAULT_DELAY_IN_MS;

          output += this.buffer;
          this.clearBuffer();
        }
      } else if (this.isBuffering) {
        this.buffer += char;

        if (this.isCompleteCodeBlockStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingCodeBlock = true;
          continue;
        }

        if (this.isCompleteTableStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingTable = true;
          continue;
        }

        if (this.isLargeDocumentStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingLargeDocument = true;
          continue;
        }

        if (
          this.isCompleteBold() ||
          this.isCompleteTag() ||
          this.isCompleteList() ||
          this.isCompleteLink()
        ) {
          output += this.buffer;
          this.clearBuffer();
        } else if (this.isFalsePositive(char)) {
          // False positive - flush buffer as raw text
          output += this.buffer;
          this.clearBuffer();
        }
        // Check if we should start buffering
      } else if (
        char === '*' ||
        char === '<' ||
        char === '`' ||
        char === '|' ||
        char === '[' ||
        this.isListStartChar(char)
      ) {
        this.buffer = char;
        this.isBuffering = true;
      } else {
        // Pass through character directly
        output += char;
      }
    }

    this.documentCharacterCount += text.length;
    return output;
  }
}

const CHUNK = 64;
const ARRIVAL_MS = 10;
const CADENCE_MS = 32;
const LITERAL_MARKERS = ['**', '__', '~~', '`', '](', '![', '| '];

// Fixture generators from ../../amendment/stream-reuse.ts (S0 transcripts).
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

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

type Emission = { at: number; end: number; text: string };

const rawSchedule = (source: string): Emission[] =>
  Array.from({ length: Math.ceil(source.length / CHUNK) }, (_, index) => ({
    at: index * ARRIVAL_MS,
    end: Math.min(source.length, (index + 1) * CHUNK),
    text: source.slice(index * CHUNK, (index + 1) * CHUNK),
  }));

// The transform processes one chunk at a time and awaits `delayInMs` after
// each emission, as `markdownJoinerTransform` does.
const joinerSchedule = (raw: readonly Emission[]): Emission[] => {
  const joiner = new MarkdownJoiner();
  const out: Emission[] = [];
  let free = 0;
  let emitted = 0;

  for (const chunk of raw) {
    let at = Math.max(chunk.at, free);
    const text = joiner.processText(chunk.text);

    if (text) {
      emitted += text.length;
      out.push({ at, end: emitted, text });
      at += joiner.delayInMs;
    }
    free = at;
  }
  const rest = joiner.flush();

  if (rest) {
    emitted += rest.length;
    out.push({ at: free, end: emitted, text: rest });
  }

  return out;
};

const summary = (samples: readonly number[]) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const pick = (q: number) =>
    sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)] : 0;

  return {
    p50: pick(0.5),
    p95: pick(0.95),
    sum: samples.reduce((a, b) => a + b, 0),
  };
};

const consume = (
  arm: 'joiner' | 'raw',
  source: string,
  raw: readonly Emission[]
) => {
  const emissions = arm === 'joiner' ? joinerSchedule(raw) : raw;
  const parser = createEditor({ plugins: BaseEditorKit });
  const target = createEditor({ plugins: BaseEditorKit });
  const finalParse = parser.api.markdown.parseSlice(source);
  const finalBlocks = finalParse.ok ? finalParse.slice.content : [];
  const publications: {
    done: number;
    final: boolean;
    length: number;
    literal: boolean;
    parseMs: number;
    publishMs: number;
  }[] = [];
  let clock = 0;
  let content = '';
  let previous: MarkdownSliceParseResult | undefined;
  let published: readonly Descendant[] = [];
  let timer: number | null = null;

  const publish = (at: number, final: boolean) => {
    const start = Math.max(at, clock);
    const t0 = performance.now();
    const result = parser.api.markdown.parseSlice(
      content,
      final ? {} : { lossPolicy: 'allow', partial: true, previous }
    );
    const t1 = performance.now();
    const nodes = result.ok ? result.slice.content : [];

    let first = 0;

    while (first < nodes.length && published[first] === nodes[first]) {
      first += 1;
    }
    if (first === 0) {
      target.update({ history: 'skip' }).value.replace({ children: nodes });
    } else {
      target.update({ history: 'skip' }, (tx) => {
        tx.nodes.replaceChildren(nodes.slice(first), { at: [], index: first });
      });
    }
    const t2 = performance.now();
    const tail = nodes.at(-1);
    const tailText = tail ? NodeApi.string(tail) : '';
    const finalText = finalBlocks[nodes.length - 1]
      ? NodeApi.string(finalBlocks[nodes.length - 1])
      : '';

    published = nodes;
    previous = !final && result.ok ? result : undefined;
    clock = start + (t2 - t0);
    publications.push({
      done: clock,
      final,
      length: content.length,
      literal:
        !final &&
        LITERAL_MARKERS.some(
          (marker) => tailText.includes(marker) && !finalText.includes(marker)
        ),
      parseMs: t1 - t0,
      publishMs: t2 - t1,
    });
  };

  for (const [index, emission] of emissions.entries()) {
    const arrival = Math.max(emission.at, clock);

    if (timer !== null && timer <= arrival) {
      publish(timer, false);
      timer = null;
    }
    content += emission.text;
    if (index === 0) publish(emission.at, false);
    else timer ??= Math.max(emission.at, clock) + CADENCE_MS;
  }
  // Finish drops the pending preview and parses the draft once, strictly.
  timer = null;
  publish(emissions.at(-1)?.at ?? 0, true);

  const previews = publications.filter((row) => !row.final);
  const last = publications.at(-1)!;
  const latency = raw.map((chunk) => {
    const shown = publications.find((row) => row.length >= chunk.end);

    return (shown?.done ?? last.done) - chunk.at;
  });

  return {
    arm,
    durationMs: last.done - raw[0].at,
    emittedChunks: emissions.length,
    final: {
      ok: finalParse.ok,
      parseMs: last.parseMs,
      publishMs: last.publishMs,
    },
    finalHash: hash(JSON.stringify(target.read.children())),
    latencyMs: summary(latency),
    literalPreviews: previews.filter((row) => row.literal).length,
    parseMs: summary(previews.map((row) => row.parseMs)),
    previews: previews.length,
    publishMs: summary(previews.map((row) => row.publishMs)),
    workMs:
      publications.reduce((sum, row) => sum + row.parseMs + row.publishMs, 0),
  };
};

test(
  'joiner deletion under the consumer cadence',
  () => {
    const packets: unknown[] = [];

    for (const kind of ['rich', 'cjk'] as const) {
      for (const size of [10_000, 50_000]) {
        const source = makeSource(kind, size);
        const raw = rawSchedule(source);
        const pairs = size === 10_000 ? 3 : 2;

        consume('raw', source, raw);
        consume('joiner', source, raw);
        for (let pair = 0; pair < pairs; pair += 1) {
          const order =
            pair % 2 === 0
              ? (['joiner', 'raw'] as const)
              : (['raw', 'joiner'] as const);
          const results = Object.fromEntries(
            order.map((arm) => [arm, consume(arm, source, raw)])
          );

          expect(results.raw.finalHash).toBe(results.joiner.finalHash);
          packets.push({
            kind,
            pair,
            rawChunks: raw.length,
            size,
            sourceHash: hash(source),
            ...results,
          });
          console.log(
            `${kind} ${size} pair ${pair}: work ${results.joiner.workMs.toFixed(0)} -> ${results.raw.workMs.toFixed(0)} ms, previews ${results.joiner.previews} -> ${results.raw.previews}, duration ${results.joiner.durationMs.toFixed(0)} -> ${results.raw.durationMs.toFixed(0)} ms, latency p95 ${results.joiner.latencyMs.p95.toFixed(0)} -> ${results.raw.latencyMs.p95.toFixed(0)} ms, literal previews ${results.joiner.literalPreviews} -> ${results.raw.literalPreviews}`
          );
        }
      }
    }
    writeFileSync(
      path.join(import.meta.dir, 'joiner-benchmark.json'),
      `${JSON.stringify(
        {
          environment: {
            arch: arch(),
            bun: Bun.version,
            cpu: cpus()[0]?.model,
            platform: platform(),
          },
          packets,
          sampling: {
            arrivalMs: ARRIVAL_MS,
            cadenceMs: CADENCE_MS,
            chunkCharacters: CHUNK,
            note: 'Headless, shared host. Each size runs one unrecorded warmup per arm, then alternating pairs: three at 10 KB, two at 50 KB. Virtual time; parse and publish CPU is measured with performance.now().',
          },
        },
        null,
        2
      )}\n`
    );
  },
  1_800_000
);
