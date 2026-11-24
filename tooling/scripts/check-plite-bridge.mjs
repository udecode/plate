#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { readPackageEntrypoints } from './export-targets.mjs';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const BRIDGE = 'plitejs/internal';

const rootArgument = process.argv.indexOf('--root');
const repoRoot =
  rootArgument === -1
    ? path.resolve(import.meta.dirname, '../..')
    : path.resolve(process.argv[rootArgument + 1]);

const problems = [];

const readTsconfig = () => {
  const configPath = path.join(repoRoot, 'tsconfig.json');
  const { config, error } = ts.readConfigFile(configPath, (file) =>
    ts.sys.readFile(file)
  );

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(config, ts.sys, repoRoot);
};

const listEntrypoints = (paths) => {
  const packagesRoot = path.join(repoRoot, 'packages');

  return readdirSync(packagesRoot).flatMap((directory) => {
    const packageRoot = path.join(packagesRoot, directory);

    if (!existsSync(path.join(packageRoot, 'package.json'))) return [];

    const { problems: manifestProblems, sourceBySpecifier } =
      readPackageEntrypoints(packageRoot);
    problems.push(...manifestProblems);

    return [...sourceBySpecifier].flatMap(([specifier, source]) => {
      const mapped = paths[specifier]?.[0];

      if (!mapped || path.resolve(repoRoot, mapped) !== source) {
        problems.push(
          `${specifier}: tsconfig.json paths maps ${mapped ?? 'nothing'} but the export map publishes ${path.relative(repoRoot, source)}`
        );
        return [];
      }

      return [{ source, specifier }];
    });
  });
};

const hasInternalTag = (node) => {
  if (!node) return false;
  if (ts.getJSDocTags(node).some((tag) => tag.tagName.text === 'internal')) {
    return true;
  }

  const text = node.getSourceFile().getFullText();

  return (ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []).some(
    (range) => /@internal\b/u.test(text.slice(range.pos, range.end))
  );
};

const declarationNode = (declaration) =>
  ts.isVariableDeclaration(declaration)
    ? declaration.parent.parent
    : declaration;

const isTagged = (symbol, aliasChain) =>
  aliasChain.some(
    (alias) =>
      alias.declarations?.some(
        (declaration) =>
          (ts.isExportSpecifier(declaration) &&
            (hasInternalTag(declaration) ||
              hasInternalTag(declaration.parent?.parent))) ||
          (ts.isNamespaceExport(declaration) &&
            hasInternalTag(declaration.parent))
      ) ?? false
  ) ||
  (symbol.declarations ?? []).some(
    (declaration) =>
      hasInternalTag(declaration) ||
      hasInternalTag(declarationNode(declaration))
  );

const bindingKey = (symbol) => {
  const declaration = symbol.declarations?.[0];

  return declaration
    ? `${declaration.getSourceFile().fileName}:${declaration.pos}`
    : null;
};

const where = (symbol) => {
  const declaration = symbol.declarations?.[0];

  if (!declaration) return 'unknown declaration';

  const sourceFile = declaration.getSourceFile();
  const { line } = sourceFile.getLineAndCharacterOfPosition(
    declaration.getStart()
  );

  return `${path.relative(repoRoot, sourceFile.fileName)}:${line + 1}`;
};

const resolveExports = (checker, moduleSymbol, prefix = '', seen = new Set()) =>
  checker.getExportsOfModule(moduleSymbol).flatMap((exported) => {
    const aliasChain = [];
    let symbol = exported;

    while (symbol.flags & ts.SymbolFlags.Alias) {
      aliasChain.push(symbol);
      symbol =
        checker.getImmediateAliasedSymbol(symbol) ??
        checker.getAliasedSymbol(symbol);
    }

    const name = `${prefix}${exported.name}`;

    if (!symbol.declarations?.length) {
      problems.push(`${name}: export resolves to no declaration`);
      return [];
    }

    const binding = { aliasChain, key: bindingKey(symbol), name, symbol };
    const namespace =
      symbol.flags &
      (ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule);

    if (namespace && symbol !== moduleSymbol) {
      if (seen.has(symbol)) return [binding];
      seen.add(symbol);
      return [binding, ...resolveExports(checker, symbol, `${name}.`, seen)];
    }

    return [binding];
  });

const { options } = readTsconfig();
const entrypoints = listEntrypoints(options.paths ?? {});
const bridge = entrypoints.find(({ specifier }) => specifier === BRIDGE);

if (!bridge) problems.push(`${BRIDGE}: missing from the package export maps`);

const program = ts.createProgram(
  entrypoints.map(({ source }) => source),
  { ...options, noEmit: true }
);
const checker = program.getTypeChecker();
const moduleOf = (source) => {
  const sourceFile = program.getSourceFile(source);
  const symbol = sourceFile && checker.getSymbolAtLocation(sourceFile);

  if (!symbol) {
    problems.push(`${path.relative(repoRoot, source)}: not a module`);
  }

  return symbol;
};

const bridgeKeys = new Map();

if (bridge) {
  const bridgeModule = moduleOf(bridge.source);

  for (const { key, name } of bridgeModule
    ? resolveExports(checker, bridgeModule)
    : []) {
    bridgeKeys.set(key, name);
  }

  if (bridgeKeys.size === 0) {
    problems.push(`${BRIDGE}: resolved to no bindings`);
  }
}

let checkedExports = 0;

for (const { source, specifier } of entrypoints) {
  if (specifier === BRIDGE) continue;

  const moduleSymbol = moduleOf(source);

  if (!moduleSymbol) continue;

  for (const { aliasChain, key, name, symbol } of resolveExports(
    checker,
    moduleSymbol
  )) {
    checkedExports += 1;

    if (bridgeKeys.has(key)) {
      problems.push(
        `${specifier} exports ${name}, which is ${BRIDGE}'s ${bridgeKeys.get(key)} (${where(symbol)})`
      );
    } else if (isTagged(symbol, aliasChain)) {
      problems.push(
        `${specifier} exports ${name}, tagged @internal at ${where(symbol)}`
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`check-plite-bridge: ${problems.length} finding(s)`);
  process.exit(1);
}

console.log(
  `check-plite-bridge: ${entrypoints.length - 1} public entrypoints, ${checkedExports} exports, ${bridgeKeys.size} bridge bindings, no leak`
);
