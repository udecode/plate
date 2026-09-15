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

import ts from 'typescript';

type EntrypointDecision = {
  exclude: string[];
  excludeReason: string;
  include: Record<string, string>;
};

type ReferenceConfig = {
  packages: Array<{
    directory: string;
    entrypoints: Record<string, EntrypointDecision>;
    name: string;
  }>;
  schemaVersion: 1;
};

type SymbolFact = {
  aliases: string[];
  documentation: string;
  entrypoint: string;
  kind: string;
  name: string;
  route: string | null;
  runtime: boolean;
  signature: string;
  source: string | null;
  typeParameters: string[];
};

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(appRoot, '../..');
const declarationSuffixPattern = /\.d\.ts$/;
const configPath = join(appRoot, 'api-reference.config.json');
const outputPath = join(appRoot, 'src/generated/api-reference-manifest.json');
const args = new Set(process.argv.slice(2));
const config = JSON.parse(readFileSync(configPath, 'utf-8')) as ReferenceConfig;

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

const findSource = (
  packageDirectory: string,
  sourceFile: ts.SourceFile,
  declaration: ts.Declaration
) => {
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
  packageName: string,
  packageDirectory: string,
  packageRoot: string,
  entrypoint: string,
  declarationRelativePath: string,
  runtimeRelativePath: string,
  decision: EntrypointDecision,
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
      `Cannot inspect packed entrypoint ${packageName}${entrypoint}.`
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
        `${packageName}${entrypoint} exports runtime value ${runtimeName} without a declaration.`
      );
    }
  }

  const included = new Set(Object.keys(decision.include));
  const excluded = new Set(decision.exclude);

  if (!args.has('--init')) {
    for (const symbol of exportedSymbols) {
      const hasInclude = included.has(symbol.name);
      const hasExclude = excluded.has(symbol.name);

      if (hasInclude === hasExclude) {
        throw new Error(
          `${packageName}${entrypoint} symbol ${symbol.name} must be included or excluded exactly once.`
        );
      }
    }

    for (const decidedName of [...included, ...excluded]) {
      if (!declarationNames.has(decidedName)) {
        throw new Error(
          `${packageName}${entrypoint} decision references missing symbol ${decidedName}.`
        );
      }
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
      entrypoint:
        entrypoint === '.'
          ? packageName
          : `${packageName}${entrypoint.slice(1)}`,
      kind: symbolKind(symbol),
      name: exportedSymbol.name,
      route: decision.include[exportedSymbol.name] ?? null,
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
          ? findSource(packageDirectory, declarationSourceFile, declaration)
          : null,
      typeParameters,
    };
  });
};

const main = async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'plate-api-reference-'));
  const manifestPackages: Record<
    string,
    { symbols: Record<string, SymbolFact>; version: string }
  > = {};

  try {
    for (const packageConfig of config.packages) {
      const packageDirectory = resolve(appRoot, packageConfig.directory);
      const packOutput = execFileSync(
        'pnpm',
        ['pack', '--pack-destination', tempRoot, '--json'],
        { cwd: packageDirectory, encoding: 'utf-8' }
      );
      const packResult = JSON.parse(packOutput) as {
        filename: string;
        version: string;
      };
      execFileSync('tar', ['-xzf', packResult.filename, '-C', tempRoot]);

      const packageRoot = join(tempRoot, 'package');
      // Packed workspace packages keep real dependency edges, so runtime export
      // inspection needs the workspace's installed dependency graph.
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
      const symbols: Record<string, SymbolFact> = {};
      const declarationEntrypoints = Object.entries(
        packageJson.exports
      ).flatMap(([entrypoint, target]) =>
        typeof target !== 'string' && target.types
          ? [{ entrypoint, path: join(packageRoot, target.types) }]
          : []
      );
      const program = ts.createProgram(
        declarationEntrypoints.map((entry) => entry.path),
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

      for (const entry of declarationEntrypoints) {
        const sourceFile = program.getSourceFile(entry.path);
        const moduleSymbol =
          sourceFile && checker.getSymbolAtLocation(sourceFile);

        if (!moduleSymbol) continue;

        for (const exported of checker.getExportsOfModule(moduleSymbol)) {
          const symbol = resolveSymbol(checker, exported);
          const entries = publicExports.get(symbol) ?? [];
          entries.push({
            entrypoint:
              entry.entrypoint === '.'
                ? packageConfig.name
                : `${packageConfig.name}${entry.entrypoint.slice(1)}`,
            name: exported.name,
          });
          publicExports.set(symbol, entries);
        }
      }

      for (const [entrypoint, decision] of Object.entries(
        packageConfig.entrypoints
      )) {
        const exportTarget = packageJson.exports[entrypoint];

        if (!exportTarget || typeof exportTarget === 'string') {
          throw new Error(
            `${packageConfig.name}${entrypoint} needs explicit packed types and runtime exports.`
          );
        }

        const declarationPath = exportTarget.types;
        const runtimePath = exportTarget.import ?? exportTarget.default;

        if (!declarationPath || !runtimePath) {
          throw new Error(
            `${packageConfig.name}${entrypoint} is missing packed types or runtime output.`
          );
        }

        const facts = await extractEntrypoint(
          packageConfig.name,
          packageDirectory,
          packageRoot,
          entrypoint,
          declarationPath,
          runtimePath,
          decision,
          program,
          publicExports
        );

        if (args.has('--init')) {
          decision.exclude = facts
            .map((fact) => fact.name)
            .filter((name) => !(name in decision.include))
            .sort();
        }

        for (const fact of facts) {
          const id = `${fact.entrypoint}:${fact.name}`;

          if (symbols[id]) throw new Error(`Duplicate API fact ${id}.`);

          symbols[id] = fact;
        }
      }

      manifestPackages[packageConfig.name] = {
        symbols: Object.fromEntries(
          Object.entries(symbols).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        ),
        version: packResult.version,
      };

      rmSync(packageRoot, { force: true, recursive: true });
    }
  } finally {
    rmSync(tempRoot, { force: true, recursive: true });
  }

  const manifest = `${JSON.stringify(
    {
      packages: manifestPackages,
      schemaVersion: 1,
    },
    null,
    2
  )}\n`;

  if (args.has('--init')) {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  }

  if (args.has('--check')) {
    const current = readFileSync(outputPath, 'utf-8');

    if (current !== manifest) {
      throw new Error(
        'API reference manifest is stale. Run pnpm --filter www api-reference.'
      );
    }
  } else {
    writeFileSync(outputPath, manifest);
  }
};

await main();
