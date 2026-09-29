import {
  type ContentSlice,
  type DescendantIn,
  type EditorCoreStateView,
  type EditorStateView,
  type EditorMarks,
  type Element,
  type Editor,
  type SchemaProperty,
  type TransactionSpec,
  type Value,
  ContentSlice as ContentSliceApi,
  definePlugin,
  definePluginPoint,
  editorCommands,
  type Plugin,
  NodeApi,
  RangeApi,
  SelectionApi,
} from '../..';
import {
  evaluateCommand,
  evaluateCommandWithState,
} from '../../core/command-registry';
import { createDetachedContentSlice } from '../../core/content-slice';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { getCompiledEditorSchemaFromApi } from '../../core/editor-schema';
import {
  getPluginContributions,
  reportEditorLifecycleError,
} from '../../core/plugin';
import {
  getCompiledEditorSchema,
  getPluginRegistry as getInternalPluginRegistry,
} from '../../core/plugin-registry';
import {
  applyTransactionSpec,
  attachTransactionSpecAfterCommit,
  getActiveEditorTransaction,
  getEditorStateView,
  toEditorCoreStateView,
} from '../../core/public-state';
import {
  getCompiledSchemaPropertyId,
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
} from '../../core/schema-compiler';
import { EditorSchemaValidationError } from '../../core/schema-validation';
import { getSelection as getEditorSelection } from '../../interfaces/editor';

const DATA_TRANSFER_FORMATS = definePluginPoint<
  DataTransferFormatRegistration<any>
>('editor-dom:data-transfer-format');
const NEWLINE_SPLIT_RE = /\r\n|\r|\n/;

export type DataTransferFormatPhase = 'accept' | 'decode' | 'encode';

const reportDataTransferFormatError = <V extends Value>(
  editor: Editor<V, any>,
  registration: DataTransferFormatRegistration<V>,
  phase: DataTransferFormatPhase,
  cause: unknown
) => {
  reportEditorLifecycleError(
    Object.freeze({
      cause,
      editor,
      pluginName: registration.owner,
      mimeType: registration.format.mimeType,
      key: registration.format.key,
      phase,
      source: 'data-transfer-format' as const,
    })
  );
};

/** Read-only host data exposed to pure format callbacks. */
export type DataTransferSnapshot = Readonly<{
  /** Files captured when clipboard ingress began. */
  files: Readonly<{
    readonly [index: number]: File;
    readonly length: number;
    item: (index: number) => File | null;
  }>;
  /** Read a captured mimeType. Missing mimeTypes return an empty string. */
  getData: (mimeType: string) => string;
  /** Formats advertised by the incoming host payload. */
  types: readonly string[];
}>;

/** One conversion diagnostic a format reports while decoding a payload. */
export type DataTransferDiagnostic = Readonly<{
  /** `lossy` when pasted content is left out or loses meaning. */
  impact: 'lossless' | 'lossy';
  /** Human-readable explanation of what changed. */
  message: string;
}>;

export type DataTransferDecodeContext<V extends Value = Value> = Readonly<{
  /** Payload for this format's registered mimeType. */
  data: string;
  /** MIME type currently being decoded. */
  mimeType: string;
  /**
   * Report a conversion diagnostic while `accept` or `decode` runs. A mounted
   * paste delivers the inserted payload's reports, plus loss from earlier
   * payloads that it cannot account for, through `Editable.onPasteResult`.
   */
  report: (diagnostic: DataTransferDiagnostic) => void;
  /** Immutable snapshot of every incoming host MIME type and file. */
  snapshot: DataTransferSnapshot;
  /** Read-only editor snapshot captured for this callback. */
  state: EditorCoreStateView<V>;
}>;

export type DataTransferEncodeContext<V extends Value = Value> = Readonly<{
  /** MIME type currently being encoded. */
  mimeType: string;
  /** Immutable model slice selected for export. */
  slice: ContentSlice<V>;
  /** Read-only editor snapshot captured for this callback. */
  state: EditorCoreStateView<V>;
}>;

/** Stable schema ownership claimed by one format direction and MIME type. */
export type DataTransferSchemaClaim =
  | Readonly<{ kind: 'element'; type: string }>
  | SchemaProperty
  | Readonly<{ kind: 'schema' }>;

export type DataTransferFormat<V extends Value = Value> = Readonly<{
  /** Stable registration identity used for lifecycle errors and conflicts. */
  key: string;
  /** MIME type read from and written to the host data container. */
  mimeType: string;
  /**
   * Parse an intact slice, or return null to delegate to the next format.
   * Contextual schema fitting occurs at insertion. Report what the slice
   * leaves out through `context.report`.
   */
  decode?: (context: DataTransferDecodeContext<V>) => ContentSlice<V> | null;
  /** Return false to skip this payload before decoding. */
  accept?: (context: DataTransferDecodeContext<V>) => boolean;
  /** Schema resources owned by this format and checked atomically. */
  claims?: readonly DataTransferSchemaClaim[];
  /** Encode the supplied slice, or return null to delegate this mimeType. */
  encode?: (context: DataTransferEncodeContext<V>) => string | null;
}>;

const prepareDataTransferFormat = <V extends Value = Value>(
  format: DataTransferFormat<V>
): DataTransferFormat<V> => {
  if (!format.key) throw new Error('DataTransfer format key cannot be empty.');
  if (!format.mimeType) {
    throw new Error('DataTransfer format mimeType cannot be empty.');
  }
  if (!format.decode && !format.encode) {
    throw new Error(
      `DataTransfer format "${format.key}" must define decode or encode.`
    );
  }

  const claims = format.claims?.map((target) => {
    if ('kind' in target && target.kind === 'schema') {
      return Object.freeze({ kind: 'schema' });
    }
    if ('kind' in target && target.kind === 'element') {
      if (!target.type) {
        throw new Error(
          `DataTransfer format "${format.key}" element type cannot be empty.`
        );
      }

      return Object.freeze({ kind: 'element', type: target.type });
    }
    if (
      !('placement' in target) ||
      (target.placement !== 'element' && target.placement !== 'text')
    ) {
      throw new Error(
        `DataTransfer format "${format.key}" has an invalid ownership target.`
      );
    }

    return Object.freeze({ ...target });
  });

  const defined: DataTransferFormat<V> = {
    ...format,
    ...(claims ? { claims: Object.freeze(claims) } : {}),
  };

  return Object.freeze(defined);
};

type DataTransferFormatRegistration<V extends Value = Value> = Readonly<{
  format: DataTransferFormat<V>;
  owner: string;
}>;

type DataTransferSliceElement<V extends Value> = Extract<
  DescendantIn<V>,
  Element
>;

const createPlainTextFallbackBlocks = <V extends Value>(
  state: EditorCoreStateView<V>,
  blockType: string,
  lines: readonly string[],
  activeMarks: EditorMarks | null
): ReadonlyArray<DescendantIn<V>> | null => {
  const createText = (text: string) =>
    Object.freeze({ ...activeMarks, text }) as DescendantIn<V>;

  if (!state.schema.element(blockType)) {
    return lines.map(
      (text) =>
        Object.freeze({
          children: Object.freeze([createText(text)]),
          type: blockType,
        }) as DescendantIn<V>
    );
  }
  const block = (() => {
    try {
      return state.schema.create(blockType);
    } catch (error) {
      if (!(error instanceof EditorSchemaValidationError)) throw error;
      // A block with required construction properties, such as a heading
      // level, cannot be default-built; new lines use the root default block.
      const fallback = state.schema.createDefaultRootChild();

      return NodeApi.isElement(fallback) ? fallback : null;
    }
  })();

  if (!block) return null;
  const wrapping = state.schema.findWrapping(block, createText(''));

  if (!wrapping) return null;

  const wrapperProperties = wrapping.map((type) => {
    const wrapper = state.schema.create(type);
    const { children: _children, ...properties } = wrapper;

    return properties;
  });
  const { children: _children, ...blockProperties } = block;

  return lines.map((text) => {
    const child = wrapperProperties.reduceRight<DescendantIn<V>>(
      (nested, properties) =>
        Object.freeze({
          ...properties,
          children: Object.freeze([nested]),
        }) as DescendantIn<V>,
      createText(text)
    );

    return Object.freeze({
      ...blockProperties,
      children: Object.freeze([child]),
    }) as DescendantIn<V>;
  });
};

const createPlainTextInlineSlice = <V extends Value>(
  state: EditorCoreStateView<V>,
  start: ReturnType<typeof RangeApi.start>,
  blockPath: readonly number[],
  text: string,
  activeMarks: EditorMarks | null
): ContentSlice<V> | null => {
  const inlineSpine = Array.from(state.nodes.levels({ at: start }))
    .flatMap(([node, path]) =>
      NodeApi.isElement(node)
        ? ([[node as DataTransferSliceElement<V>, path]] as const)
        : []
    )
    .filter(
      ([, path]) =>
        path.length > blockPath.length &&
        path.length < start.path.length &&
        blockPath.every((part, index) => path[index] === part)
    )
    .sort((left, right) => left[1].length - right[1].length);

  if (
    inlineSpine.length === 0 ||
    inlineSpine.some(
      ([node, path], index) =>
        path.length !== blockPath.length + index + 1 ||
        !state.schema.isInline(node)
    )
  ) {
    return null;
  }

  const textNode = Object.freeze({ ...activeMarks, text });
  const child = inlineSpine.reduceRight<DescendantIn<V>>((nested, [inline]) => {
    const { children: _children, type, ...properties } = inline;
    const wrapper = state.schema.create(type, properties);
    const children = Object.freeze([nested]);

    return Object.freeze({ ...wrapper, children }) as DescendantIn<V>;
  }, textNode as DescendantIn<V>);
  const content = Object.freeze([child]);

  return createDetachedContentSlice<V>(
    content,
    inlineSpine.length,
    inlineSpine.length
  );
};

const createDefaultPlainTextDataTransferFormat = <V extends Value>(
  editor?: Editor<V, any>
) =>
  prepareDataTransferFormat<V>({
    mimeType: 'text/plain',
    key: 'plite-plain-text',
    decode: ({ data, state }) => {
      const selection = state.selection();
      const semanticSelection = editor ? getEditorSelection(editor) : null;

      if (SelectionApi.isNode(semanticSelection)) {
        const defaultChild = state.schema.createDefaultRootChild(
          semanticSelection.root,
          semanticSelection.paths[0][0]
        );

        if (!defaultChild || !NodeApi.isElement(defaultChild)) return null;

        const content = createPlainTextFallbackBlocks(
          state,
          defaultChild.type,
          data.split(NEWLINE_SPLIT_RE),
          null
        );

        if (!content) return null;

        Object.freeze(content);

        return createDetachedContentSlice<V>(content, 0, 0, {
          canonicalFor: state.schema,
        });
      }

      const at = selection ?? state.points.end([]);

      if (!at) return null;

      const start = RangeApi.isRange(at) ? RangeApi.start(at) : at;

      if (
        state.nodes.void({ at: start }) ||
        state.nodes.elementReadOnly({ at: start })
      ) {
        return null;
      }

      const blockMatch = state.nodes.block({ at: start });

      if (!blockMatch) return null;

      const [block, blockPath] = blockMatch;

      if (!NodeApi.isElement(block)) return null;

      const activeMarks = (() => {
        if (
          !SelectionApi.isText(semanticSelection) ||
          !RangeApi.isCollapsed(semanticSelection)
        ) {
          return null;
        }
        if (semanticSelection.marks !== undefined) {
          return semanticSelection.marks;
        }

        const target = state.nodes.get(start.path)?.[0];

        return NodeApi.isText(target)
          ? (NodeApi.extractProps(target) as EditorMarks)
          : null;
      })();
      const lines = data.split(NEWLINE_SPLIT_RE);
      const inlineSlice =
        lines.length === 1 && !!selection && state.selection.isCollapsed()
          ? createPlainTextInlineSlice(
              state,
              start,
              blockPath,
              lines[0],
              activeMarks
            )
          : null;

      if (inlineSlice) return inlineSlice;

      const content = createPlainTextFallbackBlocks(
        state,
        block.type,
        lines,
        activeMarks
      );

      if (!content) return null;

      Object.freeze(content);

      return createDetachedContentSlice<V>(content, 1, 1, {
        canonicalFor: state.schema,
      });
    },
  });

const createDefaultDataTransferFormatRegistration = <V extends Value>(
  editor?: Editor<V, any>
) =>
  Object.freeze({
    format: createDefaultPlainTextDataTransferFormat<V>(editor),
    owner: 'editor-dom',
  });

const withDefaultDataTransferFormat = <V extends Value>(
  registrations: ReadonlyArray<DataTransferFormatRegistration<V>>,
  editor?: Editor<V, any>
) =>
  Object.freeze([
    createDefaultDataTransferFormatRegistration<V>(editor),
    ...registrations,
  ]);

type DataTransferFormatDirection = 'decode' | 'encode';

type ConcreteDataTransferFormatOwnershipTarget =
  | Readonly<{ kind: 'element'; type: string }>
  | Readonly<{
      id: string;
      kind: 'property';
      placement: 'element' | 'text';
      type: string;
    }>;

type DataTransferFormatTargetClaims<V extends Value> = {
  element?: DataTransferFormatRegistration<V>;
  properties: Map<string, DataTransferFormatRegistration<V>>;
};

const registrationName = <V extends Value>({
  format,
  owner,
}: DataTransferFormatRegistration<V>) => `${owner}/${format.key}`;

const assertDataTransferFormatTargetAvailable = <V extends Value>(
  claims: Map<string, DataTransferFormatTargetClaims<V>>,
  registration: DataTransferFormatRegistration<V>,
  direction: DataTransferFormatDirection,
  target: ConcreteDataTransferFormatOwnershipTarget
) => {
  const { format } = registration;
  const key = `${direction}:${format.mimeType}:${target.type}`;
  const existing: DataTransferFormatTargetClaims<V> = claims.get(key) ?? {
    properties: new Map(),
  };
  const conflict =
    existing.element && existing.element !== registration
      ? existing.element
      : target.kind === 'property'
        ? existing.properties.get(target.id)
        : [...existing.properties.values()].find(
            (candidate) => candidate !== registration
          );

  if (conflict && conflict !== registration) {
    const claim =
      target.kind === 'element'
        ? `${format.mimeType}:${target.type}`
        : `${format.mimeType}:${target.type}:${target.id}`;

    throw new Error(
      `DataTransfer formats "${registrationName(conflict)}" and "${registrationName(
        registration
      )}" both claim ${direction} target "${claim}".`
    );
  }

  if (target.kind === 'element') existing.element = registration;
  else existing.properties.set(target.id, registration);
  claims.set(key, existing);
};

const propertyTypes = (
  schema: CompiledEditorSchema,
  property: CompiledSchemaProperty
) => {
  const allowed =
    property.placement === 'element'
      ? schema.properties.elementAllowedByType
      : schema.properties.textAllowedByParentType;

  return [...allowed]
    .filter(([, ids]) => ids.has(property.id))
    .map(([type]) => type);
};

const compileDataTransferFormatOwnershipTargets = <V extends Value>(
  registration: DataTransferFormatRegistration<V>,
  schema: CompiledEditorSchema | null
): readonly ConcreteDataTransferFormatOwnershipTarget[] => {
  const { format } = registration;

  if (!format.claims?.length) return Object.freeze([]);
  if (!schema) {
    throw new Error(
      `DataTransfer format "${registrationName(
        registration
      )}" declares ownership targets without a compiled editor schema.`
    );
  }

  const targets = new Map<string, ConcreteDataTransferFormatOwnershipTarget>();
  const add = (target: ConcreteDataTransferFormatOwnershipTarget) => {
    const key =
      target.kind === 'element'
        ? `element:${target.type}`
        : `property:${target.type}:${target.id}`;

    targets.set(key, target);
  };
  const addProperty = (property: CompiledSchemaProperty) => {
    for (const type of propertyTypes(schema, property)) {
      add({
        id: property.id,
        kind: 'property',
        placement: property.placement,
        type,
      });
    }
  };

  for (const target of format.claims) {
    if ('kind' in target && target.kind === 'schema') {
      for (const type of schema.elements.byType.keys()) {
        add({ kind: 'element', type });
      }
      for (const property of schema.properties.byId.values()) {
        addProperty(property);
      }
      continue;
    }
    if ('kind' in target && target.kind === 'element') {
      if (!schema.elements.byType.has(target.type)) {
        throw new Error(
          `DataTransfer format "${registrationName(
            registration
          )}" claims unknown schema element "${target.type}".`
        );
      }
      add(target);
      continue;
    }

    const propertyId = getCompiledSchemaPropertyId(target);
    const property = schema.properties.byId.get(propertyId);

    if (!property) {
      throw new Error(
        `DataTransfer format "${registrationName(
          registration
        )}" claims schema property "${propertyId}" that is not installed.`
      );
    }
    addProperty(property);
  }

  return Object.freeze([...targets.values()]);
};

const compileDataTransferFormats = <V extends Value>(
  registered: ReadonlyArray<DataTransferFormatRegistration<V>>,
  schema: CompiledEditorSchema | null
) => {
  const byKey = new Map<string, DataTransferFormatRegistration<V>>();
  const claims = new Map<string, DataTransferFormatTargetClaims<V>>();

  for (const registration of registered) {
    const { format } = registration;
    const existing = byKey.get(format.key);

    if (existing) {
      throw new Error(
        `DataTransfer formats "${registrationName(existing)}" and "${registrationName(
          registration
        )}" use the same key "${format.key}".`
      );
    }
    byKey.set(format.key, registration);

    for (const target of compileDataTransferFormatOwnershipTargets(
      registration,
      schema
    )) {
      if (format.decode) {
        assertDataTransferFormatTargetAvailable(
          claims,
          registration,
          'decode',
          target
        );
      }
      if (format.encode) {
        assertDataTransferFormatTargetAvailable(
          claims,
          registration,
          'encode',
          target
        );
      }
    }
  }

  return Object.freeze(
    [...byKey.values()]
      .map((registration, index) => ({ index, registration }))
      .sort((left, right) => right.index - left.index)
      .map(({ registration }) => registration)
  );
};

type DataTransferFormatsPluginDefinition<TName extends string> = {
  contributions: true;
  name: TName;
  validate: true;
};

/** Install one or more DataTransfer formats as a named editor plugin. */
export const dataTransferFormats = <
  const TName extends string,
  V extends Value = Value,
>(
  name: TName,
  formats: ReadonlyArray<DataTransferFormat<V>>
): Plugin<DataTransferFormatsPluginDefinition<TName>> => {
  const registrations = Object.freeze(
    formats.map((format) =>
      Object.freeze({ format: prepareDataTransferFormat(format), owner: name })
    )
  );

  return definePlugin(name, {
    contributions: registrations.map((registration) =>
      DATA_TRANSFER_FORMATS.of(registration)
    ),
    validate(context) {
      compileDataTransferFormats(
        withDefaultDataTransferFormat(
          context.getContributions(DATA_TRANSFER_FORMATS) as ReadonlyArray<
            DataTransferFormatRegistration<V>
          >
        ),
        getCompiledEditorSchemaFromApi(context.schema)
      );
    },
  });
};

// The registry key retains the editor-specific value type at runtime. The
// cache therefore stores an existential format list and restores its type only
// after looking it up through that same registry.
const COMPILED_DATA_TRANSFER_FORMATS = new WeakMap<
  object,
  readonly unknown[]
>();

const getDataTransferFormats = <V extends Value>(editor: Editor<V, any>) => {
  const registry = getInternalPluginRegistry(editor);
  const cached = COMPILED_DATA_TRANSFER_FORMATS.get(registry);

  if (cached) return cached as ReadonlyArray<DataTransferFormatRegistration<V>>;

  const registered = withDefaultDataTransferFormat(
    getPluginContributions(editor, DATA_TRANSFER_FORMATS) as ReadonlyArray<
      DataTransferFormatRegistration<V>
    >,
    editor
  );
  const compiled = compileDataTransferFormats(
    registered,
    getCompiledEditorSchema(editor)
  );

  COMPILED_DATA_TRANSFER_FORMATS.set(registry, compiled);

  return compiled;
};

const createDataTransferSnapshot = (
  dataTransfer: DataTransfer,
  registeredFormats: readonly string[]
): DataTransferSnapshot => {
  const values = Array.from(dataTransfer.files ?? []);
  const files = Object.assign(values, {
    item: (index: number) => values[index] ?? null,
  });
  const types = Object.freeze(Array.from(dataTransfer.types ?? []));
  const mimeTypes = new Set([...types, ...registeredFormats]);
  const dataByFormat = new Map(
    [...mimeTypes].map(
      (mimeType) => [mimeType, dataTransfer.getData(mimeType)] as const
    )
  );

  return Object.freeze({
    files: Object.freeze(files),
    getData: (mimeType: string) => dataByFormat.get(mimeType) ?? '',
    types,
  });
};

const readDataTransferData = (
  source: DataTransferSnapshot,
  mimeType: string
) => {
  if (mimeType === 'Files') {
    return {
      available: source.files.length > 0,
      data: source.getData(mimeType),
    };
  }

  const data = source.getData(mimeType);

  return { available: data.length > 0, data };
};

const readDataTransferFormatState = <V extends Value, TResult>(
  editor: Editor<V, any>,
  read: (state: EditorCoreStateView<V>) => TResult
) => {
  const transaction = getActiveEditorTransaction(editor);

  return transaction ? read(getEditorStateView(editor)) : editor.read(read);
};

type DataTransferAttempt = Readonly<{
  diagnostics: DataTransferDiagnostic[];
  mimeType: string;
}>;

const readDataTransferDiagnostic = (
  diagnostic: unknown
): DataTransferDiagnostic => {
  const { impact, message } = (
    typeof diagnostic === 'object' && diagnostic !== null ? diagnostic : {}
  ) as Partial<DataTransferDiagnostic>;

  if (
    (impact !== 'lossless' && impact !== 'lossy') ||
    typeof message !== 'string'
  ) {
    throw new TypeError(
      'DataTransfer diagnostics need an impact of "lossless" or "lossy" and a string message.'
    );
  }

  return Object.freeze({ impact, message });
};

// Loss reported by an abandoned attempt stays unless the inserted attempt
// decoded that same payload. Matching text from another MIME type does not
// prove the rich content was recovered.
const selectDataTransferDiagnostics = (
  attempts: readonly DataTransferAttempt[],
  inserted: DataTransferAttempt | null
): readonly DataTransferDiagnostic[] =>
  Object.freeze(
    attempts.flatMap((attempt) => {
      if (attempt === inserted) return attempt.diagnostics;
      if (attempt.mimeType === inserted?.mimeType) return [];

      return attempt.diagnostics.filter(({ impact }) => impact === 'lossy');
    })
  );

/** Receives the one outcome of an observed built-in transfer insertion. */
export type DataTransferInsertionListener = (
  inserted: boolean,
  diagnostics: readonly DataTransferDiagnostic[]
) => void;

type DataTransferInsertionObservation = {
  diagnostics: readonly DataTransferDiagnostic[];
  listener: DataTransferInsertionListener;
  state: 'idle' | 'pending' | 'refused' | 'settled';
};

const EMPTY_DATA_TRANSFER_DIAGNOSTICS: readonly DataTransferDiagnostic[] =
  Object.freeze([]);

const DATA_TRANSFER_INSERTION_OBSERVATIONS = new WeakMap<
  object,
  DataTransferInsertionObservation[]
>();

const settleDataTransferInsertion = (
  observation: DataTransferInsertionObservation,
  inserted: boolean
) => {
  if (observation.state === 'settled') return;

  observation.state = 'settled';
  observation.listener(inserted, observation.diagnostics);
};

/**
 * Bind one built-in insertion outcome to the innermost observation. Later
 * insertions under the same observation belong to their own callers.
 *
 * @internal
 */
export const recordDataTransferOutcome = <V extends Value>(
  editor: Editor<V, any>,
  result: TransactionSpec | false,
  diagnostics: readonly DataTransferDiagnostic[] = EMPTY_DATA_TRANSFER_DIAGNOSTICS
) => {
  const observation = DATA_TRANSFER_INSERTION_OBSERVATIONS.get(
    getEditorRuntimeOwner(editor)
  )?.at(-1);

  if (observation?.state !== 'idle') return result;

  observation.diagnostics = diagnostics;

  if (result === false) {
    observation.state = 'refused';

    return result;
  }

  observation.state = 'pending';

  return attachTransactionSpecAfterCommit(result, () => {
    settleDataTransferInsertion(observation, true);
  });
};

/**
 * Observe the built-in transfer insertion that `insert` performs. The listener
 * runs once: after the insertion commits, or as a refusal when nothing
 * commits. A throwing `insert` or a rolled-back update settles nothing.
 *
 * @internal
 */
export const observeDataTransferInsertion = <T>(
  editor: Editor<any, any>,
  listener: DataTransferInsertionListener,
  insert: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const observations = DATA_TRANSFER_INSERTION_OBSERVATIONS.get(owner) ?? [];
  const observation: DataTransferInsertionObservation = {
    diagnostics: EMPTY_DATA_TRANSFER_DIAGNOSTICS,
    listener,
    state: 'idle',
  };

  observations.push(observation);
  DATA_TRANSFER_INSERTION_OBSERVATIONS.set(owner, observations);

  let result: T;

  try {
    result = insert();
  } finally {
    observations.splice(observations.lastIndexOf(observation), 1);

    if (observations.length === 0) {
      DATA_TRANSFER_INSERTION_OBSERVATIONS.delete(owner);
    }
  }

  // Inside an open update the pending insertion still settles on that commit.
  if (
    observation.state === 'refused' ||
    (observation.state === 'pending' && !getActiveEditorTransaction(editor))
  ) {
    settleDataTransferInsertion(observation, false);
  }

  return result;
};

export const createDataTransferTransactionSpec = <V extends Value>(
  editor: Editor<V, any>,
  dataTransfer: DataTransfer,
  options?: Readonly<{
    mimeType?: string;
    state?: EditorStateView<V, any>;
  }>
) => {
  const formats = getDataTransferFormats(editor);
  const snapshot = createDataTransferSnapshot(
    dataTransfer,
    formats.map(({ format }) => format.mimeType)
  );
  const state = options?.state
    ? toEditorCoreStateView(options.state)
    : readDataTransferFormatState(editor, toEditorCoreStateView);
  const attempts: DataTransferAttempt[] = [];

  for (const registration of formats) {
    const { format } = registration;

    if (options?.mimeType && format.mimeType !== options.mimeType) continue;
    if (!format.decode) continue;

    const { available, data } = readDataTransferData(snapshot, format.mimeType);

    if (!available) continue;

    const attempt: DataTransferAttempt = {
      diagnostics: [],
      mimeType: format.mimeType,
    };
    let reporting = true;
    const context = Object.freeze({
      data,
      mimeType: format.mimeType,
      report: (diagnostic: DataTransferDiagnostic) => {
        if (!reporting) {
          throw new Error(
            'DataTransfer diagnostics can only be reported while accept or decode runs.'
          );
        }
        attempt.diagnostics.push(readDataTransferDiagnostic(diagnostic));
      },
      snapshot,
      state,
    });
    let phase: DataTransferFormatPhase = 'accept';
    let slice: ContentSlice<V> | null = null;

    try {
      if (format.accept?.(context) !== false) {
        phase = 'decode';
        const decoded = format.decode(context);

        slice = decoded ? ContentSliceApi.fromJSON<V>(decoded) : null;
      }
    } catch (error) {
      // The lifecycle error channel owns a throwing attempt, including its
      // partial reports.
      reportDataTransferFormatError(editor, registration, phase, error);
      continue;
    } finally {
      reporting = false;
    }

    attempts.push(attempt);

    if (!slice) continue;

    const input = { slice };
    const result = options?.state
      ? evaluateCommandWithState(
          editor,
          editorCommands.replaceSlice,
          options.state,
          input
        ).result
      : evaluateCommand(editor, editorCommands.replaceSlice, input).result;

    if (result === false) continue;

    return recordDataTransferOutcome(
      editor,
      result,
      selectDataTransferDiagnostics(attempts, attempt)
    );
  }

  return recordDataTransferOutcome(
    editor,
    false,
    selectDataTransferDiagnostics(attempts, null)
  );
};

export const insertDataTransfer = <V extends Value>(
  editor: Editor<V, any>,
  dataTransfer: DataTransfer,
  options?: Readonly<{ mimeType?: string }>
) => {
  const spec = createDataTransferTransactionSpec(editor, dataTransfer, options);

  if (spec === false) return false;
  const transaction = getActiveEditorTransaction(editor);

  if (transaction) {
    applyTransactionSpec(editor, spec);
  } else {
    editor.update({ tags: 'paste' }, () => {
      applyTransactionSpec(editor, spec);
    });
  }

  return true;
};

/** Serialize a model fragment through configuration-ordered formats. */
export const writeDataTransferFragment = <V extends Value>(
  editor: Editor<V, any>,
  data: Pick<DataTransfer, 'setData'>,
  slice: ContentSlice<V>,
  options: Readonly<{ excludeMimeTypes?: readonly string[] }> = {}
) => {
  const written = new Set<string>();
  const excluded = options.excludeMimeTypes;
  const sourceSlice = ContentSliceApi.fromJSON<V>(slice);
  const state = readDataTransferFormatState(editor, toEditorCoreStateView);

  for (const registration of getDataTransferFormats(editor)) {
    const { format } = registration;

    if (
      !format.encode ||
      excluded?.includes(format.mimeType) ||
      written.has(format.mimeType)
    ) {
      continue;
    }

    let encoded: string | null;

    try {
      encoded = format.encode(
        Object.freeze({
          mimeType: format.mimeType,
          slice: sourceSlice,
          state,
        })
      );

      if (encoded !== null && typeof encoded !== 'string') {
        throw new TypeError(
          `DataTransfer format "${format.key}" returned non-string encoded data.`
        );
      }
    } catch (error) {
      reportDataTransferFormatError(editor, registration, 'encode', error);
      continue;
    }

    if (encoded === null) continue;

    data.setData(format.mimeType, encoded);
    written.add(format.mimeType);
  }

  return Object.freeze([...written]);
};
