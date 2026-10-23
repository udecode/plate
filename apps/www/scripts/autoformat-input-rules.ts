import { type ChildProcess, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual, parseArgs } from 'node:util';

import { parse } from '@babel/parser';

import {
  enforceBaseline,
  groupFindings,
  readBaseline,
} from '../../../tooling/scripts/finding-baseline.mjs';

const BASELINE = 'apps/www/scripts/autoformat-input-rules-baseline.json';
const SUBSTITUTIONS = 'apps/www/src/registry/components/editor/autoformat.tsx';
const MARKS = 'apps/www/src/registry/components/editor/basic-marks.tsx';
const FACTORIES =
  'packages/platejs/src/lib/plugins/input-rules/createInputRules.ts';
const RUNNER =
  'packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts';
const RULES = {
  blocks: {
    help: 'a typed sequence that changes a paragraph it was not typed in',
    name: 'autoformat-blocks',
  },
  declared: {
    help: 'a shorthand the kit declares that typing does not apply whole',
    name: 'autoformat-declared',
  },
  undo: {
    help: 'a keystroke whose rule one undo does not take back',
    name: 'autoformat-undo',
  },
} as const;
const RULE_NAMES = Object.values(RULES).map(({ name }) => name);
const GATE_LENGTH = 3;
const DEFAULT_JOBS = Math.min(availableParallelism(), 8);
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

type Marks = Record<string, string | true>;
type Leaf = Marks & { text: string };
type Block = { children: Leaf[]; type: string };
type Leaves = Array<[string, Marks]>;
type Context = 'bold' | 'intra' | 'start' | 'word';
type Expectation = { file: string; identity: string } & (
  | { kind: 'gives'; leaves: Leaves }
  | { kind: 'literal'; marks: string[] }
);
type Case = { context: Context; expectations: Expectation[]; typed: string };
type Failure = { detail: string; file: string; identity: string; rule: string };
type MarkSyntax = {
  close: string;
  intraWord?: true;
  marks: Marks;
  open: string;
};

const CONTEXTS: Record<Context, Leaf> = {
  bold: { bold: true, text: 'w ' },
  intra: { text: 'w' },
  start: { text: '' },
  word: { text: 'w ' },
};
const SHORTHAND_CONTEXTS = ['start', 'word', 'bold'] as const;
const ABOVE: Block = { children: [{ text: 'x' }], type: 'paragraph' };
const BELOW: Block = { children: [{ text: 'y' }], type: 'paragraph' };

const EXPECTED_MARK_SYNTAX: Record<string, MarkSyntax> = {
  'BoldRules *': { close: '**', marks: { bold: true }, open: '**' },
  'BoldRules _': { close: '__', marks: { bold: true }, open: '__' },
  CodeRules: { close: '`', marks: { code: true }, open: '`' },
  'HighlightRules ==': { close: '==', marks: { highlight: true }, open: '==' },
  'HighlightRules ≡': { close: '≡', marks: { highlight: true }, open: '≡' },
  'ItalicRules *': { close: '*', marks: { italic: true }, open: '*' },
  'ItalicRules _': { close: '_', marks: { italic: true }, open: '_' },
  'MarkComboRules boldItalic': {
    close: '***',
    marks: { bold: true, italic: true },
    open: '***',
  },
  'MarkComboRules boldItalicUnderline': {
    close: '***___',
    marks: { bold: true, italic: true, underline: true },
    open: '___***',
  },
  'MarkComboRules boldUnderline': {
    close: '**__',
    marks: { bold: true, underline: true },
    open: '__**',
  },
  'MarkComboRules italicUnderline': {
    close: '*__',
    marks: { italic: true, underline: true },
    open: '__*',
  },
  'ScriptRules sub': {
    close: '~',
    intraWord: true,
    marks: { script: 'sub' },
    open: '~',
  },
  'ScriptRules sup': {
    close: '^',
    intraWord: true,
    marks: { script: 'sup' },
    open: '^',
  },
  StrikethroughRules: {
    close: '~~',
    marks: { strikethrough: true },
    open: '~~',
  },
  UnderlineRules: { close: '__', marks: { underline: true }, open: '__' },
};

const leavesOf = (children: readonly Leaf[]) => {
  const leaves: Leaves = [];
  for (const { text, ...marks } of children) {
    if (text === '') continue;
    const last = leaves.at(-1);
    if (last && isDeepStrictEqual(last[1], marks)) last[0] += text;
    else leaves.push([text, marks]);
  }
  return leaves;
};
const showLeaves = (leaves: Leaves) =>
  leaves
    .map(([text, marks]) => {
      const names = Object.entries(marks).map(([key, value]) =>
        value === true ? key : `${key}=${value}`
      );
      return names.length > 0
        ? `${JSON.stringify(text)}⟨${names.join(',')}⟩`
        : JSON.stringify(text);
    })
    .join(' ') || '""';
const showBlocks = (blocks: readonly Block[]) =>
  blocks.map((block) => showLeaves(leavesOf(block.children))).join(' | ');
const textOf = (block: Block) =>
  block.children.map((leaf) => leaf.text).join('');
const identityOf = (typed: string, context: Context, label?: string) =>
  `${label === undefined ? '' : `${label} `}${JSON.stringify(typed)} at ${context}`;

const options = (() => {
  try {
    return parseArgs({
      args: process.argv.slice(2),
      options: {
        init: { type: 'boolean' },
        jobs: { type: 'string' },
        length: { type: 'string' },
        lower: { type: 'boolean' },
        typed: { type: 'string' },
      },
      strict: true,
    }).values;
  } catch (error) {
    console.error(`${String(error)} A flag takes the form --length=4.`);
    return process.exit(2);
  }
})();
const whole = (name: 'jobs' | 'length', fallback: number) => {
  const value = Number(options[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1) {
    console.error(`--${name} takes a whole number of at least 1.`);
    process.exit(2);
  }
  return value;
};

const loadKits = async () => {
  const [
    { createEditor },
    { AutoformatKit },
    { BasicMarksKit },
    { getPlateRuntime },
  ] = await Promise.all([
    import('platejs/react'),
    import('../src/registry/components/editor/autoformat'),
    import('../src/registry/components/editor/basic-marks'),
    import('../../../packages/platejs/src/internal/plugin/compilePlateModel'),
  ]);
  const plugins = [...BasicMarksKit, ...AutoformatKit];
  return {
    open: (context: Context) => {
      const leaf = CONTEXTS[context];
      const caret = { offset: leaf.text.length, path: [1, 0] };
      return createEditor({
        initialValue: [ABOVE, { children: [leaf], type: 'paragraph' }, BELOW],
        plugins,
        selection: { anchor: caret, focus: caret, kind: 'text' },
      });
    },
    rules: getPlateRuntime(createEditor({ plugins })).inputRules.insertText.all
      .length,
  };
};
type Kits = Awaited<ReturnType<typeof loadKits>>;

const blocksKept = (blocks: readonly Block[]) =>
  blocks.length === 3 &&
  isDeepStrictEqual(blocks[0], ABOVE) &&
  isDeepStrictEqual(blocks[2], BELOW);

const caretParagraph = (blocks: readonly Block[]) =>
  blocksKept(blocks)
    ? leavesOf(blocks[1].children)
    : withoutJoinedBelow(blocks);

const withoutJoinedBelow = (blocks: readonly Block[]): Leaves | undefined => {
  const leaves = leavesOf(blocks[1]?.children ?? []);
  const last = leaves.at(-1);
  const below = textOf(BELOW);
  if (
    blocks.length !== 2 ||
    !isDeepStrictEqual(blocks[0], ABOVE) ||
    !last ||
    Object.keys(last[1]).length > 0 ||
    !last[0].endsWith(below)
  ) {
    return undefined;
  }
  const kept = last[0].slice(0, -below.length);
  return kept === ''
    ? leaves.slice(0, -1)
    : [...leaves.slice(0, -1), [kept, last[1]]];
};

const fired = (
  before: readonly Block[],
  after: readonly Block[],
  key: string
) => {
  if (!blocksKept(after)) return true;
  const chars = (block: Block) =>
    leavesOf(block.children).flatMap(([text, marks]) =>
      Array.from(text, (char) => [char, marks])
    );
  const prefix = chars(before[1]);
  return (
    textOf(after[1]) !== textOf(before[1]) + key ||
    !isDeepStrictEqual(chars(after[1]).slice(0, prefix.length), prefix)
  );
};

const judge = (
  expectation: Expectation,
  caret: Leaves | undefined,
  after: readonly Block[]
) => {
  if (expectation.kind === 'gives') {
    return caret && isDeepStrictEqual(caret, expectation.leaves)
      ? undefined
      : `  expected "x" | ${showLeaves(expectation.leaves)} | "y"\n  got      ${showBlocks(after)}`;
  }
  const marked = caret?.some(([, marks]) =>
    expectation.marks.some((key) => key in marks)
  );
  return caret && !marked
    ? undefined
    : `  expected no ${expectation.marks.join(' or ')} mark\n  got      ${showBlocks(after)}`;
};

const runCase = (kits: Kits, { context, expectations, typed }: Case) => {
  const editor = kits.open(context);
  const keys = Array.from(typed);
  const last = keys.pop() ?? '';
  for (const key of keys) editor.update.text.insert(key);
  const read = () =>
    JSON.parse(JSON.stringify(editor.read.children())) as Block[];
  const before = read();
  editor.update.text.insert(last);
  const after = read();
  const failures: Failure[] = [];
  const typing = `  ${showBlocks(before)}  then ${JSON.stringify(last)}  gives ${showBlocks(after)}`;

  if (!blocksKept(after)) {
    failures.push({
      detail: typing,
      file: FACTORIES,
      identity: identityOf(typed, context),
      rule: RULES.blocks.name,
    });
  }
  const caret = caretParagraph(after);
  for (const expectation of expectations) {
    const detail = judge(expectation, caret, after);
    if (detail !== undefined) {
      failures.push({
        detail,
        file: expectation.file,
        identity: expectation.identity,
        rule: RULES.declared.name,
      });
    }
  }
  if (fired(before, after, last)) {
    const undone = editor.api.history.undo();
    const restored = read();
    if (undone.status !== 'applied' || !isDeepStrictEqual(restored, before)) {
      failures.push({
        detail: `${typing}\n  one undo gives ${showBlocks(restored)} (${undone.status})`,
        file: RUNNER,
        identity: identityOf(typed, context),
        rule: RULES.undo.name,
      });
    }
  }
  return failures;
};

const plan = ({ marks, substitutions }: Declarations, length: number) => {
  const producers = new Map<string, string>();
  for (const { format, matches } of substitutions) {
    if (typeof format === 'string' && /[^ -~]/.test(format)) {
      producers.set(format, matches[0]);
    }
  }
  const keysFor = (text: string, seen = new Set<string>()): string =>
    Array.from(text)
      .map((char) => {
        if (/[ -~]/.test(char)) return char;
        const source = producers.get(char);
        if (source === undefined || seen.has(char)) {
          console.error(
            `No key or rule types ${JSON.stringify(char)} in ${JSON.stringify(text)}, so the check cannot reach its rule.`
          );
          process.exit(2);
        }
        return keysFor(source, new Set([...seen, char]));
      })
      .join('');

  const cases = new Map<string, Case>();
  const caseFor = (context: Context, typed: string) => {
    const key = `${context}\u0000${typed}`;
    const found = cases.get(key) ?? { context, expectations: [], typed };
    cases.set(key, found);
    return found;
  };
  const expect = (
    context: Context,
    typed: string,
    expectation: Expectation
  ) => {
    const { expectations } = caseFor(context, typed);
    const same = expectations.find(
      ({ identity }) => identity === expectation.identity
    );
    if (same && !isDeepStrictEqual(same, expectation)) {
      console.error(
        `${expectation.identity} has two different expectations, so two patterns of its rule contradict each other.`
      );
      process.exit(2);
    }
    if (!same) expectations.push(expectation);
  };
  const caretLeaves = (context: Context, text: string, added: Marks = {}) => {
    const { text: before, ...surrounding } = CONTEXTS[context];
    return leavesOf([
      { ...surrounding, text: before },
      { ...surrounding, ...added, text },
    ]);
  };

  for (const { format, label, matches } of substitutions) {
    for (const match of matches) {
      const source = keysFor(match);
      const [typed, text] =
        typeof format === 'string'
          ? [source, format]
          : [`${source}a${source}`, `${format[0]}a${format[1]}`];
      for (const context of SHORTHAND_CONTEXTS) {
        expect(context, typed, {
          file: SUBSTITUTIONS,
          identity: identityOf(typed, context, label),
          kind: 'gives',
          leaves: caretLeaves(context, text),
        });
      }
    }
  }

  const collidingContents = (open: string, close: string) => {
    const delimiters = new Set(open + close);
    const contents = new Map([['', 'a']]);
    for (const { label, matches } of substitutions) {
      for (const match of matches) {
        const keys = Array.from(keysFor(match));
        for (const [at, second] of keys.entries()) {
          const first = keys[at - 1];
          if (first === undefined) continue;
          const [side, content] =
            first === open.at(-1) && !delimiters.has(second)
              ? ['open', second]
              : second === close[0] && !delimiters.has(first)
                ? ['close', first]
                : [];
          const key = `${side} ${label}`;
          if (content && !/\s/.test(content) && !contents.has(key)) {
            contents.set(key, content);
          }
        }
      }
    }
    return new Set(contents.values());
  };
  for (const { label, syntax } of marks) {
    const open = keysFor(syntax.open);
    const close = keysFor(syntax.close);
    for (const content of collidingContents(open, close)) {
      const typed = `${open}${content}${close}`;
      for (const context of SHORTHAND_CONTEXTS) {
        expect(context, typed, {
          file: MARKS,
          identity: identityOf(typed, context, label),
          kind: 'gives',
          leaves: caretLeaves(context, content, syntax.marks),
        });
      }
      const identity = identityOf(typed, 'intra', label);
      expect(
        'intra',
        typed,
        syntax.intraWord
          ? {
              file: MARKS,
              identity,
              kind: 'gives',
              leaves: caretLeaves('intra', content, syntax.marks),
            }
          : {
              file: MARKS,
              identity,
              kind: 'literal',
              marks: Object.keys(syntax.marks),
            }
      );
    }
  }

  const alphabet = [
    ...new Set([
      'a',
      ...substitutions.flatMap(({ matches }) =>
        matches
          .map((match) => keysFor(match))
          .filter((source) => !/[\p{L}\p{N}]/u.test(source))
          .flatMap((source) => Array.from(source))
      ),
      ...marks.flatMap(({ syntax }) =>
        Array.from(keysFor(syntax.open + syntax.close))
      ),
    ]),
  ].sort();
  let sequences = [''];
  for (let size = 1; size <= length; size++) {
    sequences = sequences.flatMap((sequence) =>
      alphabet.map((char) => sequence + char)
    );
    for (const sequence of sequences) caseFor('start', sequence);
  }
  return { alphabet: alphabet.join(''), cases: [...cases.values()] };
};

const fanOut = async (cases: readonly Case[], jobs: number) => {
  const shards: ChildProcess[] = [];
  try {
    return await Promise.all(
      Array.from(
        { length: jobs },
        (_, index) =>
          new Promise<{ failures: Failure[]; rules: number }>(
            (resolve, reject) => {
              const shard = spawn(
                process.execPath,
                [...process.execArgv, fileURLToPath(import.meta.url)],
                {
                  env: {
                    ...process.env,
                    AUTOFORMAT_RULES_SHARD: String(index),
                  },
                  stdio: ['pipe', 'pipe', 'inherit'],
                }
              );
              shards.push(shard);
              let output = '';
              shard.on('error', reject);
              shard.stdin.on('error', reject);
              shard.stdout.on('data', (chunk) => {
                output += chunk;
              });
              shard.on('close', (code, signal) => {
                if (code === 0) {
                  resolve(JSON.parse(output.trim().split('\n').at(-1) ?? ''));
                } else {
                  reject(new Error(`shard ${index} exited ${code ?? signal}`));
                }
              });
              shard.stdin.end(
                JSON.stringify(cases.filter((_case, at) => at % jobs === index))
              );
            }
          )
      )
    );
  } catch (error) {
    for (const shard of shards) shard.kill();
    throw error;
  }
};

const report = (failures: readonly Failure[], atGate: boolean) => {
  const show = (shown: readonly Failure[]) => {
    for (const { detail, identity, rule } of shown) {
      console.error(`\n${rule} ${identity}\n${detail}`);
    }
  };
  if (!atGate) {
    show(failures);
    return failures.length > 0 ? 1 : 0;
  }
  const known = readBaseline(BASELINE);
  show(
    failures.filter(
      ({ file, identity, rule }) => !known[rule]?.[file]?.includes(identity)
    )
  );
  return enforceBaseline({
    file: BASELINE,
    found: {
      ...Object.fromEntries(RULE_NAMES.map((name) => [name, {}])),
      ...groupFindings(failures),
    },
    lowerCommand: 'pnpm check:autoformat-rules --lower',
    mode: options.lower ? 'lower' : options.init ? 'init' : 'check',
    newFindingsHelp: `${Object.values(RULES)
      .map(({ help, name }) => `A ${name} entry is ${help}.`)
      .join(
        ' '
      )} Fix the rule, its order or the runtime; the baseline never grows.`,
    rules: RULE_NAMES,
  });
};

async function main() {
  const started = performance.now();
  const length = whole('length', GATE_LENGTH);
  const only = options.typed;
  const atGate = length === GATE_LENGTH && only === undefined;
  if ((options.init || options.lower) && !atGate) {
    console.error(
      '--init and --lower write the baseline, which holds the gate run, so they take no --length or --typed.'
    );
    process.exit(2);
  }

  const declared = declarations();
  const { alphabet, cases } = plan(declared, length);
  const chosen =
    only === undefined ? cases : cases.filter(({ typed }) => typed === only);
  if (only !== undefined && chosen.length === 0) {
    for (const context of Object.keys(CONTEXTS) as Context[]) {
      chosen.push({ context, expectations: [], typed: only });
    }
  }

  const shards = await fanOut(
    chosen,
    Math.min(whole('jobs', DEFAULT_JOBS), chosen.length)
  );
  const running = shards[0].rules;
  if (running !== declared.rules) {
    console.error(
      `The editor runs ${running} text input rules and the kits' inputRules lists declare ${declared.rules}, so a rule reaches the editor some other way and the check does not type it.`
    );
    process.exit(2);
  }
  const failures = shards
    .flatMap((shard) => shard.failures)
    .sort((a, b) =>
      `${a.rule} ${a.identity}`.localeCompare(`${b.rule} ${b.identity}`)
    );
  console.info(
    JSON.stringify({
      alphabet,
      declared: chosen.reduce(
        (sum, { expectations }) => sum + expectations.length,
        0
      ),
      failures: Object.fromEntries(
        RULE_NAMES.map((name) => [
          name,
          failures.filter(({ rule }) => rule === name).length,
        ])
      ),
      length,
      runs: chosen.length,
      seconds: Math.round((performance.now() - started) / 100) / 10,
    })
  );
  process.exitCode = report(failures, atGate);
}

type AstNode = {
  [key: string]: unknown;
  end?: number | null;
  loc?: { start: { line: number } } | null;
  start?: number | null;
  type: string;
};

const isNode = (value: unknown): value is AstNode =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string';
const child = (node: AstNode, key: string) =>
  isNode(node[key]) ? node[key] : undefined;
const children = (node: AstNode, key: string) => {
  const value = node[key];
  return Array.isArray(value) ? value.filter(isNode) : [];
};
const nameOf = (node: AstNode | undefined) =>
  node?.type === 'Identifier'
    ? String(node.name)
    : node?.type === 'StringLiteral'
      ? String(node.value)
      : undefined;
const property = (object: AstNode, key: string) =>
  child(
    children(object, 'properties').find(
      (entry) =>
        entry.type === 'ObjectProperty' && nameOf(child(entry, 'key')) === key
    ) ?? object,
    'value'
  );

type Declarations = ReturnType<typeof declarations>;

function declarations() {
  const read = (file: string) => {
    const code = readFileSync(path.join(repoRoot, file), 'utf-8');
    const { program } = parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
    });
    const nodes: AstNode[] = [];
    const visit = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(visit);
      else if (isNode(value)) {
        nodes.push(value);
        Object.values(value).forEach(visit);
      }
    };
    visit(program);
    const refuse = (node: AstNode | undefined, problem: string): never => {
      console.error(
        `${file}:${node?.loc?.start.line ?? 1}: ${problem}, so the check cannot read what it promises. Write it as a literal or teach the check its shape.`
      );
      process.exit(2);
    };
    const strings = (node: AstNode | undefined) =>
      (node?.type === 'ArrayExpression'
        ? children(node, 'elements')
        : [node]
      ).map((element) =>
        element?.type === 'StringLiteral'
          ? String(element.value)
          : refuse(element ?? node, 'A value is not a string literal')
      );
    const sourceText = (node: AstNode) =>
      code.slice(node.start ?? 0, node.end ?? 0);
    const ruleLists = nodes.flatMap((node) => {
      if (
        node.type !== 'ObjectProperty' ||
        nameOf(child(node, 'key')) !== 'inputRules'
      ) {
        return [];
      }
      const value = child(node, 'value');
      return value?.type === 'ArrayExpression'
        ? [children(value, 'elements')]
        : refuse(node, 'An inputRules value is not a list literal');
    });
    if (ruleLists.length === 0) {
      refuse(undefined, 'The file declares no inputRules list');
    }
    return { nodes, refuse, ruleLists, sourceText, strings };
  };

  const substitutionFile = read(SUBSTITUTIONS);
  const declared = new Map<
    string,
    Array<{ format: string | [string, string]; matches: string[] }>
  >();
  for (const node of substitutionFile.nodes) {
    const init = child(node, 'init');
    if (
      node.type !== 'VariableDeclarator' ||
      init?.type !== 'CallExpression' ||
      nameOf(child(init, 'callee')) !== 'createTextSubstitutionInputRule'
    ) {
      continue;
    }
    const [config] = children(init, 'arguments');
    const patterns = config && property(config, 'patterns');
    if (patterns?.type !== 'ArrayExpression') {
      substitutionFile.refuse(node, 'Its patterns are not a list');
      continue;
    }
    declared.set(
      String(nameOf(child(node, 'id'))),
      children(patterns, 'elements').map((pattern) => {
        if (pattern.type !== 'ObjectExpression') {
          return substitutionFile.refuse(pattern, 'A pattern is computed');
        }
        const format = property(pattern, 'format');
        const formats = substitutionFile.strings(format);
        return {
          format:
            format?.type === 'ArrayExpression'
              ? [formats[0], formats[1]]
              : formats[0],
          matches: substitutionFile.strings(property(pattern, 'match')),
        };
      })
    );
  }
  const substitutionRules = substitutionFile.ruleLists.flat();
  const substitutions = substitutionRules.flatMap((element) => {
    const label = nameOf(element) ?? '';
    const patterns = declared.get(label);
    if (!patterns) {
      return substitutionFile.refuse(
        element,
        'An input rule is not a createTextSubstitutionInputRule constant'
      );
    }
    return patterns.map((pattern) => ({ ...pattern, label }));
  });

  const markFile = read(MARKS);
  const marks = markFile.ruleLists.flat().map((element) => {
    const callee = child(element, 'callee');
    const object = callee && child(callee, 'object');
    if (
      element.type !== 'CallExpression' ||
      callee?.type !== 'MemberExpression' ||
      nameOf(child(callee, 'property')) !== 'markdown' ||
      !object
    ) {
      return markFile.refuse(
        element,
        'An input rule is not a <Mark>Rules.markdown() call'
      );
    }
    const factory = markFile.sourceText(object);
    const [settings] = children(element, 'arguments');
    const chosen =
      settings?.type === 'ObjectExpression'
        ? (property(settings, 'variant') ?? property(settings, 'value'))
        : undefined;
    const label = chosen
      ? `${factory} ${markFile.strings(chosen)[0]}`
      : factory;
    const syntax = EXPECTED_MARK_SYNTAX[label];
    if (!syntax) {
      return markFile.refuse(
        element,
        `${label} has no entry in the check's EXPECTED_MARK_SYNTAX table; name the rule's variant or add its syntax`
      );
    }
    return { label, syntax };
  });
  return {
    marks,
    rules: substitutionRules.length + marks.length,
    substitutions,
  };
}

if (process.env.AUTOFORMAT_RULES_SHARD) {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const cases: Case[] = JSON.parse(input);
  const kits = await loadKits();
  console.log(
    JSON.stringify({
      failures: cases.flatMap((entry) => runCase(kits, entry)),
      rules: kits.rules,
    })
  );
} else {
  await main();
}
