import { readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  Project,
  SyntaxKind,
} from '../../../../apps/www/node_modules/ts-morph/dist/ts-morph.js';

const roots = ['packages', 'apps', 'tooling', 'benchmarks'];
const ignoredDirectories = new Set([
  '.next',
  '.turbo',
  'dist',
  'node_modules',
  'templates',
]);
const failures = [];
let migratedCalls = 0;
let migratedRootRules = 0;
let writtenFiles = 0;

const collectFiles = async (directory) => {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(join(directory, entry.name))));
      }
      continue;
    }

    if (['.mjs', '.ts', '.tsx'].includes(extname(entry.name))) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
};

const applyEdits = (source, edits) =>
  edits
    .toSorted((left, right) => right.start - left.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      source
    );

for (const file of (await Promise.all(roots.map(collectFiles))).flat()) {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFile = project.addSourceFileAtPath(file);
  const source = sourceFile.getFullText();
  const edits = [];

  for (const call of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )) {
    if (call.getExpression().getText() !== 'defineEditorSchema') continue;

    const arguments_ = call.getArguments();
    const definition = arguments_.at(-1);

    if (
      arguments_.length === 2 &&
      !definition?.isKind(SyntaxKind.ObjectLiteralExpression)
    ) {
      continue;
    }

    if (
      ![1, 2].includes(arguments_.length) ||
      !definition?.isKind(SyntaxKind.ObjectLiteralExpression)
    ) {
      failures.push(
        `${file}:${call.getStartLineNumber()} defineEditorSchema has an invalid definition argument`
      );
      continue;
    }

    if (arguments_.length === 1) {
      const id = definition.getProperty('id');
      let name = `'schema:derived'`;

      if (id?.isKind(SyntaxKind.PropertyAssignment)) {
        const initializer = id.getInitializerOrThrow();

        name = initializer.isKind(SyntaxKind.StringLiteral)
          ? JSON.stringify(`schema:${initializer.getLiteralValue()}`)
          : `\`schema:\${${initializer.getText()}}\``;
      }

      edits.push({
        end: definition.getStart(),
        start: definition.getStart(),
        text: `${name}, `,
      });
      migratedCalls += 1;
    }

    const unwrapContentRule = (property) => {
      if (!property?.isKind(SyntaxKind.PropertyAssignment)) return;

      const initializer = property.getInitializer();

      if (!initializer?.isKind(SyntaxKind.ObjectLiteralExpression)) return;

      const properties = initializer.getProperties();
      const content = properties[0];

      if (
        properties.length !== 1 ||
        !content?.isKind(SyntaxKind.PropertyAssignment) ||
        content.getName() !== 'content'
      ) {
        return;
      }

      edits.push({
        end: initializer.getEnd(),
        start: initializer.getStart(),
        text: content.getInitializerOrThrow().getText(),
      });
      migratedRootRules += 1;
    };

    unwrapContentRule(definition.getProperty('root'));

    const rootDefinitions = definition.getProperty('roots');

    if (rootDefinitions?.isKind(SyntaxKind.PropertyAssignment)) {
      const initializer = rootDefinitions.getInitializer();

      if (initializer?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        for (const property of initializer.getProperties()) {
          unwrapContentRule(property);
        }
      }
    }
  }

  if (edits.length > 0) {
    await writeFile(file, applyEdits(source, edits));
    writtenFiles += 1;
  }
}

process.stdout.write(
  `${JSON.stringify(
    { failures, migratedCalls, migratedRootRules, writtenFiles },
    null,
    2
  )}\n`
);

if (failures.length > 0) process.exitCode = 1;
