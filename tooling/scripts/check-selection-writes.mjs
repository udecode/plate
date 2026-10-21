#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const METHODS = new Set([
  'addRange',
  'collapse',
  'collapseToEnd',
  'collapseToStart',
  'deleteFromDocument',
  'empty',
  'extend',
  'getRangeAt',
  'modify',
  'removeAllRanges',
  'removeRange',
  'selectAllChildren',
  'setBaseAndExtent',
  'setPosition',
]);

const EXCEPTIONS = [
  {
    file: 'packages/plitejs/src/dom/utils/selection-writes.ts',
    fn: 'writeDOMSelection',
    reason: 'The one writer, which records what each write leaves.',
  },
  {
    file: 'packages/plitejs/src/dom/utils/selection-writes.ts',
    fn: 'readDOMSelectionRange',
    reason: 'Hands readers a clone of the live range.',
  },
  {
    file: 'packages/plitejs/src/dom/plugin/dom-editor.ts',
    fn: 'resolveVisualPoint',
    reason:
      'A probe that collapses, moves and restores the selection, so it ends where it began and leaves the record alone.',
  },
  {
    file: 'packages/plitejs/src/react/editable/browser-handle.ts',
    fn: 'applyNativeSelection',
    reason: 'Test automation that selects as a user would.',
  },
];

const TEST_PACKAGES = new Set(['test']);
const SOURCE_FILE = /\.(?:ts|tsx|mts)$/u;
const REFUSED_SCRIPT_FILE = /\.(?:js|jsx|mjs|cjs)$/u;
const SKIPPED_FILE = /\.(?:spec|test)\.|\.d\.ts$/u;
const SKIPPED_DIRECTORY = new Set(['__tests__', 'test']);

const listSourceFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORY.has(entry.name)
        ? []
        : listSourceFiles(entryPath);
    }

    return (SOURCE_FILE.test(entry.name) ||
      REFUSED_SCRIPT_FILE.test(entry.name)) &&
      !SKIPPED_FILE.test(entry.name)
      ? [entryPath]
      : [];
  });

const isDOMSelectionMember = (symbol) =>
  symbol.declarations?.some(
    (declaration) =>
      ts.isInterfaceDeclaration(declaration.parent) &&
      declaration.parent.name.text === 'Selection' &&
      path.basename(declaration.getSourceFile().fileName) === 'lib.dom.d.ts'
  ) ?? false;

const keysOf = (checker, expression) => {
  if (ts.isStringLiteralLike(expression)) {
    return { hasUnknownKey: false, keys: [expression.text] };
  }

  const type = checker.getTypeAtLocation(expression);
  const constraint = checker.getBaseConstraintOfType(type) ?? type;
  const members = constraint.isUnion() ? constraint.types : [constraint];

  return {
    hasUnknownKey: members.some((member) => !member.isStringLiteral()),
    keys: members
      .filter((member) => member.isStringLiteral())
      .map((member) => member.value)
      .sort(),
  };
};

const propertyOf = (checker, expression, name) =>
  checker.getPropertyOfType(
    checker.getApparentType(
      checker.getNonNullableType(checker.getTypeAtLocation(expression))
    ),
    name
  );

const isAny = (checker, expression) =>
  (checker.getTypeAtLocation(expression).flags & ts.TypeFlags.Any) !== 0;

const isDOMSelection = (checker, expression) =>
  [...METHODS].some((name) => {
    const symbol = propertyOf(checker, expression, name);

    return symbol ? isDOMSelectionMember(symbol) : false;
  });

const readOfMethod = (checker, method, object, symbol) => {
  if (symbol) {
    return isDOMSelectionMember(symbol) ? { kind: 'selection', method } : null;
  }

  return isAny(checker, object) ? { kind: 'untyped', method } : null;
};

const readsOf = (checker, node) => {
  if (ts.isPropertyAccessExpression(node) && METHODS.has(node.name.text)) {
    const read = readOfMethod(
      checker,
      node.name.text,
      node.expression,
      checker.getSymbolAtLocation(node.name)
    );

    return read ? [read] : [];
  }
  if (ts.isElementAccessExpression(node)) {
    const object = node.expression;
    const { hasUnknownKey, keys } = keysOf(checker, node.argumentExpression);
    const reads = keys
      .filter((key) => METHODS.has(key))
      .map((key) =>
        readOfMethod(checker, key, object, propertyOf(checker, object, key))
      )
      .filter(Boolean);

    return hasUnknownKey && isDOMSelection(checker, object)
      ? [...reads, { kind: 'computed-key', method: null }]
      : reads;
  }
  if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
    const object = node.parent;
    const key = node.propertyName ?? node.name;
    const { hasUnknownKey, keys } = ts.isComputedPropertyName(key)
      ? keysOf(checker, key.expression)
      : {
          hasUnknownKey: false,
          keys:
            ts.isIdentifier(key) || ts.isStringLiteralLike(key)
              ? [key.text]
              : [],
        };
    const reads = keys
      .filter((name) => METHODS.has(name))
      .map((name) =>
        readOfMethod(checker, name, object, propertyOf(checker, object, name))
      )
      .filter(Boolean);

    return hasUnknownKey && isDOMSelection(checker, object)
      ? [...reads, { kind: 'computed-key', method: null }]
      : reads;
  }

  return [];
};

const functionName = (node) => {
  if (
    (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
    node.name
  ) {
    return node.name.getText();
  }
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const { parent } = node;

    if (
      (ts.isVariableDeclaration(parent) || ts.isPropertyAssignment(parent)) &&
      !ts.isBindingPattern(parent.name)
    ) {
      return parent.name.getText();
    }
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

export const findSelectionWrites = ({ files, options, root }) => {
  const program = ts.createProgram(files, { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const found = [];

  if (
    !program
      .getSourceFiles()
      .some((file) => path.basename(file.fileName) === 'lib.dom.d.ts')
  ) {
    throw new Error('lib.dom.d.ts is not in the program');
  }

  for (const fileName of files) {
    const file = program.getSourceFile(fileName);
    const relative = path.relative(root, fileName).split(path.sep).join('/');

    if (!file) throw new Error(`${relative}: not in the program`);

    const visit = (node) => {
      for (const read of readsOf(checker, node)) {
        const { line, character } = file.getLineAndCharacterOfPosition(
          node.getStart()
        );
        const fn = enclosingFunction(node);

        found.push({
          column: character + 1,
          exception: EXCEPTIONS.find(
            (exception) => exception.file === relative && exception.fn === fn
          ),
          file: relative,
          fn,
          kind: read.kind,
          line: line + 1,
          method: read.method,
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
  const rootArgument = process.argv.indexOf('--root');
  const repoRoot =
    rootArgument === -1
      ? path.resolve(import.meta.dirname, '../..')
      : path.resolve(process.argv[rootArgument + 1]);
  const packagesRoot = path.join(repoRoot, 'packages');
  const listed = readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !TEST_PACKAGES.has(entry.name))
    .map((entry) => path.join(packagesRoot, entry.name, 'src'))
    .filter((sourceRoot) => existsSync(sourceRoot))
    .flatMap(listSourceFiles);
  const files = listed.filter((file) => SOURCE_FILE.test(file));
  const found = findSelectionWrites({
    files,
    options: readTsconfig(repoRoot),
    root: repoRoot,
  });
  const scripts = listed
    .filter((file) => REFUSED_SCRIPT_FILE.test(file))
    .map(
      (file) =>
        `${path.relative(repoRoot, file).split(path.sep).join('/')}: a JavaScript file in src; write it in TypeScript so the check can read its types.`
    );
  const problems = found
    .filter((finding) => !finding.exception)
    .map(({ column, file, kind, line, method }) => {
      const at = `${file}:${line}:${column}`;

      if (kind === 'computed-key') {
        return `${at}: a Selection member read by a computed key; name the method so the check can see it.`;
      }

      return kind === 'selection'
        ? `${at}: Selection.${method}; write through writeDOMSelection or read a range copy with readDOMSelectionRange (plitejs dom/utils/selection-writes.ts).`
        : `${at}: ${method} on an any; type the object so the check can tell a Selection from a Range.`;
    })
    .concat(scripts);
  const stale = EXCEPTIONS.filter(
    (exception) => !found.some((finding) => finding.exception === exception)
  ).map(
    ({ file, fn }) =>
      `${file}: the exception for ${fn} matches no Selection read; delete it.`
  );

  if (problems.length + stale.length > 0) {
    console.error([...problems, ...stale].join('\n'));
    console.error(
      `check-selection-writes: ${problems.length + stale.length} finding(s)`
    );
    process.exit(1);
  }

  console.info(
    `check-selection-writes: ${files.length} files, ${found.length} Selection reads, all inside the ${EXCEPTIONS.length} exceptions.`
  );
}
