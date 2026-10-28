#!/usr/bin/env node
// TypeScript 7 exposes its parser only under `typescript/unstable/*`, so this
// check uses the stable TypeScript 6 API.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { trackedFiles } from './private-files.mjs';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const FOLDERS = ['apps/plite/tests/plite-browser', 'apps/www/tests/browser'];
const PLAYWRIGHT = new Set(['@playwright/test', 'playwright/test']);
const PACKAGE = '@platejs/test/playwright';
const MOVED = new Set(['expect', 'test']);
const LOADABLE = [
  'chromium',
  'defineConfig',
  'devices',
  'errors',
  'firefox',
  'mergeExpects',
  'mergeTests',
  'request',
  'selectors',
  'webkit',
];
const DEFAULT = "default from Playwright, which is Playwright's test";
const ANY_RECEIVER_OPENERS = new Set([
  'connectOverCDP',
  'launch',
  'launchPersistentContext',
  'newContext',
]);
const BROWSER_TYPES = new Set(['browserType', 'chromium', 'firefox', 'webkit']);
const MARKER = /^\s*\/\/ browser-test-imports:(.*)$/u;
const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/u;
const OPENS = 'which opens a context or browser the capture does not read';
const FORMATTER_WIDTH = 80;

const isPlaywright = (node) =>
  !!node && ts.isStringLiteralLike(node) && PLAYWRIGHT.has(node.text);
const isTypeImport = (clause) =>
  clause.phaseModifier === ts.SyntaxKind.TypeKeyword;
const unwrap = (node) =>
  ts.isAwaitExpression(node) || ts.isParenthesizedExpression(node)
    ? unwrap(node.expression)
    : node;
const taken = (name) => {
  if (LOADABLE.includes(name)) return null;
  if (name === 'default') return DEFAULT;
  if (MOVED.has(name)) return `${name} from Playwright`;

  return `${name} from Playwright; a spec loads only ${LOADABLE.join(', ')} from it at runtime, and imports a type with import type`;
};
const isImportCall = (node) =>
  node.expression.kind === ts.SyntaxKind.ImportKeyword;
const isLoad = (node) =>
  ts.isCallExpression(node) &&
  isPlaywright(node.arguments[0]) &&
  !(
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'resolve'
  );
const isBrowserType = (node) => {
  const inner = unwrap(node);

  return (
    (ts.isIdentifier(inner) && BROWSER_TYPES.has(inner.text)) ||
    (ts.isPropertyAccessExpression(inner) &&
      BROWSER_TYPES.has(inner.name.text)) ||
    (ts.isCallExpression(inner) &&
      ts.isPropertyAccessExpression(inner.expression) &&
      inner.expression.name.text === 'browserType') ||
    (ts.isConditionalExpression(inner) &&
      (isBrowserType(inner.whenTrue) || isBrowserType(inner.whenFalse)))
  );
};
const opener = (node) => {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression)
  ) {
    return null;
  }

  const { expression: receiver, name } = node.expression;

  if (ANY_RECEIVER_OPENERS.has(name.text)) return name.text;
  if (name.text === 'connect' && isBrowserType(receiver)) return 'connect';
  if (
    name.text === 'newPage' &&
    ts.isIdentifier(receiver) &&
    receiver.text === 'browser'
  ) {
    return 'browser.newPage';
  }

  return null;
};
const isStatementListItem = (node) =>
  !!node.parent &&
  (ts.isSourceFile(node.parent) ||
    ts.isBlock(node.parent) ||
    ts.isModuleBlock(node.parent) ||
    ts.isCaseClause(node.parent) ||
    ts.isDefaultClause(node.parent));

const findProblems = (fileName, text) => {
  const file = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true
  );
  const lineOf = (position) =>
    file.getLineAndCharacterOfPosition(position).line;
  const found = [];
  const openers = [];
  const statements = new Map();
  const at = (node, problem, move = null) =>
    found.push({ move, position: node.getStart(), problem });

  const visit = (node) => {
    if (isStatementListItem(node) && !statements.has(lineOf(node.getStart()))) {
      statements.set(lineOf(node.getStart()), node);
    }
    if (ts.isImportDeclaration(node) && isPlaywright(node.moduleSpecifier)) {
      const clause = node.importClause;

      if (clause && !isTypeImport(clause)) {
        if (clause.name) {
          at(node, "a default import, which is Playwright's test");
        }
        if (
          clause.namedBindings &&
          ts.isNamespaceImport(clause.namedBindings)
        ) {
          at(
            node,
            'a namespace import of Playwright; import the names you use'
          );
        }
        if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) {
            const name = (element.propertyName ?? element.name).text;

            if (!element.isTypeOnly && taken(name)) {
              at(
                element,
                taken(name),
                MOVED.has(name) ? { declaration: node, element } : null
              );
            }
          }
        }
      }
    }
    if (
      ts.isExportDeclaration(node) &&
      isPlaywright(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      if (!node.exportClause || ts.isNamespaceExport(node.exportClause)) {
        at(node, 'a re-export of every Playwright export');
      } else {
        for (const element of node.exportClause.elements) {
          const name = (element.propertyName ?? element.name).text;

          if (!element.isTypeOnly && taken(name)) {
            at(element, `a re-export of ${name} from Playwright`);
          }
        }
      }
    }
    if (
      ts.isImportEqualsDeclaration(node) &&
      !node.isTypeOnly &&
      ts.isExternalModuleReference(node.moduleReference) &&
      isPlaywright(node.moduleReference.expression)
    ) {
      at(node, 'a namespace import of Playwright; import the names you use');
    }
    if (isLoad(node)) {
      let value = node;
      let awaited = false;

      while (
        ts.isParenthesizedExpression(value.parent) ||
        ts.isAwaitExpression(value.parent)
      ) {
        awaited ||= ts.isAwaitExpression(value.parent);
        value = value.parent;
      }

      const user = value.parent;

      if (isImportCall(node) && !awaited) {
        at(
          node,
          'an import of Playwright that is not awaited; await it and destructure the names you use'
        );
      } else if (
        ts.isVariableDeclaration(user) &&
        user.initializer === value &&
        ts.isObjectBindingPattern(user.name)
      ) {
        for (const element of user.name.elements) {
          const key = element.propertyName ?? element.name;

          if (element.dotDotDotToken) {
            at(
              element,
              'a rest binding of Playwright; destructure the names you use'
            );
          } else if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) {
            at(element, 'a computed name read from Playwright');
          } else if (taken(key.text)) {
            at(element, taken(key.text));
          }
        }
      } else if (
        ts.isPropertyAccessExpression(user) &&
        user.expression === value
      ) {
        if (taken(user.name.text)) at(user, taken(user.name.text));
      } else if (
        ts.isElementAccessExpression(user) &&
        user.expression === value
      ) {
        at(user, 'a computed name read from Playwright');
      } else {
        at(
          node,
          'a namespace load of Playwright; destructure the names you use'
        );
      }
    }

    const opened = opener(node);

    if (opened) {
      openers.push({
        excused: false,
        position: node.expression.name.getStart(),
        problem: `${opened}, ${OPENS}`,
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(file);

  text.split('\n').forEach((line, index) => {
    const match = MARKER.exec(line);

    if (!match) return;

    const reason = match[1].trim();
    const statement = statements.get(index + 1);
    const markerAt = file.getPositionOfLineAndCharacter(index, 0);
    const refuse = (problem) => found.push({ position: markerAt, problem });

    if (statement && ts.isImportDeclaration(statement)) {
      refuse('a marker above an import; a marker never excuses an import');

      return;
    }
    if (!reason) {
      refuse('a marker with no reason after its colon');

      return;
    }

    const covered = statement
      ? openers.filter(
          ({ position }) =>
            position >= statement.getStart() && position < statement.getEnd()
        )
      : [];

    if (covered.length === 0) {
      refuse('a marker with nothing under it to excuse; delete it');
    }
    for (const covers of covered) covers.excused = true;
  });

  const problems = [...found, ...openers.filter(({ excused }) => !excused)].map(
    ({ move = null, position, problem }) => {
      const { character, line } = file.getLineAndCharacterOfPosition(position);

      return { column: character + 1, line: line + 1, move, position, problem };
    }
  );

  return { file, problems: problems.sort((a, b) => a.position - b.position) };
};

const sortNames = (names) =>
  [...new Set(names)].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' })
  );

const printImport = ({ head, names, specifier }) => {
  const line = `import ${head}{ ${names.join(', ')} } from ${specifier};`;

  return line.length <= FORMATTER_WIDTH
    ? line
    : `import ${head}{\n${names
        .map((name) => `  ${name},\n`)
        .join('')}} from ${specifier};`;
};

const moveImports = (file, problems) => {
  const moves = problems.map((problem) => problem.move).filter(Boolean);

  if (moves.length === 0) return null;

  const edits = [];
  const declarations = new Map();

  for (const { declaration, element } of moves) {
    declarations.set(declaration, [
      ...(declarations.get(declaration) ?? []),
      element,
    ]);
  }
  for (const [declaration, elements] of declarations) {
    const { name, namedBindings } = declaration.importClause;
    const kept = namedBindings.elements.filter(
      (element) => !elements.includes(element)
    );
    const allTypes = !name && kept.every((element) => element.isTypeOnly);
    const removed = kept.length === 0 && !name;
    const end = declaration.getEnd();

    edits.push({
      end: removed && file.text[end] === '\n' ? end + 1 : end,
      start: declaration.getStart(),
      text: removed
        ? ''
        : printImport({
            head: name ? `${name.text}, ` : allTypes ? 'type ' : '',
            names: sortNames(
              kept.map((element) =>
                allTypes
                  ? element.getText().replace(/^type\s+/u, '')
                  : element.getText()
              )
            ),
            specifier: declaration.moduleSpecifier.getText(),
          }),
    });
  }

  const names = moves.map(({ element }) => element.getText());
  const target = file.statements.find(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteralLike(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === PACKAGE &&
      statement.importClause &&
      !isTypeImport(statement.importClause) &&
      statement.importClause.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
  );

  if (target) {
    const { name, namedBindings } = target.importClause;

    edits.push({
      end: target.getEnd(),
      start: target.getStart(),
      text: printImport({
        head: name ? `${name.text}, ` : '',
        names: sortNames([
          ...namedBindings.elements.map((element) => element.getText()),
          ...names,
        ]),
        specifier: target.moduleSpecifier.getText(),
      }),
    });
  } else {
    const first = declarations.keys().next().value;
    const quote = first.moduleSpecifier.getText()[0];

    edits.push({
      end: first.getStart(),
      start: first.getStart(),
      text: `${printImport({
        head: '',
        names: sortNames(names),
        specifier: `${quote}${PACKAGE}${quote}`,
      })}\n`,
    });
  }

  return edits
    .sort((a, b) => b.start - a.start || b.end - a.end)
    .reduce(
      (next, edit) =>
        next.slice(0, edit.start) + edit.text + next.slice(edit.end),
      file.text
    );
};

export const checkBrowserTestImports = ({ files, fix = false, root }) => {
  const problems = [];
  let moved = 0;

  for (const relative of files) {
    const absolute = path.join(root, relative);
    let scan = findProblems(absolute, readFileSync(absolute, 'utf-8'));

    if (fix) {
      const next = moveImports(scan.file, scan.problems);

      if (next !== null) {
        writeFileSync(absolute, next);
        scan = findProblems(absolute, next);
        moved += 1;
      }
    }
    for (const { column, line, problem } of scan.problems) {
      problems.push(`${relative}:${line}:${column}: ${problem}`);
    }
  }

  return { moved, problems };
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const fix = process.argv.includes('--fix');
  const root = path.resolve(import.meta.dirname, '../..');
  const files = trackedFiles(root, {
    pathspecs: FOLDERS,
    untracked: true,
  }).filter((file) => SOURCE_FILE.test(file));
  const { moved, problems } = checkBrowserTestImports({ files, fix, root });

  if (moved > 0) {
    console.info(
      `check-browser-test-imports: moved the imports in ${moved} file(s).`
    );
  }
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    console.error(
      `check-browser-test-imports: ${
        problems.length
      } finding(s). Browser specs take test and expect from ${PACKAGE}, whose test saves editor-state.json when a test fails, and use the test's own context, which that file reads. A measurement that needs its own context or browser, request.newContext() included, puts "// browser-test-imports: <reason>" on the line above the statement that opens it.${
        fix
          ? ''
          : ' node tooling/scripts/check-browser-test-imports.mjs --fix moves the named imports.'
      }`
    );
    process.exit(1);
  }

  console.info(
    `check-browser-test-imports: ${files.length} browser test files take test and expect from ${PACKAGE}, and each context or browser they open apart from the test's carries a marker.`
  );
}
