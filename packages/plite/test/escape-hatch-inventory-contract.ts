import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import * as ts from 'typescript';

const repoRoot = resolve(import.meta.dir, '../../..');

const sourceRoots = ['packages', 'site', 'playwright', 'docs'];

const ignoredPathFragments = [
  '/dist/',
  '/node_modules/',
  'site/.next/',
  'site/out/',
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
    expected: { primitive: 133, stale: 627 },
    gate: 'browser proof handles must stay explicitly classified as proof transport',
    id: 'browser-proof-rows',
    next: 'explicit-proof-bridge',
    owner: 'browser-proof',
    path: /^playwright\/integration\/examples\//,
    rationale:
      'Playwright rows use semantic handles and explicit selection control for proof setup.',
  },
  {
    expected: { stale: 8 },
    gate: 'plite-browser docs describe proof handles, not app runtime API',
    id: 'plite-browser-proof-docs',
    next: 'explicit-proof-bridge',
    owner: 'browser-proof',
    path: /^packages\/plite-browser\/README\.md$/,
    rationale:
      'The plite-browser README documents the proof harness selection API.',
  },
  {
    expected: { stale: 1 },
    gate: 'plite-browser proof audit fixtures must stay classified as test-only transport',
    id: 'plite-browser-proof-audit-tests',
    next: 'explicit-proof-bridge',
    owner: 'browser-proof',
    path: /^packages\/plite-browser\/test\/core\/keyboard-oracle-audit\.test\.ts$/,
    rationale:
      'The keyboard oracle audit stores low-level fixture text for proof classification.',
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
    expected: { primitive: 120, stale: 65 },
    gate: 'core contract tests may exercise compatibility, but only as tests',
    id: 'plite-core-contract-tests',
    next: 'keep-as-contract',
    owner: 'contract-test',
    path: /^packages\/plite\/test\//,
    rationale:
      'Core contracts intentionally cover snapshots and update/runtime behavior.',
  },
  {
    expected: { primitive: 8 },
    gate: 'history tests may cover undo fixtures while history runtime burns down compatibility',
    id: 'plite-history-tests',
    next: 'keep-as-contract',
    owner: 'contract-test',
    path: /^packages\/plite-history\/test\//,
    rationale: 'History contracts guard undo/redo behavior during the rewrite.',
  },
  {
    expected: { bridge: 51, primitive: 22 },
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
    walk(join(repoRoot, root));
  }

  return files.sort();
};

const findRule = (relativePath: string) =>
  inventoryRules.find((rule) => rule.path.test(relativePath));

const getScriptKind = (relativePath: string) => {
  if (relativePath.endsWith('.tsx')) {
    return ts.ScriptKind.TSX;
  }
  if (relativePath.endsWith('.jsx')) {
    return ts.ScriptKind.JSX;
  }
  if (relativePath.endsWith('.ts')) {
    return ts.ScriptKind.TS;
  }

  return ts.ScriptKind.JS;
};

const isEditorUpdateCall = (node: ts.Node) => {
  if (!ts.isCallExpression(node)) {
    return false;
  }

  const callee = node.expression;

  return (
    ts.isPropertyAccessExpression(callee) &&
    callee.name.text === 'update' &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'editor'
  );
};

const getPropertyName = (node: ts.Node) => {
  if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
    const { name } = node;

    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
      return name.text;
    }
  }

  if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)) {
    return node.left.name.text;
  }

  return;
};

const isInsideNormalizer = (node: ts.Node) => {
  let current = node.parent;

  while (current) {
    if (getPropertyName(current) === 'normalizeNode') {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const isPrimitiveCall = (node: ts.Node) => {
  if (!ts.isCallExpression(node)) {
    return false;
  }

  const callee = node.expression;

  if (!ts.isPropertyAccessExpression(callee)) {
    return false;
  }

  if (!primitiveMethodNames.has(callee.name.text)) {
    return false;
  }

  return (
    ts.isIdentifier(callee.expression) &&
    (callee.expression.text === 'editor' || callee.expression.text === 'Editor')
  );
};

const isInsideEditorUpdate = (node: ts.Node) => {
  let current = node.parent;

  while (current) {
    if (isEditorUpdateCall(current)) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const getUnsafePrimitiveMatchesFromSource = (
  source: string,
  relativePath: string
) => {
  const sourceFile = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(relativePath)
  );
  const matches: string[] = [];

  const visit = (node: ts.Node) => {
    if (
      isPrimitiveCall(node) &&
      !isInsideEditorUpdate(node) &&
      !isInsideNormalizer(node)
    ) {
      matches.push(node.getText(sourceFile));
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

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
      `${relativePath}#code-block-${index}.ts`
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
  it('classifies every remaining escape hatch by owner and gate', () => {
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

    assert.deepEqual(unmatched, []);

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
