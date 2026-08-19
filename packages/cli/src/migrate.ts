import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import {
  diffEditorSchemaContracts,
  readEditorSchemaContract,
  type EditorSchemaContract,
  type EditorSchemaContractDiff,
} from '@platejs/plite';

import { compileEditor, replaceArtifacts } from './generate';

const FINGERPRINT_PREFIX_PATTERN = /^.*:/;
const MIGRATION_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

export type CreateMigrationOptions = Readonly<{
  cwd?: string;
  /** @internal Test boundary for committed-file reads. */
  readCommittedFile?: (path: string) => string;
}>;

export type EditorMigrationArtifacts = Readonly<{
  diff: EditorSchemaContractDiff;
  directory: string;
  manifestPath: string;
  migrationPath: string;
  paths: readonly string[];
}>;

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

const readGitFile = (path: string, cwd: string) => {
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const repositoryPath = relative(root, path).replaceAll('\\', '/');

    if (repositoryPath.startsWith('../')) throw new Error('outside repository');

    return execFileSync('git', ['show', `HEAD:${repositoryPath}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    throw new Error(
      `Plate migrations require a committed generated artifact: ${path}`
    );
  }
};

const schemaTypesSnapshot = (source: string, fingerprint: string) => {
  const start = source.indexOf('export interface EditorText');
  const end = source.indexOf('\nexport type Schema =');

  if (start < 0 || end < start) {
    throw new Error('Invalid generated editor type artifact.');
  }

  return `/* Generated schema type snapshot. Do not edit. */\nimport type { EditorSchemaContract, Element, Text } from 'platejs';\n\n${source.slice(start, end).trim()}\n\nexport type SchemaContract = EditorSchemaContract;\nexport const fingerprint = ${JSON.stringify(fingerprint)};\n`;
};

const migrationDirectoryName = (schema: EditorSchemaContract, name: string) => {
  if (!MIGRATION_NAME_PATTERN.test(name)) {
    throw new Error(
      'Plate migration names must be lowercase kebab-case identifiers.'
    );
  }
  const version =
    schema.identity.kind === 'named'
      ? `v${schema.identity.version}`
      : schema.fingerprint.replace(FINGERPRINT_PREFIX_PATTERN, '').slice(0, 12);

  return `${version}-${name}`;
};

export const createEditorMigration = async (
  entry: string,
  name: string,
  options: CreateMigrationOptions = {}
): Promise<EditorMigrationArtifacts> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const compiled = await compileEditor(entry, { cwd });
  const readCommitted =
    options.readCommittedFile ?? ((path: string) => readGitFile(path, cwd));
  const previousSchemaSource = readCommitted(compiled.schemaPath);
  const previousTypesSource = readCommitted(compiled.typesPath);
  let previousInput: unknown;

  try {
    previousInput = JSON.parse(previousSchemaSource);
  } catch {
    throw new Error(
      `Committed Plate schema artifact is not valid JSON: ${compiled.schemaPath}`
    );
  }
  const previous = readEditorSchemaContract(previousInput);

  if (!previous) {
    throw new Error(
      `Committed Plate schema artifact is invalid: ${compiled.schemaPath}`
    );
  }
  const diff = diffEditorSchemaContracts(previous, compiled.schema);

  if (diff.changes.length === 0) {
    throw new Error(
      'Plate cannot scaffold a migration without schema changes.'
    );
  }
  if (diff.requiresMigration) {
    const from = previous.identity;
    const to = compiled.schema.identity;

    if (
      from.kind !== 'named' ||
      to.kind !== 'named' ||
      from.id !== to.id ||
      to.version <= from.version
    ) {
      throw new Error(
        'Migration-required schema changes need the same named schema id and a higher version.'
      );
    }
  }

  const directory = join(
    dirname(compiled.entryPath),
    'migrations',
    migrationDirectoryName(compiled.schema, name)
  );
  const fromSchemaPath = join(directory, 'from.schema.json');
  const toSchemaPath = join(directory, 'to.schema.json');
  const fromTypesPath = join(directory, 'from.ts');
  const toTypesPath = join(directory, 'to.ts');
  const manifestPath = join(directory, 'manifest.json');
  const migrationPath = join(directory, 'migration.ts');
  const paths = [
    fromSchemaPath,
    toSchemaPath,
    fromTypesPath,
    toTypesPath,
    manifestPath,
    migrationPath,
  ];

  if (paths.some(existsSync)) {
    throw new Error(`Plate migration already exists: ${directory}`);
  }

  const fromSchema = `${JSON.stringify(previous, null, 2)}\n`;
  const toSchema = compiled.schemaSource;
  const fromTypes = schemaTypesSnapshot(
    previousTypesSource,
    previous.fingerprint
  );
  const toTypes = schemaTypesSnapshot(
    compiled.typesSource,
    compiled.schema.fingerprint
  );
  const fromVersion =
    previous.identity.kind === 'named' ? previous.identity.version : 'number';
  const toVersion =
    compiled.schema.identity.kind === 'named'
      ? compiled.schema.identity.version
      : 'number';
  const migration = `import type { DocumentMigration, EditorDocumentValue } from 'platejs';\n\nimport type { Value as FromValue } from './from';\nimport type { Value as ToValue } from './to';\n\ntype FromDocument = EditorDocumentValue<FromValue>;\ntype ToDocument = EditorDocumentValue<ToValue>;\n\n/** Add this target-version step to the application document migration chain. */\nexport const migrate: DocumentMigration<\n  FromDocument,\n  ToDocument,\n  ${fromVersion},\n  ${toVersion}\n> = ({ document }) => {\n  void document;\n  throw new Error('Implement schema migration: ${name}');\n};\n`;
  const manifest = `${JSON.stringify(
    {
      checksums: {
        fromSchema: sha256(fromSchema),
        fromTypes: sha256(fromTypes),
        migration: sha256(migration),
        toSchema: sha256(toSchema),
        toTypes: sha256(toTypes),
      },
      diff,
      editor: relative(cwd, compiled.entryPath).replaceAll('\\', '/'),
      formatVersion: 1,
      from: previous.identity,
      name,
      to: compiled.schema.identity,
    },
    null,
    2
  )}\n`;

  replaceArtifacts([
    { content: fromSchema, path: fromSchemaPath },
    { content: toSchema, path: toSchemaPath },
    { content: fromTypes, path: fromTypesPath },
    { content: toTypes, path: toTypesPath },
    { content: manifest, path: manifestPath },
    { content: migration, path: migrationPath },
  ]);

  return Object.freeze({
    diff,
    directory,
    manifestPath,
    migrationPath,
    paths: Object.freeze(paths),
  });
};
