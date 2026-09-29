import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { cpus, arch, platform } from 'node:os';
import path from 'node:path';
import { createTestEditor } from '../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { MarkdownJoiner } from '../../../../../apps/www/src/registry/lib/markdown-joiner-transform';

const out = import.meta.dir;
const root = path.resolve(out, '../../../../..');
const save = (name: string, value: unknown) => writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const hash = (x: string | Buffer) => createHash('sha256').update(x).digest('hex');
const walk = (p: string): string[] => readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)]);
const identity = () => {
  const files = [
    ...walk(path.join(root, 'packages/platejs/src')),
    ...walk(path.join(root, 'packages/plitejs/src')),
    ...['pnpm-lock.yaml', 'bun.lock', 'package.json', 'tsconfig.json', 'config/plite-source-aliases.ts', 'config/workspace-source-entries.mjs', 'apps/www/src/registry/lib/markdown-joiner-transform.ts'].map(p => path.join(root, p)),
  ].filter(p => { try { readFileSync(p); return true; } catch { return false; } }).sort();
  const inputs = Object.fromEntries(files.map(p => [path.relative(root, p), hash(readFileSync(p))]));
  return { head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), inputs, digest: hash(JSON.stringify(inputs)), harness: hash(readFileSync(import.meta.path)) };
};

const options = { partial: true, lossPolicy: 'allow' } as const;
const editor = createTestEditor();
type Result = ReturnType<typeof editor.api.markdown.parseSlice>;
const full = (s: string, partial = true) => editor.api.markdown.parseSlice(s, partial ? options : {});
const content = (r: Result) => { assert(r.ok, JSON.stringify(r.diagnostics)); return r.slice.content; };

type Checkpoint = { source: string; stable: any[]; tail: string; fallback: boolean; owner: object; fingerprint: object };

// Disposable admission experiment, NOT a Markdown incremental parser. Any source
// outside a tiny independent paragraph/ATX-heading alphabet uses the full parser.
export function incrementalParser(parse: typeof full, unsafe = false) {
  const checkpoints = new WeakMap<object, Checkpoint>();
  const owner = {};
  const fingerprint = {};
  return (source: string, previous?: Result) => {
    const old = previous && checkpoints.get(previous);
    const t0 = performance.now();
    const valid = old && old.owner === owner && old.fingerprint === fingerprint && source.startsWith(old.source);
    const prefixCheckMs = performance.now() - t0;
    let stable = valid ? old.stable : [];
    let tail = (valid ? old.tail : '') + source.slice(valid ? old.source.length : 0);
    const admitted = /^[A-Za-z0-9 #.,;:!?()\n]*$/.test(tail) && !/(^|\n)(?: {4}| {0,3}\d+[.)](?: |$))/.test(tail);
    const fallback = !unsafe && (!!(valid && old.fallback) || !admitted);
    let bytes = 0;
    const run = (s: string) => { bytes += Buffer.byteLength(s); return parse(s); };
    let result: Result;
    if (fallback) {
      result = run(source);
      stable = [];
      tail = source;
    } else {
      const boundary = tail.lastIndexOf('\n\n');
      if (boundary >= 0) {
        const completed = run(tail.slice(0, boundary + 2));
        if (!completed.ok || completed.diagnostics.length) {
          result = run(source);
          checkpoints.set(result, { source, stable: [], tail: source, fallback: true, owner, fingerprint });
          return { result, bytes, prefixCheckMs, fallback: true, stableCount: 0 };
        }
        stable = [...stable, ...completed.slice.content];
        tail = tail.slice(boundary + 2);
      }
      const parsed = run(tail);
      result = parsed.ok ? { ...parsed, slice: { ...parsed.slice, content: [...stable, ...parsed.slice.content] } } : parsed;
    }
    checkpoints.set(result, { source, stable, tail, fallback, owner, fingerprint });
    return { result, bytes, prefixCheckMs, fallback, stableCount: stable.length };
  };
}

const fixtures = {
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
  nestedTags: '<columnGroup>\n<column width="50%">\n\nLeft.\n\n</column>\n<column width="50%">\nRight.\n</column>\n</columnGroup>\n',
  table: '| a | b |\n| - | - |\n| x | y |\n\nAfter.\n',
  setext: 'Title\n---\n\nParagraph\n===\n',
  quote: '> first\n>\n> second\n\nAfter.\n',
  inline: 'A **bold** word, _italic_, `code`, [link](/url), ![alt](/image.png).\n\nAfter.\n',
  math: '$$\nx^2\n\n+y\n$$\n\nInline $a+b$.\n',
  unicode: 'Café and 🚀.\r\n\r\nSecond paragraph.\n',
  unknownTag: 'Before.\n\n<unknown>body</unknown>\n',
  incompleteTag: 'Before.\n\n<callout icon="x',
};
const chunks = (s: string, size: number, seed?: number) => {
  let n = seed ?? 1;
  const parts: string[] = [];
  for (let i = 0; i < s.length;) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    const next = seed === undefined ? size : 1 + n % size;
    parts.push(s.slice(i, i + next));
    i += next;
  }
  return parts;
};

function correctness() {
  const rows: any[] = [];
  const unsafeFailures: any[] = [];
  for (const [name, source] of Object.entries(fixtures)) {
    let checked = 0, fallbackPreviews = 0, reused = 0, identityAssertions = 0;
    for (const [label, parts] of [ ['one-character', chunks(source, 1)], ['64', chunks(source, 64)], ...Array.from({length: 24}, (_, i) => [`seed-${i+1}`, chunks(source, 73, i+1)]) ] as [string, string[]][]) {
      const parse = incrementalParser(full);
      let previous: Result | undefined, prefix = '', committed = 0;
      for (const part of parts) {
        prefix += part;
        const actual = parse(prefix, previous);
        const expected = full(prefix);
        assert.deepEqual(actual.result, expected, `${name}/${label}/${prefix.length}`);
        if (!actual.fallback && previous?.ok && actual.result.ok) {
          for (let i = 0; i < committed; i++) {
            assert.equal(actual.result.slice.content[i], previous.slice.content[i], `${name} committed identity ${i}`);
            identityAssertions++;
          }
        }
        if (previous?.ok && actual.result.ok) reused += previous.slice.content.filter((n, i) => n === actual.result.slice.content[i]).length;
        fallbackPreviews += +actual.fallback;
        checked++;
        previous = actual.result;
        committed = actual.stableCount;
      }
      assert.deepEqual(full(prefix, false), editor.api.markdown.parseSlice(source), `${name} strict final`);
    }
    const final = full(source, false);
    rows.push({ name, checked, fallbackPreviews, reused, identityAssertions, strictFinalOk: final.ok, strictDiagnostics: final.diagnostics });
    const naive = incrementalParser(full, true);
    let previous: Result | undefined, prefix = '';
    for (const part of chunks(source, 1)) {
      prefix += part;
      try {
        const actual = naive(prefix, previous).result;
        const expected = full(prefix);
        assert.deepEqual(actual, expected);
        previous = actual;
      } catch (e) {
        unsafeFailures.push({name, offset: prefix.length, prefix, reason: String(e).slice(0, 500)});
        break;
      }
    }
  }
  const p = incrementalParser(full), other = incrementalParser(full);
  const prev = p('One.\n\nTwo.').result;
  assert.deepEqual(p('Replaced input.', prev).result, full('Replaced input.'));
  assert.deepEqual(other('One.\n\nTwo. More.', prev).result, full('One.\n\nTwo. More.'));
  save('correctness.json', { fixtures, rows, previews: rows.reduce((n, x) => n+x.checked, 0), unsafeFailures, invalidation: ['nonappend source resets', 'foreign parser result resets'], limits: 'Fingerprint object is fixed per prototype instance; schema/config changes are not implemented. Arbitrary remark transforms are not admitted. Strict final is an unconditional authoritative reparse.' });
  console.log('correctness', rows.length, rows.reduce((n, x) => n+x.checked, 0), 'previews;', unsafeFailures.length, 'naive counterexamples');
}

function joinerEvidence() {
  const rows = Object.fromEntries(Object.entries({ plain: 'a'.repeat(5000), marked: 'a'.repeat(2600)+'**bold**\n'+'after\n'.repeat(50), code: '```js\nhello\n```\n', table: '| a | b |\n| - | - |\n| x | y |\n' }).map(([name, source]) => {
    const j = new MarkdownJoiner();
    const events: any[] = [];
    let offset = 0, emitted = '';
    for (const s of chunks(source, 64)) {
      offset += s.length;
      const text = j.processText(s);
      emitted += text;
      events.push({ received: offset, emitted: text.length, delay: j.delayInMs });
    }
    const remaining = j.flush(); emitted += remaining;
    assert.equal(emitted, source);
    return [name, { events, flushBytes: remaining.length, emissions: events.filter(e=>e.emitted).length, requestedDelayMs: events.filter(e=>e.emitted).reduce((n,e)=>n+e.delay,0) }];
  }));
  save('joiner.json', rows);
}

const summary = (samples: number[]) => {
  const a = [...samples].sort((a,b)=>a-b);
  return { count: a.length, min: a[0], p50: a[Math.ceil(a.length*.5)-1], p95: a[Math.ceil(a.length*.95)-1], max: a.at(-1), sum: samples.reduce((a,b)=>a+b,0) };
};
const answerUnit = (i: number) => `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const makeSource = (size: number, kind: string) => Array.from({length: 1000}, (_,i) => kind === 'rich' ? answerUnit(i) : `## Step ${i}\n\nThis independent paragraph explains a small part of the answer. It contains ordinary words and punctuation, with enough text to cross several incoming chunks.\n\n`).join('\n').slice(0, size);

function runStream(source: string, candidate: boolean, publish: boolean) {
  const parse = incrementalParser(full);
  const target = createTestEditor();
  const fitSchema = target.read(s => s.schema) as any;
  let previous: Result | undefined, prefix = '', parsedBytes = 0, parserReused = 0, modelReused = 0, keyReused = 0, comparisons = 0;
  const times = { parse: [] as number[], fit: [] as number[], publish: [] as number[], prefixCheck: [] as number[] };
  const outputs: string[] = [];
  const start = performance.now();
  for (const part of chunks(source, 64)) {
    prefix += part;
    const t0 = performance.now();
    const step = candidate ? parse(prefix, previous) : { result: full(prefix), bytes: prefix.length, prefixCheckMs: 0 };
    times.parse.push(performance.now()-t0);
    times.prefixCheck.push(step.prefixCheckMs);
    parsedBytes += step.bytes;
    const nodes = content(step.result);
    if (previous?.ok) parserReused += previous.slice.content.filter((n,i)=>n===nodes[i]).length;
    const t1 = performance.now();
    const fitted = fitSchema.fitDocumentWithReport({children: nodes});
    fitSchema.assertDocument(fitted.document);
    times.fit.push(performance.now()-t1);
    if (publish) {
      const oldNodes = target.read.children();
      const oldKeys = oldNodes.map(n=>target.key(n));
      const t2 = performance.now();
      target.update({history:'skip'}).value.replace({children: nodes as any});
      times.publish.push(performance.now()-t2);
      const now = target.read.children();
      // Count only content-equal positions, excluding the mutable tail and newly added blocks.
      oldNodes.forEach((n,i)=>{if (now[i] && JSON.stringify(n)===JSON.stringify(now[i])) { comparisons++; modelReused += +(n===now[i]); keyReused += +(oldKeys[i]===target.key(now[i])); }});
    }
    // Outside timed stages: exact oracle digest for matched runs.
    outputs.push(hash(JSON.stringify(step.result)));
    previous = step.result;
  }
  const finalStart = performance.now();
  const final = full(source, false);
  const strictFinalMs = performance.now()-finalStart;
  return { candidate, publish, stages: Object.fromEntries(Object.entries(times).map(([k,v])=>[k,summary(v)])), parsedBytes, parserReused, modelReused, keyReused, comparisons, strictFinalMs, strictFinalOk: final.ok, outputHash: hash(JSON.stringify(outputs)), wallIncludingGuardsMs: performance.now()-start };
}

async function benchmark() {
  const boundedRich = process.argv.includes('--bounded-rich');
  const packetCount = boundedRich ? 1 : 5;
  const warmups = boundedRich ? 0 : 1;
  const packets: any[] = [];
  for (const kind of (boundedRich ? ['rich'] : ['plain','rich'])) for (const size of [10_000,50_000]) {
    const source = makeSource(size, kind);
    save(`fixture-${kind}-${size}.json`, {source, bytes: Buffer.byteLength(source), chunks: Math.ceil(source.length/64), hash:hash(source)});
    // Warm both paths, then alternate order. Full headless publish for plain;
    // rich retains a full-parse fallback and separately times parse/fit only.
    const publish = kind==='plain';
    if (warmups) { runStream(source,false,publish); runStream(source,true,publish); }
    for (let packet=0;packet<packetCount;packet++) {
      const pair: any = {};
      for (const candidate of packet%2 ? [true,false] : [false,true]) pair[candidate?'candidate':'baseline'] = runStream(source,candidate,publish);
      assert.equal(pair.candidate.outputHash,pair.baseline.outputHash);
      packets.push({kind,size,packet,...pair});
      save(boundedRich ? 'benchmark-rich.json' : 'benchmark.json', { environment:{bun:Bun.version,cpu:cpus()[0]?.model,arch:arch(),platform:platform()}, sampling:{warmups,packets:packetCount,chunkBytes:64,sizeUnit:'decimal bytes', frozenTargetMet: !boundedRich, amendment: boundedRich ? 'Original five-packet target incomplete; bounded one-pair diagnostic only, not a timing acceptance pass.' : null}, packets });
      console.log(kind,size,packet, 'parse',pair.baseline.stages.parse.sum.toFixed(1),pair.candidate.stages.parse.sum.toFixed(1),'fit',pair.baseline.stages.fit.sum.toFixed(1),pair.candidate.stages.fit.sum.toFixed(1),'publish',pair.baseline.stages.publish.sum.toFixed(1),pair.candidate.stages.publish.sum.toFixed(1));
    }
  }
}

if (import.meta.main) {
const sourceLabel = process.argv.includes('--bounded-rich') ? 'rich-' : '';
const before = identity(); save(`source-${sourceLabel}before.json`, before);
try {
  correctness(); joinerEvidence();
  if (!process.argv.includes('--correctness-only')) await benchmark();
} finally {
  const after = identity(); save(`source-${sourceLabel}after.json`, after);
  save(`source-${sourceLabel}check.json`, {same:before.digest===after.digest, changed:Object.keys(before.inputs).filter(k=>before.inputs[k]!==after.inputs[k])});
}
}
