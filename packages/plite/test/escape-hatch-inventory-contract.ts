import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { parse, type ParserPlugin } from '@babel/parser';

const repoRoot = resolve(import.meta.dir, '../../..');

const sourceRoots = [
  'packages/plite',
  'packages/plite-dom',
  'packages/plite-history',
  'packages/plite-react',
  'apps/plite',
  'docs/plite',
];

const ignoredPathFragments = [
  '/.next/',
  '/dist/',
  '/node_modules/',
  '/out/',
  'apps/www/.next/',
  'apps/www/out/',
];

const selfPath = 'packages/plite/test/escape-hatch-inventory-contract.ts';

const sourceFilePattern = /\.(ts|tsx|js|jsx|md)$/;

const primitiveMethodNames = new Set([
  'delete',
  'deleteBackward',
  'deleteForward',
  'deleteFragment',
  'insertBreak',
  'insertFragment',
  'insertNodes',
  'insertSoftBreak',
  'insertText',
  'removeNodes',
  'select',
  'setNodes',
  'unwrapNodes',
  'wrapNodes',
]);

type EscapeHatchKind = 'bridge' | 'primitive' | 'stale';

type EscapeHatchOwner =
  | 'browser-proof'
  | 'central-runtime'
  | 'compat-wrapper'
  | 'contract-test'
  | 'generated-output'
  | 'historical-doc'
  | 'normalizer-doc'
  | 'public-doc-blocker'
  | 'public-example-blocker';

type EscapeHatchNext =
  | 'batch-1-burn-down'
  | 'central-owner'
  | 'compat-burn-down'
  | 'explicit-proof-bridge'
  | 'generated-output'
  | 'keep-as-contract'
  | 'historical-only';

type InventoryRule = {
  expected: Partial<Record<EscapeHatchKind, number>>;
  gate: string;
  id: string;
  next: EscapeHatchNext;
  owner: EscapeHatchOwner;
  path: RegExp;
  rationale: string;
};

const escapeHatchPatterns: Record<EscapeHatchKind, RegExp> = {
  bridge:
    /\b(beginEditableEventFrame|recordEditableKernelTrace|syncEditorSelectionFromDOM|syncEditableDOMSelectionToEditor|requestRepair|applyEditableRepairRequest|repairDOMInput|domRepairQueue\.repair|repairCaretAfterModelOperation|repairCaretAfterModelTextInsert)\(/g,
  primitive: /$a/,
  stale:
    /\beditor\.(selection|children|marks|operations)\b|\bTransforms\.|\beditor\.(apply|onChange)\b/g,
};

const inventoryRules: InventoryRule[] = [
  {
    expected: { stale: 37 },
    gate: 'historical docs are not the current API contract',
    id: 'historical-changelog',
    next: 'historical-only',
    owner: 'historical-doc',
    path: /^packages\/[^/]+\/CHANGELOG\.md$|^docs\/general\/changelog\.md$/,
    rationale:
      'Changelog entries preserve history and are not primary API guidance.',
  },
  {
    expected: { primitive: 134, stale: 629 },
    gate: 'Plite browser proof rows must stay explicitly classified as proof transport',
    id: 'app-plite-browser-proof-rows',
    next: 'explicit-proof-bridge',
    owner: 'browser-proof',
    path: /^apps\/plite\/tests\/plite-browser\/donor\/examples\//,
    rationale:
      'Apps/plite owns the browser proof transport rows that exercise editor behavior through semantic handles.',
  },
  {
    expected: { primitive: 1, stale: 2 },
    gate: 'Plite browser app smoke specs must stay classified as proof transport',
    id: 'app-plite-browser-smoke-spec',
    next: 'explicit-proof-bridge',
    owner: 'browser-proof',
    path: /^apps\/plite\/tests\/plite-browser\/plite-examples\.spec\.ts$/,
    rationale:
      'The app-level Plite browser smoke spec uses editor handles only to prove browser behavior.',
  },
  {
    expected: { stale: 59 },
    gate: 'internal Plite ledgers may preserve old API names as historical evidence',
    id: 'internal-plite-ledgers',
    next: 'historical-only',
    owner: 'historical-doc',
    path: /^docs\/plite\//,
    rationale:
      'Docs/plite stores internal ledgers and roadmap artifacts, not current public API guidance.',
  },
  {
    expected: { stale: 1 },
    gate: 'DOM runtime bridge usage must stay inside plite-dom',
    id: 'dom-runtime',
    next: 'central-owner',
    owner: 'central-runtime',
    path: /^packages\/plite-dom\/src\//,
    rationale:
      'Plite DOM owns DOM bridge compatibility and selection import/export helpers.',
  },
  {
    expected: { bridge: 30, stale: 1 },
    gate: 'React runtime escape hatches must stay under kernel/runtime owners',
    id: 'react-runtime',
    next: 'central-owner',
    owner: 'central-runtime',
    path: /^packages\/plite-react\/src\//,
    rationale:
      'Plite React owns editable input, IME, repair, and bridge workers behind the kernel.',
  },
  {
    expected: { stale: 65 },
    gate: 'core contract tests may exercise compatibility, but only as tests',
    id: 'plite-core-contract-tests',
    next: 'keep-as-contract',
    owner: 'contract-test',
    path: /^packages\/plite\/test\//,
    rationale:
      'Core contracts intentionally cover snapshots and update/runtime behavior.',
  },
  {
    expected: { bridge: 51 },
    gate: 'React tests may exercise bridges only as contract proof',
    id: 'plite-react-tests',
    next: 'keep-as-contract',
    owner: 'contract-test',
    path: /^packages\/plite-react\/test\//,
    rationale:
      'React contracts prove bridge, selection, projection, and update behavior without teaching app DX.',
  },
];

const shouldSkipPath = (relativePath: string) =>
  relativePath === selfPath ||
  ignoredPathFragments.some((fragment) => relativePath.includes(fragment));

const listSourceFiles = () => {
  const files: string[] = [];

  const walk = (absoluteDirectory: string) => {
    for (const name of readdirSync(absoluteDirectory)) {
      const absolutePath = join(absoluteDirectory, name);
      const relativePath = absolutePath.slice(repoRoot.length + 1);

      if (shouldSkipPath(relativePath)) {
        continue;
      }

      const stat = statSync(absolutePath);

      if (stat.isDirectory()) {
        walk(absolutePath);
      } else if (sourceFilePattern.test(relativePath)) {
        files.push(relativePath);
      }
    }
  };

  for (const root of sourceRoots) {
    const absoluteRoot = join(repoRoot, root);

    if (existsSync(absoluteRoot)) {
      walk(absoluteRoot);
    }
  }

  return files.sort();
};

const findRule = (relativePath: string) =>
  inventoryRules.find((rule) => rule.path.test(relativePath));

type BabelNode = {
  end?: number | null;
  name?: unknown;
  start?: number | null;
  type: string;
  value?: unknown;
  [key: string]: unknown;
};

const isBabelNode = (value: unknown): value is BabelNode =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string';

const getNodeName = (node: unknown) => {
  if (!isBabelNode(node)) {
    return;
  }

  if (node.type === 'Identifier' && typeof node.name === 'string') {
    return node.name;
  }
  if (node.type === 'StringLiteral' && typeof node.value === 'string') {
    return node.value;
  }
};

const getMemberPropertyName = (node: BabelNode) => {
  if (
    node.type !== 'MemberExpression' &&
    node.type !== 'OptionalMemberExpression'
  ) {
    return;
  }

  return getNodeName(node.property);
};

const getMemberObjectName = (node: BabelNode) => {
  if (
    node.type !== 'MemberExpression' &&
    node.type !== 'OptionalMemberExpression'
  ) {
    return;
  }

  return getNodeName(node.object);
};

const isCallExpression = (node: BabelNode) =>
  node.type === 'CallExpression' || node.type === 'OptionalCallExpression';

const isEditorUpdateCall = (node: BabelNode) => {
  if (!isCallExpression(node)) {
    return false;
  }

  const { callee } = node;

  return (
    isBabelNode(callee) &&
    getMemberPropertyName(callee) === 'update' &&
    getMemberObjectName(callee) === 'editor'
  );
};

const getPropertyName = (node: BabelNode) => {
  if (
    node.type === 'ObjectProperty' ||
    node.type === 'ObjectMethod' ||
    node.type === 'ClassMethod' ||
    node.type === 'ClassPrivateMethod'
  ) {
    return getNodeName(node.key);
  }

  if (node.type !== 'AssignmentExpression' || !isBabelNode(node.left)) {
    return;
  }

  return getMemberPropertyName(node.left);
};

const isInsideNormalizer = (ancestors: readonly BabelNode[]) =>
  ancestors.some((ancestor) => getPropertyName(ancestor) === 'normalizeNode');

const isPrimitiveCall = (node: BabelNode) => {
  if (!isCallExpression(node)) {
    return false;
  }

  const { callee } = node;

  if (!isBabelNode(callee)) {
    return false;
  }

  if (!primitiveMethodNames.has(getMemberPropertyName(callee) ?? '')) {
    return false;
  }

  const objectName = getMemberObjectName(callee);

  return objectName === 'editor' || objectName === 'Editor';
};

const isInsideEditorUpdate = (ancestors: readonly BabelNode[]) =>
  ancestors.some(isEditorUpdateCall);

const primitiveCallPattern = new RegExp(
  String.raw`\b(?:editor|Editor)\.(${Array.from(primitiveMethodNames).join('|')})\s*\(`,
  'g'
);

const getPrimitiveMatchesByRegex = (source: string) =>
  Array.from(source.matchAll(primitiveCallPattern), (match) => match[0]);

const getParserPlugins = (
  relativePath: string,
  source: string
): ParserPlugin[] => {
  const plugins: ParserPlugin[] = ['decorators-legacy'];

  if (/\.[cm]?[tj]sx$/.test(relativePath) || /@jsx\b/.test(source)) {
    plugins.push('jsx');
  }

  if (/\.[cm]?tsx?$/.test(relativePath)) {
    plugins.push('typescript');
  }

  return plugins;
};

const getUnsafePrimitiveMatchesFromSource = (
  source: string,
  relativePath: string,
  { allowRegexFallback = false } = {}
) => {
  let sourceFile: BabelNode;

  try {
    sourceFile = parse(source, {
      attachComment: false,
      errorRecovery: true,
      plugins: getParserPlugins(relativePath, source),
      sourceType: 'unambiguous',
    }) as unknown as BabelNode;
  } catch (error) {
    if (allowRegexFallback) {
      return getPrimitiveMatchesByRegex(source);
    }

    throw new Error(`Failed to parse ${relativePath}`, { cause: error });
  }

  const matches: string[] = [];

  const visit = (node: BabelNode, ancestors: readonly BabelNode[]) => {
    if (
      isPrimitiveCall(node) &&
      !isInsideEditorUpdate(ancestors) &&
      !isInsideNormalizer(ancestors) &&
      typeof node.start === 'number' &&
      typeof node.end === 'number'
    ) {
      matches.push(source.slice(node.start, node.end));
    }

    const nextAncestors = [...ancestors, node];

    for (const [key, value] of Object.entries(node)) {
      if (
        key === 'comments' ||
        key === 'end' ||
        key === 'errors' ||
        key === 'extra' ||
        key === 'loc' ||
        key === 'start' ||
        key === 'tokens'
      ) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const child of value) {
          if (isBabelNode(child)) {
            visit(child, nextAncestors);
          }
        }
        continue;
      }

      if (isBabelNode(value)) {
        visit(value, nextAncestors);
      }
    }
  };

  visit(sourceFile, []);

  return matches;
};

const getMarkdownCodeBlocks = (source: string) => {
  const blocks: string[] = [];
  const codeBlockPattern = /```([^\n]*)\n([\s\S]*?)```/g;

  for (const match of source.matchAll(codeBlockPattern)) {
    const language = match[1].trim().toLowerCase();

    if (!language || /^(js|javascript|jsx|ts|typescript|tsx)$/.test(language)) {
      blocks.push(match[2]);
    }
  }

  return blocks;
};

const getPrimitiveMatches = (source: string, relativePath: string) => {
  if (!relativePath.endsWith('.md')) {
    return getUnsafePrimitiveMatchesFromSource(source, relativePath);
  }

  return getMarkdownCodeBlocks(source).flatMap((block, index) =>
    getUnsafePrimitiveMatchesFromSource(
      block,
      `${relativePath}#code-block-${index}.ts`,
      { allowRegexFallback: true }
    )
  );
};

const getMatches = (
  kind: EscapeHatchKind,
  source: string,
  relativePath: string
) => {
  if (kind === 'primitive') {
    return getPrimitiveMatches(source, relativePath);
  }

  return Array.from(
    source.matchAll(new RegExp(escapeHatchPatterns[kind].source, 'g'))
  ).map((match) => match[0]);
};

describe('escape hatch source inventory', () => {
  it('classifies every remaining escape hatch by owner and gate', {
    timeout: 20_000,
  }, () => {
    const actual: Record<string, number> = {};
    const unmatched: Array<{
      file: string;
      kind: EscapeHatchKind;
      text: string;
    }> = [];

    for (const relativePath of listSourceFiles()) {
      const source = readFileSync(join(repoRoot, relativePath), 'utf8');

      for (const kind of Object.keys(
        escapeHatchPatterns
      ) as EscapeHatchKind[]) {
        for (const match of getMatches(kind, source, relativePath)) {
          const rule = findRule(relativePath);

          if (!rule) {
            unmatched.push({
              file: relativePath,
              kind,
              text: match,
            });
            continue;
          }

          const key = `${rule.id}:${kind}`;
          actual[key] = (actual[key] ?? 0) + 1;
        }
      }
    }

    assert.equal(
      unmatched.length,
      0,
      JSON.stringify(unmatched.slice(0, 20), null, 2)
    );

    const expected = Object.fromEntries(
      inventoryRules.flatMap((rule) =>
        Object.entries(rule.expected).map(([kind, count]) => [
          `${rule.id}:${kind}`,
          count,
        ])
      )
    );

    assert.deepEqual(actual, expected);
  });

  it('keeps every allowlist entry actionable', () => {
    for (const rule of inventoryRules) {
      assert.notEqual(rule.owner, undefined);
      assert.notEqual(rule.next, undefined);
      assert.match(rule.rationale, /\S/);
      assert.match(rule.gate, /\S/);
      assert.ok(Object.keys(rule.expected).length > 0);
    }
  });

  it('keeps public docs and examples free of active burn-down blockers', () => {
    const blockerIds = inventoryRules
      .filter((rule) => rule.next === 'batch-1-burn-down')
      .map((rule) => rule.id)
      .sort();

    assert.deepEqual(blockerIds, []);
  });
});
