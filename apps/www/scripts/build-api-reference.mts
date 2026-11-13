import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from '@typescript/typescript6';

import {
  enforceBaseline,
  groupFindings,
} from '../../../tooling/scripts/finding-baseline.mjs';

type SymbolFact = {
  aliases: string[];
  documentation: string;
  entrypoint: string;
  kind: string;
  name: string;
  runtime: boolean;
  signature: string;
  source: string | null;
  typeParameters: string[];
};

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(appRoot, '../..');
const declarationSuffixPattern = /\.d\.ts$/;
const outputPath = join(appRoot, 'src/generated/api-reference-manifest.json');
const baselineFile = 'apps/www/api-reference-baseline.json';
const undocumentedRule = 'undocumented-export';
const packageName = 'platejs';
const packageDirectory = join(repoRoot, 'packages/platejs');
const args = new Set(process.argv.slice(2));

const specifier = (entrypoint: string) =>
  entrypoint === '.' ? packageName : `${packageName}${entrypoint.slice(1)}`;

const symbolKind = (symbol: ts.Symbol) => {
  const { flags } = symbol;

  if (flags & ts.SymbolFlags.Interface) return 'interface';
  if (flags & ts.SymbolFlags.TypeAlias) return 'type';
  if (flags & ts.SymbolFlags.Class) return 'class';
  if (flags & ts.SymbolFlags.Function) return 'function';
  if (flags & ts.SymbolFlags.Enum) return 'enum';
  if (flags & ts.SymbolFlags.Variable) return 'const';
  if (flags & ts.SymbolFlags.NamespaceModule) return 'namespace';

  return 'symbol';
};

const findSource = (sourceFile: ts.SourceFile, declaration: ts.Declaration) => {
  const prefix = sourceFile.text.slice(0, declaration.getStart(sourceFile));
  const matches = Array.from(prefix.matchAll(/#region ([^\n]+\.d\.ts)/g));
  const declarationSource = matches.at(-1)?.[1];

  if (!declarationSource) return null;

  const sourceStem = declarationSource.replace(declarationSuffixPattern, '');
  const candidates = [`${sourceStem}.ts`, `${sourceStem}.tsx`];

  for (const candidate of candidates) {
    try {
      readFileSync(join(packageDirectory, candidate));

      return relative(repoRoot, join(packageDirectory, candidate)).replaceAll(
        '\\',
        '/'
      );
    } catch {
      // Skip malformed source links while scanning API references.
    }
  }

  return relative(repoRoot, join(packageDirectory, candidates[0])).replaceAll(
    '\\',
    '/'
  );
};

const resolveSymbol = (checker: ts.TypeChecker, symbol: ts.Symbol) =>
  symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;

type PublicTypeExport = { entrypoint: string; name: string };

const formatDeclaration = (
  declaration: ts.Declaration,
  checker: ts.TypeChecker,
  publicExports: Map<ts.Symbol, PublicTypeExport[]>
) => {
  const sourceFile = declaration.getSourceFile();
  const start = declaration.getStart(sourceFile);
  const replacements: Array<{ end: number; start: number; text: string }> = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal) &&
      node.qualifier
    ) {
      const moduleName = node.argument.literal.text;

      if (moduleName === 'plitejs' || moduleName.startsWith('plitejs/')) {
        let { qualifier } = node;

        while (ts.isQualifiedName(qualifier)) qualifier = qualifier.left;

        const qualifierName = qualifier.text;
        const symbol = checker.getSymbolAtLocation(qualifier);
        const resolved = symbol && resolveSymbol(checker, symbol);
        const candidates = resolved?.declarations?.length
          ? publicExports.get(resolved)
          : undefined;
        const preferredEntrypoint = moduleName.replace(/^plitejs/, 'platejs');
        const candidate = candidates
          ?.filter((entry) => entry.name === qualifierName)
          .sort(
            (left, right) =>
              Number(right.entrypoint === preferredEntrypoint) -
                Number(left.entrypoint === preferredEntrypoint) ||
              left.entrypoint.length - right.entrypoint.length ||
              left.entrypoint.localeCompare(right.entrypoint)
          )[0];

        if (!candidate) {
          throw new Error(
            `No identical public Plate export for ${moduleName}.${qualifierName}.`
          );
        }

        replacements.push({
          end: node.argument.literal.end - start,
          start: node.argument.literal.getStart(sourceFile) - start,
          text: JSON.stringify(candidate.entrypoint),
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(declaration);

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (text, replacement) =>
        text.slice(0, replacement.start) +
        replacement.text +
        text.slice(replacement.end),
      declaration.getText(sourceFile)
    );
};

const extractEntrypoint = async (
  packageRoot: string,
  entrypoint: string,
  declarationRelativePath: string,
  runtimeRelativePath: string,
  program: ts.Program,
  publicExports: Map<ts.Symbol, PublicTypeExport[]>
) => {
  const declarationPath = join(packageRoot, declarationRelativePath);
  const runtimePath = join(packageRoot, runtimeRelativePath);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(declarationPath);

  if (!sourceFile) {
    throw new Error(`Missing packed declaration ${declarationRelativePath}.`);
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

  if (!moduleSymbol) {
    throw new Error(
      `Cannot inspect packed entrypoint ${specifier(entrypoint)}.`
    );
  }

  const runtimeModule = (await import(
    `${pathToFileURL(runtimePath).href}?api-reference=${Date.now()}`
  )) as Record<string, unknown>;
  const runtimeNames = new Set(Object.keys(runtimeModule));
  const exportedSymbols = checker
    .getExportsOfModule(moduleSymbol)
    .sort((left, right) => left.name.localeCompare(right.name));
  const declarationNames = new Set(
    exportedSymbols.map((symbol) => symbol.name)
  );

  for (const runtimeName of runtimeNames) {
    if (!declarationNames.has(runtimeName)) {
      throw new Error(
        `${specifier(entrypoint)} exports runtime value ${runtimeName} without a declaration.`
      );
    }
  }

  return exportedSymbols.map((exportedSymbol): SymbolFact => {
    const symbol = resolveSymbol(checker, exportedSymbol);
    const declaration = symbol.declarations?.[0];
    const declarationSourceFile = declaration?.getSourceFile();
    const aliases =
      symbol.name === exportedSymbol.name ? [] : [symbol.name].sort();
    const typeParameters =
      declaration && 'typeParameters' in declaration
        ? (
            (declaration.typeParameters as
              | ts.NodeArray<ts.TypeParameterDeclaration>
              | undefined) ?? []
          ).map((parameter) => parameter.getText(declarationSourceFile))
        : [];

    return {
      aliases,
      documentation: ts.displayPartsToString(
        symbol.getDocumentationComment(checker)
      ),
      entrypoint: specifier(entrypoint),
      kind: symbolKind(symbol),
      name: exportedSymbol.name,
      runtime: runtimeNames.has(exportedSymbol.name),
      signature:
        declaration && declarationSourceFile
          ? formatDeclaration(declaration, checker, publicExports)
          : checker.typeToString(
              checker.getTypeOfSymbolAtLocation(exportedSymbol, sourceFile),
              sourceFile,
              ts.TypeFormatFlags.NoTruncation
            ),
      source:
        declaration && declarationSourceFile
          ? findSource(declarationSourceFile, declaration)
          : null,
      typeParameters,
    };
  });
};

const main = async () => {
  execFileSync('pnpm', ['turbo', 'run', 'build', `--filter=${packageName}`], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  const tempRoot = mkdtempSync(join(tmpdir(), 'plate-api-reference-'));
  const symbols: Record<string, SymbolFact> = {};
  let version = '';

  try {
    const packOutput = execFileSync(
      'pnpm',
      ['pack', '--pack-destination', tempRoot, '--json'],
      { cwd: packageDirectory, encoding: 'utf-8' }
    );
    // pnpm prints the prepack banner to stdout ahead of the JSON.
    const packResult = JSON.parse(
      packOutput.slice(packOutput.search(/^\{/m))
    ) as {
      filename: string;
      version: string;
    };
    ({ version } = packResult);
    execFileSync('tar', ['-xzf', packResult.filename, '-C', tempRoot]);

    const packageRoot = join(tempRoot, 'package');
    symlinkSync(
      join(packageDirectory, 'node_modules'),
      join(packageRoot, 'node_modules')
    );
    const packageJson = JSON.parse(
      readFileSync(join(packageRoot, 'package.json'), 'utf-8')
    ) as {
      exports: Record<
        string,
        string | { default?: string; import?: string; types?: string }
      >;
    };
    const entrypoints = Object.entries(packageJson.exports).flatMap(
      ([entrypoint, target]) => {
        if (typeof target === 'string' || !target.types) return [];

        const runtime = target.import ?? target.default;

        if (!runtime) {
          throw new Error(
            `${specifier(entrypoint)} has packed types but no runtime output.`
          );
        }

        return [{ declaration: target.types, entrypoint, runtime }];
      }
    );
    const program = ts.createProgram(
      entrypoints.map((entry) => join(packageRoot, entry.declaration)),
      {
        allowJs: false,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ESNext,
      }
    );
    const checker = program.getTypeChecker();
    const publicExports = new Map<ts.Symbol, PublicTypeExport[]>();

    for (const entry of entrypoints) {
      const sourceFile = program.getSourceFile(
        join(packageRoot, entry.declaration)
      );
      const moduleSymbol =
        sourceFile && checker.getSymbolAtLocation(sourceFile);

      if (!moduleSymbol) continue;

      for (const exported of checker.getExportsOfModule(moduleSymbol)) {
        const symbol = resolveSymbol(checker, exported);
        const entries = publicExports.get(symbol) ?? [];
        entries.push({
          entrypoint: specifier(entry.entrypoint),
          name: exported.name,
        });
        publicExports.set(symbol, entries);
      }
    }

    for (const entry of entrypoints) {
      const facts = await extractEntrypoint(
        packageRoot,
        entry.entrypoint,
        entry.declaration,
        entry.runtime,
        program,
        publicExports
      );

      for (const fact of facts) {
        const id = `${fact.entrypoint}:${fact.name}`;

        if (symbols[id]) throw new Error(`Duplicate API fact ${id}.`);

        symbols[id] = fact;
      }
    }
  } finally {
    rmSync(tempRoot, { force: true, recursive: true });
  }

  const manifest = `${JSON.stringify(
    {
      packages: {
        [packageName]: {
          symbols: Object.fromEntries(
            Object.entries(symbols).sort(([left], [right]) =>
              left.localeCompare(right)
            )
          ),
          version,
        },
      },
      schemaVersion: 1,
    },
    null,
    2
  )}\n`;

  const check = args.has('--check');
  const stale = check && readFileSync(outputPath, 'utf-8') !== manifest;

  if (!check) writeFileSync(outputPath, manifest);

  process.exitCode = enforceBaseline({
    file: baselineFile,
    found: {
      [undocumentedRule]: {},
      ...groupFindings(
        Object.values(symbols)
          .filter((fact) => !fact.documentation.trim())
          .map((fact) => ({
            file: fact.entrypoint,
            identity: fact.name,
            rule: undocumentedRule,
          }))
      ),
    },
    lowerCommand: 'pnpm --filter www api-reference',
    mode:
      (['check', 'init'] as const).find((mode) => args.has(`--${mode}`)) ??
      'lower',
    newFindingsHelp: `Each public ${packageName} export needs a doc comment that says what it is for. Write it on the declaration in the package source.`,
    rules: [undocumentedRule],
  });

  if (stale) {
    throw new Error(
      'API reference manifest is stale. Run pnpm --filter www api-reference.'
    );
  }
};

await main();
