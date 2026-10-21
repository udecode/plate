#!/usr/bin/env node
// Deletes test cases by full name, then the imports and top-level helpers that
// only those cases used. A full name joins the enclosing describe() titles and
// the case title with ' > '. A case is an it() or test() call with a literal
// title, or a row of a top-level array that a for-of loop passes to
// it(row.name, ...). Each name must match exactly one case, or no file is
// written.
//
// Usage: node tooling/scripts/cut-tests.mjs <cases.tsv>
// Each line of cases.tsv is `<file>\t<full name>`.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const ts = createRequire(import.meta.url)('@typescript/typescript6');

const CASE_CALLS = new Set(['it', 'test']);

const parse = (fileName, text) =>
  ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

const unwrap = (node) => {
  let current = node;

  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }

  return current;
};

const tableElements = (sourceFile, name) => {
  const declaration = sourceFile.statements
    .filter((statement) => ts.isVariableStatement(statement))
    .flatMap((statement) => statement.declarationList.declarations)
    .find(
      ({ name: binding }) => ts.isIdentifier(binding) && binding.text === name
    );
  const initializer = unwrap(declaration?.initializer);

  return initializer && ts.isArrayLiteralExpression(initializer)
    ? initializer.elements
    : [];
};

const tableRows = (sourceFile, call) => {
  const [title] = call.arguments;

  if (
    !ts.isPropertyAccessExpression(title) ||
    title.name.text !== 'name' ||
    !ts.isIdentifier(title.expression)
  ) {
    return [];
  }

  let loop = call.parent;

  while (loop && !ts.isForOfStatement(loop)) loop = loop.parent;

  if (
    !loop ||
    !ts.isIdentifier(loop.expression) ||
    !ts.isVariableDeclarationList(loop.initializer)
  ) {
    return [];
  }

  const [row] = loop.initializer.declarations;

  if (!ts.isIdentifier(row.name) || row.name.text !== title.expression.text) {
    return [];
  }

  return tableElements(sourceFile, loop.expression.text).flatMap((element) => {
    if (!ts.isObjectLiteralExpression(element)) return [];

    const name = element.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) && property.name.getText() === 'name'
    );

    return name && ts.isStringLiteralLike(name.initializer)
      ? [{ node: element, title: name.initializer.text }]
      : [];
  });
};

const listCases = (sourceFile) => {
  const cases = [];

  const visit = (node, prefix) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.arguments.length > 0
    ) {
      const [title, ...rest] = node.arguments;
      const callee = node.expression.text;

      if (callee === 'describe') {
        if (!ts.isStringLiteralLike(title)) return;

        for (const argument of rest) visit(argument, [...prefix, title.text]);

        return;
      }
      if (CASE_CALLS.has(callee)) {
        const found = ts.isStringLiteralLike(title)
          ? [
              {
                node: ts.isExpressionStatement(node.parent)
                  ? node.parent
                  : null,
                title: title.text,
              },
            ]
          : tableRows(sourceFile, node);

        for (const { node: owner, title: caseTitle } of found) {
          cases.push({ name: [...prefix, caseTitle].join(' > '), node: owner });
        }

        return;
      }
    }

    ts.forEachChild(node, (child) => visit(child, prefix));
  };

  visit(sourceFile, []);

  return cases;
};

const isExported = (node) =>
  ts
    .getModifiers(node)
    ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
  false;

const topLevelBindings = (sourceFile) =>
  sourceFile.statements.flatMap((statement) => {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;

      if (!clause) return [];

      const bindings = clause.namedBindings;
      const named =
        bindings && ts.isNamedImports(bindings) ? bindings.elements : [];

      return [
        clause.name,
        bindings && ts.isNamespaceImport(bindings) ? bindings.name : undefined,
        ...named.map((specifier) => specifier.name),
      ]
        .filter(Boolean)
        .map((nameNode) => ({ nameNode, statement }));
    }
    if (isExported(statement)) return [];
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      statement.name
    ) {
      return [{ nameNode: statement.name, statement }];
    }
    if (ts.isVariableStatement(statement)) {
      const { declarations } = statement.declarationList;

      return declarations.length === 1 && ts.isIdentifier(declarations[0].name)
        ? [{ nameNode: declarations[0].name, statement }]
        : [];
    }

    return [];
  });

const countReferences = (sourceFile) => {
  const declared = new Set(
    topLevelBindings(sourceFile).map(({ nameNode }) => nameNode)
  );
  const counts = new Map();

  const visit = (node) => {
    if (ts.isIdentifier(node) && !declared.has(node)) {
      counts.set(node.text, (counts.get(node.text) ?? 0) + 1);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return counts;
};

const startWithAttachedComments = (text, node) => {
  const fullStart = node.getFullStart();
  const comments = ts.getLeadingCommentRanges(text, fullStart) ?? [];
  let start = node.getStart();

  for (const comment of comments.toReversed()) {
    const headsSection =
      (text.slice(comment.end, start).match(/\n/g) ?? []).length > 1;
    // False for the previous line's trailing comment and for the file header.
    const ownLine = text.slice(fullStart, comment.pos).includes('\n');

    if (headsSection || !ownLine) break;

    start = comment.pos;
  }

  return start;
};

const removal = (text, node) => {
  const start = startWithAttachedComments(text, node);
  let end = node.getEnd();

  if (ts.isArrayLiteralExpression(node.parent)) {
    end += /^\s*,[ \t]*/.exec(text.slice(end))?.[0].length ?? 0;
  }

  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = /^[ \t]*(\r?\n|$)/.exec(text.slice(end));

  return /^[ \t]*$/.test(text.slice(lineStart, start)) && lineEnd
    ? { end: end + lineEnd[0].length, lines: true, start: lineStart, text: '' }
    : { end, lines: false, start, text: '' };
};

const importRewrite = (text, statement, removed) => {
  const clause = statement.importClause;
  const bindings = clause.namedBindings;
  const named =
    bindings && ts.isNamedImports(bindings)
      ? bindings.elements.filter((specifier) => !removed.has(specifier.name))
      : [];
  const parts = [
    clause.name && !removed.has(clause.name) ? clause.name.text : null,
    bindings && ts.isNamespaceImport(bindings) && !removed.has(bindings.name)
      ? bindings.getText()
      : null,
    named.length > 0
      ? `{ ${named.map((specifier) => specifier.getText()).join(', ')} }`
      : null,
  ].filter(Boolean);

  if (parts.length === 0) return removal(text, statement);

  return {
    end: clause.getEnd(),
    lines: false,
    start: clause.getStart(),
    text: `${clause.isTypeOnly ? 'type ' : ''}${parts.join(', ')}`,
  };
};

const applyEdits = (text, edits) => {
  let result = text;

  for (const edit of edits.toSorted((a, b) => b.start - a.start)) {
    let head = result.slice(0, edit.start);
    let tail = result.slice(edit.end);

    if (edit.lines) {
      if (
        tail.startsWith('\n') &&
        (head === '' || head.endsWith('\n\n') || /[{[(]\n$/.test(head))
      ) {
        tail = tail.slice(1);
      } else if (head.endsWith('\n\n') && /^[ \t]*[}\])]/.test(tail)) {
        head = head.slice(0, -1);
      }
    }

    result = head + edit.text + tail;
  }

  return result;
};

export const cutTests = (fileName, text, names) => {
  const sourceFile = parse(fileName, text);
  const cases = listCases(sourceFile);
  const problems = [];
  const targets = [...new Set(names)].map((name) => {
    const matches = cases.filter((testCase) => testCase.name === name);

    if (matches.length !== 1) {
      problems.push(
        `${matches.length === 0 ? 'no case' : `${matches.length} cases`} named ${JSON.stringify(name)}`
      );
    } else if (!matches[0].node) {
      problems.push(`${JSON.stringify(name)} is not a statement of its own`);
    }

    return matches[0]?.node;
  });

  if (problems.length > 0) {
    throw new Error(
      problems.map((problem) => `${fileName}: ${problem}`).join('\n')
    );
  }

  const usedBefore = countReferences(sourceFile);
  const helpers = [];
  let result = applyEdits(
    text,
    targets.map((node) => removal(text, node))
  );

  for (;;) {
    const current = parse(fileName, result);
    const references = countReferences(current);
    const orphans = topLevelBindings(current).filter(
      ({ nameNode }) =>
        usedBefore.get(nameNode.text) > 0 && !references.get(nameNode.text)
    );

    if (orphans.length === 0) return { helpers, text: result };

    helpers.push(...orphans.map(({ nameNode }) => nameNode.text));

    const removed = new Set(orphans.map(({ nameNode }) => nameNode));
    const statements = new Set(orphans.map(({ statement }) => statement));

    result = applyEdits(
      result,
      [...statements].map((statement) =>
        ts.isImportDeclaration(statement)
          ? importRewrite(result, statement, removed)
          : removal(result, statement)
      )
    );
  }
};

const main = (listPath) => {
  const namesByFile = new Map();

  for (const line of readFileSync(listPath, 'utf-8').split('\n')) {
    if (!line.trim()) continue;

    const [file, name] = line.split('\t');

    namesByFile.set(file, [...(namesByFile.get(file) ?? []), name]);
  }

  const problems = [];
  const results = [...namesByFile].flatMap(([file, names]) => {
    try {
      return [
        { file, names, ...cutTests(file, readFileSync(file, 'utf-8'), names) },
      ];
    } catch (error) {
      problems.push(error.message);

      return [];
    }
  });

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }

  for (const { file, helpers, names, text } of results) {
    writeFileSync(file, text);
    console.log(
      `${file}: cut ${names.length} cases${helpers.length > 0 ? `, then ${helpers.join(', ')}` : ''}`
    );
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) {
    console.error('Usage: node tooling/scripts/cut-tests.mjs <cases.tsv>');
    process.exit(2);
  }

  main(process.argv[2]);
}
