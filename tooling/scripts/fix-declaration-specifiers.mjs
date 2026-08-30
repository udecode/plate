#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';

const declarationRoot = path.resolve(process.argv[2] ?? 'dist');
const runtimeExtensions = new Set(['.cjs', '.css', '.js', '.json', '.mjs']);

const walkDeclarations = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);

    if (entry.isDirectory()) return walkDeclarations(filename);
    return entry.isFile() && entry.name.endsWith('.d.ts') ? [filename] : [];
  });

const resolveRuntimeSpecifier = (filename, specifier) => {
  if (!specifier.startsWith('.')) return specifier;
  if (runtimeExtensions.has(path.extname(specifier))) return specifier;

  const target = path.resolve(path.dirname(filename), specifier);

  if (existsSync(`${target}.d.ts`)) return `${specifier}.js`;
  if (existsSync(path.join(target, 'index.d.ts'))) {
    return `${specifier}/index.js`;
  }

  throw new Error(
    `Cannot resolve declaration specifier ${specifier} from ${filename}`
  );
};

const collectModuleSpecifiers = (source) => {
  const root = parse(source, {
    plugins: ['typescript'],
    sourceType: 'module',
  });
  const specifiers = [];

  const visit = (node) => {
    if (!node || typeof node !== 'object') return;

    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportAllDeclaration') &&
      node.source?.type === 'StringLiteral'
    ) {
      specifiers.push(node.source);
    } else if (
      node.type === 'TSImportType' &&
      node.argument?.type === 'StringLiteral'
    ) {
      specifiers.push(node.argument);
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    }
  };

  visit(root);
  return specifiers;
};

for (const filename of walkDeclarations(declarationRoot)) {
  const source = readFileSync(filename, 'utf-8');
  const replacements = collectModuleSpecifiers(source)
    .map((node) => ({
      end: node.end - 1,
      start: node.start + 1,
      value: resolveRuntimeSpecifier(filename, node.value),
    }))
    .filter(({ start, end, value }) => source.slice(start, end) !== value)
    .sort((left, right) => right.start - left.start);

  if (replacements.length === 0) continue;

  let output = source;

  for (const { end, start, value } of replacements) {
    output = `${output.slice(0, start)}${value}${output.slice(end)}`;
  }

  writeFileSync(filename, output);
}
