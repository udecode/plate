import {
  type ContentSlice,
  type DescendantIn,
  type EditorCoreStateView,
  type EditorMarks,
  type Element,
  type Editor,
  type SchemaProperty,
  type Value,
  ContentSlice as ContentSliceApi,
  defineExtension,
  defineExtensionPoint,
  editorCommands,
  type EditorExtension,
  NodeApi,
  RangeApi,
  SelectionApi,
} from '@platejs/plite';
import {
  createDetachedContentSlice,
  dispatchCommand,
  getActiveEditorTransaction,
  getCompiledEditorSchema,
  getCompiledEditorSchemaFromApi,
  getCompiledSchemaPropertyId,
  getSelection as getEditorSelection,
  getEditorExtensionContributions,
  getEditorStateView,
  getExtensionRegistry,
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  reportEditorLifecycleError,
  toEditorCoreStateView,
} from '@platejs/plite/internal';

const HOST_CODECS = defineExtensionPoint<HostCodecRegistration<any>>(
  'plite-dom:host-codec'
);
const NEWLINE_SPLIT_RE = /\r\n|\r|\n/;

export type HostCodecPhase = 'parse' | 'query' | 'serialize';

const reportHostCodecError = <V extends Value>(
  editor: Editor<V, any>,
  registration: HostCodecRegistration<V>,
  phase: HostCodecPhase,
  cause: unknown
) => {
  reportEditorLifecycleError(
    Object.freeze({
      cause,
      editor,
      extensionName: registration.owner,
      format: registration.codec.format,
      key: registration.codec.key,
      phase,
      source: 'host-codec' as const,
    })
  );
};

/** Read-only host data exposed to pure codec callbacks. */
export type HostDataSource = Readonly<{
  /** Files captured when clipboard ingress began. */
  files: Readonly<{
    readonly [index: number]: File;
    readonly length: number;
    item: (index: number) => File | null;
  }>;
  /** Read a captured format. Missing formats return an empty string. */
  getData: (format: string) => string;
  /** Formats advertised by the incoming host payload. */
  types: readonly string[];
}>;

export type HostCodecParseContext<V extends Value = Value> = Readonly<{
  /** Payload for this codec's registered format. */
  data: string;
  /** MIME format currently being decoded. */
  format: string;
  /** Immutable snapshot of every incoming host format and file. */
  source: HostDataSource;
  /** Read-only editor snapshot captured for this callback. */
  state: EditorCoreStateView<V>;
}>;

export type HostCodecSerializeContext<V extends Value = Value> = Readonly<{
  /** MIME format currently being encoded. */
  format: string;
  /** Immutable model slice selected for export. */
  slice: ContentSlice<V>;
  /** Read-only editor snapshot captured for this callback. */
  state: EditorCoreStateView<V>;
}>;

/** Stable schema ownership claimed by one codec direction and MIME format. */
export type HostCodecSchemaTarget =
  | Readonly<{ kind: 'element'; type: string }>
  | SchemaProperty
  | Readonly<{ kind: 'schema' }>;

export type HostCodec<V extends Value = Value> = Readonly<{
  /** Stable registration identity used for diagnostics and conflict checks. */
  key: string;
  /** MIME format read from and written to the host data container. */
  format: string;
  /** Parse an intact slice. Contextual schema fitting occurs at insertion. */
  parse?: (context: HostCodecParseContext<V>) => ContentSlice<V> | null;
  /** Return false to skip parsing this payload without reporting an error. */
  query?: (context: HostCodecParseContext<V>) => boolean;
  /** Schema resources owned by this codec and checked atomically. */
  owns?: readonly HostCodecSchemaTarget[];
  /** Encode the supplied slice, or return null to delegate this format. */
  serialize?: (context: HostCodecSerializeContext<V>) => string | null;
}>;

/** Define a typed parser or serializer for one host MIME format. */
export const defineHostCodec = <V extends Value = Value>(
  codec: HostCodec<V>
): HostCodec<V> => {
  if (!codec.key) throw new Error('Host codec key cannot be empty.');
  if (!codec.format) throw new Error('Host codec format cannot be empty.');
  if (!codec.parse && !codec.serialize) {
    throw new Error(
      `Host codec "${codec.key}" must define parse or serialize.`
    );
  }

  const owns = codec.owns?.map((target) => {
    if ('kind' in target && target.kind === 'schema') {
      return Object.freeze({ kind: 'schema' });
    }
    if ('kind' in target && target.kind === 'element') {
      if (!target.type) {
        throw new Error(
          `Host codec "${codec.key}" element type cannot be empty.`
        );
      }

      return Object.freeze({ kind: 'element', type: target.type });
    }
    if (
      !('placement' in target) ||
      (target.placement !== 'element' && target.placement !== 'text')
    ) {
      throw new Error(
        `Host codec "${codec.key}" has an invalid ownership target.`
      );
    }

    return Object.freeze({ ...target });
  });

  const defined: HostCodec<V> = {
    ...codec,
    ...(owns ? { owns: Object.freeze(owns) } : {}),
  };

  return Object.freeze(defined);
};

type HostCodecRegistration<V extends Value = Value> = Readonly<{
  codec: HostCodec<V>;
  owner: string;
}>;

type HostSliceElement<V extends Value> = Extract<DescendantIn<V>, Element>;

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
  const block = state.schema.create(blockType);
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
        ? ([[node as HostSliceElement<V>, path]] as const)
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

const createDefaultPlainTextHostCodec = <V extends Value>(
  editor?: Editor<V, any>
) =>
  defineHostCodec<V>({
    format: 'text/plain',
    key: 'plite-plain-text',
    parse: ({ data, state }) => {
      const selection = state.selection();
      const semanticSelection = editor ? getEditorSelection(editor) : null;

      if (SelectionApi.isNode(semanticSelection)) {
        const defaultChild = state.schema.createDefaultRootChild(
          semanticSelection.root
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

const createDefaultHostCodecRegistration = <V extends Value>(
  editor?: Editor<V, any>
) =>
  Object.freeze({
    codec: createDefaultPlainTextHostCodec<V>(editor),
    owner: 'plite-dom',
  });

const withDefaultHostCodec = <V extends Value>(
  registrations: ReadonlyArray<HostCodecRegistration<V>>,
  editor?: Editor<V, any>
) =>
  Object.freeze([
    createDefaultHostCodecRegistration<V>(editor),
    ...registrations,
  ]);

type HostCodecDirection = 'parse' | 'serialize';

type ConcreteHostCodecOwnershipTarget =
  | Readonly<{ kind: 'element'; type: string }>
  | Readonly<{
      id: string;
      kind: 'property';
      placement: 'element' | 'text';
      type: string;
    }>;

type HostCodecTargetClaims<V extends Value> = {
  element?: HostCodecRegistration<V>;
  properties: Map<string, HostCodecRegistration<V>>;
};

const registrationName = <V extends Value>({
  codec,
  owner,
}: HostCodecRegistration<V>) => `${owner}/${codec.key}`;

const assertHostCodecTargetAvailable = <V extends Value>(
  claims: Map<string, HostCodecTargetClaims<V>>,
  registration: HostCodecRegistration<V>,
  direction: HostCodecDirection,
  target: ConcreteHostCodecOwnershipTarget
) => {
  const { codec } = registration;
  const key = `${direction}:${codec.format}:${target.type}`;
  const existing: HostCodecTargetClaims<V> = claims.get(key) ?? {
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
        ? `${codec.format}:${target.type}`
        : `${codec.format}:${target.type}:${target.id}`;

    throw new Error(
      `Host codecs "${registrationName(conflict)}" and "${registrationName(registration)}" both claim ${direction} target "${claim}".`
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

const compileHostCodecOwnershipTargets = <V extends Value>(
  registration: HostCodecRegistration<V>,
  schema: CompiledEditorSchema | null
): readonly ConcreteHostCodecOwnershipTarget[] => {
  const { codec } = registration;

  if (!codec.owns?.length) return Object.freeze([]);
  if (!schema) {
    throw new Error(
      `Host codec "${registrationName(registration)}" declares ownership targets without a compiled editor schema.`
    );
  }

  const targets = new Map<string, ConcreteHostCodecOwnershipTarget>();
  const add = (target: ConcreteHostCodecOwnershipTarget) => {
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

  for (const target of codec.owns) {
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
          `Host codec "${registrationName(registration)}" owns unknown schema element "${target.type}".`
        );
      }
      add(target);
      continue;
    }

    const propertyId = getCompiledSchemaPropertyId(target);
    const property = schema.properties.byId.get(propertyId);

    if (!property) {
      throw new Error(
        `Host codec "${registrationName(registration)}" owns schema property "${propertyId}" that is not installed.`
      );
    }
    addProperty(property);
  }

  return Object.freeze([...targets.values()]);
};

const compileHostCodecs = <V extends Value>(
  registered: ReadonlyArray<HostCodecRegistration<V>>,
  schema: CompiledEditorSchema | null
) => {
  const byKey = new Map<string, HostCodecRegistration<V>>();
  const claims = new Map<string, HostCodecTargetClaims<V>>();

  for (const registration of registered) {
    const { codec } = registration;
    const existing = byKey.get(codec.key);

    if (existing) {
      throw new Error(
        `Host codecs "${registrationName(existing)}" and "${registrationName(registration)}" use the same key "${codec.key}".`
      );
    }
    byKey.set(codec.key, registration);

    for (const target of compileHostCodecOwnershipTargets(
      registration,
      schema
    )) {
      if (codec.parse) {
        assertHostCodecTargetAvailable(claims, registration, 'parse', target);
      }
      if (codec.serialize) {
        assertHostCodecTargetAvailable(
          claims,
          registration,
          'serialize',
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

type HostCodecsExtensionDefinition<TName extends string> = {
  contributions: true;
  name: TName;
  validate: true;
};

/** Install one or more host codecs as a named editor extension. */
export const hostCodecs = <const TName extends string, V extends Value = Value>(
  name: TName,
  codecs: ReadonlyArray<HostCodec<V>>
): EditorExtension<HostCodecsExtensionDefinition<TName>> => {
  const registrations = Object.freeze(
    codecs.map((codec) =>
      Object.freeze({ codec: defineHostCodec(codec), owner: name })
    )
  );

  return defineExtension(name, {
    contributions: registrations.map((registration) =>
      HOST_CODECS.of(registration)
    ),
    validate(context) {
      compileHostCodecs(
        withDefaultHostCodec(
          context.getContributions(HOST_CODECS) as ReadonlyArray<
            HostCodecRegistration<V>
          >
        ),
        getCompiledEditorSchemaFromApi(context.schema)
      );
    },
  });
};

// The registry key retains the editor-specific value type at runtime. The
// cache therefore stores an existential codec list and restores its type only
// after looking it up through that same registry.
const COMPILED_HOST_CODECS = new WeakMap<object, readonly unknown[]>();

const getHostCodecs = <V extends Value>(editor: Editor<V, any>) => {
  const registry = getExtensionRegistry(editor);
  const cached = COMPILED_HOST_CODECS.get(registry);

  if (cached) return cached as ReadonlyArray<HostCodecRegistration<V>>;

  const registered = withDefaultHostCodec(
    getEditorExtensionContributions(editor, HOST_CODECS) as ReadonlyArray<
      HostCodecRegistration<V>
    >,
    editor
  );
  const compiled = compileHostCodecs(
    registered,
    getCompiledEditorSchema(editor)
  );

  COMPILED_HOST_CODECS.set(registry, compiled);

  return compiled;
};

const createHostDataSource = (
  dataTransfer: DataTransfer,
  registeredFormats: readonly string[]
): HostDataSource => {
  const values = Array.from(dataTransfer.files ?? []);
  const files = Object.assign(values, {
    item: (index: number) => values[index] ?? null,
  });
  const types = Object.freeze(Array.from(dataTransfer.types ?? []));
  const formats = new Set([...types, ...registeredFormats]);
  const dataByFormat = new Map(
    [...formats].map(
      (format) => [format, dataTransfer.getData(format)] as const
    )
  );

  return Object.freeze({
    files: Object.freeze(files),
    getData: (format: string) => dataByFormat.get(format) ?? '',
    types,
  });
};

const readHostData = (source: HostDataSource, format: string) => {
  if (format === 'Files') {
    return {
      available: source.files.length > 0,
      data: source.getData(format),
    };
  }

  const data = source.getData(format);

  return { available: data.length > 0, data };
};

const readHostCodecState = <V extends Value, TResult>(
  editor: Editor<V, any>,
  read: (state: EditorCoreStateView<V>) => TResult
) => {
  const transaction = getActiveEditorTransaction(editor);

  return transaction ? read(getEditorStateView(editor)) : editor.read(read);
};

export const insertHostData = <V extends Value>(
  editor: Editor<V, any>,
  dataTransfer: DataTransfer,
  options?: Readonly<{ format?: string }>
) => {
  const codecs = getHostCodecs(editor);
  const source = createHostDataSource(
    dataTransfer,
    codecs.map(({ codec }) => codec.format)
  );

  for (const registration of codecs) {
    const { codec } = registration;

    if (options?.format && codec.format !== options.format) continue;
    if (!codec.parse) continue;

    const { available, data } = readHostData(source, codec.format);

    if (!available) continue;

    const createContext = (state: EditorCoreStateView<V>) =>
      Object.freeze({
        data,
        format: codec.format,
        source,
        state: toEditorCoreStateView(state),
      });

    if (codec.query) {
      try {
        if (
          readHostCodecState(editor, (state) =>
            codec.query?.(createContext(state))
          ) === false
        ) {
          continue;
        }
      } catch (error) {
        reportHostCodecError(editor, registration, 'query', error);
        continue;
      }
    }

    let slice: ContentSlice<V> | null;

    try {
      const parsed = readHostCodecState(editor, (state) =>
        codec.parse?.(createContext(state))
      );

      slice = parsed ? ContentSliceApi.fromJSON<V>(parsed) : null;
    } catch (error) {
      reportHostCodecError(editor, registration, 'parse', error);
      continue;
    }

    if (!slice) continue;

    const handled = dispatchCommand(editor, editorCommands.replaceSlice, {
      slice,
    });

    if (!handled) continue;

    return true;
  }

  return false;
};

/** Serialize a model fragment through configuration-ordered codecs. */
export const writeHostFragmentData = <V extends Value>(
  editor: Editor<V, any>,
  data: Pick<DataTransfer, 'setData'>,
  slice: ContentSlice<V>
) => {
  const written = new Set<string>();
  const sourceSlice = ContentSliceApi.fromJSON<V>(slice);

  for (const registration of getHostCodecs(editor)) {
    const { codec } = registration;

    if (!codec.serialize || written.has(codec.format)) continue;

    let serialized: null | string | undefined;

    try {
      serialized = readHostCodecState(editor, (state) =>
        codec.serialize?.(
          Object.freeze({
            format: codec.format,
            slice: sourceSlice,
            state: toEditorCoreStateView(state),
          })
        )
      );
    } catch (error) {
      reportHostCodecError(editor, registration, 'serialize', error);
      continue;
    }

    if (serialized == null) continue;

    data.setData(codec.format, serialized);
    written.add(codec.format);
  }

  return Object.freeze([...written]);
};
