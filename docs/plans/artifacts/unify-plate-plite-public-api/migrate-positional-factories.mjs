import { readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  Project,
  SyntaxKind,
} from '../../../../apps/www/node_modules/ts-morph/dist/ts-morph.js';

const factoryNames = new Map([
  ['defineEditorExtension', 'defineExtension'],
  ['createBasePlugin', 'defineBasePlugin'],
  ['createPlatePlugin', 'definePlatePlugin'],
  ['defineExtension', 'defineExtension'],
  ['defineBasePlugin', 'defineBasePlugin'],
  ['definePlatePlugin', 'definePlatePlugin'],
]);
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
let renamedIdentifiers = 0;
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
  const replacedIdentifiers = new Set();

  for (const call of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )) {
    const expression = call.getExpression();
    const oldName = expression.getText();
    const newName = factoryNames.get(oldName);

    if (!newName) continue;

    const arguments_ = call.getArguments();

    if (arguments_.length === 2 && newName === oldName) continue;

    if (
      arguments_.length !== 1 ||
      !arguments_[0]?.isKind(SyntaxKind.ObjectLiteralExpression)
    ) {
      failures.push(
        `${file}:${call.getStartLineNumber()} ${oldName} does not have one object argument`
      );
      continue;
    }

    const definition = arguments_[0];
    const properties = definition.getProperties();
    const nameIndex = properties.findIndex(
      (property) =>
        property.isKind(SyntaxKind.PropertyAssignment) &&
        property.getName() === 'name'
    );
    const nameProperty = properties[nameIndex];

    if (!nameProperty?.isKind(SyntaxKind.PropertyAssignment)) {
      failures.push(
        `${file}:${call.getStartLineNumber()} ${oldName} has no static name property`
      );
      continue;
    }

    let removeStart = nameProperty.getFullStart();
    let removeEnd = nameProperty.getEnd();

    if (properties.length > 1 && nameIndex < properties.length - 1) {
      removeEnd = properties[nameIndex + 1].getFullStart();
    } else if (properties.length > 1) {
      removeStart = properties[nameIndex - 1].getEnd();
    }

    edits.push(
      {
        end: expression.getEnd(),
        start: expression.getStart(),
        text: newName,
      },
      {
        end: definition.getStart(),
        start: definition.getStart(),
        text: `${nameProperty.getInitializerOrThrow().getText()}, `,
      },
      { end: removeEnd, start: removeStart, text: '' }
    );
    replacedIdentifiers.add(expression.getStart());
    migratedCalls += 1;
  }

  for (const identifier of sourceFile.getDescendantsOfKind(
    SyntaxKind.Identifier
  )) {
    const newName = factoryNames.get(identifier.getText());

    if (
      !newName ||
      newName === identifier.getText() ||
      replacedIdentifiers.has(identifier.getStart())
    ) {
      continue;
    }

    edits.push({
      end: identifier.getEnd(),
      start: identifier.getStart(),
      text: newName,
    });
    renamedIdentifiers += 1;
  }

  if (edits.length > 0) {
    await writeFile(file, applyEdits(source, edits));
    writtenFiles += 1;
  }
}

process.stdout.write(
  `${JSON.stringify(
    { failures, migratedCalls, renamedIdentifiers, writtenFiles },
    null,
    2
  )}\n`
);

if (failures.length > 0) process.exitCode = 1;
