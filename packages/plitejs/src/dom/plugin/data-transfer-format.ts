import {
  type ContentSlice,
  type DescendantIn,
  type EditorCoreStateView,
  type EditorStateView,
  type EditorMarks,
  type Element,
  type Editor,
  type SchemaProperty,
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

export type DataTransferFormatPhase = 'accept' | 'decode' | 'encode' | 'notify';

export type DataTransferDiagnostic =
  | Readonly<{
      code: string;
      message: string;
      severity: 'error';
    }>
  | Readonly<{
      code: string;
      message: string;
      severity: 'warning';
    }>;

export type DataTransferWarningDiagnostic = Extract<
  DataTransferDiagnostic,
  { severity: 'warning' }
>;

export type DataTransferErrorDiagnostic = Extract<
  DataTransferDiagnostic,
  { severity: 'error' }
>;

export type DataTransferDecodeResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly DataTransferWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [
        DataTransferErrorDiagnostic,
        ...DataTransferDiagnostic[],
      ];
      ok: false;
    }>;

export type DataTransferEncodeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly DataTransferWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [
        DataTransferErrorDiagnostic,
        ...DataTransferDiagnostic[],
      ];
      ok: false;
    }>;

export type DataTransferAttempt = Readonly<{
  diagnostics: readonly DataTransferDiagnostic[];
  key: string;
  mimeType: string;
  outcome: 'rejected' | 'selected' | 'unfit' | 'written';
  phase: 'decode' | 'encode';
}>;

export type DataTransferReport = Readonly<{
  attempts: readonly DataTransferAttempt[];
  outcome: 'inserted' | 'unhandled' | 'written';
}>;

type DataTransferReportSink = (report: DataTransferReport) => void;

const DATA_TRANSFER_REPORT_SINKS = new WeakMap<
  object,
  DataTransferReportSink
>();
const ACTIVE_DATA_TRANSFER_ATTEMPTS = new WeakMap<
  object,
  DataTransferAttempt[][]
>();

export const getDataTransferReportSink = (editor: object) =>
  DATA_TRANSFER_REPORT_SINKS.get(editor);

export const setDataTransferReportSink = (
  editor: object,
  sink: DataTransferReportSink | undefined
) => {
  if (sink) DATA_TRANSFER_REPORT_SINKS.set(editor, sink);
  else DATA_TRANSFER_REPORT_SINKS.delete(editor);
};

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const freezeDataTransferDiagnostics = (
  value: unknown,
  expected: 'failure' | 'success'
): readonly DataTransferDiagnostic[] => {
  if (!Array.isArray(value)) {
    throw new TypeError('DataTransfer result diagnostics must be an array.');
  }

  const diagnostics = value.map((diagnostic) => {
    if (
      !isRecord(diagnostic) ||
      typeof diagnostic.code !== 'string' ||
      diagnostic.code.length === 0 ||
      typeof diagnostic.message !== 'string' ||
      (diagnostic.severity !== 'error' && diagnostic.severity !== 'warning')
    ) {
      throw new TypeError('DataTransfer diagnostics must be valid objects.');
    }
    if (expected === 'success' && diagnostic.severity !== 'warning') {
      throw new TypeError(
        'Successful DataTransfer results may contain warnings only.'
      );
    }

    return Object.freeze({
      code: diagnostic.code,
      message: diagnostic.message,
      severity: diagnostic.severity,
    }) as DataTransferDiagnostic;
  });

  if (expected === 'success') return Object.freeze(diagnostics);

  const errors = diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'error'
  );

  if (errors.length === 0) {
    throw new TypeError(
      'Failed DataTransfer results must contain at least one error.'
    );
  }

  return Object.freeze([
    ...errors,
    ...diagnostics.filter((diagnostic) => diagnostic.severity === 'warning'),
  ]);
};

const createDataTransferAttempt = <V extends Value>(
  registration: DataTransferFormatRegistration<V>,
  phase: DataTransferAttempt['phase'],
  outcome: DataTransferAttempt['outcome'],
  diagnostics: readonly DataTransferDiagnostic[]
): DataTransferAttempt =>
  Object.freeze({
    diagnostics,
    key: registration.format.key,
    mimeType: registration.format.mimeType,
    outcome,
    phase,
  });

const getActiveDataTransferAttempts = (editor: object) =>
  ACTIVE_DATA_TRANSFER_ATTEMPTS.get(editor)?.at(-1);

const notifyDataTransferReport = <V extends Value>(
  editor: Editor<V, any>,
  outcome: DataTransferReport['outcome'],
  attempts: readonly DataTransferAttempt[]
) => {
  const sink = getDataTransferReportSink(editor);

  if (!sink) return;

  const report = Object.freeze({
    attempts: Object.freeze([...attempts]),
    outcome,
  }) satisfies DataTransferReport;

  try {
    sink(report);
  } catch (error) {
    reportEditorLifecycleError(
      Object.freeze({
        cause: error,
        editor,
        pluginName: 'dom',
        mimeType: '*',
        key: 'dom:onDataTransferReport',
        phase: 'notify' as const,
        source: 'data-transfer-format' as const,
      })
    );
  }
};

export const withDataTransferReportBoundary = <V extends Value, T>(
  editor: Editor<V, any>,
  run: () => T
): T => {
  const stack = ACTIVE_DATA_TRANSFER_ATTEMPTS.get(editor) ?? [];

  if (stack.length > 0) return run();

  const attempts: DataTransferAttempt[] = [];

  stack.push(attempts);
  ACTIVE_DATA_TRANSFER_ATTEMPTS.set(editor, stack);
  try {
    const result = run();

    if (result === false) {
      notifyDataTransferReport(editor, 'unhandled', attempts);
    }

    return result;
  } finally {
    stack.pop();
    if (stack.length === 0) ACTIVE_DATA_TRANSFER_ATTEMPTS.delete(editor);
  }
};

export const attachDataTransferInsertedReport = <V extends Value>(
  editor: Editor<V, any>,
  spec: import('../..').TransactionSpec,
  attempts = getActiveDataTransferAttempts(editor) ?? []
) =>
  attachTransactionSpecAfterCommit(spec, () => {
    notifyDataTransferReport(editor, 'inserted', attempts);
  });

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

export type DataTransferDecodeContext<V extends Value = Value> = Readonly<{
  /** Payload for this format's registered mimeType. */
  data: string;
  /** MIME type currently being decoded. */
  mimeType: string;
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
  /** Stable registration identity used for diagnostics and conflict checks. */
  key: string;
  /** MIME type read from and written to the host data container. */
  mimeType: string;
  /** Parse an intact slice. Contextual schema fitting occurs at insertion. */
  decode?: (
    context: DataTransferDecodeContext<V>
  ) => DataTransferDecodeResult<V> | null;
  /** Return false to skip parsing this payload without reporting an error. */
  accept?: (context: DataTransferDecodeContext<V>) => boolean;
  /** Schema resources owned by this format and checked atomically. */
  claims?: readonly DataTransferSchemaClaim[];
  /** Encode the supplied slice, or return null to delegate this mimeType. */
  encode?: (
    context: DataTransferEncodeContext<V>
  ) => DataTransferEncodeResult | null;
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

        return Object.freeze({
          diagnostics: Object.freeze([]),
          ok: true as const,
          slice: createDetachedContentSlice<V>(content, 0, 0, {
            canonicalFor: state.schema,
          }),
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

      if (inlineSlice) {
        return Object.freeze({
          diagnostics: Object.freeze([]),
          ok: true as const,
          slice: inlineSlice,
        });
      }

      const content = createPlainTextFallbackBlocks(
        state,
        block.type,
        lines,
        activeMarks
      );

      if (!content) return null;

      Object.freeze(content);

      return Object.freeze({
        diagnostics: Object.freeze([]),
        ok: true as const,
        slice: createDetachedContentSlice<V>(content, 1, 1, {
          canonicalFor: state.schema,
        }),
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

export const createDataTransferTransactionSpec = <V extends Value>(
  editor: Editor<V, any>,
  dataTransfer: DataTransfer,
  options?: Readonly<{
    mimeType?: string;
    state?: EditorStateView<V, any>;
  }>
) => {
  const formats = getDataTransferFormats(editor);
  const attempts = getActiveDataTransferAttempts(editor) ?? [];
  const snapshot = createDataTransferSnapshot(
    dataTransfer,
    formats.map(({ format }) => format.mimeType)
  );
  const state = options?.state
    ? toEditorCoreStateView(options.state)
    : readDataTransferFormatState(editor, toEditorCoreStateView);

  for (const registration of formats) {
    const { format } = registration;

    if (options?.mimeType && format.mimeType !== options.mimeType) continue;
    if (!format.decode) continue;

    const { available, data } = readDataTransferData(snapshot, format.mimeType);

    if (!available) continue;

    const context = Object.freeze({
      data,
      mimeType: format.mimeType,
      snapshot,
      state,
    });

    if (format.accept) {
      try {
        if (format.accept(context) === false) {
          continue;
        }
      } catch (error) {
        reportDataTransferFormatError(editor, registration, 'accept', error);
        continue;
      }
    }

    let decoded: Readonly<{
      diagnostics: readonly DataTransferDiagnostic[];
      slice: ContentSlice<V>;
    }> | null;

    try {
      const result = format.decode(context);

      if (result === null) {
        decoded = null;
      } else if (!isRecord(result) || typeof result.ok !== 'boolean') {
        throw new TypeError(
          `DataTransfer format "${format.key}" returned an invalid decode result.`
        );
      } else if (!result.ok) {
        const diagnostics = freezeDataTransferDiagnostics(
          result.diagnostics,
          'failure'
        );

        attempts.push(
          createDataTransferAttempt(
            registration,
            'decode',
            'rejected',
            diagnostics
          )
        );
        decoded = null;
      } else {
        decoded = Object.freeze({
          diagnostics: freezeDataTransferDiagnostics(
            result.diagnostics,
            'success'
          ),
          slice: ContentSliceApi.fromJSON<V>(result.slice),
        });
      }
    } catch (error) {
      reportDataTransferFormatError(editor, registration, 'decode', error);
      continue;
    }

    if (!decoded) continue;

    const input = { slice: decoded.slice };
    const result = options?.state
      ? evaluateCommandWithState(
          editor,
          editorCommands.replaceSlice,
          options.state,
          input
        ).result
      : evaluateCommand(editor, editorCommands.replaceSlice, input).result;

    if (result === false) {
      attempts.push(
        createDataTransferAttempt(
          registration,
          'decode',
          'unfit',
          Object.freeze([
            Object.freeze({
              code: 'data-transfer-unfit',
              message: `Decoded ${format.mimeType} content does not fit at the target selection.`,
              severity: 'error' as const,
            }),
          ])
        )
      );
      continue;
    }

    attempts.push(
      createDataTransferAttempt(
        registration,
        'decode',
        'selected',
        decoded.diagnostics
      )
    );

    return attachDataTransferInsertedReport(editor, result, attempts);
  }

  return false;
};

export const insertDataTransfer = <V extends Value>(
  editor: Editor<V, any>,
  dataTransfer: DataTransfer,
  options?: Readonly<{ mimeType?: string }>
) =>
  withDataTransferReportBoundary(editor, () => {
    const spec = createDataTransferTransactionSpec(
      editor,
      dataTransfer,
      options
    );

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
  });

/** Serialize a model fragment through configuration-ordered formats. */
export const writeDataTransferFragment = <V extends Value>(
  editor: Editor<V, any>,
  data: Pick<DataTransfer, 'setData'>,
  slice: ContentSlice<V>,
  options: Readonly<{ excludeMimeTypes?: readonly string[] }> = {}
) => {
  const attempts: DataTransferAttempt[] = [];
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

    let encoded: Readonly<{
      data: string;
      diagnostics: readonly DataTransferDiagnostic[];
    }> | null;

    try {
      const result = format.encode(
        Object.freeze({
          mimeType: format.mimeType,
          slice: sourceSlice,
          state,
        })
      );

      if (result === null) {
        encoded = null;
      } else if (!isRecord(result) || typeof result.ok !== 'boolean') {
        throw new TypeError(
          `DataTransfer format "${format.key}" returned an invalid encode result.`
        );
      } else if (!result.ok) {
        const diagnostics = freezeDataTransferDiagnostics(
          result.diagnostics,
          'failure'
        );

        attempts.push(
          createDataTransferAttempt(
            registration,
            'encode',
            'rejected',
            diagnostics
          )
        );
        encoded = null;
      } else if (typeof result.data !== 'string') {
        throw new TypeError(
          `DataTransfer format "${format.key}" returned non-string encoded data.`
        );
      } else {
        encoded = Object.freeze({
          data: result.data,
          diagnostics: freezeDataTransferDiagnostics(
            result.diagnostics,
            'success'
          ),
        });
      }
    } catch (error) {
      reportDataTransferFormatError(editor, registration, 'encode', error);
      continue;
    }

    if (!encoded) continue;

    data.setData(format.mimeType, encoded.data);
    written.add(format.mimeType);
    attempts.push(
      createDataTransferAttempt(
        registration,
        'encode',
        'written',
        encoded.diagnostics
      )
    );
  }

  notifyDataTransferReport(editor, 'written', attempts);

  return Object.freeze([...written]);
};
