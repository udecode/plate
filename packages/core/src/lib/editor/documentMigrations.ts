import type {
  EditorDocumentValue,
  EditorSchemaIdentity,
  PersistedDocumentInput,
  Value,
} from '@platejs/plite';
import { MAIN_ROOT_KEY } from '@platejs/plite/internal';

import { mapDocumentSelection } from '../../internal/plugin/pipePrepareDocument';
import type { BaseEditor } from './BaseEditor';
import type { EditorApplicationSchema } from './editorApplicationSchema';

type NamedEditorApplicationSchema = EditorApplicationSchema &
  Readonly<{ id: string; version: number }>;

export type DocumentMigrationContext<
  FromDocument extends EditorDocumentValue = EditorDocumentValue,
  FromVersion extends number = number,
  ToVersion extends number = number,
> = Readonly<{
  document: FromDocument;
  editor: BaseEditor;
  from: FromVersion;
  to: ToVersion;
}>;

export type DocumentMigration<
  FromDocument extends EditorDocumentValue = EditorDocumentValue,
  ToDocument extends EditorDocumentValue = EditorDocumentValue,
  FromVersion extends number = number,
  ToVersion extends number = number,
> = {
  bivarianceHack(
    context: DocumentMigrationContext<FromDocument, FromVersion, ToVersion>
  ): ToDocument;
}['bivarianceHack'];

type DocumentMigrationSteps = Readonly<Record<number, DocumentMigration>>;

export type DocumentMigrations<
  TSteps extends DocumentMigrationSteps = DocumentMigrationSteps,
> = Readonly<{
  id: string;
  sourceFingerprints: Readonly<Record<number, string>>;
  steps: TSteps;
  unversioned?: number;
  version: number;
}>;

export type DocumentMigrationResult = Readonly<{
  applied: readonly number[];
  document: EditorDocumentValue;
  selection?: PersistedDocumentInput['selection'];
  source: number;
  target: number;
}>;

const assertVersion = (version: number, owner: string) => {
  if (!Number.isSafeInteger(version) || version < 0) {
    throw new TypeError(`${owner} must be a non-negative safe integer.`);
  }
};

type MigrationInput<TMigration> =
  TMigration extends DocumentMigration<infer TInput> ? TInput : never;

type MigrationOutput<TMigration> =
  TMigration extends DocumentMigration<EditorDocumentValue, infer TOutput>
    ? TOutput
    : never;

type MigrationFrom<TMigration> =
  TMigration extends DocumentMigration<
    EditorDocumentValue,
    EditorDocumentValue,
    infer TFrom
  >
    ? TFrom
    : number;

type MigrationTo<TMigration> =
  TMigration extends DocumentMigration<
    EditorDocumentValue,
    EditorDocumentValue,
    number,
    infer TTo
  >
    ? TTo
    : number;

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type PreviousDigit = {
  '0': '9';
  '1': '0';
  '2': '1';
  '3': '2';
  '4': '3';
  '5': '4';
  '6': '5';
  '7': '6';
  '8': '7';
  '9': '8';
};
type StringCharacters<
  Input extends string,
  Output extends readonly string[] = readonly [],
> = Input extends `${infer Head}${infer Tail}`
  ? StringCharacters<Tail, readonly [...Output, Head]>
  : Output;
type DecrementDigits<Input extends readonly string[]> = Input extends readonly [
  ...infer Prefix extends readonly string[],
  infer Last extends Digit,
]
  ? Last extends '0'
    ? readonly [...DecrementDigits<Prefix>, '9']
    : readonly [...Prefix, PreviousDigit[Last]]
  : readonly [];
type JoinCharacters<Input extends readonly string[]> = Input extends readonly [
  infer Head extends string,
  ...infer Tail extends readonly string[],
]
  ? `${Head}${JoinCharacters<Tail>}`
  : '';
type TrimLeadingZeros<Input extends string> = Input extends `0${infer Rest}`
  ? Rest extends ''
    ? '0'
    : TrimLeadingZeros<Rest>
  : Input;
type PreviousVersion<Version extends number> = Version extends 0
  ? never
  : TrimLeadingZeros<
        JoinCharacters<DecrementDigits<StringCharacters<`${Version}`>>>
      > extends `${infer Previous extends number}`
    ? Previous
    : never;

type CanFeed<TOutput, TInput> = [TOutput] extends [TInput] ? true : false;

type IncompatibleMigrationVersion<TSteps extends DocumentMigrationSteps> = {
  [Version in keyof TSteps]: Version extends number
    ? number extends MigrationTo<TSteps[Version]>
      ? never
      : MigrationTo<TSteps[Version]> extends Version
        ? Version extends MigrationTo<TSteps[Version]>
          ? number extends MigrationFrom<TSteps[Version]>
            ? never
            : MigrationFrom<TSteps[Version]> extends PreviousVersion<Version>
              ? MigrationFrom<TSteps[Version]> extends keyof TSteps
                ? CanFeed<
                    MigrationOutput<TSteps[MigrationFrom<TSteps[Version]>]>,
                    MigrationInput<TSteps[Version]>
                  > extends true
                  ? never
                  : Version
                : never
              : Version
          : Version
        : Version
    : never;
}[keyof TSteps];

type MigrationContinuity<TSteps extends DocumentMigrationSteps> = [
  IncompatibleMigrationVersion<TSteps>,
] extends [never]
  ? unknown
  : Readonly<{
      __migrationStepInputMustAcceptPreviousOutput: IncompatibleMigrationVersion<TSteps>;
    }>;

/** Define one exact, ascending application document migration chain. */
export const defineDocumentMigrations = <
  const TSchema extends NamedEditorApplicationSchema,
  const TSteps extends DocumentMigrationSteps,
>(
  schema: TSchema,
  options: Readonly<{
    sourceFingerprints?: Readonly<Record<number, string>>;
    steps: TSteps;
    unversioned?: number;
  }> &
    MigrationContinuity<TSteps>
): Readonly<{
  id: TSchema['id'];
  sourceFingerprints: Readonly<Record<number, string>>;
  steps: TSteps;
  unversioned?: number;
  version: TSchema['version'];
}> => {
  if (!schema.id) {
    throw new TypeError('Document migrations require a named schema id.');
  }
  assertVersion(schema.version, 'Document migration target version');
  if (options.unversioned !== undefined) {
    assertVersion(options.unversioned, 'Unversioned document source version');
    if (options.unversioned > schema.version) {
      throw new Error(
        'Unversioned document source version cannot exceed the target version.'
      );
    }
  }

  const steps = Object.fromEntries(
    Object.entries(options.steps).map(([rawVersion, migration]) => {
      const version = Number(rawVersion);

      assertVersion(version, 'Document migration step version');
      if (version > schema.version) {
        throw new Error(
          `Document migration step ${version} exceeds target version ${schema.version}.`
        );
      }
      if (typeof migration !== 'function') {
        throw new TypeError(
          `Document migration step ${version} must be a function.`
        );
      }

      return [version, migration];
    })
  ) as TSteps;
  const sourceFingerprints = Object.fromEntries(
    Object.entries(options.sourceFingerprints ?? {}).map(
      ([rawVersion, fingerprint]) => {
        const version = Number(rawVersion);

        assertVersion(version, 'Document migration source version');
        if (version >= schema.version) {
          throw new Error(
            `Document migration source fingerprint ${version} must precede target version ${schema.version}.`
          );
        }
        if (typeof fingerprint !== 'string' || fingerprint.length === 0) {
          throw new TypeError(
            `Document migration source fingerprint ${version} must be a non-empty string.`
          );
        }

        return [version, fingerprint];
      }
    )
  );

  return Object.freeze({
    id: schema.id,
    sourceFingerprints: Object.freeze(sourceFingerprints),
    steps: Object.freeze(steps),
    ...(options.unversioned === undefined
      ? {}
      : { unversioned: options.unversioned }),
    version: schema.version,
  });
};

const isPersistedDocumentInput = <V extends Value>(
  input: EditorDocumentValue<V> | PersistedDocumentInput<V>
): input is PersistedDocumentInput<V> => 'document' in input;

const assertSourceIdentity = (
  source: EditorSchemaIdentity,
  migrations: DocumentMigrations
) => {
  if (source.kind !== 'named') {
    throw new Error('Document migrations require a named source schema.');
  }
  if (source.id !== migrations.id) {
    throw new Error(
      `Document schema id "${source.id}" does not match migration id "${migrations.id}".`
    );
  }
  assertVersion(source.version, 'Persisted document source version');

  if (source.version < migrations.version) {
    const expected = migrations.sourceFingerprints[source.version];

    if (!expected) {
      throw new Error(
        `Missing source schema fingerprint for ${migrations.id}@${source.version}.`
      );
    }
    if (source.fingerprint !== expected) {
      throw new Error(
        `Document schema fingerprint ${source.fingerprint} does not match migration source ${migrations.id}@${source.version} fingerprint ${expected}.`
      );
    }
  }

  return source.version;
};

/** Run every required target-version step for one complete external document. */
export const migrateDocument = <V extends Value>(
  input: EditorDocumentValue<V> | PersistedDocumentInput<V>,
  options: Readonly<{
    editor: BaseEditor;
    migrations: DocumentMigrations;
  }>
): DocumentMigrationResult => {
  const { editor, migrations } = options;
  const current = editor.read.schema.identity();

  if (current.kind !== 'named') {
    throw new Error('Document migrations require a named current schema.');
  }
  if (current.id !== migrations.id || current.version !== migrations.version) {
    throw new Error(
      `Current schema ${current.id}@${current.version} does not match migration target ${migrations.id}@${migrations.version}.`
    );
  }

  const persisted = isPersistedDocumentInput(input);
  const source = persisted
    ? assertSourceIdentity(input.schema, migrations)
    : migrations.unversioned;

  if (source === undefined) {
    return Object.freeze({
      applied: Object.freeze([]),
      document: input as EditorDocumentValue<V>,
      selection: undefined,
      source: current.version,
      target: current.version,
    });
  }
  if (source > current.version) {
    throw new Error(
      `Document schema version ${source} is newer than current version ${current.version}; downgrades are not supported.`
    );
  }
  if (
    persisted &&
    source === current.version &&
    input.schema.fingerprint !== current.fingerprint
  ) {
    throw new Error(
      `Document schema fingerprint ${input.schema.fingerprint} does not match current fingerprint ${current.fingerprint}.`
    );
  }

  let document = (persisted ? input.document : input) as EditorDocumentValue;
  let selection = persisted ? input.selection : undefined;
  const applied: number[] = [];

  for (let version = source + 1; version <= current.version; version++) {
    const migration = migrations.steps[version];

    if (!migration) {
      throw new Error(
        `Missing document migration step ${version} for ${migrations.id}@${source}->${current.version}.`
      );
    }

    const next = migration({
      document,
      editor,
      from: version - 1,
      to: version,
    });

    if (!next || Array.isArray(next) || !Array.isArray(next.children)) {
      throw new Error(
        `Document migration step ${version} must return a complete document.`
      );
    }
    if (selection && selection !== 'start' && selection !== 'end') {
      selection = mapDocumentSelection(
        editor,
        selection,
        document,
        next,
        selection.anchor.root ?? selection.focus.root ?? MAIN_ROOT_KEY
      );
    }
    document = next;
    applied.push(version);
  }

  return Object.freeze({
    applied: Object.freeze(applied),
    document,
    selection,
    source,
    target: current.version,
  });
};
