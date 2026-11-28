import {
  assertDetachedSelectionSupported,
  assertEditorDocumentContainers,
  completePersistedDocumentFields,
  createDetachedEditorSchema,
  type Descendant,
  DocumentChange,
  EDITOR_DOCUMENT_FIELDS,
  type EditorDocumentShapeIssue,
  type EditorDocumentValue,
  type EditorJsonValue,
  type EditorSchemaIdentity,
  type EditorStateField,
  type EditorStateSchemaApi,
  ElementApi,
  getEditorDocumentShapeIssueMessage,
  isEnvelopeInput,
  type NativeAuthoredDocumentCapability,
  type PersistedDocumentInput,
  type Range,
  readDocumentRecord,
  readPersistedEnvelope,
  readStoredEditorDocument,
  rejectEditorRecord,
  type RuntimePluginReference,
  type Selection,
  SelectionApi,
  snapshotEditorJsonValue,
} from '../facade';
import type { EditorApplicationSchema } from '../lib/editor/editorApplicationSchema';
import { compilePlateEditorTarget } from '../lib/editor/withPlite';
import {
  findDocumentMigrationAuthoredCapability,
  registerDocumentMigrationAuthoredCapability,
} from './documentMigrationAuthored.internal';
import {
  assertHistoricalSelection,
  isConcreteSelection,
  mapDetachedStepSelection,
  mapLiveRanges,
  mapStepRanges,
  readCoveringRange,
  resolveSelection,
  savedRangeOrNull,
  type SnapshotSelectionInput,
  uncrossedRange,
} from './documentMigrationSelection.internal';
import { registerMigrationBindings } from './documentMigrationTarget.internal';

type NamedEditorApplicationSchema = EditorApplicationSchema &
  Readonly<{ id: string; version: number }>;

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyArray<infer TItem>
    ? ReadonlyArray<DeepReadonly<TItem>>
    : T extends object
      ? { readonly [TKey in keyof T]: DeepReadonly<T[TKey]> }
      : T;

export type DocumentMigrationSchema = Pick<
  EditorStateSchemaApi,
  | 'assertDocument'
  | 'element'
  | 'fitDocument'
  | 'identity'
  | 'isInline'
  | 'property'
>;

/** Immutable current-schema facts available to historical migration steps. */
export type DocumentMigrationTarget = Readonly<{
  schema: DocumentMigrationSchema;
}>;

export type DocumentMigrationSelectionContext = Readonly<{
  mappedSelection: Selection;
  selection: Exclude<Selection, null>;
}>;

/**
 * Saved ranges by thread id. A range's points name the root it covers, and a
 * point that names none is in the primary root.
 */
export type DocumentMigrationRanges = Readonly<Record<string, Range>>;

/**
 * Migrated ranges by thread id; `null` when the text a range covered is gone,
 * a step put its ends in the opposite order, or the range collapsed, covers no
 * text or points outside the input document.
 */
export type MigratedDocumentRanges = Readonly<Record<string, Range | null>>;

/** The ranges still mapped before a step, in order, each in the root it names. */
export type DocumentMigrationRangesContext = Readonly<{
  ranges: readonly Range[];
}>;

/** Stored top-level fields outside `children`, `meta`, `roots` and `records`. */
export type DocumentMigrationLegacy = Readonly<Record<string, EditorJsonValue>>;

/**
 * A migration document admits only `children`, `meta`, `roots` and `records`;
 * any other key fails to compile with a message naming the `legacy` channel.
 */
export type ClosedMigrationDocument<TDocument> = {
  readonly [TKey in keyof TDocument]: TKey extends keyof EditorDocumentValue
    ? TDocument[TKey]
    : `Return top-level field "${TKey & string}" in legacy`;
};

export type DocumentMigrationStepResult<
  ToDocument extends EditorDocumentValue & ClosedMigrationDocument<ToDocument> =
    EditorDocumentValue,
> = Readonly<{
  document: ToDocument;
  /** Legacy fields left to lift. Omitted, the step's input passes on. */
  legacy?: DocumentMigrationLegacy;
  /**
   * Map every range in one call, returning one range or `null` per range in
   * order. A returned range keeps its input's root, or it maps to `null`.
   * Omitted, every range maps to `null` when the step changes the document.
   */
  mapRanges?: (
    context: DocumentMigrationRangesContext
  ) => ReadonlyArray<Range | null>;
  mapSelection?: (context: DocumentMigrationSelectionContext) => Selection;
}>;

export type DocumentMigrationContext<
  FromDocument extends EditorDocumentValue &
    ClosedMigrationDocument<FromDocument> = EditorDocumentValue,
  FromVersion extends number = number,
  ToVersion extends number = number,
> = Readonly<{
  document: DeepReadonly<FromDocument>;
  from: FromVersion;
  /** Legacy top-level fields no earlier step lifted. */
  legacy: DocumentMigrationLegacy;
  target: DocumentMigrationTarget;
  to: ToVersion;
}>;

export type DocumentMigration<
  FromDocument extends EditorDocumentValue &
    ClosedMigrationDocument<FromDocument> = EditorDocumentValue,
  ToDocument extends EditorDocumentValue & ClosedMigrationDocument<ToDocument> =
    EditorDocumentValue,
  FromVersion extends number = number,
  ToVersion extends number = number,
> = {
  bivarianceHack(
    context: DocumentMigrationContext<FromDocument, FromVersion, ToVersion>
  ): DocumentMigrationStepResult<ToDocument>;
}['bivarianceHack'];

type DocumentMigrationSteps = Readonly<Record<number, DocumentMigration>>;

declare const documentMigrationsBrand: unique symbol;

/** Opaque, precompiled migration definition. */
export type DocumentMigrations<
  TSteps extends DocumentMigrationSteps = DocumentMigrationSteps,
  TId extends string = string,
  TVersion extends number = number,
> = Readonly<{
  [documentMigrationsBrand]: true;
  id: TId;
  sourceFingerprints: Readonly<Record<number, string>>;
  steps: TSteps;
  version: TVersion;
}>;

/** The migrated envelope, plus the mapped ranges when `ranges` was passed. */
export type DocumentMigrationResult<
  TRanges extends DocumentMigrationRanges | undefined = undefined,
> = Readonly<{
  applied: readonly number[];
  output: PersistedDocumentInput;
  source: number;
}> &
  (undefined extends TRanges
    ? unknown
    : Readonly<{ ranges: MigratedDocumentRanges }>);

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

// keyof a union keeps only shared keys; distributing sees each returned
// document's own.
type ExtraField<TDocument> = TDocument extends unknown
  ? Exclude<keyof TDocument, keyof EditorDocumentValue>
  : never;

// Inferring `document` straight from a union of results merges the branches
// into their common supertype, so infer the whole result and distribute.
type ExtraResultField<TResult> =
  TResult extends Readonly<{
    document: infer TDocument;
  }>
    ? ExtraField<TDocument>
    : never;

type ExtraDocumentField<TMigration> = TMigration extends (
  ...args: never[]
) => infer TResult
  ? ExtraResultField<TResult>
  : never;

/** Close an inferred step's returned document, which no generic argument checks. */
type MigrationClosure<TSteps extends DocumentMigrationSteps> = [
  ExtraDocumentField<TSteps[keyof TSteps]>,
] extends [never]
  ? unknown
  : Readonly<{
      __migrationStepDocument: `Return top-level field "${ExtraDocumentField<TSteps[keyof TSteps]> & string}" in legacy`;
    }>;

type MigrationContinuity<TSteps extends DocumentMigrationSteps> = [
  IncompatibleMigrationVersion<TSteps>,
] extends [never]
  ? unknown
  : Readonly<{
      __migrationStepInputMustAcceptPreviousOutput: IncompatibleMigrationVersion<TSteps>;
    }>;

type MigrationAuthority = Readonly<{
  authored?: NativeAuthoredDocumentCapability;
  fields: ReadonlyArray<EditorStateField<any>>;
  schema: ReturnType<typeof createDetachedEditorSchema>;
  target: DocumentMigrationTarget;
}>;

const migrationAuthorities = new WeakMap<object, MigrationAuthority>();

const assertVersion = (version: number, owner: string) => {
  if (!Number.isSafeInteger(version) || version < 0) {
    throw new TypeError(`${owner} must be a non-negative safe integer.`);
  }
};

const STEP_RESULT_FIELDS = Object.freeze({
  document: 'required',
  legacy: 'optional',
  mapRanges: 'optional',
  mapSelection: 'optional',
} satisfies Record<keyof DocumentMigrationStepResult, 'optional' | 'required'>);

const rejectDocument =
  (label: string) =>
  (issue: EditorDocumentShapeIssue): never => {
    throw new Error(`${label}: ${getEditorDocumentShapeIssueMessage(issue)}`);
  };

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const splitHistoricalDocument = (value: unknown, label: string) => {
  if (!isJsonRecord(value)) return rejectDocument(label)({ kind: 'record' });
  const entries = Object.entries(value);
  // fromEntries defines own keys, so a stored "__proto__" field stays data.
  const document = Object.fromEntries(
    entries.filter(([field]) => Object.hasOwn(EDITOR_DOCUMENT_FIELDS, field))
  );
  const legacy = Object.fromEntries(
    entries.filter(([field]) => !Object.hasOwn(EDITOR_DOCUMENT_FIELDS, field))
  );

  assertEditorDocumentContainers(document, rejectDocument(label));

  return {
    document: Object.freeze(document) as EditorDocumentValue,
    legacy: Object.freeze(legacy) as DocumentMigrationLegacy,
  };
};

const assertUniqueElementIds = (value: EditorDocumentValue): void => {
  const seen = new Map<
    string,
    Readonly<{ path: readonly number[]; root: string }>
  >();
  const visit = (
    nodes: readonly Descendant[],
    root: string,
    prefix: readonly number[]
  ) => {
    nodes.forEach((node, index) => {
      if (!ElementApi.isElement(node)) return;
      const path = [...prefix, index];

      if (typeof node.id === 'string' && node.id.length > 0) {
        const existing = seen.get(node.id);

        if (existing) {
          throw new Error(
            `Duplicate element ID "${node.id}" at ${existing.root}:[${existing.path}] and ${root}:[${path}].`
          );
        }
        seen.set(node.id, { path, root });
      }
      visit(node.children, root, path);
    });
  };

  visit(value.children, 'main', []);
  for (const [root, children] of Object.entries(value.roots ?? {})) {
    visit(children, root, []);
  }
};

const completeDocument = (
  authority: MigrationAuthority,
  document: EditorDocumentValue,
  selection: SnapshotSelectionInput | undefined,
  hasSelection: boolean,
  ranges: ReadonlyArray<Range | null> | undefined
) => {
  assertUniqueElementIds(document);
  const live = ranges?.flatMap((range) => (range ? [range] : [])) ?? [];
  const fitted =
    isConcreteSelection(selection) || live.length > 0
      ? authority.schema.fitDocumentAndMapPositions(document, {
          ranges: live,
          ...(isConcreteSelection(selection)
            ? {
                selection: {
                  root: SelectionApi.root(selection) ?? 'main',
                  selection,
                },
              }
            : {}),
        })
      : { document: authority.schema.fitDocument(document), ranges: [] };
  const fittedSelection = isConcreteSelection(selection)
    ? fitted.selection
    : selection;
  const assertTarget = (value: EditorDocumentValue) => {
    authority.schema.assertDocument(value);
    assertUniqueElementIds(value);
  };
  // A migrated document loads, so its pending changes get the spares a load
  // stores.
  const repaired =
    findDocumentMigrationAuthoredCapability(authority.target)?.repair(
      fitted.document
    ) ?? fitted.document;
  const completed = completePersistedDocumentFields(repaired, authority.fields);
  const resolved = resolveSelection(fittedSelection, completed);

  assertTarget(completed);
  if (resolved !== undefined) {
    assertDetachedSelectionSupported(authority.schema, resolved, completed);
  }

  return Object.freeze({
    document: completed,
    ranges:
      ranges &&
      mapLiveRanges(ranges, fitted.ranges, (range, value) =>
        readCoveringRange(
          uncrossedRange(range, value ?? null),
          completed,
          'Migrated range'
        )
      ),
    ...(hasSelection ? { selection: resolved } : {}),
  });
};

/** Compile one named current target and its exact historical migration chain. */
export const defineDocumentMigrations = <
  const TPlugins extends readonly RuntimePluginReference[],
  const TSchema extends NamedEditorApplicationSchema,
  const TSteps extends DocumentMigrationSteps,
>(
  options: Readonly<{
    plugins: TPlugins;
    schema: TSchema;
    sourceFingerprints?: Readonly<Record<number, string>>;
    steps: TSteps;
  }> &
    MigrationClosure<TSteps> &
    MigrationContinuity<TSteps>
): DocumentMigrations<TSteps, TSchema['id'], TSchema['version']> => {
  if (!options.schema.id) {
    throw new TypeError('Document migrations require a named schema id.');
  }
  assertVersion(options.schema.version, 'Document migration target version');

  const compiled = compilePlateEditorTarget({
    plugins: options.plugins,
    schema: options.schema,
  });
  const schema = createDetachedEditorSchema(compiled.schema);
  const current = schema.identity();

  if (
    current.kind !== 'named' ||
    current.id !== options.schema.id ||
    current.version !== options.schema.version
  ) {
    throw new Error(
      'Compiled migration target does not match its named schema.'
    );
  }

  const steps = Object.fromEntries(
    Object.entries(options.steps).map(([rawVersion, migration]) => {
      const version = Number(rawVersion);

      assertVersion(version, 'Document migration step version');
      if (version > current.version) {
        throw new Error(
          `Document migration step ${version} exceeds target version ${current.version}.`
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
        if (version >= current.version) {
          throw new Error(
            `Document migration source fingerprint ${version} must precede target version ${current.version}.`
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
  const target = Object.freeze({ schema }) satisfies DocumentMigrationTarget;
  registerMigrationBindings(target, compiled.modelBindings, compiled.schema);
  if (compiled.authored) {
    registerDocumentMigrationAuthoredCapability(
      target,
      compiled.authored,
      compiled.schema
    );
  }
  const definition = Object.freeze({
    id: current.id,
    sourceFingerprints: Object.freeze(sourceFingerprints),
    steps: Object.freeze(steps),
    version: current.version,
  }) as DocumentMigrations<TSteps, TSchema['id'], TSchema['version']>;

  migrationAuthorities.set(
    definition,
    Object.freeze({
      ...(compiled.authored ? { authored: compiled.authored } : {}),
      fields: compiled.fields,
      schema,
      target,
    })
  );

  return definition;
};

const readDefinition = (migrations: DocumentMigrations): MigrationAuthority => {
  const authority =
    migrations && typeof migrations === 'object'
      ? migrationAuthorities.get(migrations)
      : undefined;

  if (!authority) {
    throw new TypeError(
      'Document migrations must come from defineDocumentMigrations in this runtime.'
    );
  }

  return authority;
};

const readEnvelopeSource = (
  identity: EditorSchemaIdentity,
  migrations: DocumentMigrations,
  current: EditorSchemaIdentity
) => {
  if (identity.kind !== 'named' || identity.id !== migrations.id) {
    throw new Error('Persisted document schema has the wrong named lineage.');
  }
  const source = identity.version;

  if (current.kind !== 'named') {
    throw new Error('Document migrations require a named current schema.');
  }
  if (source > current.version) {
    throw new Error(
      `Document schema version ${source} is newer than current version ${current.version}.`
    );
  }
  const expected =
    source === current.version
      ? current.fingerprint
      : migrations.sourceFingerprints[source];

  if (!expected || identity.fingerprint !== expected) {
    throw new Error(
      `Unknown schema fingerprint for ${migrations.id}@${source}.`
    );
  }

  return source;
};

type IsAny<T> = 0 extends 1 & T ? true : false;

type IsEnvelopeInput<TInput> =
  TInput extends Readonly<{ document: unknown; schema: unknown }>
    ? 'children' extends keyof TInput
      ? false
      : true
    : false;

type MigrationOptions<
  TInput,
  TRanges extends DocumentMigrationRanges | undefined = undefined,
> = Readonly<{
  migrations: DocumentMigrations;
  ranges?: TRanges;
}> &
  (IsAny<TInput> extends true
    ? Readonly<{ source?: number | 'current' }>
    : IsEnvelopeInput<TInput> extends true
      ? Readonly<{ source?: never }>
      : Readonly<{ source: number | 'current' }>);

/**
 * Convert one external document into the definition's exact current envelope,
 * mapping `ranges`, keyed by thread id, through every step and the final fit.
 */
export const migrateDocument = <
  const TInput,
  TRanges extends DocumentMigrationRanges | undefined = undefined,
>(
  input: TInput,
  options: MigrationOptions<NoInfer<TInput>, TRanges>
): DocumentMigrationResult<TRanges> => {
  const authority = readDefinition(options.migrations);
  const { migrations } = options;
  const current = authority.schema.identity();
  if (current.kind !== 'named') {
    throw new Error('Document migrations require a named current schema.');
  }
  const owned = snapshotEditorJsonValue(input, 'Document migration input');
  // A legacy raw value can hold a top-level "document" without children; only
  // a record that also names its schema reads as an envelope.
  const envelope = isEnvelopeInput(owned) && owned.schema !== undefined;
  let historical: unknown;
  let selection: SnapshotSelectionInput | undefined;
  let hasSelection = false;
  let source: number;

  if (options.source === undefined) {
    if (!envelope) {
      throw new Error('Raw document input requires explicit source intent.');
    }
    const persisted = readPersistedEnvelope(owned);

    source = readEnvelopeSource(persisted.schema, migrations, current);
    historical = persisted.document;
    hasSelection = Object.hasOwn(persisted, 'selection');
    selection = persisted.selection as SnapshotSelectionInput | undefined;
  } else {
    if (envelope) {
      throw new Error(
        'A persisted document envelope carries its own source version; migrate it without source.'
      );
    }
    source = options.source === 'current' ? current.version : options.source;
    assertVersion(source, 'Raw document source version');
    if (source > current.version) {
      throw new Error(
        `Document schema version ${source} is newer than current version ${current.version}.`
      );
    }
    historical = Array.isArray(owned) ? { children: owned } : owned;
  }

  let { document, legacy } = splitHistoricalDocument(
    historical,
    options.source === undefined ? 'Persisted document' : 'Raw document'
  );

  const chain: Array<readonly [number, DocumentMigration]> = [];

  for (let to = source + 1; to <= current.version; to++) {
    const migration = migrations.steps[to];

    if (typeof migration !== 'function') {
      throw new Error(
        `Missing document migration step ${to} for ${migrations.id}@${source}->${current.version}.`
      );
    }
    chain.push(Object.freeze([to, migration] as const));
  }

  assertHistoricalSelection(authority.schema, selection, document);
  const rangeEntries = options.ranges && Object.entries(options.ranges);
  let ranges: ReadonlyArray<Range | null> | undefined = rangeEntries?.map(
    ([, range]) => savedRangeOrNull(range, document)
  );

  for (const [to, migration] of chain) {
    const before = document;
    const result = readDocumentRecord(
      migration({
        document: before,
        from: to - 1,
        legacy,
        target: authority.target,
        to,
      }),
      STEP_RESULT_FIELDS,
      rejectEditorRecord(`Document migration step ${to} result`)
    );
    const mapper = result.mapSelection;

    if (mapper !== undefined && typeof mapper !== 'function') {
      throw new Error(
        `Document migration step ${to} mapSelection must be a function.`
      );
    }
    if (
      result.mapRanges !== undefined &&
      typeof result.mapRanges !== 'function'
    ) {
      throw new Error(
        `Document migration step ${to} mapRanges must be a function.`
      );
    }
    const label = `Document migration step ${to} document`;
    document = readStoredEditorDocument(
      snapshotEditorJsonValue(result.document, label),
      rejectDocument(label)
    );
    if (result.legacy !== undefined) {
      const nextLegacy = snapshotEditorJsonValue(
        result.legacy,
        `Document migration step ${to} legacy`
      );

      if (!isJsonRecord(nextLegacy)) {
        throw new Error(
          `Document migration step ${to} legacy must be an object.`
        );
      }
      legacy = nextLegacy as DocumentMigrationLegacy;
    }

    let change: DocumentChange | undefined;
    const after = document;
    const changeOf = () => (change ??= DocumentChange.between(before, after));

    if (isConcreteSelection(selection)) {
      const original = selection;
      let hasMapped = false;
      let cachedMapped: Selection = null;
      const getMappedSelection = () => {
        if (!hasMapped) {
          cachedMapped = mapDetachedStepSelection(
            authority.schema,
            original,
            changeOf(),
            before,
            document
          );
          hasMapped = true;
        }

        return cachedMapped;
      };

      selection = mapper
        ? (mapper as DocumentMigrationStepResult['mapSelection'])?.(
            Object.freeze({
              get mappedSelection() {
                return getMappedSelection();
              },
              selection: original,
            })
          )
        : getMappedSelection();
      if (selection === undefined) {
        throw new Error(
          `Document migration step ${to} selection mapper must return a selection or null.`
        );
      }
      selection = snapshotEditorJsonValue(
        selection,
        `Document migration step ${to} selection`
      );
      assertHistoricalSelection(authority.schema, selection, document);
    }
    if (ranges) {
      ranges = mapStepRanges(
        to,
        ranges,
        result.mapRanges as DocumentMigrationStepResult['mapRanges'],
        changeOf,
        document
      );
    }
  }

  const [unlifted] = Object.keys(legacy);

  if (unlifted !== undefined) {
    throw new Error(
      chain.length === 0
        ? getEditorDocumentShapeIssueMessage({ kind: 'field', field: unlifted })
        : `Migrated document field "${unlifted}" was not lifted by any migration step.`
    );
  }

  const completed = completeDocument(
    authority,
    document,
    selection,
    hasSelection,
    ranges
  );
  const output = snapshotEditorJsonValue(
    {
      document: completed.document,
      schema: current,
      ...(hasSelection ? { selection: completed.selection } : {}),
    },
    'Migrated document output'
  ) as PersistedDocumentInput;

  // A null prototype keeps a thread id such as "__proto__" as its own key.
  const migratedRanges: Record<string, Range | null> = Object.create(null);

  rangeEntries?.forEach(([id], index) => {
    migratedRanges[id] = completed.ranges?.[index] ?? null;
  });

  return Object.freeze({
    applied: Object.freeze(chain.map(([to]) => to)),
    output,
    source,
    ...(rangeEntries ? { ranges: Object.freeze(migratedRanges) } : {}),
  }) as DocumentMigrationResult<TRanges>;
};
