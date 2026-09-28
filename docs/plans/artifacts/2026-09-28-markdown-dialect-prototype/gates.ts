// PROTOTYPE — throwaway gate runner. See NOTES.md.
// Run: bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/2026-09-28-markdown-dialect-prototype/gates.ts [repl]

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline';

import remarkEmoji from '../../../../packages/platejs/node_modules/remark-emoji/index.js';
import remarkGfm from '../../../../packages/platejs/node_modules/remark-gfm/index.js';
import remarkMath from '../../../../packages/platejs/node_modules/remark-math/index.js';
import remarkParse from '../../../../packages/platejs/node_modules/remark-parse/index.js';
import { unified } from '../../../../packages/platejs/node_modules/unified/index.js';

import { createTestEditor } from '../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';
import { compileMarkdownMappings } from '../../../../packages/platejs/src/markdown/lib/internal/markdownMappings';
import { remarkMention } from '../../../../packages/platejs/src/markdown/lib/plugins/remarkMention';
import {
  type PlateTagRegistry,
  plateTagsFromMarkdown,
  remarkPlateTags,
  trimIncompleteTagTail,
} from './plateTags';

const b = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const pass = (ok: boolean) => (ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

const TAGS: PlateTagRegistry = {
  audio: { kind: 'block', void: false },
  block: { kind: 'block' },
  callout: { kind: 'block' },
  codeDrawing: { kind: 'block' },
  column: { kind: 'block' },
  columnGroup: { kind: 'block' },
  date: { kind: 'inline' },
  del: { kind: 'inline' },
  details: { kind: 'block' },
  figure: { kind: 'block' },
  file: { kind: 'block' },
  img: { kind: 'block', void: true },
  kbd: { kind: 'inline' },
  mark: { kind: 'inline' },
  mediaEmbed: { kind: 'block' },
  span: { kind: 'inline' },
  sub: { kind: 'inline' },
  summary: { kind: 'block' },
  sup: { kind: 'inline' },
  toc: { kind: 'block' },
  u: { kind: 'inline' },
  video: { kind: 'block' },
};

const MDAST_TYPES = new Set([
  'blockquote', 'code', 'delete', 'emphasis', 'footnoteDefinition',
  'footnoteReference', 'heading', 'image', 'inlineCode', 'inlineMath', 'link',
  'list', 'math', 'mention', 'strong', 'table', 'thematicBreak',
]);

const editor = createTestEditor();
const md = editor.api.markdown;

const CANDIDATE_PLUGINS = [
  remarkMath,
  remarkGfm,
  [remarkPlateTags, { tags: TAGS }],
  remarkEmoji,
  remarkMention,
] as any[];

const refParse = (source: string, options: any = {}) => md.parse(source, options);
const candParse = (source: string, options: any = {}) =>
  md.parse(source, { ...options, remarkPlugins: CANDIDATE_PLUGINS, withoutMdx: true });
const refSerialize = (document: any) => md.serialize({ document, lossPolicy: 'allow' });
const candSerialize = (document: any) =>
  md.serialize({ document, lossPolicy: 'allow', remarkPlugins: CANDIDATE_PLUGINS });

const attempt = <T>(fn: () => T): { value?: T; threw?: string } => {
  try {
    return { value: fn() };
  } catch (error) {
    return { threw: `${(error as Error).name}: ${(error as Error).message}`.slice(0, 160) };
  }
};
const same = (a: unknown, c: unknown) => JSON.stringify(a) === JSON.stringify(c);
const docOf = (r: any) => (r?.ok ? r.document : r);

// Kill check: pair CommonMark `html` nodes that are exactly one registered tag.
const SINGLE_TAG = /^<(\/?)([A-Za-z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]+))?)*)\s*(\/?)>$/;
const ATTR = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s>]+)))?/g;
function remarkHtmlPairer(this: any) {
  const pairer = plateTagsFromMarkdown(TAGS).transforms[0];
  const visit = (node: any, flow: boolean) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.map((child: any) => {
      visit(child, child.type !== 'paragraph' && child.type !== 'heading' && child.type !== 'tableCell' && flow);
      if (child.type !== 'html') return child;
      const m = SINGLE_TAG.exec(child.value.trim());
      if (!m || !Object.hasOwn(TAGS, m[2])) return child;
      const attributes = [...m[3].matchAll(ATTR)].map((a) => ({
        name: a[1],
        value: a[4] !== undefined ? { expression: a[4] } : (a[2] ?? a[3] ?? a[5] ?? null),
      }));
      return {
        flow,
        position: child.position,
        raw: child.value,
        tag: { attributes, closing: m[1] === '/', name: m[2], selfClosing: m[4] === '/' },
        type: 'plateTagMarker',
      };
    });
  };
  return (tree: any) => {
    visit(tree, true);
    pairer(tree);
  };
}
const PAIRER_PLUGINS = [remarkMath, remarkGfm, remarkEmoji, remarkHtmlPairer, remarkMention] as any[];
const pairerParse = (source: string) =>
  md.parse(source, { remarkPlugins: PAIRER_PLUGINS, withoutMdx: true });

// ---------------------------------------------------------------------------
// Legacy corpus: documents serialized by the current MDX writer.

export const LEGACY_SOURCES = [
  '<callout icon="💡">\n  Tip with **bold** and <u>underline</u>.\n</callout>',
  '<details>\n  <summary>Title *x*</summary>\n\n  Body paragraph.\n\n  - item\n</details>',
  '<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n  <column width="50%">\n    <callout icon="🔥">\n      Deep\n    </callout>\n  </column>\n</columnGroup>',
  'Text with <kbd>Ctrl</kbd>, <sup>2</sup>, <sub>i</sub>, <mark>hi</mark>, <del>x</del>.',
  'Colors <span style="color: red;">red</span>, <span style="background-color: yellow;">bg</span>, <span style="font-size: 20px;">big</span>, <span style="font-family: serif;">ff</span>, <span style="font-weight: 700;">w</span>.',
  '<toc />',
  '- one\n  - nested <u>u</u>\n- two <kbd>k</kbd>',
  '> quote with <kbd>k</kbd> and <u>u</u>',
  '| a | b |\n| - | - |\n| <u>x</u> | <kbd>y</kbd> |',
  'Footnote[^1].\n\n[^1]: Note with <u>u</u>.',
  '```js\nconst a = <div/>;\n```',
  '$$\nx^2\n$$\n\nInline $a<b$ math.',
  '<callout icon="📌">\n  Callout **one**\n</callout>\n\n<callout>\n  Second\n</callout>',
  '1. first <u>u</u>\n2. second\n   <callout>\n     In list\n   </callout>',
];

// `testValue` is not schema-valid (a blockquote holds text directly), so it
// is not part of the corpus.
const legacyDocs: { label: string; document: any }[] = [];
const skippedLegacy: string[] = [];
for (const [index, source] of LEGACY_SOURCES.entries()) {
  const parsed = attempt(() => refParse(source, { lossPolicy: 'allow' }));
  if (parsed.value?.ok) legacyDocs.push({ label: `src${index}`, document: parsed.value.document });
  else skippedLegacy.push(`src${index}: ${parsed.threw ?? JSON.stringify(parsed.value?.diagnostics?.[0]?.message)}`);
}
const legacy = legacyDocs.flatMap(({ document, label }) => {
  const out = attempt(() => refSerialize(document));
  if (out.value?.ok) return [{ data: out.value.data as string, document, label }];
  skippedLegacy.push(`${label} (serialize): ${out.threw ?? out.value?.diagnostics?.[0]?.message}`);
  return [];
});

// Inputs written by hand the way people and models write them: no indentation,
// no blank lines, HTML-style attributes. MDX accepts all of these too.
const HAND_FIXTURES = [
  '<columnGroup>\n<column width="50%">\nleft\n</column>\n<column width="50%">\nright\n</column>\n</columnGroup>',
  '<details>\n<summary>Title</summary>\n\nbody **x**\n\n</details>',
  '<details>\n<summary>Title</summary>\nbody\n</details>',
  '<callout icon="💡">\nhello **world**\n</callout>',
  '<callout icon="💡">hello</callout>',
  '- item\n\n  <callout>\n  in list\n  </callout>',
  '> <callout>\n> quoted\n> </callout>',
  'para\n<callout>\ninterrupt\n</callout>',
];

// ---------------------------------------------------------------------------

const sections: { name: string; ok: boolean; lines: string[] }[] = [];
const section = (name: string, ok: boolean, lines: string[]) => sections.push({ lines, name, ok });

// G0 registry covers every non-MDAST decode source
{
  const sources = [...compileMarkdownMappings(editor as any).decodeBySource.keys()];
  const missing = sources.filter((s) => !MDAST_TYPES.has(s) && !Object.hasOwn(TAGS, s));
  section('G0 registry covers installed tag mappings', missing.length === 0, [
    `decode sources: ${sources.length}; unregistered non-MDAST: ${missing.join(', ') || 'none'}`,
  ]);
}

// G1 CommonMark identity
const specPath = path.join(tmpdir(), 'commonmark-0.31.2-spec.json');
if (!existsSync(specPath)) {
  const response = await fetch('https://spec.commonmark.org/0.31.2/spec.json');
  writeFileSync(specPath, await response.text());
}
const spec: { example: number; markdown: string }[] = JSON.parse(readFileSync(specPath, 'utf8'));
{
  const registeredMention = new RegExp(`</?(${Object.keys(TAGS).join('|')})[\\s/>]`);
  const run = (extra: any[]) => {
    const plain = unified().use(remarkParse).use(extra);
    const cand = unified().use(remarkParse).use(extra).use(remarkPlateTags, { tags: TAGS });
    const expected: number[] = [];
    const unexpected: number[] = [];
    for (const { example, markdown } of spec) {
      const a = attempt(() => plain.runSync(plain.parse(markdown)));
      const c = attempt(() => cand.runSync(cand.parse(markdown)));
      if (c.threw) { unexpected.push(example); continue; }
      if (same(a.value, c.value)) continue;
      (registeredMention.test(markdown) ? expected : unexpected).push(example);
    }
    return { expected, unexpected };
  };
  const cm = run([]);
  const gfm = run([remarkGfm, remarkMath]);
  section('G1 CommonMark identity (spec 0.31.2, 652 examples)', cm.unexpected.length === 0 && gfm.unexpected.length === 0, [
    `CommonMark: ${spec.length - cm.expected.length - cm.unexpected.length} identical, ${cm.expected.length} differ by containing a registered tag ${dim(`[${cm.expected.join(', ')}]`)}, ${cm.unexpected.length} unexpected ${cm.unexpected.join(', ')}`,
    `+GFM+math: ${spec.length - gfm.expected.length - gfm.unexpected.length} identical, ${gfm.expected.length} registered-tag diffs, ${gfm.unexpected.length} unexpected ${gfm.unexpected.join(', ')}`,
  ]);
}

// G2 never throws
{
  const alphabet = ['<', '>', '/', '"', "'", '{', '}', '=', ' ', '  ', '\n', '\n\n', '\t', 'callout', 'u', 'details', 'summary', 'column', 'columnGroup', 'toc', 'img', 'span', 'div', 'a', 'x', '*', '-', '> ', '`', '|', '#', '1.', '&quot;', 'icon', 'https://x.y', '$', '[', ']', '(', ')'];
  let seed = 42;
  const rand = () => ((seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31) / 2 ** 31);
  const samples = Array.from({ length: 20_000 }, () =>
    Array.from({ length: 1 + Math.floor(rand() * 40) }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('')
  );
  const mdastCand = unified().use(remarkParse).use(CANDIDATE_PLUGINS);
  let mdastThrows = 0;
  const plateThrows = new Map<string, number>();
  let candOk = 0;
  let refOk = 0;
  const refThrows = new Map<string, number>();
  let firstMdastThrow = '';
  let firstPlateThrow = '';
  for (const s of samples) {
    const m = attempt(() => mdastCand.runSync(mdastCand.parse(s)));
    if (m.threw) { mdastThrows++; firstMdastThrow ||= `${JSON.stringify(s)} → ${m.threw}`; }
    const c = attempt(() => candParse(s, { lossPolicy: 'allow' }));
    if (c.threw) { plateThrows.set(c.threw.split(':')[0], (plateThrows.get(c.threw.split(':')[0]) ?? 0) + 1); firstPlateThrow ||= `${JSON.stringify(s)} → ${c.threw}`; }
    else if (c.value?.ok) candOk++;
    const r = attempt(() => refParse(s, { lossPolicy: 'allow' }));
    if (r.threw) refThrows.set(r.threw.split(':')[0], (refThrows.get(r.threw.split(':')[0]) ?? 0) + 1);
    else if (r.value?.ok) refOk++;
  }
  section('G2 grammar is total (20k fuzz strings; totality, not fidelity)', mdastThrows === 0, [
    `candidate mdast throws: ${mdastThrows} ${firstMdastThrow}`,
    `Plate parse returns ok under lossPolicy 'allow' (no fidelity claim) — candidate ${candOk}/20000, current MDX kit ${refOk}/20000`,
    `Plate parse() throws — candidate ${JSON.stringify(Object.fromEntries(plateThrows))} ${dim(firstPlateThrow)}; current ${JSON.stringify(Object.fromEntries(refThrows))}`,
  ]);
}

// G3 legacy reads (+ kill check for the MDAST pairer)
{
  const lines: string[] = [];
  let candSame = 0;
  let pairerSame = 0;
  for (const { data, label } of legacy) {
    const ref = docOf(refParse(data, { lossPolicy: 'allow' }));
    const cand = attempt(() => docOf(candParse(data, { lossPolicy: 'allow' })));
    const pair = attempt(() => docOf(pairerParse(data)));
    if (same(ref, cand.value)) candSame++;
    else lines.push(`candidate ≠ MDX on ${label}: ${cand.threw ?? diff(ref, cand.value)}`);
    if (same(ref, pair.value)) pairerSame++;
  }
  section(`G3 legacy MDX output reads identically (${legacy.length} docs)`, candSame === legacy.length, [
    `candidate: ${candSame}/${legacy.length}; MDAST html pairer (kill check): ${pairerSame}/${legacy.length}`,
    ...(skippedLegacy.length > 0 ? [dim(`sources the current kit itself rejects: ${skippedLegacy.join(' | ')}`)] : []),
    ...lines,
  ]);
}

// G4 nesting without blank lines / hand-written tags
{
  const lines: string[] = [];
  let candSame = 0;
  let pairerSame = 0;
  let refFails = 0;
  for (const source of HAND_FIXTURES) {
    const ref = attempt(() => refParse(source, { lossPolicy: 'allow' }));
    const cand = attempt(() => candParse(source, { lossPolicy: 'allow' }));
    const pair = attempt(() => pairerParse(source));
    const refDoc = ref.threw ?? docOf(ref.value);
    if (ref.threw || !ref.value?.ok) refFails++;
    const status = (x: any) => x.threw ? 'throws' : x.value?.ok ? 'ok' : `fails ${x.value?.diagnostics?.[0]?.code}`;
    lines.push(dim(`${JSON.stringify(source)} → MDX ${status(ref)}, candidate ${status(cand)}, pairer ${status(pair)}`));
    if (!cand.value?.ok) lines.push(`  candidate does not read this fixture (${status(cand)})`);
    else if (same(refDoc, docOf(cand.value))) candSame++;
    else if (ref.threw || !ref.value?.ok) { candSame++; lines.push(`  improvement (MDX rejects, candidate reads): ${short(docOf(cand.value))}`); }
    else lines.push(`${JSON.stringify(source)}\n      MDX:  ${short(refDoc)}\n      cand: ${short(cand.threw ?? docOf(cand.value))}`);
    if (same(refDoc, pair.threw ?? docOf(pair.value))) pairerSame++;
  }
  section(`G4 hand-written nesting reads correctly (${HAND_FIXTURES.length} fixtures)`, candSame === HAND_FIXTURES.length, [
    `candidate reads ${candSame}/${HAND_FIXTURES.length} (identical to MDX or MDX rejects); MDAST pairer identical: ${pairerSame}/${HAND_FIXTURES.length}; MDX itself failed/threw on ${refFails}`,
    ...lines,
  ]);
}

// G5 unclosed tag at EOF + every streaming prefix
{
  const eof = unified().use(remarkParse).use(remarkPlateTags, { tags: TAGS }).parse('<callout icon="x">\n\nhello **wor');
  const el: any = eof.children[0];
  const eofOk = el?.type === 'mdxJsxFlowElement' && el.data?.plateUnclosed === true && el.children[0]?.type === 'paragraph';
  let prefixes = 0;
  let candOk = 0;
  let candThrow = 0;
  let refOk = 0;
  let leaks = 0;
  let trimmedLeaks = 0;
  const failCodes = new Map<string, number>();
  const leakPattern = new RegExp(`</?(${Object.keys(TAGS).join('|')})\\b`);
  for (const { data } of legacy) {
    for (let end = 1; end <= data.length; end++) {
      const prefix = data.slice(0, end);
      prefixes++;
      const c = attempt(() => candParse(prefix, { lossPolicy: 'allow' }));
      if (c.threw) candThrow++;
      else if (c.value?.ok) {
        candOk++;
        if (leakPattern.test(JSON.stringify(c.value.document))) leaks++;
      } else {
        const code = `${c.value?.diagnostics?.[0]?.code}: ${c.value?.diagnostics?.[0]?.message}`.slice(0, 90);
        failCodes.set(code, (failCodes.get(code) ?? 0) + 1);
      }
      const t = attempt(() => candParse(trimIncompleteTagTail(prefix, TAGS), { lossPolicy: 'allow' }));
      if (t.value?.ok && leakPattern.test(JSON.stringify(t.value.document))) trimmedLeaks++;
      const r = attempt(() => refParse(prefix, { lossPolicy: 'allow', recovery: 'incomplete-stream' }));
      if (r.value?.ok) refOk++;
    }
  }
  section('G5 unclosed tags stay open to EOF; every prefix parses', eofOk && candThrow === 0, [
    `'<callout icon="x">\\n\\nhello **wor' → ${el?.type} unclosed=${el?.data?.plateUnclosed} children=${el?.children?.map((c: any) => c.type)}`,
    `${prefixes} prefixes: candidate ok ${candOk}, throws ${candThrow}; current MDX + incomplete-stream recovery ok ${refOk}`,
    `prefixes whose candidate document shows a partial tag as text: ${leaks}; with trimIncompleteTagTail: ${trimmedLeaks}`,
    `candidate non-ok prefixes by first diagnostic: ${JSON.stringify(Object.fromEntries(failCodes))}`,
  ]);
}

// G6 exact offsets
{
  let checked = 0;
  const bad: string[] = [];
  const cand = unified().use(remarkParse).use(CANDIDATE_PLUGINS);
  const walk = (node: any, source: string) => {
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      checked++;
      const slice = source.slice(node.position.start.offset, node.position.end.offset);
      const closedOk = node.data?.plateUnclosed || slice.endsWith(`</${node.name}>`) || slice.endsWith('/>') || (TAGS[node.name]?.void && slice.endsWith('>'));
      if (!slice.startsWith(`<${node.name}`) || !closedOk) bad.push(`${node.name}: ${JSON.stringify(slice.slice(0, 60))}`);
    }
    node.children?.forEach((child: any) => walk(child, source));
  };
  for (const source of [...legacy.map((l) => l.data), ...HAND_FIXTURES]) walk(cand.runSync(cand.parse(source)), source);
  const withUnknown = 'Intro paragraph.\n\n<callout>\nok\n</callout>\n\nThen <blink>x</blink> `<img src=x>` <!-- c --> tail';
  const diag = candParse(withUnknown);
  const refDiag = refParse(withUnknown);
  section('G6 tag-element boundaries slice exactly to their source', bad.length === 0, [
    `${checked} elements checked; bad: ${bad.length} ${bad.slice(0, 3).join(' | ')}; split-paragraph remainders not checked (approximate)`,
    `document with unknown HTML → candidate: ok=${diag.ok} ${short(diag.ok ? diag.document : diag.diagnostics)}`,
    `                              current:   ok=${refDiag.ok} ${short(refDiag.ok ? refDiag.document : refDiag.diagnostics)}`,
  ]);
}

// G7 new writer round trip + no accidental indented code
{
  let sameRoundTrip = 0;
  let deepIndent = 0;
  let mdxReadsNew = 0;
  const lines: string[] = [];
  for (const { document, label } of legacy) {
    const refRt = docOf(refParse((refSerialize(document) as any).data, { lossPolicy: 'allow' }));
    const out = attempt(() => candSerialize(document));
    const data = (out.value as any)?.data as string | undefined;
    const candRt = data === undefined ? out.threw : docOf(candParse(data, { lossPolicy: 'allow' }));
    if (same(refRt, candRt)) sameRoundTrip++;
    if (data !== undefined && same(refRt, docOf(attempt(() => refParse(data, { lossPolicy: 'allow' })).value))) mdxReadsNew++;
    else lines.push(`${label}: ${typeof candRt === 'string' ? candRt : diff(refRt, candRt)}`);
    let fenced = false;
    for (const line of (data ?? '').split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      else if (!fenced && /^ {4,}\S/.test(line)) deepIndent++;
    }
  }
  const sample = (candSerialize(legacyDocs.find((d) => d.label === 'src2')!.document) as any).data;
  section('G7 CommonMark-friendly writer round-trips like MDX', sameRoundTrip === legacy.length && deepIndent === 0, [
    `round trips equal to MDX round trip: ${sameRoundTrip}/${legacy.length}; lines indented ≥4 outside fences: ${deepIndent}; current MDX kit reads new output identically: ${mdxReadsNew}/${legacy.length}`,
    (() => {
      const braces = { children: [{ children: [{ text: 'Hello {name} and a < b and x<y' }], type: 'paragraph' }] };
      const out = (candSerialize(braces) as any).data;
      const back = attempt(() => refParse(out));
      return `text with braces → new writer ${JSON.stringify(out)} → MDX kit ${back.threw ?? (back.value?.ok ? 'ok' : back.value?.diagnostics?.[0]?.code)}; candidate ${candParse(out).ok ? 'ok' : 'fails'}`;
    })(),
    ...lines,
    dim(`sample (columns):\n${sample}`),
  ]);
}

// G8 inputs the current kit rejects or corrupts
{
  const cases = [
    'Array<string> is a type',
    'x<y and 3<4',
    'see <https://example.com>',
    'Hello {name}, cost is {',
    'a\n\n<!-- note -->\n\nb',
    'text\n\n    const x = 1;\n\nmore',
    '| a | b |\n| - | - |\n| x<br>y | z |',
    '`<img src=x>`',
    'a <callout>b</callout> c',
  ];
  const lines = cases.map((source) => {
    const r = attempt(() => refParse(source));
    const c = attempt(() => candParse(source));
    const view = (x: any) => x.threw ?? (x.value.ok ? `ok ${short(x.value.document, 110)}` : `FAIL ${x.value.diagnostics[0]?.code}`);
    return `${JSON.stringify(source)}\n      current: ${view(r)}\n      cand:    ${view(c)}`;
  });
  section('G8 previously rejected/corrupted inputs', true, lines);
}

// B1/B2 cost
{
  const big = Array.from({ length: 40 }, () => legacy.map((l) => l.data).join('\n\n')).join('\n\n');
  const time = (fn: () => void, runs = 5) => {
    fn();
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) fn();
    return (performance.now() - t0) / runs;
  };
  const refMs = time(() => refParse(big, { lossPolicy: 'allow' }));
  const candMs = time(() => candParse(big, { lossPolicy: 'allow' }));
  const mdastPlain = unified().use(remarkParse).use([remarkMath, remarkGfm]);
  const mdastCand = unified().use(remarkParse).use([remarkMath, remarkGfm]).use(remarkPlateTags, { tags: TAGS });
  const plainMs = time(() => mdastPlain.parse(big));
  const tagMs = time(() => mdastCand.parse(big));
  const stream = legacy.map((l) => l.data).join('\n\n');
  const prefixes = Array.from({ length: Math.ceil(stream.length / 32) }, (_, i) => stream.slice(0, (i + 1) * 32));
  const refStream = time(() => prefixes.forEach((p) => refParse(p, { lossPolicy: 'allow', recovery: 'incomplete-stream' })), 1);
  const candStream = time(() => prefixes.forEach((p) => candParse(p, { lossPolicy: 'allow' })), 1);
  const answer = Array.from({ length: 12 }, (_, i) => `## Step ${i + 1}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`).join('\n');
  const answerPrefixes = Array.from({ length: Math.ceil(answer.length / 32) }, (_, i) => answer.slice(0, (i + 1) * 32));
  let refAnswerOk = 0;
  let candAnswerOk = 0;
  const refAnswer = time(() => answerPrefixes.forEach((p) => { if (refParse(p, { lossPolicy: 'allow', recovery: 'incomplete-stream' }).ok) refAnswerOk++; }), 1);
  const candAnswer = time(() => answerPrefixes.forEach((p) => { if (candParse(trimIncompleteTagTail(p, TAGS), { lossPolicy: 'allow' }).ok) candAnswerOk++; }), 1);
  const refFinal = refParse(answer);
  const candFinal = candParse(answer);
  section('B cost (single-run timings; smoke check only, Benchmark owns measurement)', true, [
    `AI-style answer ${(answer.length / 1024).toFixed(1)} KB, ${answerPrefixes.length} accumulated prefixes (current path truncates, so not comparable): current+recovery ${refAnswer.toFixed(0)} ms (ok ${refAnswerOk / 2}/${answerPrefixes.length}), candidate+tail trim ${candAnswer.toFixed(0)} ms (ok ${candAnswerOk / 2}/${answerPrefixes.length})`,
    `same answer, final strict parse: current ok=${refFinal.ok}${refFinal.ok ? '' : ` (${refFinal.diagnostics[0]?.code})`}, candidate ok=${candFinal.ok}`,
    `full Plate parse of ${(big.length / 1024).toFixed(0)} KB: current MDX ${refMs.toFixed(1)} ms, candidate ${candMs.toFixed(1)} ms`,
    `mdast only: CommonMark+GFM+math ${plainMs.toFixed(1)} ms, + Plate tags ${tagMs.toFixed(1)} ms`,
    `streaming ${prefixes.length} accumulated prefixes of ${(stream.length / 1024).toFixed(1)} KB: current+recovery ${refStream.toFixed(0)} ms, candidate ${candStream.toFixed(0)} ms`,
  ]);
}

function short(value: unknown, max = 220) {
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
function diff(a: unknown, c: unknown) {
  const x = JSON.stringify(a) ?? '';
  const y = JSON.stringify(c) ?? '';
  let i = 0;
  while (i < x.length && x[i] === y[i]) i++;
  return `at ${i}: MDX …${x.slice(Math.max(0, i - 40), i + 80)}… vs cand …${y.slice(Math.max(0, i - 40), i + 80)}…`;
}

// ---------------------------------------------------------------------------

console.log(`\n${b('Markdown dialect prototype — CommonMark + registered Plate tags')}\n`);
for (const { lines, name, ok } of sections) {
  console.log(`${pass(ok)} ${b(name)}`);
  for (const line of lines) console.log(`   ${line}`);
  console.log('');
}

if (process.argv.includes('repl')) {
  const mdastCand = unified().use(remarkParse).use(CANDIDATE_PLUGINS);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const strip = (node: any): any => {
    const { position: _p, ...rest } = node;
    return rest.children ? { ...rest, children: rest.children.map(strip) } : rest;
  };
  const frame = (source: string) => {
    console.clear();
    console.log(`${b('source')} ${dim('(type Markdown; \\n = newline; empty line quits)')}\n${source}\n`);
    console.log(`${b('candidate mdast')}\n${JSON.stringify(strip(mdastCand.runSync(mdastCand.parse(source))), null, 1)}\n`);
    const c = candParse(source, { lossPolicy: 'allow' });
    console.log(`${b('candidate Plate')} ${JSON.stringify(c.ok ? c.document.children : c.diagnostics)}`);
    const r = attempt(() => refParse(source, { lossPolicy: 'allow' }));
    console.log(`${b('current MDX kit')} ${r.threw ?? JSON.stringify(r.value?.ok ? r.value.document.children : r.value?.diagnostics)}\n`);
  };
  frame('<callout icon="💡">\nhello **world**\n</callout>');
  rl.on('line', (line) => {
    if (!line) return rl.close();
    frame(line.replaceAll('\\n', '\n'));
  });
}
