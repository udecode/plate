#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const OWNER = {
  file: 'packages/plitejs/src/yjs/core/document.ts',
  fn: 'deleteRawYjsChildren',
};
const SOURCE_ROOT = 'packages/plitejs/src/yjs';
const SOURCE_FILE = /\.(?:ts|tsx|mts)$/u;
const SKIPPED_FILE = /\.(?:spec|test)\.|\.d\.ts$/u;

const listSourceFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);

    return SOURCE_FILE.test(entry.name) && !SKIPPED_FILE.test(entry.name)
      ? [entryPath]
      : [];
  });

const isElementChildDelete = (symbol) =>
  symbol.declarations?.some(
    (declaration) =>
      ts.isClassDeclaration(declaration.parent) &&
      declaration.parent.name?.text === 'YXmlFragment' &&
      declaration.getSourceFile().fileName.includes('/yjs/')
  ) ?? false;

const deleteOf = (checker, node) => {
  const name = ts.isPropertyAccessExpression(node)
    ? node.name
    : ts.isElementAccessExpression(node) &&
        ts.isStringLiteralLike(node.argumentExpression)
      ? node.argumentExpression
      : null;

  if (name?.text !== 'delete') return null;

  const symbol = checker.getSymbolAtLocation(name);

  if (symbol) return isElementChildDelete(symbol) ? 'element' : null;

  const type = checker.getTypeAtLocation(node.expression);

  return (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) === 0
    ? null
    : 'untyped';
};

const functionName = (node) => {
  if (
    (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
    node.name
  ) {
    return node.name.getText();
  }
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    !ts.isBindingPattern(node.parent.name)
  ) {
    return node.parent.name.getText();
  }

  return null;
};

const enclosingFunction = (node) => {
  for (let current = node.parent; current; current = current.parent) {
    const name = functionName(current);

    if (name) return name;
  }

  return null;
};

export const findYjsElementDeletes = ({ files, options, root }) => {
  const program = ts.createProgram(files, { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const found = [];

  for (const fileName of files) {
    const file = program.getSourceFile(fileName);
    const relative = path.relative(root, fileName).split(path.sep).join('/');

    if (!file) throw new Error(`${relative}: not in the program`);

    const visit = (node) => {
      const kind = deleteOf(checker, node);

      if (kind) {
        const { line, character } = file.getLineAndCharacterOfPosition(
          node.getStart()
        );
        const fn = enclosingFunction(node);

        found.push({
          column: character + 1,
          file: relative,
          fn,
          kind,
          line: line + 1,
          owner: relative === OWNER.file && fn === OWNER.fn,
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(file);
  }

  return found;
};

const readTsconfig = (repoRoot) => {
  const { config, error } = ts.readConfigFile(
    path.join(repoRoot, 'tsconfig.json'),
    (file) => ts.sys.readFile(file)
  );

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, repoRoot);

  if (parsed.errors.length > 0) {
    throw new Error(
      parsed.errors
        .map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        )
        .join('\n')
    );
  }

  return parsed.options;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const repoRoot = path.resolve(import.meta.dirname, '../..');
  const files = listSourceFiles(path.join(repoRoot, SOURCE_ROOT));
  const found = findYjsElementDeletes({
    files,
    options: readTsconfig(repoRoot),
    root: repoRoot,
  });
  const problems = found
    .filter((finding) => !finding.owner)
    .map(({ column, file, kind, line }) =>
      kind === 'element'
        ? `${file}:${line}:${column}: an element child delete; delete through ${OWNER.fn} (${OWNER.file}) so the write scope settles what it hides.`
        : `${file}:${line}:${column}: delete on an untyped value; type it so the check can tell an element from a text or a map.`
    );

  if (!found.some((finding) => finding.owner)) {
    problems.push(
      `${OWNER.file}: ${OWNER.fn} makes no element child delete; update this check's owner.`
    );
  }

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    console.error(`check-yjs-element-deletes: ${problems.length} finding(s)`);
    process.exit(1);
  }

  console.info(
    `check-yjs-element-deletes: ${files.length} files, every element child delete goes through ${OWNER.fn}.`
  );
}
