#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { getPublicEntrypointRuntimeRows } from '../entrypoints/entrypoint-dag.mjs';
import {
  enforceBaseline,
  groupFindings,
  lineIdentity,
  readBaseline,
} from './finding-baseline.mjs';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const PACKAGES = new Set(['plitejs', 'platejs']);
const HOOK_NAME = /^use[A-Z]/u;
const CREATION_NAMES = new Set(['createEditor']);

export const SCHEMALESS_VALUE_GENERICS = new Set([
  'packages/plitejs/src/react/hooks/use-editor.ts#useEditor#V',
  'packages/plitejs/src/react/plugin/with-react.ts#createEditor#V',
]);

const BASELINE = 'tooling/scripts/check-hook-generics-baseline.json';
const RULE = 'hook-generics';

const resolveAlias = (checker, symbol) =>
  symbol && symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;

const aliasDeclarationOf = (checker, typeName) =>
  resolveAlias(
    checker,
    checker.getSymbolAtLocation(typeName)
  )?.declarations?.find(ts.isTypeAliasDeclaration);

// The caller's input cannot infer an occurrence inside a callback's own
// parameter list or in a conditional type's check or extends clause.
const CALLBACK = 1;
const CONDITIONAL = 2;
const OPTIONAL = 4;
const PLAIN_USE = new Set([0]);

const combine = (outer, inner) => {
  const masks = new Set();
  for (const a of outer) for (const b of inner) masks.add(a | b);
  return masks;
};

const union = (...sets) => new Set(sets.flatMap((set) => [...set]));

const isCallable = (node) =>
  ts.isFunctionTypeNode(node) ||
  ts.isConstructorTypeNode(node) ||
  ts.isMethodSignature(node) ||
  ts.isCallSignatureDeclaration(node) ||
  ts.isConstructSignatureDeclaration(node);

const createOccurrenceFinder = (checker) => {
  const aliasParameterContexts = new Map();

  const occurrences = (target, node, context) => {
    if (!node) return new Set();

    if (ts.isTypeReferenceNode(node)) {
      if (checker.getSymbolAtLocation(node.typeName) === target) {
        return new Set([context]);
      }

      const typeArguments = node.typeArguments ?? [];
      const alias =
        typeArguments.length > 0 && aliasDeclarationOf(checker, node.typeName);

      return union(
        ...typeArguments.map((argument, index) => {
          const inner = occurrences(target, argument, 0);
          if (inner.size === 0) return inner;

          const parameter = alias && alias.typeParameters?.[index];
          const uses = parameter
            ? contextsOfAliasParameter(alias, parameter)
            : PLAIN_USE;

          return combine(combine(new Set([context]), uses), inner);
        })
      );
    }
    if (isCallable(node)) {
      return union(
        ...node.parameters.map((parameter) =>
          occurrences(target, parameter.type, context | CALLBACK)
        ),
        occurrences(target, node.type, context)
      );
    }
    if (ts.isConditionalTypeNode(node)) {
      return union(
        occurrences(target, node.checkType, context | CONDITIONAL),
        occurrences(target, node.extendsType, context | CONDITIONAL),
        occurrences(target, node.trueType, context),
        occurrences(target, node.falseType, context)
      );
    }
    if (ts.isPropertySignature(node)) {
      return occurrences(
        target,
        node.type,
        node.questionToken ? context | OPTIONAL : context
      );
    }

    const found = [];
    ts.forEachChild(node, (child) => {
      found.push(occurrences(target, child, context));
    });
    return union(...found);
  };

  const contextsOfAliasParameter = (alias, parameter) => {
    if (!aliasParameterContexts.has(parameter)) {
      aliasParameterContexts.set(parameter, PLAIN_USE);
      aliasParameterContexts.set(
        parameter,
        occurrences(checker.getSymbolAtLocation(parameter.name), alias.type, 0)
      );
    }

    return aliasParameterContexts.get(parameter);
  };

  return (target, node, context = 0) => occurrences(target, node, context);
};

const reachesReturn = (checker, find, signature, typeParameter) => {
  if (signature.type) {
    return (
      find(checker.getSymbolAtLocation(typeParameter.name), signature.type)
        .size > 0
    );
  }

  const resolved = checker.getSignatureFromDeclaration(signature);
  if (!resolved) return true;

  // Without NoTruncation, a long printed type drops its middle members.
  const printed = checker.typeToString(
    checker.getReturnTypeOfSignature(resolved),
    undefined,
    ts.TypeFormatFlags.NoTruncation
  );
  const name = typeParameter.name.text.replaceAll('$', '\\$');

  return new RegExp(`(?<![\\w$])${name}(?![\\w$])`, 'u').test(printed);
};

const judgeTypeParameter = (checker, find, signature, typeParameter) => {
  const target = checker.getSymbolAtLocation(typeParameter.name);
  const masks = union(
    ...signature.parameters.map((parameter) =>
      find(
        target,
        parameter.type,
        parameter.questionToken || parameter.initializer ? OPTIONAL : 0
      )
    )
  );
  const inferable = [...masks].filter(
    (mask) => !(mask & (CALLBACK | CONDITIONAL))
  );

  if (inferable.length === 0) return 'no parameter supplies it';

  const reachesCallback = [...masks].some((mask) => mask & CALLBACK);

  if (
    inferable.every((mask) => mask & OPTIONAL) &&
    (reachesCallback || reachesReturn(checker, find, signature, typeParameter))
  ) {
    return 'only optional input supplies it, yet it reaches the result';
  }

  return null;
};

export function findHookGenerics({
  compilerOptions,
  entrypoints,
  exemptions = SCHEMALESS_VALUE_GENERICS,
  repoRoot,
}) {
  const problems = [];
  const findings = [];
  const sources = [];

  for (const { source, specifier } of entrypoints) {
    if (!source || !existsSync(source)) {
      problems.push(`${specifier}: no source file`);
    } else {
      sources.push({ source, specifier });
    }
  }

  const program = ts.createProgram(
    sources.map(({ source }) => source),
    { ...compilerOptions, noEmit: true }
  );
  const checker = program.getTypeChecker();
  const find = createOccurrenceFinder(checker);
  const judged = new Set();

  for (const { source, specifier } of sources) {
    const sourceFile = program.getSourceFile(source);
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    const exported = moduleSymbol
      ? checker.getExportsOfModule(moduleSymbol)
      : [];

    if (exported.length === 0) {
      problems.push(`${specifier}: exports nothing`);
      continue;
    }

    for (const symbol of exported) {
      if (!HOOK_NAME.test(symbol.name) && !CREATION_NAMES.has(symbol.name)) {
        continue;
      }

      const resolved = resolveAlias(checker, symbol);
      if (!(resolved.flags & ts.SymbolFlags.Value)) continue;

      // Overloads list only their call signatures, never the implementation.
      const signatures = checker.getTypeOfSymbol(resolved).getCallSignatures();
      if (signatures.length === 0) {
        problems.push(`${specifier}: ${symbol.name} has no call signature`);
        continue;
      }

      for (const declaration of signatures.map((signature) =>
        signature.getDeclaration()
      )) {
        const declarationFile = declaration.getSourceFile();
        const file = path.relative(repoRoot, declarationFile.fileName);

        for (const parameter of declaration.typeParameters ?? []) {
          if (judged.has(parameter)) continue;
          judged.add(parameter);

          const name = parameter.name.text;

          if (exemptions.has(`${file}#${symbol.name}#${name}`)) continue;

          const reason = judgeTypeParameter(
            checker,
            find,
            declaration,
            parameter
          );
          if (!reason) continue;

          const line =
            declarationFile.getLineAndCharacterOfPosition(parameter.getStart())
              .line + 1;

          findings.push({
            file,
            identity: lineIdentity(declarationFile.text, line),
            line,
            name,
            reason,
            rule: RULE,
            symbol: symbol.name,
          });
        }
      }
    }
  }

  return { findings, problems };
}

const clientEntrypoints = (repoRoot, paths) =>
  getPublicEntrypointRuntimeRows()
    .filter(
      ({ packageName, runtime }) =>
        PACKAGES.has(packageName) && runtime === 'client'
    )
    .map(({ specifier }) => {
      const mapped = paths[specifier]?.[0];
      return { source: mapped && path.resolve(repoRoot, mapped), specifier };
    });

const readCompilerOptions = (repoRoot) => {
  const configPath = path.join(repoRoot, 'tsconfig.json');
  const { config, error } = ts.readConfigFile(configPath, (file) =>
    ts.sys.readFile(file)
  );

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(config, ts.sys, repoRoot).options;
};

const main = () => {
  const repoRoot = path.resolve(import.meta.dirname, '../..');
  const compilerOptions = readCompilerOptions(repoRoot);
  const entrypoints = clientEntrypoints(repoRoot, compilerOptions.paths ?? {});
  const { findings, problems } = findHookGenerics({
    compilerOptions,
    entrypoints,
    repoRoot,
  });

  if (entrypoints.length === 0) {
    problems.push('no client entrypoints found for plitejs or platejs');
  }
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
    return;
  }

  const known = readBaseline(BASELINE)[RULE] ?? {};

  process.exitCode = enforceBaseline({
    file: BASELINE,
    found: { [RULE]: {}, ...groupFindings(findings) },
    lowerCommand: 'node tooling/scripts/check-hook-generics.mjs',
    mode: process.argv.includes('--check')
      ? 'check'
      : process.argv.includes('--init')
        ? 'init'
        : 'lower',
    newFindingsHelp: [
      'New caller-chosen type parameters on hooks or createEditor:',
      ...findings
        .filter((finding) => !known[finding.file]?.includes(finding.identity))
        .map(
          (finding) =>
            `- ${finding.file}:${finding.line}: ${finding.symbol} ${finding.name}: ${finding.reason}`
        ),
    ].join('\n'),
    rules: [RULE],
  });
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
