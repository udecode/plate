#!/usr/bin/env node
// A draft document value can carry its records only beside its JSON, in core's
// record store, and a spread copies own fields only. So every object spread of
// a document value, and every rest over one, must say what happens to its
// records: a spread is the first argument of `withValueRecords` or
// `showValueRecords`, or becomes `deriveValue`, and a rest names `records`.
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const ATTACHES = new Set(['showValueRecords', 'withValueRecords']);

// A document value's `children` is its content and its `records` an optional
// field, unlike a transaction, whose `children` reads and `records` writes.
const isDocumentValue = (checker, type) => {
  const constraint = checker.getBaseConstraintOfType(type) ?? type;
  const parts = constraint.isUnion() ? constraint.types : [constraint];

  return parts.some((part) => {
    const apparent = checker.getApparentType(checker.getNonNullableType(part));
    const children = apparent.getProperty('children');
    const records = apparent.getProperty('records');

    return (
      children !== undefined &&
      records !== undefined &&
      (records.flags & ts.SymbolFlags.Optional) !== 0 &&
      checker.getTypeOfSymbol(children).getCallSignatures().length === 0
    );
  });
};

const attachesRecords = (literal) => {
  let node = literal;

  while (
    ts.isParenthesizedExpression(node.parent) ||
    ts.isAsExpression(node.parent) ||
    ts.isSatisfiesExpression(node.parent) ||
    ts.isNonNullExpression(node.parent)
  ) {
    node = node.parent;
  }

  const call = node.parent;

  return (
    ts.isCallExpression(call) &&
    call.arguments[0] === node &&
    ts.isIdentifier(call.expression) &&
    ATTACHES.has(call.expression.text)
  );
};

const namesRecords = (pattern) =>
  pattern.elements.some(
    (element) =>
      !element.dotDotDotToken &&
      (element.propertyName ?? element.name).getText() === 'records'
  );

/** Each spread or rest under `prefix` that drops a document value's records. */
export const findValueSpreads = (configPath, prefix = 'src/') => {
  const config = ts.getParsedCommandLineOfConfigFile(
    path.resolve(configPath),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} }
  );
  const program = ts.createProgram(config.fileNames, config.options);
  const checker = program.getTypeChecker();
  const root = path.dirname(path.resolve(configPath));
  const found = [];

  for (const file of program.getSourceFiles()) {
    const relative = path
      .relative(root, file.fileName)
      .split(path.sep)
      .join('/');

    if (file.isDeclarationFile || !relative.startsWith(prefix)) continue;

    const report = (node, kind) => {
      const { line } = file.getLineAndCharacterOfPosition(node.getStart());

      found.push({ file: relative, kind, line: line + 1 });
    };
    const visit = (node) => {
      if (
        ts.isSpreadAssignment(node) &&
        isDocumentValue(checker, checker.getTypeAtLocation(node.expression)) &&
        !attachesRecords(node.parent)
      ) {
        report(node, 'spread');
      }
      if (
        ts.isObjectBindingPattern(node) &&
        node.elements.some((element) => element.dotDotDotToken) &&
        isDocumentValue(checker, checker.getTypeAtLocation(node)) &&
        !namesRecords(node)
      ) {
        report(node, 'rest');
      }
      ts.forEachChild(node, visit);
    };

    visit(file);
  }

  return found;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const config = 'packages/plitejs/tsconfig.json';
  const found = findValueSpreads(config);

  for (const { file, kind, line } of found) {
    console.error(
      `packages/plitejs/${file}:${line}: this ${kind} drops the records a document value carries beside its JSON. Use deriveValue, name records in the rest, or pass the object to withValueRecords or showValueRecords.`
    );
  }
  if (found.length > 0) process.exit(1);
  console.info(
    'check-value-records: no document value spread drops its records.'
  );
}
