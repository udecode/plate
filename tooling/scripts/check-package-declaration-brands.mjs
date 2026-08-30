#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const declarationFilePattern = /\.d\.(?:c|m)?ts$/;
const privateBrandPatterns = [
  /\b(?:declare\s+)?const\s+(PLATE_[A-Z0-9_]+)\s*:\s*unique\s+symbol\b/g,
  /\btypeof\s+(PLATE_[A-Z0-9_]+)\b/g,
  /\[\s*(PLATE_[A-Z0-9_]+)\s*\]/g,
  /\b(?:import|export)\s+(?:type\s+)?\{[\s\S]*?\b(PLATE_[A-Z0-9_]*(?:BRAND|MARKER|MODEL|TOKEN|WITNESS)[A-Z0-9_]*)\b[\s\S]*?\}\s+from\b/g,
];
const plitePrivateWitness = 'editorExtensionDefinition';
const plitePrivateWitnessOwnerPattern =
  /\bdeclare\s+const\s+editorExtensionDefinition\s*:\s*unique\s+symbol\b/;
const publicEditorExtensionDependenciesGenericPattern =
  /\bEditorExtension\s*<\s*[^,<>\n]+,\s*[^>\n]+>/g;
const publicEditorExtensionDependencyReferenceGenericPattern =
  /\bEditorExtensionDependencyReference\s*</g;
const publicEditorExtensionDependencyReferenceInterfacePattern =
  /\binterface\s+EditorExtensionDependencyReference\s*\{([\s\S]*?)\}/g;
const publicEditorExtensionDependencyReferenceTypeAliasPattern =
  /\btype\s+EditorExtensionDependencyReference\s*=/g;
const exportedTypeLambdaDeclarationPattern =
  /\bexport\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type)\s+([A-Za-z_$][\w$]*TypeLambda)\b/g;
const exportClausePattern = /\bexport\s+(?:type\s+)?\{([\s\S]*?)\}/g;
const typeLambdaNamePattern = /^[A-Za-z_$][\w$]*TypeLambda$/;
const typeOnlyExportSpecifierPrefixPattern = /^type\s+/;
const exportSpecifierAliasPattern = /\s+as\s+/;
const canonicalEditorExtensionTypeLambda = 'EditorExtensionTypeLambda';
const internalPliteContractTypeSymbols = [
  'EditorExtensionTypeLambda',
  'InternalEditorExtensionDependencyReference',
  'InternalEditorExtensionInstalledCapabilitiesOf',
  'InternalEditorExtensionTypeProviderOf',
  'InternalEditorExtensionWitnessFor',
];
const internalCoreContractTypeSymbols = [
  'InternalDefinitionOf',
  'PluginDefinitionCarrier',
  'StaticEditorExtensionTypeLambda',
];
const internalPlatePluginCompilerTypeSymbols = [
  'InternalDefinitionOf',
  'PluginDefinitionCarrier',
  'StaticEditorExtensionTypeLambda',
  'PluginDefinitionProvider',
  'PluginDefinitionRoot',
  'PluginDefinitionFromRoot',
  'NormalizeBasePluginInput',
  'NormalizePlatePluginInput',
  'MergePluginDefinitions',
  'MergePluginState',
  'BasePluginContextualDescriptor',
  'BasePluginDescriptorCarrier',
  'BasePluginRuntimeDescriptor',
  'BasePluginDescriptor',
  'BasePluginMethods',
  'MergeBasePluginDefinitions',
  'BasePluginConstructorDefinition',
  'BasePluginConstructorProvider',
  'BasePluginConstructorResult',
  'BasePluginStageDefinition',
  'BasePluginStage',
  'ExtendedBasePlugin',
  'PlatePluginMethods',
  'MergePlatePluginDefinitions',
  'PlatePluginConstructorDefinition',
  'PlatePluginConstructorProvider',
  'PlatePluginConstructorResult',
  'PlatePluginStageDefinition',
  'PlatePluginStage',
  'ExtendedPlatePlugin',
  'PlatePluginAdapterProvider',
  'ToPlatePluginResult',
  'ToPlatePluginAdapterResult',
  'ToConfiguredPlatePluginResult',
];
const publicPackageDeclarationEntrypointPattern =
  /^dist\/(?:(?:react|static)\/)?index\.d\.(?:c|m)?ts$/;
const pliteRootDeclarationEntrypointPattern = /^dist\/index\.d\.(?:c|m)?ts$/;

const collectExportedPackageTypeLambdas = (source) => {
  const symbols = new Set();

  for (const match of source.matchAll(exportedTypeLambdaDeclarationPattern)) {
    if (match[1] !== canonicalEditorExtensionTypeLambda) {
      symbols.add(match[1]);
    }
  }
  exportedTypeLambdaDeclarationPattern.lastIndex = 0;

  for (const match of source.matchAll(exportClausePattern)) {
    for (const specifier of match[1].split(',')) {
      const names = specifier
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
        .trim()
        .replace(typeOnlyExportSpecifierPrefixPattern, '')
        .split(exportSpecifierAliasPattern);

      for (const name of names) {
        if (
          name !== canonicalEditorExtensionTypeLambda &&
          typeLambdaNamePattern.test(name)
        ) {
          symbols.add(name);
        }
      }
    }
  }
  exportClausePattern.lastIndex = 0;

  return symbols;
};

const hasExactShallowDependencyReference = (body) => {
  const memberPattern =
    /\breadonly\s+([A-Za-z_$][\w$]*)(\?)?\s*:\s*([^;{}]+)\s*;/g;
  const members = [...body.matchAll(memberPattern)];
  const remainder = body
    .replace(memberPattern, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .trim();

  if (remainder || members.length !== 2) return false;

  const fields = new Map(
    members.map((match) => [
      match[1],
      { optional: match[2] === '?', type: match[3].trim() },
    ])
  );

  return (
    fields.size === 2 &&
    fields.get('name')?.optional === false &&
    fields.get('name')?.type === 'string' &&
    fields.get('enabled')?.optional === true &&
    fields.get('enabled')?.type === 'boolean'
  );
};

const exposesCompilerType = (source, symbol) => {
  const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const occurrencePattern = new RegExp(`\\b${escapedSymbol}\\b`);

  if (!occurrencePattern.test(source)) return false;

  const privateDeclarationPattern = new RegExp(
    `\\b(?:declare\\s+)?(?:abstract\\s+)?(?:class|interface|type)\\s+${escapedSymbol}\\b`
  );
  const exportedDeclarationPattern = new RegExp(
    `\\bexport\\s+(?:default\\s+)?(?:declare\\s+)?(?:abstract\\s+)?(?:class|interface|type)\\s+${escapedSymbol}\\b`
  );
  const exportedSpecifierPattern = new RegExp(
    `\\bexport\\s+(?:type\\s+)?\\{[^}]*\\b${escapedSymbol}\\b[^}]*\\}`
  );

  return (
    !privateDeclarationPattern.test(source) ||
    exportedDeclarationPattern.test(source) ||
    exportedSpecifierPattern.test(source)
  );
};

export function auditPrivatePlateDeclarationBrands(
  files,
  { publicDeclarationPaths } = {}
) {
  const errors = [];

  for (const file of files) {
    if (!declarationFilePattern.test(file.path)) continue;

    const brands = new Set();

    for (const pattern of privateBrandPatterns) {
      pattern.lastIndex = 0;

      for (const match of file.source.matchAll(pattern)) {
        brands.add(match[1]);
      }
    }

    for (const brand of brands) {
      errors.push(
        `${file.path}: public declaration exposes private Plate brand ${brand}`
      );
    }

    if (
      file.source.includes(plitePrivateWitness) &&
      !plitePrivateWitnessOwnerPattern.test(file.source)
    ) {
      errors.push(
        `${file.path}: public declaration exposes private Plite witness ${plitePrivateWitness}`
      );
    }

    if (publicEditorExtensionDependenciesGenericPattern.test(file.source)) {
      errors.push(
        `${file.path}: EditorExtension exposes a public dependencies generic; keep EditorExtension<Definition> and private transitive requirements`
      );
    }
    publicEditorExtensionDependenciesGenericPattern.lastIndex = 0;

    if (
      publicEditorExtensionDependencyReferenceGenericPattern.test(file.source)
    ) {
      errors.push(
        `${file.path}: EditorExtensionDependencyReference must remain shallow and non-generic`
      );
    }
    publicEditorExtensionDependencyReferenceGenericPattern.lastIndex = 0;

    for (const match of file.source.matchAll(
      publicEditorExtensionDependencyReferenceInterfacePattern
    )) {
      if (!hasExactShallowDependencyReference(match[1])) {
        errors.push(
          `${file.path}: EditorExtensionDependencyReference must contain exactly readonly name: string and readonly enabled?: boolean`
        );
      }
    }
    publicEditorExtensionDependencyReferenceInterfacePattern.lastIndex = 0;

    if (
      publicEditorExtensionDependencyReferenceTypeAliasPattern.test(file.source)
    ) {
      errors.push(
        `${file.path}: EditorExtensionDependencyReference must remain the exact shallow interface`
      );
    }
    publicEditorExtensionDependencyReferenceTypeAliasPattern.lastIndex = 0;

    if (pliteRootDeclarationEntrypointPattern.test(file.path)) {
      for (const symbol of internalPliteContractTypeSymbols) {
        if (new RegExp(`\\b${symbol}\\b`).test(file.source)) {
          errors.push(
            `${file.path}: root declaration exposes internal Plite dependency type ${symbol}`
          );
        }
      }
    }
    if (publicPackageDeclarationEntrypointPattern.test(file.path)) {
      for (const symbol of collectExportedPackageTypeLambdas(file.source)) {
        errors.push(
          `${file.path}: public declaration exports package-specific type lambda ${symbol}; expose a *TypeProvider and keep EditorExtensionTypeLambda internal`
        );
      }
      for (const symbol of internalCoreContractTypeSymbols) {
        if (new RegExp(`\\b${symbol}\\b`).test(file.source)) {
          errors.push(
            `${file.path}: public declaration exposes internal Core author-to-canonical type ${symbol}`
          );
        }
      }
    }

    const isPublicDeclaration =
      !publicDeclarationPaths || publicDeclarationPaths.has(file.path);

    for (const symbol of internalPlatePluginCompilerTypeSymbols) {
      if (!isPublicDeclaration) continue;
      if (
        internalCoreContractTypeSymbols.includes(symbol) &&
        (publicPackageDeclarationEntrypointPattern.test(file.path) ||
          file.path.includes('/internal/'))
      ) {
        continue;
      }
      if (exposesCompilerType(file.source, symbol)) {
        errors.push(
          `${file.path}: public declaration exposes internal Plate plugin compiler type ${symbol}`
        );
      }
    }
  }

  return errors;
}

export function assertNoPrivatePlateDeclarationBrands(
  packageRoot = process.cwd()
) {
  const distRoot = join(packageRoot, 'dist');

  if (!existsSync(distRoot)) return;

  const files = walkDeclarationFiles(distRoot).map((path) => ({
    path: toPosixPath(relative(packageRoot, path)),
    source: readFileSync(path, 'utf-8'),
  }));
  const errors = auditPrivatePlateDeclarationBrands(files, {
    publicDeclarationPaths: collectPublicDeclarationPaths(packageRoot),
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function collectPublicDeclarationPaths(packageRoot) {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf-8')
  );
  const paths = new Set();

  const addDeclarationPath = (value) => {
    if (typeof value !== 'string') return;

    const declarationPath = value
      .replace(/^\.\//, '')
      .replace(/\.mjs$/, '.d.mts')
      .replace(/\.cjs$/, '.d.cts')
      .replace(/\.js$/, '.d.ts');

    if (declarationFilePattern.test(declarationPath)) {
      paths.add(declarationPath);
    }
  };

  const visitExportTarget = (target) => {
    if (typeof target === 'string') {
      addDeclarationPath(target);
      return;
    }
    if (!target || typeof target !== 'object') return;

    for (const value of Object.values(target)) {
      visitExportTarget(value);
    }
  };

  addDeclarationPath(packageJson.types);
  visitExportTarget(packageJson.exports);

  return paths;
}

function walkDeclarationFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkDeclarationFiles(path));
      continue;
    }
    if (entry.isFile() && declarationFilePattern.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const toPosixPath = (path) => path.split(sep).join('/');

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    assertNoPrivatePlateDeclarationBrands(resolve(process.argv[2] ?? '.'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
