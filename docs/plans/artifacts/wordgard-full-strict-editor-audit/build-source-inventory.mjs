#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), '../../../..');
const target = process.argv[2] ?? '/Users/zbeyens/git/wordgard';
const output =
  process.argv[3] ??
  resolve(
    repoRoot,
    'docs/plans/artifacts/wordgard-full-strict-editor-audit/raw-source-inventory.json'
  );
const requireFromTarget = createRequire(resolve(target, 'package.json'));
const ts = requireFromTarget('typescript');

const trackedFiles = execFileSync('git', ['-C', target, 'ls-files', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(Boolean)
  .sort();

const sha256 = (content) => createHash('sha256').update(content).digest('hex');

const classifyFile = (path) => {
  if (path.startsWith('src/')) return 'source';
  if (path.startsWith('test/')) return 'test';
  if (path.startsWith('bin/')) return 'tooling';
  if (path.startsWith('demo/')) return 'product-shell';

  return 'metadata';
};

const declarationName = (node, sourceFile) => {
  if (node.name) return node.name.getText(sourceFile);
  if (ts.isConstructorDeclaration(node)) return 'constructor';
  if (ts.isCallSignatureDeclaration(node)) return 'call-signature';
  if (ts.isConstructSignatureDeclaration(node)) return 'construct-signature';
  if (ts.isIndexSignatureDeclaration(node)) return 'index-signature';
  if (ts.isExportAssignment(node)) return 'export-assignment';
  if (ts.isExportDeclaration(node)) {
    return node.exportClause?.getText(sourceFile) ?? 'export-all';
  }

  return '(anonymous)';
};

const files = trackedFiles.map((path) => {
  const absolutePath = resolve(target, path);
  const content = readFileSync(absolutePath);
  const entry = {
    bytes: content.byteLength,
    category: classifyFile(path),
    path,
    sha256: sha256(content),
  };

  if (!/\.[cm]?tsx?$/.test(path)) return entry;

  const text = content.toString('utf8');
  const sourceFile = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const declarations = [];

  const visit = (node, depth = 0) => {
    if (
      node !== sourceFile &&
      (ts.isDeclaration(node) ||
        ts.isExportAssignment(node) ||
        ts.isExportDeclaration(node))
    ) {
      const start = node.getStart(sourceFile);
      const { line, character } =
        sourceFile.getLineAndCharacterOfPosition(start);
      declarations.push({
        column: character + 1,
        depth,
        exported:
          node.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
          ) ?? false,
        kind: ts.SyntaxKind[node.kind],
        line: line + 1,
        name: declarationName(node, sourceFile),
        parentKind: ts.SyntaxKind[node.parent.kind],
      });
    }

    ts.forEachChild(node, (child) => visit(child, depth + 1));
  };

  visit(sourceFile);

  return {
    ...entry,
    declarationCount: declarations.length,
    declarations,
    lines: text.split(/\r?\n/).length,
    parseDiagnostics: sourceFile.parseDiagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      start: diagnostic.start ?? null,
    })),
  };
});

const categoryCounts = Object.fromEntries(
  [...new Set(files.map((file) => file.category))]
    .sort()
    .map((category) => [
      category,
      files.filter((file) => file.category === category).length,
    ])
);
const typescriptFiles = files.filter((file) => file.declarations);
const head = execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();

const inventory = {
  authority: {
    branch: execFileSync('git', ['-C', target, 'branch', '--show-current'], {
      encoding: 'utf8',
    }).trim(),
    commit: head,
    origin: execFileSync('git', ['-C', target, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    }).trim(),
    repository: target,
    upstream: execFileSync(
      'git',
      [
        '-C',
        target,
        'rev-parse',
        '--abbrev-ref',
        '--symbolic-full-name',
        '@{upstream}',
      ],
      { encoding: 'utf8' }
    ).trim(),
  },
  files,
  generatedAt: new Date().toISOString(),
  kind: 'wordgard-raw-source-inventory',
  schemaVersion: 1,
  summary: {
    categoryCounts,
    parseDiagnosticCount: typescriptFiles.reduce(
      (count, file) => count + file.parseDiagnostics.length,
      0
    ),
    trackedFiles: files.length,
    typescriptDeclarations: typescriptFiles.reduce(
      (count, file) => count + file.declarationCount,
      0
    ),
    typescriptFiles: typescriptFiles.length,
  },
};

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);
process.stdout.write(
  `${relative(repoRoot, output)} ${JSON.stringify(inventory.summary)}\n`
);
