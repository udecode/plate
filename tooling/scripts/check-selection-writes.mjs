#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync, readdirSync, realpathSync } from 'node:fs';
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
    fn: 'changeDOMSelection',
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

const RAW_WRITERS = new Set(['changeDOMSelection', 'writeDOMSelection']);

const WRITER_EXCEPTIONS = [
  {
    file: 'packages/plitejs/src/dom/utils/selection-writes.ts',
    fn: 'writeDOMSelection',
    reason: 'Public plitejs/dom wrapper over changeDOMSelection.',
  },
  {
    file: 'packages/plitejs/src/dom/plugin/dom-root-runtime.ts',
    fn: 'writeEditableDOMSelection',
    reason: 'Editable-scoped DOM selection write gate in plitejs.',
  },
  {
    file: 'packages/plitejs/src/dom/plugin/dom-root-runtime.ts',
    fn: 'clearEditableDOMSelection',
    reason: 'Editable-scoped DOM selection clear gate in plitejs.',
  },
  {
    file: 'packages/platejs/src/react/components/NodeSelection.tsx',
    fn: 'clearNodeSelectionDOMSelection',
    reason:
      'Guarded Plate clear helper across the public plitejs/dom package boundary.',
  },
];

const CANONICAL_WRITER_FILES = [
  'packages/plitejs/src/dom/utils/selection-writes.ts',
  'packages/plitejs/src/dom/utils/selection-writes.d.ts',
  'packages/plitejs/dist/dom/index.d.ts',
  'packages/plitejs/dist/dom/index.d.mts',
  'packages/plitejs/dist/dom/index.d.cts',
];

const TEST_PACKAGES = new Set(['test']);
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts)$/u;
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

const safeRealpath = (filePath) => {
  try {
    return realpathSync(filePath);
  } catch {
    return path.resolve(filePath);
  }
};

const createRawSelectionWriterMatcher = (root) => {
  const canonicalCandidates = CANONICAL_WRITER_FILES.map((relative) =>
    path.resolve(root, relative)
  );
  const hasCanonical = canonicalCandidates.some((candidate) =>
    existsSync(candidate)
  );
  const allowed = new Set();

  for (const candidate of hasCanonical
    ? canonicalCandidates
    : [path.resolve(root, 'selection-writes.ts')]) {
    allowed.add(candidate);
    allowed.add(safeRealpath(candidate));
  }

  return (fileName) => {
    const resolved = path.resolve(fileName);

    return allowed.has(resolved) || allowed.has(safeRealpath(resolved));
  };
};

const isDOMSelectionMember = (symbol) =>
  symbol.declarations?.some(
    (declaration) =>
      ts.isInterfaceDeclaration(declaration.parent) &&
      declaration.parent.name.text === 'Selection' &&
      path.basename(declaration.getSourceFile().fileName) === 'lib.dom.d.ts'
  ) ?? false;

const resolveTargetSymbol = (checker, symbol) => {
  let current = symbol;
  const seen = new Set();

  while (
    current &&
    (current.flags & ts.SymbolFlags.Alias) !== 0 &&
    !seen.has(current)
  ) {
    seen.add(current);
    current = checker.getAliasedSymbol(current);
  }

  return current ?? null;
};

const rawSelectionWriterName = (checker, symbol, isWriterFile) => {
  const target = resolveTargetSymbol(checker, symbol);

  if (!target || !RAW_WRITERS.has(target.getName())) return null;

  return target.declarations?.some((declaration) =>
    isWriterFile(declaration.getSourceFile().fileName)
  )
    ? target.getName()
    : null;
};

const isInsideTypePosition = (node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (
      ts.isTypeNode(current) ||
      ts.isTypeAliasDeclaration(current) ||
      ts.isInterfaceDeclaration(current)
    ) {
      return true;
    }
    if (ts.isStatement(current)) return false;
  }

  return false;
};

const isValueIdentifierReference = (node) => {
  const { parent } = node;

  if (!parent || isInsideTypePosition(node)) return false;
  if (
    ts.isImportSpecifier(parent) ||
    ts.isImportClause(parent) ||
    ts.isNamespaceImport(parent) ||
    ts.isExportSpecifier(parent) ||
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isVariableDeclaration(parent) && parent.name === node) ||
    (ts.isFunctionDeclaration(parent) && parent.name === node) ||
    (ts.isParameter(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isShorthandPropertyAssignment(parent) && parent.name === node) ||
    (ts.isPropertySignature(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) &&
      (parent.name === node || parent.propertyName === node))
  ) {
    return false;
  }

  return true;
};

const isDirectlyInspectedNamespacePosition = (node) => {
  let current = node;

  while (current.parent && ts.isParenthesizedExpression(current.parent)) {
    current = current.parent;
  }

  const { parent } = current;

  if (!parent) return false;
  if (
    (ts.isPropertyAccessExpression(parent) && parent.expression === current) ||
    (ts.isElementAccessExpression(parent) && parent.expression === current) ||
    (ts.isVariableDeclaration(parent) &&
      parent.initializer === current &&
      ts.isObjectBindingPattern(parent.name)) ||
    (ts.isBinaryExpression(parent) &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      parent.right === current &&
      isDestructuringPatternExpression(parent.left))
  ) {
    return true;
  }

  if (ts.isArrayLiteralExpression(parent)) {
    return isDirectlyInspectedNamespacePosition(parent);
  }
  if (
    ts.isForOfStatement(parent) &&
    parent.expression === current &&
    isDestructuringPatternExpression(parent.initializer)
  ) {
    return true;
  }

  return false;
};

const isDestructuringPatternExpression = (node) => {
  let current = node;

  while (ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }

  return (
    ts.isObjectLiteralExpression(current) ||
    ts.isArrayLiteralExpression(current) ||
    ts.isVariableDeclarationList(current)
  );
};

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

const propertyOfType = (checker, type, name) =>
  checker.getPropertyOfType(
    checker.getApparentType(checker.getNonNullableType(type)),
    name
  );

const isAnyType = (type) => (type.flags & ts.TypeFlags.Any) !== 0;

const isDOMSelectionType = (checker, type) =>
  [...METHODS].some((name) => {
    const symbol = propertyOfType(checker, type, name);

    return symbol ? isDOMSelectionMember(symbol) : false;
  });

const isRawWriterNamespaceType = (checker, type, isWriterFile) => {
  const apparent = checker.getApparentType(checker.getNonNullableType(type));

  return checker
    .getPropertiesOfType(apparent)
    .some((symbol) => !!rawSelectionWriterName(checker, symbol, isWriterFile));
};

const readOfMethodType = (method, type, symbol) => {
  if (symbol) {
    return isDOMSelectionMember(symbol) ? { kind: 'selection', method } : null;
  }

  return isAnyType(type) ? { kind: 'untyped', method } : null;
};

const readOfRawWriterType = (checker, name, type, symbol, isWriterFile) => {
  const writer = rawSelectionWriterName(checker, symbol, isWriterFile);

  if (writer) return { kind: 'raw-writer', method: writer };

  return RAW_WRITERS.has(name) && isAnyType(type)
    ? { kind: 'untyped', method: name }
    : null;
};

const getIterableElementType = (checker, type, index = null) => {
  const nonNull = checker.getNonNullableType(type);

  if (
    index !== null &&
    checker.isTupleType(nonNull) &&
    nonNull.typeArguments?.[index]
  ) {
    return nonNull.typeArguments[index];
  }

  const numberIndexed = checker.getIndexTypeOfType(
    nonNull,
    ts.IndexKind.Number
  );

  if (numberIndexed) return numberIndexed;

  const iteratorSymbol = checker
    .getPropertiesOfType(checker.getApparentType(nonNull))
    .find((symbol) => symbol.getName() === '__@iterator');

  if (!iteratorSymbol) return null;

  const iteratorFnType = checker.getTypeOfSymbolAtLocation(
    iteratorSymbol,
    iteratorSymbol.valueDeclaration ?? iteratorSymbol.declarations?.[0]
  );
  const callSignature = iteratorFnType.getCallSignatures()[0];
  const iteratorType = callSignature?.getReturnType();
  const nextSymbol = iteratorType
    ? propertyOfType(checker, iteratorType, 'next')
    : null;
  const nextReturn = nextSymbol
    ? checker
        .getTypeOfSymbolAtLocation(
          nextSymbol,
          nextSymbol.valueDeclaration ?? nextSymbol.declarations?.[0]
        )
        .getCallSignatures()[0]
        ?.getReturnType()
    : null;
  const valueSymbol = nextReturn
    ? propertyOfType(checker, nextReturn, 'value')
    : null;

  return valueSymbol
    ? checker.getTypeOfSymbolAtLocation(
        valueSymbol,
        valueSymbol.valueDeclaration ?? valueSymbol.declarations?.[0]
      )
    : null;
};

const getAssignmentTargetType = (checker, target) => {
  let current = target;

  while (current.parent && ts.isParenthesizedExpression(current.parent)) {
    current = current.parent;
  }

  const { parent } = current;

  if (!parent) return null;
  if (
    ts.isBinaryExpression(parent) &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    parent.left === current
  ) {
    return checker.getTypeAtLocation(parent.right);
  }
  if (
    ts.isPropertyAssignment(parent) &&
    parent.initializer === current &&
    ts.isObjectLiteralExpression(parent.parent)
  ) {
    const parentType = getAssignmentTargetType(checker, parent.parent);

    if (!parentType) return null;
    if (ts.isIdentifier(parent.name) || ts.isStringLiteralLike(parent.name)) {
      const symbol = propertyOfType(checker, parentType, parent.name.text);

      return symbol ? checker.getTypeOfSymbolAtLocation(symbol, parent) : null;
    }

    return null;
  }
  if (ts.isArrayLiteralExpression(parent)) {
    const index = parent.elements.indexOf(current);

    if (index === -1) return null;

    const arrayType = getAssignmentTargetType(checker, parent);

    return arrayType ? getIterableElementType(checker, arrayType, index) : null;
  }
  if (ts.isForOfStatement(parent) && parent.initializer === current) {
    return getIterableElementType(
      checker,
      checker.getTypeAtLocation(parent.expression)
    );
  }

  return null;
};

const readsFromKeysOnType = (
  checker,
  type,
  keys,
  hasUnknownKey,
  isWriterFile
) => {
  const reads = keys
    .filter((key) => METHODS.has(key))
    .map((key) =>
      readOfMethodType(key, type, propertyOfType(checker, type, key))
    )
    .filter(Boolean);
  const writerReads = keys
    .map((key) =>
      readOfRawWriterType(
        checker,
        key,
        type,
        propertyOfType(checker, type, key),
        isWriterFile
      )
    )
    .filter(Boolean);
  const results = [...reads, ...writerReads];

  if (hasUnknownKey && isDOMSelectionType(checker, type)) {
    results.push({ kind: 'computed-key', method: null });
  }
  if (hasUnknownKey && isRawWriterNamespaceType(checker, type, isWriterFile)) {
    results.push({ kind: 'raw-writer-computed-key', method: null });
  }

  return results;
};

const readsOf = (checker, node, isWriterFile) => {
  if (ts.isIdentifier(node) && isValueIdentifierReference(node)) {
    const symbol = checker.getSymbolAtLocation(node);
    const writer = rawSelectionWriterName(checker, symbol, isWriterFile);

    if (writer) return [{ kind: 'raw-writer', method: writer }];

    if (
      !isDirectlyInspectedNamespacePosition(node) &&
      isRawWriterNamespaceType(
        checker,
        checker.getTypeAtLocation(node),
        isWriterFile
      )
    ) {
      return [{ kind: 'raw-writer-namespace', method: node.text }];
    }

    return [];
  }
  if (
    ts.isShorthandPropertyAssignment(node) &&
    ts.isObjectLiteralExpression(node.parent)
  ) {
    const targetType = getAssignmentTargetType(checker, node.parent);

    if (targetType) {
      return readsFromKeysOnType(
        checker,
        targetType,
        [node.name.text],
        false,
        isWriterFile
      );
    }

    const valueSymbol = checker.getShorthandAssignmentValueSymbol(node);
    const writer = rawSelectionWriterName(checker, valueSymbol, isWriterFile);

    if (writer) return [{ kind: 'raw-writer', method: writer }];

    const valueType = valueSymbol
      ? checker.getTypeOfSymbolAtLocation(valueSymbol, node)
      : null;

    return valueType &&
      isRawWriterNamespaceType(checker, valueType, isWriterFile)
      ? [{ kind: 'raw-writer-namespace', method: node.name.text }]
      : [];
  }
  if (
    ts.isPropertyAssignment(node) &&
    ts.isObjectLiteralExpression(node.parent)
  ) {
    const targetType = getAssignmentTargetType(checker, node.parent);

    if (!targetType) return [];

    const { hasUnknownKey, keys } = ts.isComputedPropertyName(node.name)
      ? keysOf(checker, node.name.expression)
      : {
          hasUnknownKey: false,
          keys:
            ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)
              ? [node.name.text]
              : [],
        };

    return readsFromKeysOnType(
      checker,
      targetType,
      keys,
      hasUnknownKey,
      isWriterFile
    );
  }
  if (ts.isPropertyAccessExpression(node)) {
    const name = node.name.text;
    const symbol = checker.getSymbolAtLocation(node.name);
    const receiverType = checker.getTypeAtLocation(node.expression);

    if (METHODS.has(name)) {
      const read = readOfMethodType(name, receiverType, symbol);

      if (read) return [read];
    }

    if (!isInsideTypePosition(node)) {
      const writerRead = readOfRawWriterType(
        checker,
        name,
        receiverType,
        symbol,
        isWriterFile
      );

      if (writerRead) return [writerRead];
    }

    return [];
  }
  if (ts.isElementAccessExpression(node)) {
    const { hasUnknownKey, keys } = keysOf(checker, node.argumentExpression);

    return readsFromKeysOnType(
      checker,
      checker.getTypeAtLocation(node.expression),
      keys,
      hasUnknownKey,
      isWriterFile
    );
  }
  if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
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

    return readsFromKeysOnType(
      checker,
      checker.getTypeAtLocation(node.parent),
      keys,
      hasUnknownKey,
      isWriterFile
    );
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

const isRawWriterKind = (kind) =>
  kind === 'raw-writer' ||
  kind === 'raw-writer-computed-key' ||
  kind === 'raw-writer-namespace';

export const findSelectionWrites = ({ files, options, root }) => {
  const program = ts.createProgram(files, { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const isWriterFile = createRawSelectionWriterMatcher(root);
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
      for (const read of readsOf(checker, node, isWriterFile)) {
        const { line, character } = file.getLineAndCharacterOfPosition(
          node.getStart()
        );
        const fn = enclosingFunction(node);
        const table = isRawWriterKind(read.kind)
          ? WRITER_EXCEPTIONS
          : EXCEPTIONS;

        found.push({
          column: character + 1,
          exception: table.find(
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
      if (kind === 'raw-writer-computed-key') {
        return `${at}: a raw selection-writes member read by a computed key; write through writeEditableDOMSelection or clearEditableDOMSelection (plitejs dom/plugin/dom-root-runtime.ts).`;
      }
      if (kind === 'raw-writer-namespace') {
        return `${at}: namespace ${method} containing raw selection writers passed as a value; import the non-writer helpers directly instead.`;
      }
      if (kind === 'raw-writer') {
        return `${at}: raw ${method}; write through writeEditableDOMSelection or clearEditableDOMSelection (plitejs dom/plugin/dom-root-runtime.ts).`;
      }

      return kind === 'selection'
        ? `${at}: Selection.${method}; write through writeEditableDOMSelection or clearEditableDOMSelection (plitejs dom/plugin/dom-root-runtime.ts) or read a range copy with readDOMSelectionRange (plitejs dom/utils/selection-writes.ts).`
        : `${at}: ${method} on an any; type the object so the check can tell a Selection or raw writer from another value.`;
    })
    .concat(scripts);
  const stale = [...EXCEPTIONS, ...WRITER_EXCEPTIONS]
    .filter(
      (exception) => !found.some((finding) => finding.exception === exception)
    )
    .map(
      ({ file, fn }) =>
        `${file}: the exception for ${fn} matches no selection read or raw writer; delete it.`
    );

  if (problems.length + stale.length > 0) {
    console.error([...problems, ...stale].join('\n'));
    console.error(
      `check-selection-writes: ${problems.length + stale.length} finding(s)`
    );
    process.exit(1);
  }

  const selectionReads = found.filter((f) => !isRawWriterKind(f.kind)).length;
  const rawWriterReads = found.length - selectionReads;

  console.info(
    `check-selection-writes: ${files.length} files, ${selectionReads} Selection reads and ${rawWriterReads} raw writer calls, all inside the ${EXCEPTIONS.length + WRITER_EXCEPTIONS.length} exceptions.`
  );
}
