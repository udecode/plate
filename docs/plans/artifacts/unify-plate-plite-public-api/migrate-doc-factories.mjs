import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = ['content', 'docs/vision', '.agents/rules', '.changeset'];
const standaloneFiles = [
  'packages/plite/README.md',
  'packages/yjs/README.md',
  'tooling/scripts/check-plate-doc-code-contracts.mjs',
  'tooling/scripts/check-plate-doc-code-contracts.test.mjs',
  'tooling/scripts/check-plate-schema-adoption.mjs',
  'tooling/scripts/check-plate-schema-adoption.test.mjs',
  'tooling/scripts/check-plite-docs.mjs',
  'tooling/scripts/check-plite-docs.test.mjs',
];
const extensions = new Set(['.md', '.mdc', '.mdx']);
const renamedFactories = new Map([
  ['createBasePlugin', 'defineBasePlugin'],
  ['createPlatePlugin', 'definePlatePlugin'],
  ['defineEditorExtension', 'defineExtension'],
]);
const positionalFactories = new Set([
  'defineBasePlugin',
  'defineExtension',
  'definePlatePlugin',
]);
const whitespacePattern = /\s/;
const identifierCharacterPattern = /[\w$]/;
const horizontalWhitespacePattern = /[ \t]/;
const stringLiteralPattern = /^(['"])(.*)\1$/;

const collectFiles = async (directory) => {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (extensions.has(extname(entry.name))) files.push(path);
  }

  return files;
};

const skipTrivia = (source, start) => {
  let index = start;

  while (whitespacePattern.test(source[index] ?? '')) index += 1;

  return index;
};

const findClosingBrace = (source, start) => {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}' && --depth === 0) return index;
  }

  return -1;
};

const findProperty = (source, objectStart, objectEnd, propertyName) => {
  let depth = 1;
  let quote = null;
  let escaped = false;

  for (let index = objectStart + 1; index < objectEnd; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{' || char === '[' || char === '(') depth += 1;
    if (char === '}' || char === ']' || char === ')') depth -= 1;
    if (depth !== 1 || !source.startsWith(propertyName, index)) continue;

    const before = source[index - 1] ?? '';
    const after = source[index + propertyName.length] ?? '';

    if (
      identifierCharacterPattern.test(before) ||
      identifierCharacterPattern.test(after)
    ) {
      continue;
    }

    const colon = skipTrivia(source, index + propertyName.length);

    if (source[colon] !== ':') continue;

    const valueStart = skipTrivia(source, colon + 1);
    let valueDepth = 1;
    let valueQuote = null;
    let valueEscaped = false;

    for (let cursor = valueStart; cursor <= objectEnd; cursor += 1) {
      const valueChar = source[cursor];

      if (valueQuote) {
        if (valueEscaped) valueEscaped = false;
        else if (valueChar === '\\') valueEscaped = true;
        else if (valueChar === valueQuote) valueQuote = null;
        continue;
      }
      if (valueChar === '"' || valueChar === "'" || valueChar === '`') {
        valueQuote = valueChar;
        continue;
      }
      if (cursor === objectEnd && valueDepth === 1) {
        return {
          removeEnd: cursor,
          removeStart: index,
          value: source.slice(valueStart, cursor).trim(),
        };
      }
      if (valueChar === '{' || valueChar === '[' || valueChar === '(') {
        valueDepth += 1;
      }
      if (valueChar === '}' || valueChar === ']' || valueChar === ')') {
        valueDepth -= 1;
      }
      if (valueDepth === 1 && (valueChar === ',' || cursor === objectEnd)) {
        let removeStart = index;

        while (
          removeStart > objectStart + 1 &&
          horizontalWhitespacePattern.test(source[removeStart - 1])
        ) {
          removeStart -= 1;
        }
        let removeEnd = valueChar === ',' ? cursor + 1 : cursor;

        while (horizontalWhitespacePattern.test(source[removeEnd] ?? '')) {
          removeEnd += 1;
        }

        return {
          removeEnd,
          removeStart,
          value: source.slice(valueStart, cursor).trim(),
        };
      }
    }
  }

  return null;
};

const migrateCalls = (source) => {
  const edits = [];
  const callPattern =
    /\b(defineBasePlugin|defineEditorSchema|defineExtension|definePlatePlugin)\s*\(/g;

  for (const match of source.matchAll(callPattern)) {
    const factory = match[1];
    const openParen = source.indexOf('(', match.index);
    const objectStart = skipTrivia(source, openParen + 1);

    if (source[objectStart] !== '{') continue;

    const objectEnd = findClosingBrace(source, objectStart);

    if (objectEnd < 0) continue;

    if (positionalFactories.has(factory)) {
      const property =
        findProperty(source, objectStart, objectEnd, 'name') ??
        findProperty(source, objectStart, objectEnd, 'key');

      if (!property) continue;

      edits.push(
        { end: objectStart, start: objectStart, text: `${property.value}, ` },
        { end: property.removeEnd, start: property.removeStart, text: '' }
      );
      continue;
    }

    const id = findProperty(source, objectStart, objectEnd, 'id');
    const literal = id?.value.match(stringLiteralPattern);
    const name = literal ? `\`schema:${literal[2]}\`` : "'documentSchema'";

    edits.push({ end: objectStart, start: objectStart, text: `${name}, ` });
  }

  return edits
    .toSorted((left, right) => right.start - left.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      source
    );
};

let changed = 0;

for (const file of [
  ...(await Promise.all(roots.map(collectFiles))).flat(),
  ...standaloneFiles,
]) {
  const source = await readFile(file, 'utf8');
  let next = source;

  for (const [from, to] of renamedFactories) {
    next = next.replaceAll(from, to);
  }
  next = migrateCalls(next);
  next = next.replace(
    /^(\s*)(.*\bdefine(?:BasePlugin|Extension|PlatePlugin)\([^\n]+, \{) {2,}(\S)/gm,
    (_match, indent, prefix, nextToken) =>
      `${indent}${prefix}\n${indent}  ${nextToken}`
  );
  next = next.replace(
    /^(\s*)(.*\},) {2,}([A-Za-z_$])/gm,
    (_match, indent, prefix, nextToken) =>
      `${indent}${prefix}\n${indent}${nextToken}`
  );
  next = next.replace(
    /(\bdefine(?:BasePlugin|Extension|PlatePlugin)\([^\n]+, \{)\n[ \t]*\n/g,
    '$1\n'
  );

  if (next !== source) {
    await writeFile(file, next);
    changed += 1;
  }
}

process.stdout.write(`${changed} files migrated\n`);
