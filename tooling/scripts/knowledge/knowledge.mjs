import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

// Parsers stay private to this file so a store's legacy format never leaks past
// it.
import { parse } from '@babel/parser';

import {
  TEST_FILE_PATTERNS,
  TEST_SLOW_FILE_PATTERNS,
} from '../../config/test-suites.mjs';
import { entrypointDags } from '../../entrypoints/entrypoint-dag.mjs';
import {
  classifyPackageFile,
  entrypointPackageNames,
  repoRoot,
} from '../../entrypoints/entrypoint-turbo.mjs';
import {
  lookupContext,
  lookupIn,
  owningScopes,
  researchRows,
} from '../review-ledger.mjs';

const SPEC = 'docs/editor-behavior/markdown-editing-spec.md';
const ISSUES = 'docs/editor-issue-harvester';
const HARVEST = 'docs/editor-test-harvester';
const LESSONS = 'docs/research/sources/plate-notes';

const editorRepos = {
  lexical: 'facebook/lexical',
  plate: 'udecode/plate',
  prosekit: 'prosekit/prosekit',
  prosemirror: 'prosemirror/prosemirror',
  slate: 'ianstormtaylor/slate',
  tiptap: 'ueberdosis/tiptap',
  wordgard: 'wordgard/wordgard',
};
const editorOfRepo = (repo) =>
  Object.keys(editorRepos).find(
    (key) => editorRepos[key].toLowerCase() === repo.toLowerCase()
  );

// Lexical, ProseMirror, Slate and Wordgard generate their ledger table from
// these inputs, so a decision written into the table is lost on the next build.
// ProseKit has no builder, so its table is the input.
const decisionInputs = {
  lexical: `${ISSUES}/lexical/full/issue-closure-overrides.json`,
  prosekit: `${ISSUES}/prosekit/full/issue-closure-ledger.tsv`,
  prosemirror: `${ISSUES}/prosemirror/full/issue-closure-overrides.json`,
  slate: `${ISSUES}/slate/full/classify-delta.mjs`,
  wordgard: `${ISSUES}/wordgard/full/issue-decisions.mjs`,
};

const RULE_ID = /^EDIT-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}$/;
const RULE_PREFIX = /^EDIT-[A-Z0-9]+(?:-[A-Z0-9]+)*-?$/;
const ISSUE_REF = /^([a-z][a-z0-9-]*)#(\d+)$/;
const TAG = /\[(EDIT-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}|[a-z][a-z0-9-]*#\d+)\]/g;
const STATUSES = new Set(['locked', 'proposed', 'audit', 'deviation']);

const git = (repo, args) =>
  spawnSync('git', args, { cwd: repo, encoding: 'utf-8', maxBuffer: 1 << 30 });

// node:path's matchesGlob compiles the pattern on every call, which took the
// index load from 0.85 s to 2.6 s, so each pattern compiles once here.
const globs = new Map();
function globRegExp(pattern) {
  if (!globs.has(pattern)) {
    if (/[?[\]!]/.test(pattern)) {
      throw new Error(`Unsupported glob syntax in ${pattern}`);
    }
    let source = '';
    let braces = 0;
    for (let i = 0; i < pattern.length; i += 1) {
      const char = pattern[i];
      if (char === '*' && pattern[i + 1] === '*') {
        source += pattern[i + 2] === '/' ? '(?:.*/)?' : '.*';
        i += pattern[i + 2] === '/' ? 2 : 1;
      } else if (char === '*') source += '[^/]*';
      else if (char === '{') {
        braces += 1;
        source += '(?:';
      } else if (char === '}') {
        braces -= 1;
        source += ')';
      } else if (char === ',') {
        if (!braces) throw new Error(`Unsupported glob syntax in ${pattern}`);
        source += '|';
      } else source += char.replace(/[.+^$()|\\]/g, '\\$&');
    }
    globs.set(pattern, new RegExp(`^${source}$`));
  }
  return globs.get(pattern);
}
const matchesGlob = (path, pattern) => globRegExp(pattern).test(path);

/**
 * A checkout read from disk. Git lists its files, which skips ignored build
 * output; `has` drops a deleted file whose deletion is not staged yet.
 */
export function workTree(root) {
  let paths;
  return {
    repo: root,
    ref: null,
    list() {
      if (!paths) {
        const listed = git(root, [
          'ls-files',
          '--cached',
          '--others',
          '--exclude-standard',
        ]);
        if (listed.status !== 0) {
          throw new Error(`git ls-files failed in ${root}: ${listed.stderr}`);
        }
        paths = listed.stdout.split('\n').filter(Boolean);
      }
      return paths;
    },
    has: (path) => existsSync(join(root, path)),
    read: (path) => readFileSync(join(root, path), 'utf-8'),
    bytes: (path) => readFileSync(join(root, path)),
  };
}

/** Commit `ref` of the repository at `repo`; every file `patterns` match is read in one batch. */
export function commitTree(repo, ref, patterns) {
  const listed = spawnSync('git', ['ls-tree', '-r', '-z', '--name-only', ref], {
    cwd: repo,
    encoding: 'utf-8',
    maxBuffer: 1 << 30,
  });
  if (listed.status !== 0) {
    throw new Error(`Cannot list ${ref}: ${listed.stderr}`);
  }
  const paths = listed.stdout.split('\0').filter(Boolean);
  const wanted = paths.filter((path) =>
    patterns.some((pattern) => matchesGlob(path, pattern))
  );
  const batch = spawnSync('git', ['cat-file', '--batch'], {
    cwd: repo,
    input: `${wanted.map((path) => `${ref}:${path}`).join('\n')}\n`,
    maxBuffer: 1 << 30,
  });
  if (batch.status !== 0) {
    throw new Error(`Cannot read ${ref}: ${String(batch.stderr)}`);
  }
  const texts = new Map();
  let at = 0;
  for (const path of wanted) {
    const end = batch.stdout.indexOf(10, at);
    const [, type, size] = batch.stdout.toString('utf-8', at, end).split(' ');
    at = end + 1;
    if (type !== 'blob') continue;
    texts.set(path, batch.stdout.toString('utf-8', at, at + Number(size)));
    at += Number(size) + 1;
  }
  return {
    repo,
    ref,
    list: () => paths,
    has: (path) => texts.has(path),
    read: (path) => {
      if (!texts.has(path)) {
        throw new Error(`${path} at ${ref} was not read; add its pattern`);
      }
      return texts.get(path);
    },
  };
}

const files = (tree, patterns, ignore = []) =>
  tree
    .list()
    .filter(
      (path) =>
        patterns.some((pattern) => matchesGlob(path, pattern)) &&
        !ignore.some((pattern) => matchesGlob(path, pattern)) &&
        tree.has(path)
    )
    .sort();

const RULE_BULLET =
  /^\s*- `(EDIT-[A-Z0-9*]+(?:-[A-Z0-9*]+)*)`(?: `([a-z-]+)`)?(?: `([^`]+)`)?:?\s*(.*)$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** Indexes of the lines outside fenced blocks, fence lines left out. */
export function unfencedLines(lines) {
  const out = [];
  let fence = null;
  lines.forEach((line, i) => {
    const marker = FENCE.exec(line)?.[1];
    if (fence) {
      if (
        marker?.[0] === fence[0] &&
        marker.length >= fence.length &&
        line.trim() === marker
      ) {
        fence = null;
      }
    } else if (marker) fence = marker;
    else out.push(i);
  });
  return out;
}

/** The rule IDs the law text defines, wildcard families left out. */
export function ruleIds(text) {
  return parseSpec(text, '').flatMap((rule) =>
    rule.wildcard ? [] : [rule.id]
  );
}

// A rule's scenario is its first fence and its notes are its `note:` lines,
// both only before any prose. Prose and later notes describe the section, so
// they stay in `context`, which search reads but the card never shows as the
// rule.
function parseSpec(text, file) {
  const rules = [];
  const headings = [];
  let fence = null;
  let current = null;
  let prose = false;
  text.split('\n').forEach((line, i) => {
    const marker = FENCE.exec(line)?.[1];
    if (fence) {
      if (
        marker?.[0] === fence[0] &&
        marker.length >= fence.length &&
        line.trim() === marker
      ) {
        fence = null;
        if (current?.scenario) current.closed = true;
      } else if (current?.scenario && !current.closed) {
        current.scenario.push(line);
      }
      return;
    }
    if (marker) {
      fence = marker;
      if (current && current.scenario === null && !prose) current.scenario = [];
      return;
    }
    const heading = /^(#{2,3}) (.+)$/.exec(line);
    if (heading) {
      headings.length = heading[1].length - 2;
      headings.push(heading[2].trim());
      current = null;
      return;
    }
    const bullet = RULE_BULLET.exec(line);
    if (bullet) {
      const [, id, status, key, title] = bullet;
      current = {
        id,
        status: status ?? null,
        key: key ?? null,
        title: title.trim(),
        family: headings[0] ?? null,
        section: headings[1] ?? null,
        scenario: null,
        notes: [],
        context: [],
        file,
        line: i + 1,
        wildcard: id.includes('*'),
      };
      prose = false;
      rules.push(current);
      return;
    }
    if (!current || !line.trim()) return;
    const note = /^note: (.+)$/.exec(line);
    if (note && !prose) current.notes.push(note[1]);
    else {
      prose = true;
      current.context.push(note?.[1] ?? line.trim());
    }
  });
  return rules.map(({ closed, ...rule }) => ({
    ...rule,
    scenario: rule.scenario?.join('\n') ?? null,
    context: rule.context.join(' '),
  }));
}

const tsvRows = (text) => {
  const [head, ...lines] = text.split('\n');
  const header = head.split('\t');
  return lines.flatMap((line, i) =>
    line.trim()
      ? [
          {
            line: i + 2,
            cells: Object.fromEntries(
              header.map((key, k) => [key, line.split('\t')[k] ?? ''])
            ),
          },
        ]
      : []
  );
};

// Lexical and ProseMirror ledgers carry closureKind and exactTest; Slate,
// Wordgard and ProseKit carry status and local_test.
function parseIssueLedger(rows, file, editor) {
  return rows.flatMap(({ line, cells }) => {
    const number = Number(cells.issue ?? cells.issue_number ?? cells.number);
    if (!Number.isInteger(number)) return [];
    return [
      {
        ref: `${editor}#${number}`,
        editor,
        store: 'issue-ledgers',
        title: cells.title ?? '',
        state: (cells.state ?? '').toLowerCase(),
        assessment: cells.closureKind || cells.status || '',
        owner: cells.owner ?? '',
        legacyTest: cells.exactTest || cells.local_test || '',
        reason: cells.reason ?? '',
        file,
        line,
      },
    ];
  });
}

const ISSUE_LINK =
  /\[#?(\d+)\]\(https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:issues|pull)\/\d+\)/;
const BARE_ISSUE = /(?:^|[\s|`(])#(\d{2,6})\b/;
const TABLE_BODY = (line) => line.startsWith('|') && !/^\|\s*:?-/.test(line);
const cellsOf = (line) =>
  line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((cell) => cell.trim());

function parseIssueTables(text, file) {
  const issues = [];
  text.split('\n').forEach((line, i) => {
    if (!TABLE_BODY(line)) return;
    const link = ISSUE_LINK.exec(line);
    const number = Number(link?.[1] ?? BARE_ISSUE.exec(line)?.[1]);
    if (!Number.isInteger(number)) return;
    const editor = link ? (editorOfRepo(link[2]) ?? 'slate') : 'slate';
    const cells = cellsOf(line);
    issues.push({
      ref: `${editor}#${number}`,
      editor,
      store: 'slate-issue-program',
      title: cells.reduce(
        (long, cell) =>
          cell.length > long.length && !ISSUE_LINK.test(cell) ? cell : long,
        ''
      ),
      state: '',
      assessment: '',
      owner: '',
      legacyTest: '',
      reason: cells.join(' | '),
      file,
      line: i + 1,
    });
  });
  return issues;
}

// Harvest indexes come in several formats. A bullet that starts with a location
// (`path:line`, `L12` or `12`) is one upstream test; a title adapter reads the
// call or fixture after it, plain text is a title, and a dynamic call keeps no
// title. A bullet stating an absence or a total is not an entry. A table whose
// `Extracted names` column joins `path:line name` anchors with `<br>` holds one
// entry per anchor.
const HARVEST_LOCATION = /^\s*[-*] (?:`([^`]+:\d+)`:?|(L\d+):|(\d+):)\s?(.*)$/;
const HARVEST_ASIDE = /^\s*[-*] (?:No |N\/A:|[A-Z][\w `().-]*: \d)/;
const HARVEST_TITLE = [
  /^(?:test|it|describe)[^:]*: ['"`](.+?)['"`],/,
  /^(?:test|it|describe)[^:]*: (?:it|test|describe)(?:\.\w+)*\(\s*['"`](.+?)['"`]/,
  /^fixture: (\S+)/,
  /^`(?:it|test|describe)(?:\.\w+)*(?:\.each\(.*\))?\(\s*['"`](.+?)['"`]/,
  /^`"(.+)"`$/,
  /^`([A-Za-z_$][\w$]*)`$/,
  /^(?:it|test|describe) — (.+)$/,
];

function parseTestIndex(text, file, editor) {
  const harvested = [];
  const preamble = text.split(/^## /m)[0];
  let revision = /`([0-9a-f]{40})`/.exec(preamble)?.[1] ?? null;
  let upstreamFile = null;
  let names = null;
  let expected = 0;
  text.split('\n').forEach((line, i) => {
    const heading = /^## `?([^`\s]+)`?/.exec(line);
    if (heading) {
      upstreamFile = heading[1];
      return;
    }
    const commit = /^Commit: `([0-9a-f]{7,40})`/.exec(line);
    if (commit) revision = commit[1];
    if (line.startsWith('|')) {
      const cells = cellsOf(line);
      if (cells.includes('Extracted names')) {
        names = cells.indexOf('Extracted names');
      } else if (names !== null && TABLE_BODY(line)) {
        for (const anchor of cells[names].split('<br>').filter(Boolean)) {
          const [, location, title] = /^(\S+:\d+)\s*(.*)$/.exec(anchor) ?? [
            null,
            null,
            anchor,
          ];
          harvested.push({
            editor,
            revision,
            upstream: location ?? cells[1].replaceAll('`', ''),
            title: title || null,
            file,
            line: i + 1,
          });
        }
      }
      return;
    }
    const entry = HARVEST_LOCATION.exec(line);
    if (!entry) {
      if (/^\s*[-*] /.test(line) && !HARVEST_ASIDE.test(line)) expected += 1;
      return;
    }
    expected += 1;
    const [, located, numbered, plain, rest] = entry;
    const title =
      HARVEST_TITLE.map((pattern) => pattern.exec(rest)?.[1]).find(Boolean) ??
      (/^`[^`]*`?$|^(?:test|it|describe)[^:]*: /.test(rest) || !rest
        ? null
        : rest.replaceAll('`', ''));
    harvested.push({
      editor,
      revision,
      upstream:
        located ?? `${upstreamFile}:${(numbered ?? plain).replace(/^L/, '')}`,
      title,
      file,
      line: i + 1,
    });
  });
  const anchors = Number(/^Line\/name anchors: (\d+)/m.exec(text)?.[1] ?? 0);
  return {
    harvested,
    expected: names === null ? expected : anchors || harvested.length,
  };
}

function parseLessons(text, file) {
  const lessons = [];
  let area = null;
  const lines = text.split('\n');
  const open = new Set(unfencedLines(lines));
  lines.forEach((line, i) => {
    if (!open.has(i)) return;
    const heading = /^## (.+)$/.exec(line);
    if (heading) area = heading[1];
    const bullet = /^- \*\*(.+?)\*\*\s*(.*)$/.exec(line);
    if (bullet) {
      lessons.push({
        title: bullet[1].replace(/\.$/, ''),
        text: bullet[2],
        area,
        file,
        line: i + 1,
      });
    }
  });
  return lessons;
}

const pluginsFor = (file) =>
  /\.[cm]?tsx$/.test(file)
    ? ['typescript', 'jsx']
    : /\.[cm]?ts$/.test(file)
      ? ['typescript']
      : file.endsWith('.jsx')
        ? ['jsx']
        : [];

const TEST_CALLEES = new Set(['it', 'test', 'describe']);
const SKIPS = new Set(['skip', 'todo', 'fixme', 'fail', 'failing']);
const CONDITIONS = {
  if: 'unless',
  runIf: 'unless',
  skipIf: 'when',
  todoIf: 'when',
};
const DECLARES = new Set([
  'only',
  'concurrent',
  'serial',
  'parallel',
  'each',
  'describe',
  ...SKIPS,
  ...Object.keys(CONDITIONS),
]);
const isFunction = (node) =>
  ['ArrowFunctionExpression', 'FunctionExpression'].includes(node?.type);

function testChain(callee) {
  const links = [];
  for (let at = callee; ;) {
    if (at.type === 'Identifier') {
      return TEST_CALLEES.has(at.name)
        ? { base: at.name, links: links.reverse() }
        : null;
    }
    if (
      at.type === 'MemberExpression' &&
      !at.computed &&
      at.property.type === 'Identifier'
    ) {
      links.push({ name: at.property.name, args: null });
      at = at.object;
    } else if (
      at.type === 'CallExpression' &&
      at.callee.type === 'MemberExpression' &&
      at.callee.property.type === 'Identifier'
    ) {
      links.push({ name: at.callee.property.name, args: at.arguments });
      at = at.callee.object;
    } else return null;
  }
}

const IGNORED_KEYS = new Set([
  'type',
  'loc',
  'start',
  'end',
  'extra',
  'range',
  'leadingComments',
  'trailingComments',
  'innerComments',
  'errors',
  'tokens',
  'comments',
]);
function forEachChild(node, visit) {
  for (const key in node) {
    if (IGNORED_KEYS.has(key)) continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child.type === 'string') visit(child);
      }
    } else if (value && typeof value.type === 'string') visit(value);
  }
}

function parseTests(text, file) {
  let ast;
  try {
    ast = parse(text, {
      sourceType: 'module',
      errorRecovery: true,
      plugins: pluginsFor(file),
    });
  } catch (error) {
    return { tests: [], problem: `cannot parse ${file}: ${error.message}` };
  }
  if (ast.errors?.length) {
    return {
      tests: [],
      problem: `cannot parse ${file}: ${ast.errors[0].message}`,
    };
  }
  const source = (node) =>
    text.slice(node.start, node.end).replace(/\s+/g, ' ');
  const tests = [];
  const visit = (node, scope, test) => {
    if (node.type === 'CallExpression') {
      const chain = testChain(node.callee);
      const names = chain?.links.map((link) => link.name) ?? [];
      const declares = chain && names.every((name) => DECLARES.has(name));
      const [first] = node.arguments;
      const body = node.arguments.findLast(isFunction);
      const titled = ['StringLiteral', 'TemplateLiteral'].includes(first?.type);
      const declaration = first && !isFunction(first) && (body || titled);
      const skipCall = ['skip', 'fixme'].includes(node.callee.property?.name);
      // `testInfo.skip(…)` and `test.info().skip(…)` skip from inside a body.
      const infoSkip =
        /^(?:testInfo|info)$/.test(node.callee.object?.name) ||
        (node.callee.object?.type === 'CallExpression' &&
          testChain(node.callee.object.callee)?.links.at(-1)?.name === 'info');
      const statement = chain
        ? chain.base !== 'describe' &&
          names.length === 1 &&
          skipCall &&
          !declaration
        : skipCall && infoSkip;
      if (statement) {
        const when = first ? `when ${source(first)}` : 'always';
        if (test) test.inBody ??= when;
        else scope.statements.push(when);
        return;
      }
      if (declares && declaration) {
        const modifier = names.find((name) => SKIPS.has(name));
        const condition = chain.links.find(
          (link) => CONDITIONS[link.name] && link.args?.length
        );
        const skip = modifier
          ? ['fail', 'failing'].includes(modifier)
            ? 'expected to fail'
            : 'always'
          : condition &&
            `${CONDITIONS[condition.name]} ${source(condition.args[0])}`;
        const title =
          first.type === 'StringLiteral'
            ? first.value
            : first.type === 'TemplateLiteral'
              ? first.quasis
                  .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
                  .join('…')
              : null;
        const group = chain.base === 'describe' || names.includes('describe');
        if (group) {
          const inner = { title, skip, statements: [], parent: scope };
          if (body) visit(body.body, inner, null);
          return;
        }
        const declared = {
          file,
          line: node.loc.start.line,
          title,
          suite: [],
          scope,
          own: skip ?? null,
          inBody: null,
          unsupported: title === null,
          template:
            names.includes('each') ||
            (first.type === 'TemplateLiteral' && first.expressions.length > 0),
          tags: title ? [...title.matchAll(TAG)].map((tag) => tag[1]) : [],
        };
        tests.push(declared);
        if (body) visit(body.body, scope, declared);
        return;
      }
    }
    forEachChild(node, (child) => visit(child, scope, test));
  };
  visit(
    ast.program,
    { title: null, skip: null, statements: [], parent: null },
    null
  );
  return {
    tests: tests.map(({ scope, own, inBody, ...test }) => {
      let skipped = own ?? inBody;
      for (let at = scope; at; at = at.parent) {
        if (at.title !== null) test.suite.unshift(at.title);
        if (skipped) continue;
        const why = at.skip ?? at.statements[0];
        if (why) {
          skipped = at.parent
            ? `inside skipped "${at.title}" (${why})`
            : `file skipped ${why}`;
        }
      }
      return { ...test, skipped: skipped ?? null };
    }),
  };
}

const PLITE_BROWSER = 'apps/plite/tests/plite-browser/';
const WWW_BROWSER = 'apps/www/tests/browser/';
const DEFERRED = '**/__deferred__/**/*.{ts,tsx}';
const partitionPatterns = entrypointPackageNames.map(
  (name) =>
    `${entrypointDags[name].packageRoot}/{src,test}/**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`
);
const testPatterns = [
  DEFERRED,
  `${PLITE_BROWSER}**/*.{test,spec}.ts`,
  `${WWW_BROWSER}**/*.{test,spec}.ts`,
  ...TEST_SLOW_FILE_PATTERNS,
  ...partitionPatterns,
  'packages/*/test/**/*.{ts,tsx}',
  ...TEST_FILE_PATTERNS,
];

function testFiles(tree) {
  const runners = new Map();
  const add = (path, run) => {
    if (!runners.has(path)) runners.set(path, run);
  };
  for (const path of files(tree, [DEFERRED])) {
    add(path, {
      check: 'none',
      engines: [],
      why: 'deferred, kept out of every gate',
    });
  }
  for (const path of files(tree, [`${PLITE_BROWSER}**/*.{test,spec}.ts`])) {
    add(path, {
      check: 'plite CI',
      engines: ['chromium'],
      why: 'pull requests run Chromium; Firefox, WebKit and mobile run only on dispatch',
    });
  }
  for (const path of files(tree, [`${WWW_BROWSER}**/*.{test,spec}.ts`])) {
    add(path, {
      check: 'manual',
      engines: ['chromium', 'firefox', 'webkit'],
      why: 'runs only through the test:www-browser scripts',
    });
  }
  for (const path of files(tree, TEST_SLOW_FILE_PATTERNS)) {
    add(path, { check: 'pnpm check', engines: [], why: 'test-slow step' });
  }
  // getPackageRuntimeTestFiles walks the disk; the same partition ownership
  // read from the tree's listing also serves a commit.
  for (const packageName of entrypointPackageNames) {
    const { packageRoot, taskPartitions } = entrypointDags[packageName];
    const owned = new Set(Object.values(taskPartitions).flat());
    for (const path of files(
      tree,
      partitionPatterns.filter((pattern) =>
        pattern.startsWith(`${packageRoot}/`)
      )
    )) {
      if (owned.has(classifyPackageFile(packageName, join(repoRoot, path)))) {
        add(path, {
          check: 'pnpm check',
          engines: [],
          why: 'plite-test partitions',
        });
      }
    }
  }
  for (const path of files(tree, ['packages/*/test/**/*.{ts,tsx}'])) {
    add(path, {
      check: 'pnpm check',
      engines: [],
      why: 'imported by plite-test partitions',
    });
  }
  for (const path of files(tree, TEST_FILE_PATTERNS, [
    '**/tests/plite-browser/**',
    '**/tests/browser/**',
  ])) {
    add(path, { check: 'pnpm check', engines: [], why: 'test step' });
  }
  return runners;
}

const stores = {
  law: [SPEC],
  issueLedgers: [`${ISSUES}/*/full/issue-closure-ledger.tsv`],
  issueProgram: ['docs/plite-issues/**/*.md'],
  harvests: [`${HARVEST}/*/test-index.md`],
  lessons: [`${LESSONS}/*.md`],
  targets: ['benchmarks/targets/slate-v2.json'],
  notes: [
    'benchmarks/editor/iterations/*.md',
    'benchmarks/editor/docs/baselines/*.md',
  ],
  subjects: ['docs/plans/topics/*.md'],
  decisions: ['docs/research/decisions/*.md'],
  pages: ['docs/research/**/*.md', 'docs/editor-audits/**/*.md'],
  scopes: ['docs/research/review-scopes/*.json'],
};
const pageIgnore = [
  'docs/research/decisions/**',
  'docs/research/raw/**',
  'docs/research/review-records/**',
  `${LESSONS}/**`,
];

const citationStores = [
  'docs/editor-behavior/**/*.md',
  'docs/research/**/*.{md,json,tsv}',
  'docs/plans/topics/*.md',
];
const citationRecords = [
  'docs/research/review-records/**',
  'docs/research/raw/**',
  // A probe capture records the paths it saw at its own commit.
  'docs/research/probes/**/*.json',
];

/** Every path `loadIndex` and `findings` read, for a tree read in one batch. */
export const indexPatterns = [
  ...Object.values(stores).flat(),
  ...testPatterns,
  ...citationStores,
];

/** Parses every store of `tree` once. Reads only the tree, never the network. */
export function loadIndex(tree) {
  const coverage = [];
  const covered = (store, file, parsed, expected, problem) =>
    coverage.push({
      store,
      file,
      parsed,
      expected,
      ...(problem ? { problem } : {}),
    });
  const specText = tree.read(SPEC);
  const rules = parseSpec(specText, SPEC);
  covered(
    'behavior-law',
    SPEC,
    rules.length,
    specText.match(/^\s*- `EDIT-/gm)?.length ?? 0
  );

  const issues = [];
  for (const path of files(tree, stores.issueLedgers)) {
    const rows = tsvRows(tree.read(path));
    const parsed = parseIssueLedger(rows, path, path.split('/')[2]);
    covered('issue-ledgers', path, parsed.length, rows.length);
    issues.push(...parsed);
  }
  for (const path of files(tree, stores.issueProgram)) {
    const text = tree.read(path);
    const parsed = parseIssueTables(text, path);
    const rows = text
      .split('\n')
      .filter(
        (line) => TABLE_BODY(line) && /\/issues\/\d|#\d{2,6}\b/.test(line)
      );
    covered('slate-issue-program', path, parsed.length, rows.length);
    issues.push(...parsed);
  }

  const harvested = [];
  for (const path of files(tree, stores.harvests)) {
    const parsed = parseTestIndex(tree.read(path), path, path.split('/')[2]);
    covered('test-harvests', path, parsed.harvested.length, parsed.expected);
    harvested.push(...parsed.harvested);
  }

  const lessons = files(tree, stores.lessons).flatMap((path) => {
    const parsed = parseLessons(tree.read(path), path);
    if (!path.endsWith('/README.md')) {
      const lines = tree
        .read(path)
        .replace(/^---\n[\s\S]*?\n---\n/, '')
        .split('\n');
      const bullets = unfencedLines(lines).filter((i) =>
        lines[i].startsWith('- ')
      );
      covered('lessons', path, parsed.length, bullets.length);
    }
    return parsed;
  });
  const targets = JSON.parse(tree.read(stores.targets[0])).targets.map(
    (target) => ({
      id: target.id,
      question: target.question ?? '',
      command: target.command ?? '',
      file: stores.targets[0],
    })
  );
  const page = (path) => {
    const text = tree.read(path);
    return {
      file: path,
      title:
        /^title: (.+)$/m.exec(text)?.[1] ?? /^# (.+)$/m.exec(text)?.[1] ?? path,
      text,
    };
  };
  const notes = files(tree, stores.notes).map(page);
  const subjects = files(tree, stores.subjects).map((path) => {
    const { title, text } = page(path);
    return {
      file: path,
      title,
      lead:
        text
          .split('\n\n')
          .find((block) => block && !/^(#|Page:)/.test(block)) ?? '',
    };
  });
  const decisions = files(tree, stores.decisions).map(page);
  const pages = files(tree, stores.pages, pageIgnore).map(page);
  const scopeIds = files(tree, stores.scopes).map((path) =>
    path
      .split('/')
      .at(-1)
      .replace(/\.json$/, '')
  );

  const tests = [];
  for (const [path, run] of testFiles(tree)) {
    if (!tree.has(path)) continue;
    const parsed = parseTests(tree.read(path), path);
    if (parsed.problem) covered('tests', path, 0, 1, parsed.problem);
    for (const test of parsed.tests) tests.push({ ...test, ...run });
  }
  const byTag = new Map();
  for (const test of tests) {
    for (const tag of test.tags) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(test);
    }
  }
  return {
    tree,
    rules,
    issues,
    harvested,
    lessons,
    targets,
    notes,
    subjects,
    decisions,
    pages,
    scopeIds,
    tests,
    byTag,
    coverage,
  };
}

const synonyms = [
  ['arrowdown', 'down arrow', 'arrow down', '↓'],
  ['arrowup', 'up arrow', 'arrow up', '↑'],
  ['arrowleft', 'left arrow', '←'],
  ['arrowright', 'right arrow', '→'],
  ['enter', 'return', '↵', 'newline'],
  ['backspace', '⌫'],
  ['delete', '⌦'],
  ['tab', '⇥'],
  ['shift+tab', 'untab', '⇤'],
  ['trailing', 'last', 'final', 'end'],
  ['leading', 'first', 'start'],
  ['paste', 'clipboard'],
  ['ime', 'composition'],
];
const stopWords = new Set([
  'a',
  'an',
  'the',
  'of',
  'in',
  'on',
  'at',
  'to',
  'and',
  'or',
  'is',
  'it',
  'when',
  'with',
  'for',
  'by',
]);

const groupsOf = (words) =>
  words
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word))
    .map((word) => synonyms.find((group) => group.includes(word)) ?? [word]);

const escapeRegExp = (form) => form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = new Map();
const patternsOf = (group) => {
  const key = group.join('\u0000');
  if (!patterns.has(key)) {
    patterns.set(
      key,
      group.map((form) =>
        /^[\w+ ]+$/.test(form)
          ? new RegExp(`\\b${escapeRegExp(form)}(?:s|es)?\\b`, 'i')
          : new RegExp(escapeRegExp(form), 'i')
      )
    );
  }
  return patterns.get(key);
};
const hits = (text, groups) =>
  groups.filter((group) =>
    patternsOf(group).some((pattern) => pattern.test(text))
  ).length;

function ranked(items, groups, fields) {
  const need = groups.length > 2 ? 2 : groups.length;
  return items
    .map((item) => {
      const [title = '', body = ''] = fields(item);
      const total = hits(`${title} ${body}`, groups);
      return {
        item,
        total,
        score:
          total * 10 +
          hits(title, groups) * 3 -
          Math.min(9, (title.length + body.length) / 400),
      };
    })
    .filter(({ total }) => total >= need)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

const ruleFields = (rule) => [
  [rule.id, rule.key, rule.title, rule.family, rule.section]
    .filter(Boolean)
    .join(' '),
  [rule.scenario, ...rule.notes, rule.context].filter(Boolean).join(' '),
];
const issueFields = (issue) => [
  `${issue.ref} ${issue.title}`,
  `${issue.reason} ${issue.legacyTest}`,
];
const testFields = (test) => [test.title, test.suite.join(' ')];

function keysAndWords(index, query) {
  const keys = {
    rules: new Set(),
    issues: new Set(),
    paths: [],
    targets: [],
    editors: [],
    words: [],
  };
  for (const token of query.trim().split(/\s+/)) {
    if (RULE_ID.test(token)) keys.rules.add(token);
    else if (RULE_PREFIX.test(token)) {
      for (const rule of index.rules) {
        if (rule.id.startsWith(token.replace(/-$/, ''))) {
          keys.rules.add(rule.id);
        }
      }
    } else if (ISSUE_REF.test(token)) keys.issues.add(token);
    else if (index.targets.some((target) => target.id === token)) {
      keys.targets.push(token);
    } else if (editorRepos[token]) keys.editors.push(token);
    else if (token.includes('/')) keys.paths.push(token.replace(/^\.\//, ''));
    else keys.words.push(token);
  }
  return keys;
}

const TEST_FILE = /\.(?:test|spec|slow)\.[cm]?[jt]sx?$/;

function testsOfPath(index, path) {
  const dir = path.slice(0, path.lastIndexOf('/') + 1);
  const stem = TEST_FILE.test(path) ? '' : path.slice(dir.length).split('.')[0];
  return index.tests.filter(
    (test) =>
      test.file.startsWith(path) ||
      (stem &&
        test.file.startsWith(`${dir}${stem}.`) &&
        !test.file.slice(dir.length).includes('/'))
  );
}

function addReachedTags(index, { rules, issues }, tests = []) {
  const tagsOf = (items) => {
    for (const test of items) {
      for (const tag of test.tags) {
        (tag.startsWith('EDIT-') ? rules : issues).add(tag);
      }
    }
  };
  tagsOf(tests);
  tagsOf([...rules].flatMap((id) => index.byTag.get(id) ?? []));
  tagsOf([...issues].flatMap((ref) => index.byTag.get(ref) ?? []));
}

const tagged = (index, keys) =>
  [...keys.rules, ...keys.issues].flatMap((tag) => index.byTag.get(tag) ?? []);
const union = (...lists) => [...new Set(lists.flat())];

/**
 * One card: the query's keys and every relationship they reach, then ranked
 * words and the relationships of the best word matches.
 */
export function card(index, query, { detail = false } = {}) {
  const limit = detail ? 25 : 5;
  const keys = keysAndWords(index, query);
  const pathTests = keys.paths.flatMap((path) => testsOfPath(index, path));
  addReachedTags(index, keys, pathTests);
  const issueRows = index.issues.filter((issue) => keys.issues.has(issue.ref));
  const keyed = {
    law: index.rules.filter((rule) => keys.rules.has(rule.id)),
    tests: union(tagged(index, keys), pathTests),
    upstream: union(
      issueRows,
      index.issues.filter((issue) => keys.editors.includes(issue.editor))
    ),
    harvested: index.harvested.filter((test) =>
      keys.editors.includes(test.editor)
    ),
    targets: index.targets.filter((target) => keys.targets.includes(target.id)),
    notes: index.notes.filter((note) =>
      keys.targets.some((id) => note.text.includes(id))
    ),
    lessons: index.lessons.filter(
      (lesson) =>
        keys.targets.some((id) => lesson.text.includes(id)) ||
        keys.paths.some((path) => lesson.text.includes(path)) ||
        [...keys.rules].some((id) => lesson.text.includes(id))
    ),
    research: [],
    pages: [],
    subjects: [],
    decisions: [],
  };

  // An issue key alone also searches with its title, so a card finds the law
  // and tests for an issue no test is tagged with yet.
  const words = keys.words.length
    ? keys.words
    : issueRows.slice(0, 1).flatMap((issue) => issue.title.split(/[^\w+]+/));
  const groups = groupsOf(words);
  if (groups.length) {
    const found = {
      law: ranked(index.rules, groups, ruleFields),
      tests: ranked(
        index.tests.filter((test) => test.title),
        groups,
        testFields
      ),
      upstream: ranked(index.issues, groups, issueFields),
      harvested: ranked(
        index.harvested.filter((test) => test.title),
        groups,
        (test) => [test.title]
      ),
      lessons: ranked(index.lessons, groups, (lesson) => [
        lesson.title,
        lesson.text,
      ]),
      targets: ranked(index.targets, groups, (target) => [
        target.id,
        target.question,
      ]),
      notes: ranked(index.notes, groups, (note) => [note.title, note.text]),
      research: ranked(
        (index.researchRows ??= index.tree.repo
          ? researchRows(index.tree.repo).rows
          : []),
        groups,
        (row) => [row.run, row.text]
      ),
      pages: ranked(index.pages, groups, (page) => [page.title, page.text]),
      subjects: ranked(index.subjects, groups, (subject) => [
        subject.title,
        subject.lead,
      ]),
      decisions: ranked(index.decisions, groups, (page) => [
        page.title,
        page.text,
      ]),
    };
    const viaTests = { rules: new Set(), issues: new Set() };
    addReachedTags(index, viaTests, found.tests.slice(0, limit));
    const viaRules = {
      rules: new Set(found.law.slice(0, limit).map((rule) => rule.id)),
      issues: new Set(),
    };
    addReachedTags(index, viaRules);
    const near = {
      law: index.rules.filter((rule) => viaTests.rules.has(rule.id)),
      tests: tagged(index, { rules: viaRules.rules, issues: viaTests.issues }),
      upstream: index.issues.filter(
        (issue) =>
          viaTests.issues.has(issue.ref) || viaRules.issues.has(issue.ref)
      ),
    };
    for (const section of Object.keys(found)) {
      keyed[section] = union(
        keyed[section],
        near[section] ?? [],
        found[section]
      );
    }
  }

  // Paths, the words that name a scope, or the whole word query when nothing
  // names one go to the review ledger's lookup, which loads once per index.
  const named = keys.words
    .filter((word) => index.scopeIds.includes(word.toLowerCase()))
    .map((word) => word.toLowerCase());
  const wordsOnly =
    keys.words.length > 0 && !named.length && !keys.paths.length;
  const ledger =
    keys.paths.length || named.length || wordsOnly
      ? (index.ledger ??= lookupContext(index.tree.repo))
      : null;
  const owners = keys.paths.map((path) => [
    path,
    owningScopes(ledger.ledger, path),
  ]);
  const scopeQueries = union(
    owners.flatMap(([path, ids]) => (ids.length ? ids : [path])),
    named,
    wordsOnly ? [keys.words.join(' ')] : []
  );
  const scopeCards = new Map();
  let scopeNote;
  for (const scopeQuery of scopeQueries) {
    try {
      for (const item of lookupIn(ledger, scopeQuery, { detail })) {
        scopeCards.set(item.id ?? JSON.stringify(item), item);
      }
    } catch (error) {
      if (!error.message.startsWith('No scope')) throw error;
      scopeNote ??= error.message;
    }
  }

  const out = {
    query,
    keys: {
      rules: [...keys.rules],
      issues: [...keys.issues],
      paths: keys.paths,
      targets: keys.targets,
      editors: keys.editors,
      words: keys.words,
    },
    more: {},
  };
  for (const [section, items] of Object.entries({
    ...keyed,
    scopes: [...scopeCards.values()],
  })) {
    out[section] = items.slice(0, limit);
    if (items.length > limit) out.more[section] = items.length - limit;
  }
  if (!scopeCards.size && scopeNote) out.scopeNote = scopeNote;
  return out;
}

/** Where each kind of finding from a card belongs. */
export function writeBack(result) {
  const rule = result.law.find((item) => !item.wildcard) ?? result.law[0];
  const issue = result.upstream[0];
  const lesson = result.lessons[0];
  return [
    [
      'rule',
      rule
        ? `${SPEC} § ${[rule.family, rule.section].filter(Boolean).join(' / ')}`
        : SPEC,
    ],
    [
      'test tag',
      'end the test title with [EDIT-…] for each rule it proves and [<editor>#<n>] for each issue it guards',
    ],
    [
      'issue decision',
      issue
        ? issue.store === 'issue-ledgers'
          ? (decisionInputs[issue.editor] ?? issue.file)
          : issue.file
        : `the editor's decision input (${Object.values(decisionInputs).join(', ')})`,
    ],
    ['lesson', lesson ? lesson.file : `${LESSONS}/<area>.md`],
    [
      'external finding',
      'a research run in docs/plite/research/<date>-<slug>/ through the research rule',
    ],
  ];
}

/** Locked rules that no test a gate runs carries, each with the reason. */
export function gaps(index, prefix) {
  return index.rules
    .filter(
      (rule) =>
        !rule.wildcard &&
        rule.status === 'locked' &&
        (!prefix || rule.id.startsWith(prefix))
    )
    .flatMap((rule) => {
      const carriers = index.byTag.get(rule.id) ?? [];
      const running = carriers.filter(
        (test) =>
          ['pnpm check', 'plite CI'].includes(test.check) && !test.skipped
      );
      if (running.length) return [];
      return [
        {
          ...rule,
          reason: carriers.length
            ? `tagged only on tests no gate runs: ${carriers.map((test) => `${test.file}:${test.line} (${test.skipped ?? test.why})`).join('; ')}`
            : 'no tagged test',
        },
      ];
    });
}

/** A set of tracked paths; `has` also accepts a directory that holds one. */
export function pathSet(paths) {
  const all = new Set(paths);
  const dirs = new Set();
  for (const path of all) {
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i += 1) {
      dirs.add(parts.slice(0, i).join('/'));
    }
  }
  return { has: (path) => all.has(path) || dirs.has(path.replace(/\/$/, '')) };
}

/** The paths a fresh checkout of `ref` holds, or of the index when `ref` is omitted. */
export function trackedPaths(root, ref) {
  const listed = ref
    ? git(root, ['ls-tree', '-r', '--name-only', ref])
    : git(root, ['ls-files']);
  if (listed.status !== 0) {
    throw new Error(`Cannot list ${ref ?? 'the index'}: ${listed.stderr}`);
  }
  return pathSet(listed.stdout.split('\n').filter(Boolean));
}

const ROOTS =
  '(?:docs|packages|apps|tooling|benchmarks|content|\\.agents|\\.claude|templates|config)/';
const REPO_PATH = new RegExp(
  `(?<=^|[\\s\`'"(|,;[])((?:[0-9a-f]{7,40}:)?(?:/Users/|/private/tmp/|${ROOTS})[^\\s\`'"|,;<>*{}[\\]$]*)`,
  'g'
);
const EVIDENCE_LAYER = /^(?:\.\.\/)+raw\//;
const ROOT_PATH = new RegExp(`^${ROOTS}`);
const ANCHOR = /#.*$/;
const LINE_RANGE = /:\d+(?:-\d+)?$/;

// Destinations of inline Markdown links outside code spans, with balanced
// parentheses and `<…>` destinations.
function linkTargets(line) {
  const plain = line.replace(/`+[^`]*`+/g, (span) => ' '.repeat(span.length));
  const targets = [];
  for (
    let at = plain.indexOf('](');
    at !== -1;
    at = plain.indexOf('](', at + 2)
  ) {
    let start = at + 2;
    let end;
    if (plain[start] === '<') {
      start += 1;
      end = plain.indexOf('>', start);
      if (end === -1) continue;
    } else {
      let depth = 0;
      for (
        end = start;
        end < plain.length && !/\s/.test(plain[end]);
        end += 1
      ) {
        if (plain[end] === '(') depth += 1;
        else if (plain[end] === ')') {
          if (depth === 0) break;
          depth -= 1;
        }
      }
    }
    const target = plain.slice(start, end);
    if (target && !/^#|^(?![0-9a-f]{7,40}:)[a-z][a-z0-9+.-]*:/i.test(target)) {
      targets.push(target);
    }
  }
  return targets;
}

const trimToken = (token) => {
  let out = token.replace(/[.,:;]+$/, '');
  while (
    out.endsWith(')') &&
    (out.match(/\(/g)?.length ?? 0) < (out.match(/\)/g)?.length ?? 0)
  ) {
    out = out.slice(0, -1).replace(/[.,:;]+$/, '');
  }
  return out;
};

/**
 * Why `raw`, cited from `file`, cannot be opened in a fresh checkout, or null.
 * Another editor's file is cited as `<owner>/<repo>@<commit>:<path>`, which
 * REPO_PATH never matches, or under the `../raw` evidence layer.
 */
function citationProblem(raw, file, tracked, local, linked) {
  if (EVIDENCE_LAYER.test(raw)) return null;
  const pinned = /^([0-9a-f]{7,40}):(.+)$/.exec(raw);
  if (pinned) {
    const [, sha, path] = pinned;
    if (!local.reachable(sha)) {
      return {
        target: raw,
        message: `cites commit ${sha}, which no remote branch contains`,
      };
    }
    return local.holds(sha, path.replace(/[#:].*$/, ''))
      ? null
      : {
          target: raw,
          message: `cites ${path}, which commit ${sha} does not hold`,
        };
  }
  if (/^(?:\/Users\/|\/private\/tmp\/)/.test(raw)) {
    return { target: raw, message: 'cites a path outside the repository' };
  }
  const path = repoPath(raw, file, linked);
  if (!path || path === '.') return null;
  if (path.startsWith('..')) {
    return { target: path, message: 'cites a path outside the repository' };
  }
  return tracked.has(path)
    ? null
    : {
        target: path,
        message: `cites ${path}, which a fresh checkout does not have`,
      };
}

function repoPath(raw, file, linked) {
  const relative = linked && !raw.startsWith('/') && !ROOT_PATH.test(raw);
  return (
    relative ? normalize(join(dirname(file), raw)) : raw.replace(/^\//, '')
  )
    .replace(ANCHOR, '')
    .replace(LINE_RANGE, '');
}

/** Repository paths the Markdown links of the page at `file` resolve to, as K7 reads them. */
export function linkedPaths(text, file) {
  const lines = text.split('\n');
  return unfencedLines(lines)
    .flatMap((i) => linkTargets(lines[i]))
    .filter((raw) => !/^[0-9a-f]{7,40}:/.test(raw) && !EVIDENCE_LAYER.test(raw))
    .map((raw) => repoPath(raw, file, true).replace(/\/$/, ''));
}

function localCommits(repo) {
  const cache = new Map();
  const memo = (key, run) => {
    if (!cache.has(key)) cache.set(key, run());
    return cache.get(key);
  };
  return {
    reachable: (sha) =>
      memo(`reach ${sha}`, () =>
        ['origin/next', 'origin/main'].some(
          (branch) =>
            git(repo, ['merge-base', '--is-ancestor', sha, branch]).status === 0
        )
      ),
    holds: (sha, path) =>
      memo(
        `holds ${sha}:${path}`,
        () => git(repo, ['cat-file', '-e', `${sha}:${path}`]).status === 0
      ),
  };
}

/**
 * Every K finding in `index`, as `{ rule, file, line, identity, message }`. A
 * K7 identity is the line and its target, so a line keeps one entry per broken
 * citation.
 */
export function findings(
  index,
  {
    tracked = index.tree.ref
      ? pathSet(index.tree.list())
      : trackedPaths(index.tree.repo),
  } = {}
) {
  const { tree } = index;
  const out = [];
  const texts = new Map();
  const textOf = (file) => {
    if (!texts.has(file)) texts.set(file, tree.read(file));
    return texts.get(file);
  };
  const lineOf = (file, line) =>
    textOf(file).split('\n')[line - 1]?.trim() ?? '';
  const at = (rule, file, line, message, identity = lineOf(file, line)) =>
    out.push({ rule, file, line, identity, message });

  for (const { store, file, parsed, expected, problem } of index.coverage) {
    if (problem) at('K0', file, 1, `${store}: ${problem}`, problem);
    else if (parsed < expected) {
      at(
        'K0',
        file,
        1,
        `${store}: read ${parsed} records where ${file} holds ${expected}`
      );
    }
  }

  const defined = new Map();
  for (const rule of index.rules) {
    if (rule.wildcard) continue;
    if (!RULE_ID.test(rule.id)) {
      at('K1', rule.file, rule.line, `malformed rule ID ${rule.id}`);
    }
    if (defined.has(rule.id)) {
      at(
        'K1',
        rule.file,
        rule.line,
        `${rule.id} is defined again (first at line ${defined.get(rule.id)})`
      );
    } else defined.set(rule.id, rule.line);
  }
  for (const rule of index.rules) {
    if (!STATUSES.has(rule.status)) {
      at(
        'K12',
        rule.file,
        rule.line,
        `${rule.id} has status ${rule.status ?? 'none'}`
      );
    }
  }

  // GitHub is the plate issue ledger, so a plate tag needs no indexed row.
  const issueRefs = new Set(index.issues.map((issue) => issue.ref));
  const ledgered = new Set(index.issues.map((issue) => issue.editor));
  for (const test of index.tests) {
    for (const tag of test.tags) {
      const editor = tag.split('#')[0];
      if (tag.startsWith('EDIT-')) {
        if (!defined.has(tag)) {
          at('K4', test.file, test.line, `tag ${tag} names no rule`);
        }
      } else if (!editorRepos[editor]) {
        at('K4', test.file, test.line, `tag ${tag} names no known editor`);
      } else if (editor === 'plate') {
        continue;
      } else if (!ledgered.has(editor)) {
        at(
          'K4',
          test.file,
          test.line,
          `tag ${tag}: no ${editor} issue ledger is indexed`
        );
      } else if (!issueRefs.has(tag)) {
        at('K4', test.file, test.line, `tag ${tag} names no issue row`);
      }
    }
  }

  const local = localCommits(tree.repo);
  for (const file of files(tree, citationStores, citationRecords)) {
    if (!tracked.has(file)) continue;
    const lines = textOf(file).split('\n');
    const open = file.endsWith('.md') ? new Set(unfencedLines(lines)) : null;
    let section = null;
    lines.forEach((line, i) => {
      const fenced = open && !open.has(i);
      const heading = !fenced && /^(#{1,2}) (.*)$/.exec(line);
      if (heading) section = heading[1] === '##' ? heading[2].trim() : null;
      // A subject's Open work item names the saved patch or answer it waits
      // on, which the shared rules keep in the ignored run directory.
      const waitsOnRun =
        file.startsWith('docs/plans/topics/') && section === 'Open work';
      const cited = [
        ...(fenced || !open ? [] : linkTargets(line).map((raw) => [raw, true])),
        ...[...line.matchAll(REPO_PATH)]
          .filter(
            (match) =>
              !'<{*$'.includes(line[match.index + match[0].length] || ' ')
          )
          .map((match) => [trimToken(match[1]), false]),
      ];
      const seen = new Set();
      for (const [raw, linked] of cited) {
        const problem = citationProblem(raw, file, tracked, local, linked);
        if (
          !problem ||
          seen.has(problem.target) ||
          (waitsOnRun &&
            normalize(problem.target).startsWith('docs/plans/artifacts/'))
        ) {
          continue;
        }
        seen.add(problem.target);
        at(
          'K7',
          file,
          i + 1,
          problem.message,
          `${line.trim()} -> ${problem.target}`
        );
      }
    });
  }
  return out;
}
