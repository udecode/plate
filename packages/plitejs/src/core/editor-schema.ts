import type {
  ContentSlice,
  Descendant,
  DescendantIn,
  AnyEditor as Editor,
  EditorDocumentValue,
  EditorElementBehavior,
  EditorSchemaElement,
  EditorSchemaProperty,
  EditorSchemaPropertyQuery,
  EditorSchemaVocabulary,
  EditorStateSchemaApi,
  Element,
  NamedRootKey,
  Node,
  Path,
  RootKey,
  Selection,
  Text,
  Value,
} from '../interfaces';
import { ElementApi, NodeApi } from '../interfaces';
import type { EditorJsonValue } from '../interfaces/json';
import type {
  PropertyValueDescriptor,
  SchemaPropertyHandle,
  SchemaPropertyLandingPolicy,
  SchemaTarget,
} from '../interfaces/schema';
import { failInvariant } from '../internal/fail-invariant';
import { getDefined } from '../internal/get-defined';
import {
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  type DocumentChange,
  valueRootNodes,
} from './change/document-change';
import {
  DocumentIndex,
  type NodeList,
  rootIndexOf,
} from './change/document-index';
import type { DocumentPropertyContext, RootChange } from './change/root-change';
import type { JsonNode } from './change/tokens';
import { normalizeSetValues } from './change/transform';
import { cloneFrozen, isImmutable, isOwnedJsonValue } from './clone';
import { completeContent } from './content-completion';
import { ContentSlice as ContentSliceValue } from './content-slice';
import {
  getEditorDocumentShapeIssueMessage,
  readEditorDocument,
  type EditorDocumentShapeIssue,
} from './document-shape';
import {
  ensureElementOwnedRootIndex,
  getDirtyElementOwnedRootIssues,
  getElementOwnedRootGrammarBindings,
  getElementOwnedRootIssues,
  getElementOwnedRootKeys,
  matchesElementOwnedRootDeclaration,
  rebaseElementOwnedRootIndex,
  resolveElementOwnedRootPath,
  sealElementOwnedRootIndex,
  type ElementOwnedRootBinding,
  type ElementOwnedRootIndex,
  type ElementOwnedRootIssue,
} from './element-owned-root-index';
import { getPluginRegistry, type PluginRegistry } from './plugin-registry';
import { profileCoreDuration } from './profiling';
import { getEditorDocumentValue } from './public-state';
import { getValueRecords } from './record-store';
import {
  emptyIndexedDocument,
  type OrphanedRootsInput,
  orphanedRoots,
  schemaHasContentRoots,
} from './root-ownership';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
  CompiledSchemaProperty,
  CompiledSchemaTargetContext,
} from './schema-compiler';
import {
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
} from './schema-compiler';
import {
  createEditorSchemaValidationError,
  EditorSchemaValidationError,
  type EditorSchemaValidationLocation,
} from './schema-validation';
import {
  createCompiledSliceFitterDelegate,
  type InternalSliceFitOptions,
  type SliceFitRuntimeTargetOptions,
} from './slice-fit/compiled-slice-fitter';
import {
  type EditorSchemaFitReport,
  type EditorSchemaRepair,
  type RepresentationRepairEvent,
  type RepresentationRepairSink,
  type RootCanonicalizationPass,
  schemaModelLocation,
  schemaRepair,
} from './slice-fit/fit-report';
import type { FitInputPaths } from './slice-fit/provenance';
import {
  areEditorJsonValuesEqual,
  assertEditorJsonValue,
  snapshotEditorJsonValue,
} from './value-codec';

/**
 * A required property that nothing supplies. Only `createDeclarativeAndFill`
 * and `canonicalizeDeclarativePropertyRecord` without a `validationLocation`
 * throw it, so `refuseMissingProperty` returns `null` for it alone, and every
 * other failure still throws, a `missing-property` error from validation or
 * one from a generator included.
 */
class MissingPropertyError extends EditorSchemaValidationError {
  constructor(
    diagnostics: ConstructorParameters<typeof EditorSchemaValidationError>[0]
  ) {
    super(diagnostics);
    this.name = 'MissingPropertyError';
  }
}

const refuseMissingProperty = <T>(build: () => T): T | null => {
  try {
    return build();
  } catch (error) {
    if (error instanceof MissingPropertyError) return null;
    throw error;
  }
};

/**
 * A `MissingPropertyError` from a generator's own schema build, such as
 * `schema.create`, fails the outer build instead of refusing it.
 */
const generatePropertyValue = (
  descriptor: Readonly<{ generate?: () => unknown }>
) => {
  try {
    return descriptor.generate?.();
  } catch (error) {
    throw error instanceof MissingPropertyError
      ? new EditorSchemaValidationError(error.diagnostics, { cause: error })
      : error;
  }
};

/**
 * Schema implementation used only by the slice transaction owner.
 *
 * @internal
 */
export type InternalEditorSchemaApi<V extends Value = Value> =
  EditorStateSchemaApi<V> & {
    canContain: (parent: Element, child: Descendant) => boolean;
    canContainAt: (
      parent: Element | null,
      child: Descendant,
      index: number,
      root?: RootKey
    ) => boolean;
    canContainAtRoot: (child: Descendant, root?: RootKey) => boolean;
    canWrap: (
      parent: Element | null,
      wrapper: Element,
      index?: number,
      root?: RootKey
    ) => boolean;
    emptyTextKeeps: (
      key: string,
      value: unknown,
      at: Readonly<{
        ancestors: readonly Element[];
        parent: Element;
        root: RootKey;
      }>
    ) => boolean;
    fitReportSink: (root: RootKey) => RepresentationRepairSink | undefined;
    /**
     * Build an element in its canonical empty form at a site: `ancestors` are
     * the elements it will sit in, immediate parent first.
     */
    createAt: (
      type: string,
      properties: Readonly<Record<string, unknown>> | undefined,
      site: Readonly<{ ancestors: readonly Element[]; root: RootKey }>
    ) => Element;
    /**
     * `createDefaultChild`, except that a default with a required property
     * nothing supplies is `null` instead of an error.
     */
    tryCreateDefaultChild: EditorStateSchemaApi<V>['createDefaultChild'];
    /**
     * Whether `fit` can land before child `at` of `children`, the children of
     * `parent` (null for a root), once the `removing` indexes leave. Checks the
     * content prefix, the landed positions and `max` on the children after the
     * transfer; `strict` checks landed blocks without the derived schema's
     * unknown-element allowance. A nested parent without a compiled content
     * program refuses.
     */
    canPlaceAt: (
      parent: Element | null,
      children: readonly Descendant[],
      fit: readonly Descendant[],
      at: number,
      options?: Readonly<{
        removing?: readonly number[];
        root?: RootKey;
        strict?: boolean;
      }>
    ) => boolean;
    /**
     * `canPlaceAt` at a slot path of `root`'s current document, except that a
     * parent without a compiled content program takes any fit. A missing
     * parent refuses.
     */
    canPlaceAtPath: (
      at: Path,
      fit: readonly Descendant[],
      options?: Readonly<{ removing?: readonly number[]; root?: RootKey }>
    ) => boolean;
    /** Register one trusted immutable document installed by the runtime owner. */
    adoptDocumentBaseline: (value: EditorDocumentValue) => void;
    /** Fit an external document and preserve one explicit selection through it. */
    fitDocumentWithSelection: <TValue extends Value>(
      value: EditorDocumentValue<TValue>,
      options: Readonly<{
        root: RootKey;
        selection: NonNullable<Selection>;
      }>
    ) => Readonly<{
      document: EditorDocumentValue<V>;
      selection: NonNullable<Selection>;
    }>;
    /** Fit an external document and retain its committed semantic repairs. */
    fitDocumentWithReport: <TValue extends Value>(
      value: EditorDocumentValue<TValue>
    ) => EditorSchemaFitReport<V>;
    /** Validate one detached slice without applying destination grammar. */
    assertContentSliceForSchema: (
      slice: unknown
    ) => asserts slice is ContentSlice<V>;
    canonicalizeTextPropertiesAt: (
      properties: Readonly<Record<string, unknown>>,
      path: Path,
      root?: RootKey,
      preferredKey?: string
    ) => Readonly<Record<string, unknown>>;
    /**
     * `canonicalizeTextPropertiesAt` for a text whose parent and ancestors
     * are given by type, nearest first, for a tree that is not the document.
     */
    canonicalizeTextPropertiesIn: (
      properties: Readonly<Record<string, unknown>>,
      types: readonly string[],
      root?: RootKey,
      preferredKey?: string
    ) => Readonly<Record<string, unknown>>;
    canonicalizeChildren: (
      children: readonly Descendant[],
      root: RootKey,
      ancestors: readonly Element[],
      dropMisplaced: boolean,
      baseline?: Readonly<{
        document: DocumentIndex;
        path: readonly number[];
        from: number;
      }>
    ) => readonly Descendant[];
    copyChildren: (
      children: readonly Descendant[],
      root: RootKey,
      ancestors?: readonly Element[]
    ) => readonly Descendant[];
    copyNodeAt: (node: Descendant, path: Path, root?: RootKey) => Descendant;
    placeElementAt: (
      source: Element,
      options: Readonly<{ at: Path; root?: RootKey | undefined }>
    ) => Element | null;
    elementPropertiesForSplitAt: (
      element: Element,
      path: Path,
      root?: RootKey
    ) => Readonly<Record<string, unknown>>;
    /**
     * Whether the element a split of `source` at `path` continues into,
     * written as `continuation`, keeps property `key` with `value`: the split
     * keeps it, the continuation's slot does not fix it and, when placement
     * changed the continuation's type, the type change keeps it. An
     * `undefined` value asks about the key alone. `children` is the root
     * `path` is in, for a draft that has moved away from the editor's
     * document.
     */
    elementSplitKeepsAt: (
      source: Element,
      continuation: Element,
      options: Readonly<{
        children: NodeList<Descendant>;
        path: Path;
        root: RootKey;
      }>
    ) => (key: string, value: unknown) => boolean;
    /**
     * `element` as changing its type to `type` at `path` leaves it: `type`
     * set, each of its own properties the change keeps with its validated
     * value, and each direct text child cut down to the properties it keeps.
     * Element children pass through. Returns `element` itself when `type` is
     * already its type, and a text child that loses nothing as the same
     * object.
     */
    elementForTypeChangeAt: (
      element: Element,
      type: string,
      path: Path,
      root: RootKey
    ) => Element;
    /**
     * The properties, `type` included, that reset gives `element` at `at`
     * when it converts it to its slot's default: what the type change keeps,
     * the slot's own properties, and defaults or generated values for the
     * rest. A block already of that type also keeps each property that no
     * default or generator could restore. `null` when the slot has no
     * element default, when the default lacks a required property nothing
     * supplies, or when a type change leaves the block's content without one.
     */
    elementPropertiesForResetAt: (
      element: Element,
      at: Path,
      root?: RootKey
    ) => Partial<Element> | null;
    elementPropertyLanding: (
      element: Element,
      key: string,
      ancestors: readonly Element[],
      root: RootKey
    ) => SchemaPropertyLandingPolicy;
    fit: (slice: ContentSlice, options: InternalSliceFitOptions) => boolean;
    fitContent: (
      slice: ContentSlice,
      options: Readonly<{ parent: Element; root?: RootKey }>
    ) => readonly Descendant[] | null;
    getElementContent: (type: string) => CompiledSchemaContentProgram | null;
    getElementOwnedRoots: (element: Element) => ReadonlyArray<
      Readonly<{
        ownership: import('../interfaces/schema').SchemaContentRootOwnership;
        root: NamedRootKey;
        slot: string;
      }>
    >;
    getOrphanedElementOwnedRoots: (
      input: OrphanedRootsInput
    ) => readonly NamedRootKey[];
    indexConstructedRoot: (
      input: Readonly<{
        after: DocumentIndex;
        before: DocumentIndex;
        change?: RootChange;
        root: RootKey;
      }>
    ) => void;
    getRootContent: (
      root?: RootKey,
      value?: EditorDocumentValue
    ) => CompiledSchemaContentProgram | null;
    getTextPropertyAt: (
      key: string,
      path: Path,
      root?: RootKey
    ) => CompiledSchemaProperty | null;
    isTextPropertyAllowedAt: (
      key: string,
      path: Path,
      root?: RootKey
    ) => boolean;
    isSetValuedProperty: (
      node: JsonNode,
      key: string,
      context: DocumentPropertyContext
    ) => boolean;
    isTextPropertyEqualAt: (
      key: string,
      left: unknown,
      right: unknown,
      path: Path,
      root?: RootKey
    ) => boolean;
    mergeTextPropertyAt: (
      key: string,
      previous: unknown,
      next: unknown,
      path: Path,
      root?: RootKey
    ) => unknown;
    textPropertiesForSplitAt: (
      text: Text,
      path: Path,
      root?: RootKey
    ) => Readonly<Record<string, unknown>>;
    validateTextPropertiesAtValue: (
      properties: Readonly<Record<string, unknown>>,
      path: Path,
      value: EditorDocumentValue,
      root?: RootKey
    ) => void;
    /** Validate one canonical change whose immutable baseline already has authority. */
    validateDocumentChange: (input: DocumentChangeValidationInput) => void;
    checkDocumentChange: (input: DocumentChangeValidationInput) => void;
  };

type DocumentChangeValidationInput = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
}>;

const structurallyEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => structurallyEqual(value, right[index]))
    );
  }
  if (
    typeof left !== 'object' ||
    left === null ||
    typeof right !== 'object' ||
    right === null
  ) {
    return false;
  }

  const leftRecord = left as Readonly<Record<string, unknown>>;
  const rightRecord = right as Readonly<Record<string, unknown>>;
  const keys = Object.keys(leftRecord);

  return (
    keys.length === Object.keys(rightRecord).length &&
    keys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        structurallyEqual(leftRecord[key], rightRecord[key])
    )
  );
};

const nodePropertiesEqual = (
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
  contentKey: 'children' | 'text',
  rightKeys: readonly string[]
) => {
  const leftKeys = Object.keys(left);

  if (
    leftKeys.length - (Object.hasOwn(left, contentKey) ? 1 : 0) !==
    rightKeys.length
  ) {
    return false;
  }
  for (const key of rightKeys) {
    if (
      !Object.hasOwn(left, key) ||
      !structurallyEqual(left[key], right[key])
    ) {
      return false;
    }
  }

  return true;
};

const contentProgramsEqual = (
  left: CompiledSchemaContentProgram | null,
  right: CompiledSchemaContentProgram | null
): boolean =>
  left === right ||
  (left !== null &&
    right !== null &&
    left.allowsText === right.allowsText &&
    left.allowsUnknownElements === right.allowsUnknownElements &&
    left.min === right.min &&
    left.max === right.max &&
    left.allowedElementTypes.size === right.allowedElementTypes.size &&
    [...left.allowedElementTypes].every((type) =>
      right.allowedElementTypes.has(type)
    ) &&
    structurallyEqual(left.defaultPlan, right.defaultPlan) &&
    structurallyEqual(left.prefix, right.prefix) &&
    contentProgramsEqual(left.remainder ?? null, right.remainder ?? null));

export const canonicalizeCompiledExclusiveTextProperties = (
  schema: CompiledEditorSchema,
  source: Readonly<Record<string, unknown>>,
  context: CompiledSchemaTargetContext,
  preferredKey?: string
) => {
  const entries = Object.entries(source).map(([key, value]) => ({
    key,
    property: resolveCompiledSchemaProperty(schema, 'text', key, context),
    value,
  }));
  const preferredId = preferredKey
    ? resolveCompiledSchemaProperty(schema, 'text', preferredKey, context)?.id
    : undefined;
  const acceptedIds = new Set<string>();
  const acceptedKeys = new Set<string>();

  for (const entry of [...entries].sort((left, right) => {
    const leftPreferred = left.property?.id === preferredId ? 0 : 1;
    const rightPreferred = right.property?.id === preferredId ? 0 : 1;

    return (
      leftPreferred - rightPreferred ||
      (left.property?.id ?? left.key).localeCompare(
        right.property?.id ?? right.key
      ) ||
      left.key.localeCompare(right.key)
    );
  })) {
    const { property } = entry;

    if (
      property &&
      [...acceptedIds].some((acceptedId) =>
        schema.properties.conflictsByPropertyId
          .get(acceptedId)
          ?.has(property.id)
      )
    ) {
      continue;
    }
    acceptedKeys.add(entry.key);
    if (property) acceptedIds.add(property.id);
  }

  if (acceptedKeys.size === entries.length) return source;

  return Object.freeze(
    Object.fromEntries(
      entries.flatMap(({ key, value }) =>
        acceptedKeys.has(key) ? [[key, value]] : []
      )
    )
  );
};

const getElementType = (element: { type?: unknown }) =>
  typeof element.type === 'string' && element.type.length > 0
    ? element.type
    : null;

const getValidationNodeType = (node: Descendant) =>
  NodeApi.isText(node) ? 'text' : (getElementType(node) ?? undefined);

const toSchemaValidationLocation = (
  root: RootKey,
  path: readonly number[],
  nodeType?: string,
  ancestors: readonly Element[] = []
): EditorSchemaValidationLocation => {
  const ancestorTypes = ancestors.flatMap((ancestor) => {
    const type = getElementType(ancestor);

    return type ? [type] : [];
  });

  return {
    ...(ancestorTypes.length > 0 ? { ancestorTypes } : {}),
    ...(nodeType === undefined ? {} : { nodeType }),
    ...(ancestorTypes[0] ? { parentType: ancestorTypes[0] } : {}),
    path,
    root: root === 'main' ? null : root,
  };
};

const canonicalizePropertyValue = (
  owner: string,
  descriptor: PropertyValueDescriptor,
  value: unknown
): EditorJsonValue => {
  let canonical: EditorJsonValue;

  if (descriptor.kind === 'set') {
    if (!Array.isArray(value)) {
      throw new EditorSchemaValidationError(`${owner} must be an array.`);
    }

    const itemDescriptor = (
      descriptor as PropertyValueDescriptor & {
        item: PropertyValueDescriptor;
      }
    ).item;

    canonical = normalizeSetValues(
      value.map((item) =>
        canonicalizePropertyValue(owner, itemDescriptor, item)
      )
    );
  } else {
    try {
      canonical = snapshotEditorJsonValue(value, owner) as EditorJsonValue;
    } catch {
      throw new EditorSchemaValidationError(
        `${owner} must encode to JSON-compatible data.`
      );
    }

    const validKind =
      descriptor.kind === 'json' ||
      (descriptor.kind === 'enum'
        ? typeof canonical === 'string' &&
          (
            descriptor as PropertyValueDescriptor & {
              values: readonly string[];
            }
          ).values.includes(canonical)
        : typeof canonical === descriptor.kind);

    if (!validKind) {
      throw new EditorSchemaValidationError(
        `${owner} must be ${descriptor.kind}.`
      );
    }
  }

  return canonical;
};

const validatePropertyValue = (
  owner: string,
  descriptor: PropertyValueDescriptor,
  value: unknown
) => {
  const canonical = canonicalizePropertyValue(owner, descriptor, value);
  const validateCanonical = (
    currentDescriptor: PropertyValueDescriptor,
    current: EditorJsonValue
  ): void => {
    if (currentDescriptor.kind === 'set') {
      const itemDescriptor = (
        currentDescriptor as PropertyValueDescriptor & {
          item: PropertyValueDescriptor;
        }
      ).item;

      for (const item of current as readonly EditorJsonValue[]) {
        validateCanonical(itemDescriptor, item);
      }
    }

    if (currentDescriptor.validate && !currentDescriptor.validate(current)) {
      throw new EditorSchemaValidationError(
        `${owner} fails custom property validation.`
      );
    }
  };

  validateCanonical(descriptor, canonical);

  return canonical;
};

const getPropertyDefault = (property: CompiledSchemaProperty) =>
  Object.hasOwn(property.descriptor, 'default')
    ? property.descriptor.default
    : undefined;

const getDocumentRoot = (value: EditorDocumentValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const getDocumentRootNodes = (value: EditorDocumentValue, root: string) =>
  valueRootNodes(value, root) as NodeList<Descendant>;

const editorRootLabel = (root: string) =>
  root === 'main' ? 'primary root' : `root "${root}"`;

const getDescendant = (
  children: NodeList<Descendant>,
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants.at(index);
    if (!node) return null;
    descendants = ElementApi.isElement(node) ? node.children : [];
  }

  return node ?? null;
};

const getElementAncestors = (
  children: NodeList<Descendant>,
  path: readonly number[],
  options: Readonly<{ includeTarget?: boolean }> = {}
) => {
  const ancestors: Element[] = [];
  const limit = options.includeTarget ? path.length : path.length - 1;

  for (let depth = 1; depth <= limit; depth++) {
    const node = getDescendant(children, path.slice(0, depth));

    if (ElementApi.isElement(node)) ancestors.unshift(node);
  }

  return ancestors;
};

const COMPILED_SCHEMA_BY_API = new WeakMap<
  EditorStateSchemaApi<any>,
  () => CompiledEditorSchema | null
>();
const INTERNAL_BY_API = new WeakMap<object, InternalEditorSchemaApi>();
const VALIDATED_DOCUMENT_ROOTS = new Map<string, WeakSet<object>>();
const isRootValidatedBy = (children: object, authority: string) =>
  VALIDATED_DOCUMENT_ROOTS.get(authority)?.has(children) === true;
const markRootValidatedBy = (children: object, authority: string) => {
  let roots = VALIDATED_DOCUMENT_ROOTS.get(authority);

  if (!roots) {
    roots = new WeakSet();
    VALIDATED_DOCUMENT_ROOTS.set(authority, roots);
  }
  roots.add(children);
};
const DEEP_FROZEN_NODES = new WeakSet<object>();
const isDeepFrozenNode = (node: Descendant): boolean => {
  if (DEEP_FROZEN_NODES.has(node)) return true;
  if (
    !Object.isFrozen(node) ||
    (!NodeApi.isText(node) &&
      (!Object.isFrozen(node.children) ||
        !node.children.every(isDeepFrozenNode)))
  ) {
    return false;
  }
  DEEP_FROZEN_NODES.add(node);

  return true;
};
// Deep-frozen top-level nodes a document assertion validated, per compiled
// schema and root: their content cannot change and that schema's validators are
// deterministic, so a later document sharing them validates only new nodes. A
// rebound validator compiles a new schema even when its identity is equal.
const VALIDATED_ROOT_NODES = new WeakMap<object, WeakMap<object, RootKey>>();
const SCHEMA_HAS_COPY_TRANSFORMS = new WeakMap<CompiledEditorSchema, boolean>();
const rootNodes = (document: DocumentIndex) =>
  document.nodes as NodeList<Descendant>;

/**
 * Resolve the exact compiled artifact behind a candidate schema API.
 *
 * @internal
 */
export const getCompiledEditorSchemaFromApi = (
  schemaApi: EditorStateSchemaApi<any>
) => COMPILED_SCHEMA_BY_API.get(schemaApi)?.() ?? null;

/** @internal */
export const getInternalEditorSchemaFromApi = (
  schemaApi: EditorStateSchemaApi
) => getDefined(INTERNAL_BY_API.get(schemaApi));

/** @internal */
export const placeElementAt = (
  schemaApi: EditorStateSchemaApi,
  source: Element,
  options: Readonly<{ at: Path; root?: RootKey | undefined }>
) => getInternalEditorSchemaFromApi(schemaApi).placeElementAt(source, options);

/** @internal */
export const canPlaceBlocksAtPath = (
  schemaApi: EditorStateSchemaApi,
  at: Path,
  fit: readonly Descendant[],
  options: Readonly<{ removing?: readonly number[]; root?: RootKey }> = {}
) => getInternalEditorSchemaFromApi(schemaApi).canPlaceAtPath(at, fit, options);

/** A changed span of a root's children, in the before and the after root. */
export type ImportedRootWindow = Readonly<{
  afterFrom: number;
  afterTo: number;
  beforeFrom: number;
  beforeTo: number;
}>;

/**
 * Whether a root that changed only inside `windows`, ordered by position,
 * still holds its content. It checks each child inside a window at its final
 * index, each retained child that ends in or leaves the root's prefix, and the
 * final count. Any other retained child keeps a remainder slot, which does not
 * depend on its index.
 *
 * @internal
 */
export const holdsImportedRoot = (
  schema: InternalEditorSchemaApi,
  root: RootKey,
  after: Readonly<{ at: (index: number) => Descendant; length: number }>,
  windows: readonly ImportedRootWindow[]
): boolean => {
  const content = schema.getRootContent(root);

  if (!content) return true;
  if (
    after.length < content.min ||
    (content.max !== null && after.length > content.max)
  ) {
    return false;
  }

  const indexes = new Set<number>();
  let next = 0;
  let shift = 0;

  for (const window of windows) {
    for (let index = window.afterFrom; index < window.afterTo; index++) {
      indexes.add(index);
    }
  }
  for (let index = 0; index < (content.prefix?.length ?? 0); index++) {
    indexes.add(index);
    while ((windows[next]?.beforeTo ?? Number.POSITIVE_INFINITY) <= index) {
      const passed = getDefined(windows[next]);

      shift +=
        passed.afterTo -
        passed.afterFrom -
        (passed.beforeTo - passed.beforeFrom);
      next += 1;
    }
    if ((windows[next]?.beforeFrom ?? Number.POSITIVE_INFINITY) > index) {
      indexes.add(index + shift);
    }
  }

  for (const index of indexes) {
    if (
      index < after.length &&
      !schema.canContainAt(null, after.at(index), index, root)
    ) {
      return false;
    }
  }

  return true;
};

export const createEditorSchema = <V extends Value = Value>(
  getEditor: () => Editor<V>,
  getRegistry: () => PluginRegistry<any> = () => getPluginRegistry(getEditor()),
  getDocument: () => EditorDocumentValue<V> = () =>
    getEditorDocumentValue(getEditor())
): InternalEditorSchemaApi<V> => {
  const getDeclarativeSchema = () => {
    const registry = getRegistry().schemaContributions;

    return registry.compiled;
  };
  const assertDeclaredRecordSets = (
    sets: Iterable<string>,
    schema: CompiledEditorSchema
  ) => {
    for (const set of sets) {
      if (!schema.recordSets.has(set)) {
        throw createEditorSchemaValidationError(
          'invalid-document',
          `Undeclared record set "${set}" in editor schema.`,
          toSchemaValidationLocation('main', [])
        );
      }
    }
  };
  const getValidationAuthority = () => {
    const schema = getDeclarativeSchema();

    return schema
      ? `schema:${schema.identity.fingerprint}:${schema.revision}`
      : `schema:unavailable:${getRegistry().schemaRevision}`;
  };

  type RuntimeTargetOptions = SliceFitRuntimeTargetOptions;
  type RuntimeTextTargetOptions = RuntimeTargetOptions &
    Readonly<{ parent?: Element | null }>;

  let publicViewSchema: CompiledEditorSchema | null = null;
  let publicElementViews = new Map<string, EditorSchemaElement>();
  let publicPropertyViews = new Map<string, EditorSchemaProperty>();
  const ensurePublicViews = (schema: CompiledEditorSchema) => {
    if (publicViewSchema === schema) return;

    publicViewSchema = schema;
    publicElementViews = new Map();
    publicPropertyViews = new Map();
  };

  const toPublicContent = (
    content: CompiledSchemaContentProgram
  ): NonNullable<EditorSchemaElement['content']> =>
    Object.freeze({
      allowedElementTypes: Object.freeze(
        [...content.allowedElementTypes].sort((left, right) =>
          left.localeCompare(right)
        )
      ),
      allowsText: content.allowsText,
      allowsUnknownElements: content.allowsUnknownElements,
      default:
        content.defaultPlan?.kind === 'text'
          ? 'text'
          : content.defaultPlan?.kind === 'element'
            ? Object.freeze({
                ...(content.defaultPlan.properties
                  ? { properties: content.defaultPlan.properties }
                  : {}),
                type: content.defaultPlan.type,
              })
            : null,
      max: content.max,
      min: content.min,
      ...(content.prefix ? { prefix: content.prefix } : {}),
      ...(content.remainder
        ? { remainder: toPublicContent(content.remainder) }
        : {}),
    });

  const getPublicElement = (type: string): EditorSchemaElement | null => {
    const schema = getDeclarativeSchema();

    if (!schema) return null;
    ensurePublicViews(schema);
    const known = publicElementViews.get(type);

    if (known) return known;
    const element = schema.elements.byType.get(type);

    if (!element) return null;
    const value: EditorSchemaElement = Object.freeze({
      behavior: element.behavior,
      content: element.content ? toPublicContent(element.content) : null,
      contentRoots: Object.freeze(
        Object.fromEntries(
          [...element.contentRoots].map(([slot, root]) => [
            slot,
            Object.freeze({
              content: toPublicContent(root.content),
              ownership: root.ownership,
            }),
          ])
        )
      ),
      groups: Object.freeze([...element.groups].sort()),
      propertyIds: Object.freeze([...element.propertyIds].sort()),
      slice: element.slice,
      structure: element.structure,
      type,
    });

    publicElementViews.set(type, value);

    return value;
  };

  const toPublicProperty = (
    property: CompiledSchemaProperty
  ): EditorSchemaProperty => {
    const known = publicPropertyViews.get(property.id);

    if (known) return known;
    const value: EditorSchemaProperty = Object.freeze({
      id: property.id,
      key: property.key,
      lifecycle: Object.freeze({
        ...property.lifecycle,
        landing: property.lifecycle.landing ?? 'preserve',
      }),
      merge: property.merge,
      placement: property.placement,
      role: property.role,
      target: property.target,
      value: property.descriptor,
    });

    publicPropertyViews.set(property.id, value);

    return value;
  };

  const getPublicProperty = (
    input: SchemaPropertyHandle | EditorSchemaPropertyQuery
  ): EditorSchemaProperty | null => {
    const schema = getDeclarativeSchema();

    if (!schema) return null;
    if ('kind' in input) {
      const property = schema.properties.byId.get(input.id);

      return property ? toPublicProperty(property) : null;
    }
    const { ancestors = [], key, placement, root = null, type } = input;

    if (root === 'main') {
      throw new Error(
        'The primary schema root is implicit; omit root or pass null.'
      );
    }
    ensurePublicViews(schema);
    const candidates = getCompiledPropertyCandidates(schema, placement, key);
    const property = type
      ? resolveCompiledSchemaProperty(schema, placement, key, {
          ancestors,
          root,
          type,
        })
      : candidates.length === 1
        ? candidates[0]
        : null;

    return property ? toPublicProperty(property) : null;
  };

  const toCompiledTargetContext = (
    type: string,
    options: RuntimeTargetOptions = {}
  ): CompiledSchemaTargetContext => ({
    ancestors: (options.ancestors ?? []).flatMap((element) => {
      const ancestorType = getElementType(element);

      return ancestorType ? [ancestorType] : [];
    }),
    root:
      options.root === undefined || options.root === 'main'
        ? null
        : options.root,
    type,
  });

  const getDeclarativeRootProgram = (
    schema: CompiledEditorSchema,
    root: RootKey
  ) => (root === 'main' ? schema.primaryRoot : schema.roots.get(root))?.content;

  const getDocumentOwnershipIndexes = (
    schema: CompiledEditorSchema,
    value: EditorDocumentValue
  ): ReadonlyArray<
    Readonly<{
      index: ElementOwnedRootIndex;
      root: RootKey;
    }>
  > =>
    Object.freeze(
      Object.entries({
        main: value.children,
        ...value.roots,
      }).map(([root, children]) => ({
        index: ensureElementOwnedRootIndex(
          schema,
          root,
          DocumentIndex.fromValue(children as readonly JsonNode[])
        ),
        root,
      }))
    );

  const getLiveDocumentOwnershipIndexes = (
    schema: CompiledEditorSchema,
    targetRoot: RootKey
  ): ReadonlyArray<
    Readonly<{
      index: ElementOwnedRootIndex;
      root: RootKey;
    }>
  > => {
    const editor = getEditor();
    const pending: RootKey[] = [
      'main',
      ...schema.roots.keys(),
      ...(targetRoot === 'main' ? [] : [targetRoot]),
    ];
    const seen = new Set<RootKey>();
    const indexes: Array<{
      index: ElementOwnedRootIndex;
      root: RootKey;
    }> = [];

    for (const root of pending) {
      if (seen.has(root)) continue;
      seen.add(root);
      const children =
        root === 'main' ? editor.read.children() : editor.read.root(root);
      const index = ensureElementOwnedRootIndex(
        schema,
        root,
        DocumentIndex.fromValue(children)
      );

      indexes.push({ index, root });
      for (const childRoot of getElementOwnedRootKeys(index)) {
        if (!seen.has(childRoot)) pending.push(childRoot);
      }
    }

    return Object.freeze(indexes);
  };

  const getDocumentRootProgram = (
    schema: CompiledEditorSchema,
    root: RootKey,
    value?: EditorDocumentValue
  ) => {
    const declared = getDeclarativeRootProgram(schema, root);

    if (declared || root === 'main') return declared;
    let projected: CompiledSchemaContentProgram | undefined;
    const indexes = value
      ? getDocumentOwnershipIndexes(schema, value)
      : getLiveDocumentOwnershipIndexes(schema, root);

    for (const { index } of indexes) {
      for (const binding of getElementOwnedRootGrammarBindings(index, root)) {
        if (projected && !contentProgramsEqual(projected, binding.content)) {
          return null;
        }
        projected = binding.content;
      }
    }

    return projected;
  };

  const getCompiledPropertyCandidates = (
    schema: CompiledEditorSchema,
    placement: 'element' | 'text',
    key: string
  ) => {
    const lookup = schema.properties.lookup[placement];
    const ids = [
      ...(lookup.exact.get(key) ?? []),
      ...lookup.prefixes.flatMap(({ prefix, propertyIds }) =>
        key.startsWith(prefix) ? propertyIds : []
      ),
    ];

    return ids.flatMap((id) => {
      const property = schema.properties.byId.get(id);

      return property ? [property] : [];
    });
  };

  const matchesTargetWithOpenAncestorBoundary = (
    schema: CompiledEditorSchema,
    target: SchemaTarget | null,
    context: CompiledSchemaTargetContext
  ): boolean | 'unknown' => {
    if (!target) return true;

    switch (target.kind) {
      case 'type': {
        const current = target;

        return context.type === current.type;
      }
      case 'types': {
        const current = target;

        return current.types.includes(context.type);
      }
      case 'group': {
        const current = target;

        return (
          schema.elements.groups.get(current.group)?.has(context.type) ?? false
        );
      }
      case 'root': {
        const current = target;

        return context.root === current.root;
      }
      case 'parent': {
        const current = target;
        const [parent, ...ancestors] = context.ancestors ?? [];

        return parent
          ? matchesTargetWithOpenAncestorBoundary(schema, current.target, {
              ancestors,
              root: context.root,
              type: parent,
            })
          : 'unknown';
      }
      case 'not': {
        const current = target;
        const result = matchesTargetWithOpenAncestorBoundary(
          schema,
          current.target,
          context
        );

        return result === 'unknown' ? result : !result;
      }
      case 'and': {
        const current = target;
        let unknown = false;

        for (const child of current.targets) {
          const result = matchesTargetWithOpenAncestorBoundary(
            schema,
            child,
            context
          );

          if (result === false) return false;
          unknown ||= result === 'unknown';
        }

        return unknown ? 'unknown' : true;
      }
      case 'or': {
        const current = target;
        let unknown = false;

        for (const child of current.targets) {
          const result = matchesTargetWithOpenAncestorBoundary(
            schema,
            child,
            context
          );

          if (result === true) return true;
          unknown ||= result === 'unknown';
        }

        return unknown ? 'unknown' : false;
      }
    }

    return failInvariant('Unexpected schema target kind');
  };

  const DEFAULT_ELEMENT_BEHAVIOR: EditorElementBehavior = Object.freeze({
    atom: false,
    inline: false,
    isolating: false,
    markableVoid: false,
    object: false,
    ownsExit: false,
    readOnly: false,
    selectable: true,
    void: false,
  });

  const getCompiledElement = (element: { type?: unknown }) => {
    const type = getElementType(element);

    return type
      ? (getDeclarativeSchema()?.elements.byType.get(type) ?? null)
      : null;
  };

  const getElementContent = (type: string) =>
    getDeclarativeSchema()?.elements.byType.get(type)?.content ?? null;

  const getRootContent = (
    root: RootKey = 'main',
    value: EditorDocumentValue = getDocument()
  ) => {
    const schema = getDeclarativeSchema();

    return schema
      ? (getDocumentRootProgram(schema, root, value) ?? null)
      : null;
  };

  const indexConstructedRoot: InternalEditorSchemaApi['indexConstructedRoot'] =
    ({ after, before, change, root }) => {
      const schema = getDeclarativeSchema();

      if (schema && hasContentRoots()) {
        rebaseElementOwnedRootIndex(schema, root, change, before, after);
      }
    };

  const getElementBehavior = (element: Element): EditorElementBehavior =>
    getCompiledElement(element)?.behavior ?? DEFAULT_ELEMENT_BEHAVIOR;

  const getElementContentRoots = (
    element: Element
  ): Readonly<Record<string, NamedRootKey>> => {
    const slots = getCompiledElement(element)?.contentRoots;

    if (!slots || slots.size === 0) return Object.freeze({});
    const { childRoots } = element as { childRoots?: unknown };

    if (typeof childRoots !== 'object' || childRoots === null) {
      return Object.freeze({});
    }

    return Object.freeze(
      Object.fromEntries(
        [...slots.keys()].flatMap((slot) => {
          const root = (childRoots as Readonly<Record<string, unknown>>)[slot];

          return typeof root === 'string' && root.length > 0
            ? [[slot, root] as const]
            : [];
        })
      )
    );
  };

  const getElementOwnedRoots: InternalEditorSchemaApi['getElementOwnedRoots'] =
    (element) => {
      const contentRoots = getCompiledElement(element)?.contentRoots;
      const { childRoots } = element as { childRoots?: unknown };

      if (
        !contentRoots ||
        contentRoots.size === 0 ||
        typeof childRoots !== 'object' ||
        childRoots === null
      ) {
        return Object.freeze([]);
      }

      return Object.freeze(
        [...contentRoots].flatMap(([slot, declaration]) => {
          const root = (childRoots as Readonly<Record<string, unknown>>)[slot];

          return typeof root === 'string' && root.length > 0 && root !== 'main'
            ? [
                Object.freeze({
                  ownership: declaration.ownership,
                  root,
                  slot,
                }),
              ]
            : [];
        })
      );
    };

  const hasContentRoots = () => {
    const schema = getDeclarativeSchema();

    return schema ? schemaHasContentRoots(schema) : false;
  };

  const getOrphanedElementOwnedRoots: InternalEditorSchemaApi['getOrphanedElementOwnedRoots'] =
    (input) => {
      const schema = getDeclarativeSchema();

      return schema ? orphanedRoots(schema, input) : Object.freeze([]);
    };

  const getElementSlicePolicy = (element: Element) =>
    getCompiledElement(element)?.slice ??
    Object.freeze({
      endMatter: false,
      preserveContext: false,
      replaceWhenCovered: true,
    });

  const allowsElementType = (parentType: string, childType: string) => {
    const schema = getDeclarativeSchema();
    const content = schema?.elements.byType.get(parentType)?.content;

    if (!schema || !content) return false;

    return (
      content.allowedElementTypes.has(childType) ||
      (content.allowsUnknownElements &&
        schema.unknown === 'preserve' &&
        !schema.elements.byType.has(childType))
    );
  };

  const isElementTypeInGroup = (type: string, group: string) =>
    getDeclarativeSchema()?.elements.groups.get(group)?.has(type) ?? false;

  const resolveElementProperty = (
    element: Element,
    property: string,
    options: RuntimeTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();
    const type = getElementType(element);

    return schema && type
      ? resolveCompiledSchemaProperty(
          schema,
          'element',
          property,
          toCompiledTargetContext(type, options)
        )
      : null;
  };

  const getProperty = ((
    node: Element | Text,
    property: string | SchemaPropertyHandle<string>,
    options: RuntimeTargetOptions & Readonly<{ parent?: Element }> = {}
  ): unknown => {
    if (typeof property === 'string') {
      const key = property;
      const ownDescriptor = Object.getOwnPropertyDescriptor(node, key);
      const ownValue =
        ownDescriptor && 'value' in ownDescriptor
          ? ownDescriptor.value
          : undefined;

      if (ownValue !== undefined) return ownValue;
      if (ElementApi.isElement(node)) {
        const resolved = resolveElementProperty(node, key, options);

        return resolved ? getPropertyDefault(resolved) : undefined;
      }
      const schema = getDeclarativeSchema();
      const resolved = schema
        ? options.parent
          ? resolveCompiledSchemaProperty(
              schema,
              'text',
              key,
              toCompiledTargetContext(
                getElementType(options.parent) ?? '',
                options
              )
            )
          : (getCompiledPropertyCandidates(schema, 'text', key).find(
              (candidate) => candidate.target === null
            ) ?? null)
        : null;

      return resolved ? getPropertyDefault(resolved) : undefined;
    }

    const schema = getDeclarativeSchema();
    const resolved = schema?.properties.byId.get(property.id);

    if (
      !resolved ||
      resolved.placement !== property.placement ||
      typeof resolved.key !== 'string'
    ) {
      return undefined;
    }
    if (
      (resolved.placement === 'element' && !ElementApi.isElement(node)) ||
      (resolved.placement === 'text' && !NodeApi.isText(node))
    ) {
      return undefined;
    }
    const ownDescriptor = Object.getOwnPropertyDescriptor(node, resolved.key);
    const ownValue =
      ownDescriptor && 'value' in ownDescriptor
        ? ownDescriptor.value
        : undefined;
    if (resolved.placement === 'text' && !resolved.target) {
      return ownValue !== undefined ? ownValue : getPropertyDefault(resolved);
    }
    const type = ElementApi.isElement(node)
      ? getElementType(node)
      : options.parent
        ? getElementType(options.parent)
        : null;

    if (
      !type ||
      !matchesCompiledSchemaTarget(
        schema,
        resolved.target,
        toCompiledTargetContext(type, options)
      )
    ) {
      return undefined;
    }
    return ownValue !== undefined ? ownValue : getPropertyDefault(resolved);
  }) as InternalEditorSchemaApi['getProperty'];

  const contentAllows = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    child: Descendant
  ) =>
    NodeApi.isText(child)
      ? content.allowsText
      : content.allowedElementTypes.has(getElementType(child) ?? '') ||
        (content.allowsUnknownElements &&
          schema.unknown === 'preserve' &&
          !getCompiledElement(child));

  const validationContentAllows = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    child: Descendant
  ) =>
    contentAllows(schema, content, child) ||
    (schema.identity.kind === 'derived' &&
      ElementApi.isElement(child) &&
      !getCompiledElement(child));

  const contentAllowsAt = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    child: Descendant,
    index: number,
    options: RuntimeTargetOptions = {}
  ) => {
    const { prefix } = content;

    if (prefix && index < prefix.length) {
      const slot = prefix[index];

      return (
        ElementApi.isElement(child) &&
        getElementType(child) === slot.type &&
        Object.entries(slot.properties).every(([key, value]) =>
          structurallyEqual(getProperty(child, key, options), value)
        )
      );
    }

    return validationContentAllows(schema, content.remainder ?? content, child);
  };

  const elementUsesInlineContent = (element: Element) => {
    const behavior = getElementBehavior(element);

    if (behavior.void) return false;
    const content = getCompiledElement(element)?.content;

    return content
      ? content.allowsText
      : element.children.some(
          (child) =>
            NodeApi.isText(child) ||
            (ElementApi.isElement(child) && getElementBehavior(child).inline)
        );
  };

  const canContain = (parent: Element, child: Descendant) => {
    const schema = getDeclarativeSchema();
    const content = getCompiledElement(parent)?.content;

    if (schema && content) return contentAllows(schema, content, child);

    return elementUsesInlineContent(parent)
      ? NodeApi.isText(child) ||
          (ElementApi.isElement(child) && getElementBehavior(child).inline)
      : ElementApi.isElement(child) && !getElementBehavior(child).inline;
  };

  const canContainAtRoot = (child: Descendant, root: RootKey = 'main') => {
    const schema = getDeclarativeSchema();
    const content = getRootContent(root);

    if (schema && content) return contentAllows(schema, content, child);

    return ElementApi.isElement(child) && !getElementBehavior(child).inline;
  };

  const canContainAt: InternalEditorSchemaApi<V>['canContainAt'] = (
    parent,
    child,
    index,
    root = 'main'
  ) => {
    const schema = getDeclarativeSchema();
    const content = parent
      ? getCompiledElement(parent)?.content
      : getRootContent(root);

    if (schema && content) {
      return contentAllowsAt(schema, content, child, index, {
        ancestors: parent ? [parent] : [],
        root,
      });
    }

    return parent ? canContain(parent, child) : canContainAtRoot(child, root);
  };

  const canWrap: InternalEditorSchemaApi<V>['canWrap'] = (
    parent,
    wrapper,
    index,
    root
  ) =>
    (index === undefined
      ? !!parent && canContain(parent, wrapper)
      : canContainAt(parent, wrapper, index, root)) &&
    wrapper.children.every((child) => canContain(wrapper, child));

  const canPlaceIn = (
    ancestors: readonly Element[],
    children: NodeList<Descendant>,
    fit: readonly Descendant[],
    at: number,
    {
      removing = [],
      root = 'main',
      strict = false,
    }: Parameters<InternalEditorSchemaApi<V>['canPlaceAt']>[4] = {}
  ) => {
    const [parent = null] = ancestors;
    const schema = getDeclarativeSchema();
    const content = parent
      ? getCompiledElement(parent)?.content
      : getRootContent(root);

    if (!schema || !content) {
      return !parent && fit.every((child) => canContainAtRoot(child, root));
    }

    const removed = [...removing].sort((a, b) => a - b);
    const index = at - removed.filter((position) => position < at).length;
    const length = children.length - removed.length + fit.length;

    if (content.max !== null && length > content.max) return false;

    const remaining = (position: number) => {
      let original = position;

      for (const gone of removed) {
        if (gone <= original) original += 1;
      }

      return getDefined(children.at(original));
    };
    const childAt = (position: number) =>
      position < index
        ? remaining(position)
        : position < index + fit.length
          ? fit[position - index]
          : remaining(position - fit.length);
    const options = { ancestors, root };
    const prefixLength = content.prefix?.length ?? 0;
    // Nodes that shift across the prefix boundary change slot, so the window
    // runs past the prefix by as many positions as the transfer adds or removes.
    const shifted = Math.min(
      length,
      prefixLength > 0 ? prefixLength + fit.length + removed.length : 0
    );

    for (let position = 0; position < shifted; position++) {
      if (position >= index && position < index + fit.length) continue;
      if (
        !contentAllowsAt(schema, content, childAt(position), position, options)
      ) {
        return false;
      }
    }

    return fit.every((child, offset) => {
      const position = index + offset;

      return position < prefixLength || !strict
        ? contentAllowsAt(schema, content, child, position, options)
        : contentAllows(schema, content.remainder ?? content, child);
    });
  };

  const canPlaceAt: InternalEditorSchemaApi<V>['canPlaceAt'] = (
    parent,
    children,
    fit,
    at,
    options
  ) => canPlaceIn(parent ? [parent] : [], children, fit, at, options);

  const canPlaceAtPath: InternalEditorSchemaApi<V>['canPlaceAtPath'] = (
    at,
    fit,
    { removing, root = 'main' } = {}
  ) => {
    const index = at.at(-1);
    const ancestors = getSlotAncestors(at, root);

    if (index === undefined || !ancestors) return false;

    const [parent] = ancestors;

    if (parent && !getCompiledElement(parent)?.content) return true;

    return canPlaceIn(
      ancestors,
      parent?.children ?? getDocumentRootNodes(getDocument(), root),
      fit,
      index,
      { removing, root }
    );
  };

  const createDeclarativeAndFill = (
    schema: CompiledEditorSchema,
    type: string,
    properties?: Readonly<Record<string, unknown>>,
    creating: ReadonlySet<string> = new Set(),
    options: RuntimeTargetOptions = {}
  ): Element => {
    const compiled = schema.elements.byType.get(type);

    if (!compiled) {
      throw new Error(`Unknown editor element spec "${type}".`);
    }
    if (creating.has(type)) {
      throw new Error(
        `Recursive default content for editor element "${type}".`
      );
    }

    if (properties?.type !== undefined && properties.type !== type) {
      throw new EditorSchemaValidationError(
        `Editor element construction for "${type}" cannot change its declared type.`
      );
    }

    const context = toCompiledTargetContext(type, options);
    const nextProperties: Record<string, unknown> = {};

    for (const propertyId of compiled.construction.materializedPropertyIds) {
      const property = getDefined(schema.properties.byId.get(propertyId));

      if (
        typeof property.key !== 'string' ||
        !matchesCompiledSchemaTarget(schema, property.target, context) ||
        property.descriptor.omitDefault ||
        Object.hasOwn(properties ?? {}, property.key)
      ) {
        continue;
      }

      nextProperties[property.key] = property.descriptor.generate
        ? canonicalizePropertyValue(
            `Editor element property "${property.key}"`,
            property.descriptor,
            generatePropertyValue(property.descriptor)
          )
        : property.descriptor.default;
    }

    for (const propertyId of schema.properties.elementAllowedByType.get(type) ??
      []) {
      const property = schema.properties.byId.get(propertyId);

      if (
        property?.descriptor.required &&
        typeof property.key === 'string' &&
        matchesCompiledSchemaTarget(schema, property.target, context) &&
        !Object.hasOwn(properties ?? {}, property.key)
      ) {
        throw new MissingPropertyError(
          createEditorSchemaValidationError(
            'missing-property',
            `Editor element "${type}" requires property "${property.key}".`,
            {
              nodeType: type,
              path: options.path ?? [],
              root: options.root ?? null,
            },
            {
              property: {
                candidates: [property],
                key: property.key,
                placement: 'element',
              },
            }
          ).diagnostics
        );
      }
    }

    for (const [key, value] of Object.entries(properties ?? {})) {
      if (key === 'children' || key === 'type') continue;
      const candidates = getCompiledPropertyCandidates(schema, 'element', key);
      const property = resolveCompiledSchemaProperty(
        schema,
        'element',
        key,
        context
      );

      if (!property) {
        if (candidates.length > 0 || schema.unknown === 'reject') {
          throw new EditorSchemaValidationError(
            candidates.length > 0
              ? `Editor element property "${key}" cannot target "${type}".`
              : `Unknown editor element property "${key}" on "${type}" in closed editor schema.`
          );
        }
        nextProperties[key] = snapshotEditorJsonValue(
          value,
          `Editor element "${type}" property "${key}"`
        );
        continue;
      }

      const canonical = validatePropertyValue(
        `Editor element "${type}" property "${key}"`,
        property.descriptor,
        value
      );

      if (
        !property.descriptor.omitDefault ||
        (!Object.hasOwn(property.descriptor, 'default') &&
          !property.descriptor.generate) ||
        !structurallyEqual(canonical, property.descriptor.default)
      ) {
        nextProperties[key] = canonical;
      }
    }

    const children: Descendant[] = [];
    const element = {
      ...nextProperties,
      children,
      type,
    } as Element;
    const nextCreating = new Set(creating).add(type);
    const site = {
      ancestors: [element, ...(options.ancestors ?? [])],
      root: options.root,
    };

    if (compiled.content) {
      children.push(
        ...completeContent({
          children: [],
          content: compiled.content,
          element: true,
          schema: {
            create: (childType, childProperties) =>
              createDeclarativeAndFill(
                schema,
                childType,
                childProperties,
                nextCreating,
                site
              ),
            fitsPrefix: () => false,
            isInline: (node) =>
              ElementApi.isElement(node) && getElementBehavior(node).inline,
          },
        }).children
      );
    }

    assertEditorJsonValue(element, `Editor element "${type}"`);

    return cloneFrozen(
      canonicalizeDeclarativeChildren(
        [element],
        schema,
        options.root ?? 'main',
        options.ancestors ?? [],
        false
      )[0] as Element
    );
  };

  const create = ((
    element: string | Readonly<{ kind: 'schema-element'; type: string }>,
    properties?: Readonly<Record<string, unknown>>,
    creating: ReadonlySet<string> = new Set(),
    options: RuntimeTargetOptions = {}
  ): Element => {
    const type = typeof element === 'string' ? element : element.type;
    const declarative = getDeclarativeSchema();

    if (!declarative) {
      throw new Error(`Unknown editor element type "${type}".`);
    }

    return createDeclarativeAndFill(
      declarative,
      type,
      properties,
      creating,
      options
    );
  }) as InternalEditorSchemaApi['create'];

  const emptyTextKeeps: InternalEditorSchemaApi['emptyTextKeeps'] = (
    key,
    value,
    at
  ) => {
    const declarative = getDeclarativeSchema();
    const property = declarative && getTextProperty(declarative, key, at);

    if (!property) return false;

    const { descriptor } = property;

    return (
      property.role === 'metadata' ||
      descriptor.required ||
      descriptor.generate !== undefined ||
      (Object.hasOwn(descriptor, 'default') &&
        areEditorJsonValuesEqual(descriptor.default, value))
    );
  };

  const createAt: InternalEditorSchemaApi['createAt'] = (
    type,
    properties,
    site
  ) => {
    const declarative = getDeclarativeSchema();

    if (!declarative) {
      throw new Error(`Unknown editor element type "${type}".`);
    }

    return createDeclarativeAndFill(
      declarative,
      type,
      properties,
      new Set(),
      site
    );
  };

  type DefaultSlot =
    | Readonly<{ kind: 'text' }>
    | Readonly<{
        kind: 'element';
        properties: Readonly<Record<string, unknown>> | undefined;
        schema: CompiledEditorSchema;
        site: Readonly<{ ancestors: readonly Element[]; root: RootKey }>;
        type: string;
      }>;

  const defaultSlotIn = (
    content: CompiledSchemaContentProgram | null | undefined,
    index: number,
    site: Readonly<{ ancestors: readonly Element[]; root: RootKey }>
  ): DefaultSlot | null => {
    const schema = getDeclarativeSchema();

    if (!schema || !content) return null;
    const slot = content.prefix?.[index];

    if (slot) {
      return {
        kind: 'element',
        properties: slot.properties,
        schema,
        site,
        type: slot.type,
      };
    }
    const plan = content.defaultPlan;

    if (plan?.kind === 'text') return { kind: 'text' };
    if (!plan) return null;

    return {
      kind: 'element',
      properties: plan.properties,
      schema,
      site,
      type: plan.type,
    };
  };

  const getSlotAncestors = (at: Path, root: RootKey) => {
    const ancestors =
      at.length > 1
        ? getElementAncestors(getDocumentRootNodes(getDocument(), root), at)
        : [];

    return ancestors.length === at.length - 1 ? ancestors : null;
  };

  const resolveDefaultSlot = (at: Path, root: RootKey) => {
    const index = at.at(-1);
    const ancestors = getSlotAncestors(at, root);

    if (index === undefined || !ancestors) return null;

    const [parent] = ancestors;
    const content = parent
      ? getCompiledElement(parent)?.content
      : getRootContent(root);

    return parent && !content
      ? defaultSlotIn(getRootContent(root), getDefined(at[0]), {
          ancestors: [],
          root,
        })
      : defaultSlotIn(content, index, { ancestors, root });
  };

  const buildDefaultSlot = (slot: DefaultSlot | null): Descendant | null => {
    if (!slot) return null;
    if (slot.kind === 'text') return { text: '' };

    return createDeclarativeAndFill(
      slot.schema,
      slot.type,
      slot.properties,
      new Set(),
      slot.site
    );
  };

  const createDefaultChild: EditorStateSchemaApi<V>['createDefaultChild'] = ({
    at,
    root = 'main',
  }) => buildDefaultSlot(resolveDefaultSlot(at, root));

  const tryCreateDefaultChild: InternalEditorSchemaApi<V>['tryCreateDefaultChild'] =
    ({ at, root = 'main' }) =>
      refuseMissingProperty(() =>
        buildDefaultSlot(resolveDefaultSlot(at, root))
      );

  const placeDerivedElement: InternalEditorSchemaApi['placeElementAt'] = (
    source,
    { at, root = 'main' }
  ) => {
    const schema = getDeclarativeSchema();
    const index = at.at(-1);
    const ancestors = getSlotAncestors(at, root);

    if (!schema || index === undefined || !ancestors) return source;
    const [parent] = ancestors;
    const content = parent
      ? getCompiledElement(parent)?.content
      : getRootContent(root);

    if (
      !content ||
      contentAllowsAt(schema, content, source, index, { ancestors, root })
    ) {
      return source;
    }
    const landing = buildDefaultSlot(
      defaultSlotIn(content, index, { ancestors, root })
    );

    if (
      !ElementApi.isElement(landing) ||
      !elementUsesInlineContent(landing) ||
      !elementUsesInlineContent(source)
    ) {
      return null;
    }

    const preserved = NodeApi.extractProps(
      elementForTypeChangeAt(source, landing.type, at, root)
    );
    const fixed = content.prefix?.[index]?.properties ?? {};
    const kept = Object.fromEntries(
      Object.entries(preserved).filter(([key]) => !Object.hasOwn(fixed, key))
    );

    return { ...landing, ...kept, children: source.children };
  };

  type CanonicalizationObserver = {
    events: RepresentationRepairEvent[];
    passes: RootCanonicalizationPass[];
    root: RootKey;
  };
  let canonicalizationObserver: CanonicalizationObserver | undefined;
  const observeRootCanonicalization = <T>(root: RootKey, run: () => T) => {
    if (canonicalizationObserver) {
      throw new Error('Schema fit canonicalization observers cannot nest.');
    }

    const observer: CanonicalizationObserver = {
      events: [],
      passes: [],
      root,
    };

    canonicalizationObserver = observer;
    try {
      const value = run();

      return Object.freeze({
        events: Object.freeze([...observer.events]),
        passes: Object.freeze([...observer.passes]),
        value,
      });
    } finally {
      canonicalizationObserver = undefined;
    }
  };
  const fitReportSink: InternalEditorSchemaApi['fitReportSink'] = (root) => {
    const observer = canonicalizationObserver;

    return observer?.root === root
      ? (event) => {
          observer.events.push(event);
        }
      : undefined;
  };

  const collectPropertyRepairs = (
    input: readonly Descendant[],
    output: readonly Descendant[],
    root: RootKey,
    inputPaths: FitInputPaths
  ): readonly EditorSchemaRepair[] => {
    if (structurallyEqual(input, output)) return Object.freeze([]);
    const declarative = getDeclarativeSchema();

    if (!declarative) {
      throw new Error(
        `Unclassified property mutation in editor root "${root}" without a compiled schema.`
      );
    }

    const repairs: EditorSchemaRepair[] = [];
    const visit = (
      before: readonly Descendant[],
      after: readonly Descendant[],
      ancestors: readonly Element[],
      parentPath: readonly number[]
    ) => {
      if (before.length !== after.length) {
        throw new Error(
          `Property canonicalization changed child topology in editor root "${root}".`
        );
      }

      for (const [index, source] of before.entries()) {
        const targetNode = after[index];
        const path = [...parentPath, index];

        if (
          !targetNode ||
          NodeApi.isText(source) !== NodeApi.isText(targetNode)
        ) {
          throw new Error(
            `Property canonicalization changed node structure in editor root "${root}" at [${path}].`
          );
        }

        const placement = NodeApi.isText(source) ? 'text' : 'element';
        const type = NodeApi.isText(source)
          ? (getElementType(ancestors[0] ?? {}) ?? '')
          : getElementType(source);

        if (
          !type ||
          (!NodeApi.isText(source) &&
            type !== getElementType(targetNode as Element))
        ) {
          throw new Error(
            `Property canonicalization changed element identity in editor root "${root}" at [${path}].`
          );
        }

        const context = toCompiledTargetContext(type, {
          ancestors: NodeApi.isText(source) ? ancestors.slice(1) : ancestors,
          root,
        });
        const reserved = new Set(
          NodeApi.isText(source)
            ? ['text']
            : [
                'children',
                'type',
                ...((declarative.elements.byType.get(type)?.contentRoots.size ??
                  0) > 0
                  ? ['childRoots']
                  : []),
              ]
        );
        const sourceRecord = source as unknown as Readonly<
          Record<string, unknown>
        >;
        const targetRecord = targetNode as unknown as Readonly<
          Record<string, unknown>
        >;
        const keys = new Set([
          ...Object.keys(sourceRecord),
          ...Object.keys(targetRecord),
        ]);

        for (const key of keys) {
          if (reserved.has(key)) continue;
          const had = Object.hasOwn(sourceRecord, key);
          const has = Object.hasOwn(targetRecord, key);

          if (
            had &&
            has &&
            structurallyEqual(sourceRecord[key], targetRecord[key])
          ) {
            continue;
          }

          const property = resolveCompiledSchemaProperty(
            declarative,
            placement,
            key,
            context
          );

          if (!property) {
            throw new Error(
              `Unclassified schema property mutation for "${key}" in editor root "${root}" at [${path}].`
            );
          }

          const inputLocations = inputPaths(path).map((sourcePath) =>
            schemaModelLocation(root, sourcePath, key)
          );
          const outputLocation = schemaModelLocation(root, path, key);

          if (!had && has) {
            const code = property.descriptor.generate
              ? 'generate-property'
              : Object.hasOwn(property.descriptor, 'default')
                ? 'default-property'
                : null;

            if (!code) {
              throw new Error(
                `Unclassified inserted schema property "${key}" in editor root "${root}" at [${path}].`
              );
            }
            repairs.push(
              schemaRepair({
                code,
                impact: 'lossless',
                outputs: [outputLocation],
                owner: 'property',
              })
            );
            continue;
          }
          if (had && !has) {
            const omittedDefault =
              property.descriptor.omitDefault &&
              Object.hasOwn(property.descriptor, 'default') &&
              structurallyEqual(sourceRecord[key], property.descriptor.default);
            const exclusive =
              placement === 'text' && property.exclusiveGroupIds.length > 0;

            if (!omittedDefault && !exclusive) {
              throw new Error(
                `Unclassified removed schema property "${key}" in editor root "${root}" at [${path}].`
              );
            }
            repairs.push(
              schemaRepair({
                code: omittedDefault
                  ? 'omit-default-property'
                  : 'resolve-exclusive-property',
                impact: omittedDefault ? 'lossless' : 'lossy',
                inputs: inputLocations,
                owner: 'property',
              })
            );
            continue;
          }
          if (property.descriptor.kind !== 'set') {
            throw new Error(
              `Unclassified changed schema property "${key}" in editor root "${root}" at [${path}].`
            );
          }
          repairs.push(
            schemaRepair({
              code: 'canonicalize-set-property',
              impact: 'lossless',
              inputs: inputLocations,
              outputs: [outputLocation],
              owner: 'property',
            })
          );
        }

        if (!NodeApi.isText(source) && !NodeApi.isText(targetNode)) {
          visit(
            source.children,
            targetNode.children,
            [source, ...ancestors],
            path
          );
        }
      }
    };

    visit(input, output, [], []);
    if (repairs.length === 0) {
      throw new Error(
        `Unclassified property mutation in editor root "${root}".`
      );
    }

    return Object.freeze(repairs);
  };

  const representationContext = Object.freeze({ getSchema: () => api });
  const sliceFitter = createCompiledSliceFitterDelegate<V>(() => ({
    canContain,
    collectPropertyRepairs,
    contentAllows,
    contentAllowsAt,
    createDeclarativeAndFill,
    editorRootLabel,
    elementUsesInlineContent,
    getCompiledElement,
    getDescendant,
    getDocumentRoot,
    getDocumentRootProgram,
    getEditor: () => representationContext as unknown as Editor<V>,
    getElementAncestors,
    getElementBehavior,
    getElementContentRoots,
    getElementSlicePolicy,
    getElementType,
    getRootContent,
    getVocabulary,
    indexConstructedRoot,
    isSetValuedProperty,
    nodePropertiesEqual,
    observeRootCanonicalization,
    revision: getRegistry().schemaRevision,
    schema: getDeclarativeSchema(),
    schemaApi: api,
    structurallyEqual,
    validateDeclarativeChildren,
    validateDocument: assertDocument,
    validateSliceVocabulary,
  }));
  const fit: InternalEditorSchemaApi<V>['fit'] = sliceFitter.fit;
  const fitContent: InternalEditorSchemaApi<V>['fitContent'] =
    sliceFitter.fitContent;
  const fitDocument = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> => sliceFitter.fitDocument(input);
  const fitDocumentWithReport: InternalEditorSchemaApi<V>['fitDocumentWithReport'] =
    (input) => sliceFitter.fitDocumentWithReport(input);
  const fitDocumentWithSelection: InternalEditorSchemaApi<V>['fitDocumentWithSelection'] =
    (input, options) => sliceFitter.fitDocumentWithSelection(input, options);
  const findWrapping: InternalEditorSchemaApi<V>['findWrapping'] =
    sliceFitter.findWrapping;

  const canonicalizeDeclarativePropertyRecord = (
    source: Readonly<Record<string, unknown>>,
    schema: CompiledEditorSchema,
    placement: 'element' | 'text',
    context: CompiledSchemaTargetContext,
    reserved: ReadonlySet<string>,
    dropMisplaced: boolean,
    openAncestorBoundary = false,
    validationLocation?: EditorSchemaValidationLocation
  ) => {
    const output: Record<string, unknown> = {};
    const canonicalizeProperty = (
      key: string,
      property: CompiledSchemaProperty,
      value: unknown
    ) => {
      try {
        return (
          validationLocation ? validatePropertyValue : canonicalizePropertyValue
        )(`Editor ${placement} property "${key}"`, property.descriptor, value);
      } catch (error) {
        if (!validationLocation) throw error;

        throw createEditorSchemaValidationError(
          'invalid-property-value',
          error instanceof Error
            ? error.message
            : `Editor ${placement} property "${key}" is invalid.`,
          validationLocation,
          {
            cause: error,
            property: { candidates: [property], key, placement },
          }
        );
      }
    };

    for (const key of reserved) {
      if (Object.hasOwn(source, key)) output[key] = source[key];
    }

    for (const [key, value] of Object.entries(source)) {
      if (reserved.has(key)) continue;
      const candidates = getCompiledPropertyCandidates(schema, placement, key);
      const property = resolveCompiledSchemaProperty(
        schema,
        placement,
        key,
        context
      );

      if (!property) {
        if (candidates.length > 0) {
          const boundaryProperty = openAncestorBoundary
            ? candidates.find(
                (candidate) =>
                  matchesTargetWithOpenAncestorBoundary(
                    schema,
                    candidate.target,
                    context
                  ) === 'unknown'
              )
            : undefined;

          if (boundaryProperty) {
            output[key] = canonicalizeProperty(key, boundaryProperty, value);
            continue;
          }
          if (dropMisplaced) continue;
          const message = `Schema ${placement} property "${key}" cannot target ${
            placement === 'text'
              ? `text under "${context.type}"`
              : `element "${context.type}"`
          }.`;

          throw validationLocation
            ? createEditorSchemaValidationError(
                'property-target-mismatch',
                message,
                validationLocation,
                { property: { candidates, key, placement } }
              )
            : new EditorSchemaValidationError(message);
        }
        if (schema.unknown === 'reject') {
          const message = `Unknown ${placement} property "${key}" in closed editor schema.`;

          throw validationLocation
            ? createEditorSchemaValidationError(
                'unknown-property',
                message,
                validationLocation
              )
            : new EditorSchemaValidationError(message);
        }
        output[key] = snapshotEditorJsonValue(
          value,
          `Editor ${placement} property "${key}"`
        );
        continue;
      }

      const canonical = canonicalizeProperty(key, property, value);

      if (
        property.descriptor.omitDefault &&
        Object.hasOwn(property.descriptor, 'default') &&
        structurallyEqual(canonical, property.descriptor.default)
      ) {
        continue;
      }
      output[key] = canonical;
    }

    const allowedIds =
      placement === 'element'
        ? schema.properties.elementAllowedByType.get(context.type)
        : schema.properties.textAllowedByParentType.get(context.type);

    for (const id of allowedIds ?? []) {
      const property = schema.properties.byId.get(id);

      if (
        !property ||
        typeof property.key !== 'string' ||
        Object.hasOwn(output, property.key) ||
        !matchesCompiledSchemaTarget(schema, property.target, context) ||
        (!Object.hasOwn(property.descriptor, 'default') &&
          !property.descriptor.generate) ||
        property.descriptor.omitDefault
      ) {
        continue;
      }
      if (validationLocation) {
        throw createEditorSchemaValidationError(
          'missing-property',
          `Editor ${placement} requires canonical property "${property.key}".`,
          validationLocation,
          {
            property: {
              candidates: [property],
              key: property.key,
              placement,
            },
          }
        );
      }
      output[property.key] = property.descriptor.generate
        ? canonicalizeProperty(
            property.key,
            property,
            generatePropertyValue(property.descriptor)
          )
        : property.descriptor.default;
    }

    for (const id of allowedIds ?? []) {
      const property = schema.properties.byId.get(id);

      if (
        !property?.descriptor.required ||
        typeof property.key !== 'string' ||
        Object.hasOwn(output, property.key) ||
        !matchesCompiledSchemaTarget(schema, property.target, context)
      ) {
        continue;
      }
      const message = `Editor ${placement} requires property "${property.key}".`;

      throw validationLocation
        ? createEditorSchemaValidationError(
            'missing-property',
            message,
            validationLocation,
            {
              property: {
                candidates: [property],
                key: property.key,
                placement,
              },
            }
          )
        : new MissingPropertyError({
            code: 'missing-property',
            message,
            path: [],
            root: null,
          });
    }

    const sourceKeys = Object.keys(source);
    const canonicalOutput =
      placement === 'text'
        ? canonicalizeCompiledExclusiveTextProperties(schema, output, context)
        : output;
    const outputKeys = Object.keys(canonicalOutput);

    return sourceKeys.length === outputKeys.length &&
      sourceKeys.every(
        (key) =>
          Object.hasOwn(canonicalOutput, key) &&
          structurallyEqual(source[key], canonicalOutput[key])
      )
      ? source
      : canonicalOutput;
  };

  const canonicalizeDeclarativeChildren = (
    children: readonly Descendant[],
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[],
    dropMisplaced: boolean,
    baseline?: NodeList<Descendant>,
    offset = 0
  ): readonly Descendant[] => {
    const canonical = children.map((node, index) => {
      const previous = baseline?.at(index + offset);

      if (node === previous) return node;
      if (NodeApi.isText(node)) {
        const parent = ancestors[0];
        const context = toCompiledTargetContext(
          getElementType(parent ?? {}) ?? '',
          { ancestors: ancestors.slice(1), root }
        );
        const source = node as unknown as Readonly<Record<string, unknown>>;

        return canonicalizeDeclarativePropertyRecord(
          source,
          schema,
          'text',
          context,
          new Set(['text']),
          dropMisplaced
        ) as Text;
      }

      const type = getElementType(node);
      const previousChildren =
        previous &&
        !NodeApi.isText(previous) &&
        getElementType(previous) === type
          ? previous.children
          : undefined;

      if (!type || !schema.elements.byType.has(type)) {
        if (schema.unknown === 'reject') {
          throw new EditorSchemaValidationError(
            `Unknown editor element type "${type ?? 'missing'}".`
          );
        }

        const nested = canonicalizeDeclarativeChildren(
          node.children,
          schema,
          root,
          [node, ...ancestors],
          dropMisplaced,
          previousChildren
        );

        return nested === node.children ? node : { ...node, children: nested };
      }

      const properties = canonicalizeDeclarativePropertyRecord(
        node,
        schema,
        'element',
        toCompiledTargetContext(type, { ancestors, root }),
        new Set([
          'children',
          'type',
          ...((schema.elements.byType.get(type)?.contentRoots.size ?? 0) > 0
            ? ['childRoots']
            : []),
        ]),
        dropMisplaced
      );
      const candidate = properties as unknown as Element;
      const nested = canonicalizeDeclarativeChildren(
        node.children,
        schema,
        root,
        [candidate, ...ancestors],
        dropMisplaced,
        previousChildren
      );

      if (candidate === node && nested === node.children) return node;

      return { ...candidate, children: nested, type };
    });

    return canonical.every((node, index) => node === children[index])
      ? children
      : canonical;
  };

  const canonicalizeChildren: InternalEditorSchemaApi['canonicalizeChildren'] =
    (children, root, ancestors, dropMisplaced, baseline) => {
      const schema = getDeclarativeSchema();
      // Only the validated immutable before-root can prove unchanged properties.
      let previous: NodeList<Descendant> | undefined =
        baseline &&
        baseline.path.length === ancestors.length &&
        isRootValidatedBy(baseline.document, getValidationAuthority())
          ? rootNodes(baseline.document)
          : undefined;

      if (baseline) {
        for (let depth = 0; previous && depth < baseline.path.length; depth++) {
          const parent = previous.at(baseline.path[depth]);
          if (
            !parent ||
            NodeApi.isText(parent) ||
            getElementType(parent) !==
              getElementType(ancestors[baseline.path.length - depth - 1] ?? {})
          ) {
            previous = undefined;
            break;
          }
          previous = parent.children;
        }
      }

      const canonical = schema
        ? canonicalizeDeclarativeChildren(
            children,
            schema,
            root,
            ancestors,
            dropMisplaced,
            previous,
            baseline?.from ?? 0
          )
        : children;

      if (
        canonicalizationObserver?.root === root &&
        ancestors.length === 0 &&
        baseline === undefined
      ) {
        canonicalizationObserver.passes.push(
          Object.freeze({ input: children, output: canonical })
        );
      }

      return canonical;
    };

  const copyDeclarativeChildren = (
    children: readonly Descendant[],
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[]
  ): readonly Descendant[] => {
    const copyProperties = (
      node: Descendant,
      placement: 'element' | 'text',
      context: CompiledSchemaTargetContext,
      reserved: ReadonlySet<string>
    ) => {
      const source = node as unknown as Readonly<Record<string, unknown>>;
      const output = Object.fromEntries(
        Object.entries(source).filter(([key]) => {
          if (reserved.has(key)) return true;
          const property = resolveCompiledSchemaProperty(
            schema,
            placement,
            key,
            context
          );

          return property?.lifecycle.copy !== 'drop';
        })
      );

      return Object.keys(output).length === Object.keys(source).length
        ? node
        : (output as unknown as Descendant);
    };

    const copied = children.map((node) => {
      if (NodeApi.isText(node)) {
        const parent = ancestors[0];

        return copyProperties(
          node,
          'text',
          toCompiledTargetContext(getElementType(parent ?? {}) ?? '', {
            ancestors: ancestors.slice(1),
            root,
          }),
          new Set(['text'])
        );
      }

      const type = getElementType(node) ?? '';
      const candidate = copyProperties(
        node,
        'element',
        toCompiledTargetContext(type, { ancestors, root }),
        new Set(['childRoots', 'children', 'type'])
      ) as Element;
      const nested = copyDeclarativeChildren(node.children, schema, root, [
        candidate,
        ...ancestors,
      ]);

      return candidate === node && nested === node.children
        ? node
        : { ...candidate, children: nested };
    });

    return copied.every((node, index) => node === children[index])
      ? children
      : copied;
  };

  const copyChildren: InternalEditorSchemaApi['copyChildren'] = (
    children,
    root,
    ancestors = []
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return children;
    let hasCopyTransforms = SCHEMA_HAS_COPY_TRANSFORMS.get(schema);
    if (hasCopyTransforms === undefined) {
      hasCopyTransforms = false;
      for (const lifecycle of schema.properties.lifecycle.values()) {
        if (lifecycle.copy === 'drop') {
          hasCopyTransforms = true;
          break;
        }
      }
      SCHEMA_HAS_COPY_TRANSFORMS.set(schema, hasCopyTransforms);
    }

    return hasCopyTransforms
      ? copyDeclarativeChildren(children, schema, root, ancestors)
      : children;
  };

  const copyNodeAt: InternalEditorSchemaApi['copyNodeAt'] = (
    node,
    path,
    root = 'main'
  ) => {
    const children = getDocumentRootNodes(getDocument(), root);

    return copyChildren(
      node ? [node] : [],
      root,
      getElementAncestors(children, path)
    )[0];
  };

  const getTextPropertyInParent = (
    schema: CompiledEditorSchema,
    key: string,
    parentContext: CompiledSchemaTargetContext | null
  ) => {
    if (parentContext) {
      return resolveCompiledSchemaProperty(schema, 'text', key, parentContext);
    }
    const candidates = getCompiledPropertyCandidates(schema, 'text', key);

    return candidates.length === 1 ? candidates[0] : null;
  };

  const getTextProperty = (
    schema: CompiledEditorSchema,
    key: string,
    options: RuntimeTextTargetOptions = {}
  ) => {
    const parentType = options.parent
      ? (getElementType(options.parent) ?? '')
      : '';

    return getTextPropertyInParent(
      schema,
      key,
      parentType ? toCompiledTargetContext(parentType, options) : null
    );
  };

  const getTextTargetOptions = (
    value: EditorDocumentValue,
    path: Path,
    root: RootKey = 'main'
  ): RuntimeTextTargetOptions => {
    const children = getDocumentRootNodes(value, root);
    const ancestors = getElementAncestors(children, path);

    return {
      ancestors: ancestors.slice(1),
      parent: ancestors[0] ?? null,
      root,
    };
  };

  const getTextTargetOptionsAt = (
    path: Path,
    root: RootKey = 'main'
  ): RuntimeTextTargetOptions =>
    getTextTargetOptions(getDocument(), path, root);

  const getElementTargetOptionsAt = (
    path: Path,
    root: RootKey = 'main'
  ): RuntimeTargetOptions => ({
    ancestors: getElementAncestors(
      getDocumentRootNodes(getDocument(), root),
      path
    ),
    root,
  });

  const keepsElementPropertyOnSplit = (
    schema: CompiledEditorSchema,
    key: string,
    context: CompiledSchemaTargetContext
  ) => {
    if (key === 'type') return true;
    const property = resolveCompiledSchemaProperty(
      schema,
      'element',
      key,
      context
    );

    return property
      ? property.lifecycle.split === 'preserve'
      : schema.unknown === 'preserve' &&
          getCompiledPropertyCandidates(schema, 'element', key).length === 0;
  };

  const elementPropertiesForSplitAt = (
    element: Element,
    path: Path,
    root: RootKey = 'main'
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return NodeApi.extractProps(element);
    const context = toCompiledTargetContext(
      getElementType(element) ?? '',
      getElementTargetOptionsAt(path, root)
    );

    return Object.freeze(
      Object.fromEntries(
        Object.entries(NodeApi.extractProps(element)).filter(([key]) =>
          keepsElementPropertyOnSplit(schema, key, context)
        )
      )
    );
  };

  const elementSplitKeepsAt: InternalEditorSchemaApi['elementSplitKeepsAt'] = (
    source,
    continuation,
    { children, path, root }
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return () => true;
    const ancestors = getElementAncestors(children, path);
    const options = { ancestors, root };
    const [parent] = ancestors;
    const content = parent
      ? getCompiledElement(parent)?.content
      : getRootContent(root);
    const continuationSlotFixed =
      content?.prefix?.[getDefined(path.at(-1)) + 1]?.properties ?? {};
    const from = toCompiledTargetContext(getElementType(source) ?? '', options);
    const to =
      continuation.type === source.type
        ? null
        : toCompiledTargetContext(getElementType(continuation) ?? '', options);

    return (key, value) => {
      if (
        Object.hasOwn(continuationSlotFixed, key) ||
        !keepsElementPropertyOnSplit(schema, key, from)
      ) {
        return false;
      }
      if (!to) return true;
      if (key === 'type') return false;
      const keep = typeChangeKeep(schema, key, from, to);

      return keep !== null && (value === undefined || keep(value) !== null);
    };
  };

  const elementPropertyLanding: InternalEditorSchemaApi['elementPropertyLanding'] =
    (element, key, ancestors, root) => {
      const schema = getDeclarativeSchema();

      return schema
        ? (resolveCompiledSchemaProperty(
            schema,
            'element',
            key,
            toCompiledTargetContext(getElementType(element) ?? '', {
              ancestors,
              root,
            })
          )?.lifecycle.landing ?? 'preserve')
        : 'preserve';
    };

  const getTextPropertyAt = (
    key: string,
    path: Path,
    root: RootKey = 'main'
  ) => {
    const schema = getDeclarativeSchema();

    return schema
      ? getTextProperty(schema, key, getTextTargetOptionsAt(path, root))
      : null;
  };

  const canonicalizeTextPropertiesIn = (
    properties: Readonly<Record<string, unknown>>,
    [parentType, ...ancestors]: readonly string[],
    root: RootKey = 'main',
    preferredKey?: string
  ) => {
    const schema = getDeclarativeSchema();

    return schema && parentType
      ? canonicalizeCompiledExclusiveTextProperties(
          schema,
          properties,
          { ...toCompiledTargetContext(parentType, { root }), ancestors },
          preferredKey
        )
      : properties;
  };

  const canonicalizeTextPropertiesAt = (
    properties: Readonly<Record<string, unknown>>,
    path: Path,
    root: RootKey = 'main',
    preferredKey?: string
  ) => {
    const { ancestors = [], parent } = getTextTargetOptionsAt(path, root);

    return canonicalizeTextPropertiesIn(
      properties,
      parent
        ? [
            getElementType(parent) ?? '',
            ...ancestors.flatMap((element) => getElementType(element) ?? []),
          ]
        : [],
      root,
      preferredKey
    );
  };

  const isSetValuedProperty = (
    _node: JsonNode,
    key: string,
    context: DocumentPropertyContext
  ) => {
    const schema = getDeclarativeSchema();

    return Boolean(
      schema &&
      resolveCompiledSchemaProperty(schema, context.placement, key, {
        ancestors: context.ancestors,
        root: context.root,
        type: context.type,
      })?.merge === 'set'
    );
  };

  const getVocabulary = (): EditorSchemaVocabulary => {
    const schema = getDeclarativeSchema();

    if (!schema) {
      return Object.freeze({
        elementTypes: Object.freeze([]),
        groupNames: Object.freeze([]),
        propertyIds: Object.freeze([]),
        rootNames: Object.freeze([]),
      });
    }

    return schema.vocabulary;
  };

  const textPropertyAppliesToContext = (
    parent: Element,
    key: string,
    options: RuntimeTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return true;
    const candidates = getCompiledPropertyCandidates(schema, 'text', key);

    if (candidates.length === 0) return schema.unknown === 'preserve';

    return Boolean(
      resolveCompiledSchemaProperty(
        schema,
        'text',
        key,
        toCompiledTargetContext(getElementType(parent) ?? '', options)
      )
    );
  };

  const isTextPropertyAllowedAt = (
    key: string,
    path: Path,
    root: RootKey = 'main'
  ) => {
    const options = getTextTargetOptionsAt(path, root);

    return Boolean(
      options.parent &&
      textPropertyAppliesToContext(options.parent, key, options)
    );
  };

  const isTextPropertyEqual = (
    key: string,
    left: unknown,
    right: unknown,
    options: RuntimeTextTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();
    const property = schema ? getTextProperty(schema, key, options) : null;
    const normalize = (value: unknown) =>
      property?.descriptor.omitDefault && value === undefined
        ? property.descriptor.default
        : value;

    return structurallyEqual(normalize(left), normalize(right));
  };

  const isTextPropertyEqualAt = (
    key: string,
    left: unknown,
    right: unknown,
    path: Path,
    root: RootKey = 'main'
  ) =>
    isTextPropertyEqual(key, left, right, getTextTargetOptionsAt(path, root));

  const mergeCompiledTextProperty = (
    key: string,
    previous: unknown,
    value: unknown,
    options: RuntimeTextTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) {
      return snapshotEditorJsonValue(value, `Editor text property "${key}"`);
    }
    const candidates = getCompiledPropertyCandidates(schema, 'text', key);
    const property = getTextProperty(schema, key, options);

    if (!property) {
      if (candidates.length > 0 || schema.unknown === 'reject') {
        throw new EditorSchemaValidationError(
          candidates.length > 0
            ? `Editor text property "${key}" cannot target editor element "${
                options.parent?.type ?? 'root'
              }".`
            : `Unknown text property "${key}" in closed editor schema.`
        );
      }

      return snapshotEditorJsonValue(value, `Editor text property "${key}"`);
    }

    const canonical = validatePropertyValue(
      `Editor text property "${key}"`,
      property.descriptor,
      value
    );

    if (property.merge !== 'set') return canonical;
    const previousItems =
      previous === undefined
        ? []
        : validatePropertyValue(
            `Editor text property "${key}"`,
            property.descriptor,
            previous
          );
    return normalizeSetValues([
      ...(previousItems as readonly EditorJsonValue[]),
      ...(canonical as readonly EditorJsonValue[]),
    ]) as EditorJsonValue;
  };

  const mergeTextPropertyAt = (
    key: string,
    previous: unknown,
    value: unknown,
    path: Path,
    root: RootKey = 'main'
  ) =>
    mergeCompiledTextProperty(
      key,
      previous,
      value,
      getTextTargetOptionsAt(path, root)
    );

  const getTextProperties = (text: Text) => {
    const { text: _text, ...properties } = text;

    return properties;
  };

  const textPropertiesForSplit = (
    text: Text,
    options: RuntimeTextTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return Object.freeze(getTextProperties(text));

    return Object.freeze(
      Object.fromEntries(
        Object.entries(getTextProperties(text)).filter(([key]) => {
          const property = getTextProperty(schema, key, options);

          return property
            ? property.lifecycle.split === 'preserve'
            : schema.unknown === 'preserve';
        })
      )
    );
  };

  const textPropertiesForSplitAt = (
    text: Text,
    path: Path,
    root: RootKey = 'main'
  ) => textPropertiesForSplit(text, getTextTargetOptionsAt(path, root));

  const typeChangeKeep = (
    schema: CompiledEditorSchema,
    key: string,
    from: CompiledSchemaTargetContext,
    to: CompiledSchemaTargetContext
  ): ((value: unknown) => Readonly<{ value: unknown }> | null) | null => {
    const source = resolveCompiledSchemaProperty(schema, 'element', key, from);

    if (!source) {
      return schema.unknown === 'preserve' &&
        getCompiledPropertyCandidates(schema, 'element', key).length === 0
        ? (value) => ({ value })
        : null;
    }
    if (source.lifecycle.typeChange !== 'preserve-if-allowed') return null;
    const destination = resolveCompiledSchemaProperty(
      schema,
      'element',
      key,
      to
    );

    return destination
      ? (value) => {
          try {
            return {
              value: validatePropertyValue(
                `Editor element property "${key}"`,
                destination.descriptor,
                value
              ),
            };
          } catch {
            return null;
          }
        }
      : null;
  };

  const keptElementProperties = (
    schema: CompiledEditorSchema,
    element: Element,
    from: CompiledSchemaTargetContext,
    to: CompiledSchemaTargetContext
  ): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(NodeApi.extractProps(element)).flatMap(([key, value]) => {
        if (key === 'type') return [];
        const kept = typeChangeKeep(schema, key, from, to)?.(value);

        return kept ? [[key, kept.value]] : [];
      })
    );

  const elementForTypeChangeAt: InternalEditorSchemaApi<V>['elementForTypeChangeAt'] =
    (element, type, path, root) => {
      if (element.type === type) return element;
      const schema = getDeclarativeSchema();

      if (!schema) return Object.freeze({ ...element, type });
      const options = getElementTargetOptionsAt(path, root);
      const fromType = getElementType(element) ?? '';
      const toType = getElementType({ type }) ?? '';
      const from = toCompiledTargetContext(fromType, options);
      const to = toCompiledTargetContext(toType, options);
      const textRules = new Map<
        string,
        readonly [CompiledSchemaProperty | null, CompiledSchemaProperty | null]
      >();
      const keepsText = (key: string, value: unknown) => {
        let rule = textRules.get(key);

        if (!rule) {
          rule = [
            getTextPropertyInParent(schema, key, fromType ? from : null),
            getTextPropertyInParent(schema, key, toType ? to : null),
          ];
          textRules.set(key, rule);
        }
        const [source, destination] = rule;

        if (!source) return schema.unknown === 'preserve';
        if (
          source.lifecycle.typeChange !== 'preserve-if-allowed' ||
          !destination
        ) {
          return false;
        }

        try {
          validatePropertyValue(
            `Editor text property "${key}"`,
            destination.descriptor,
            value
          );

          return true;
        } catch {
          return false;
        }
      };
      let children: Descendant[] | null = null;

      for (let index = 0; index < element.children.length; index++) {
        const child = element.children[index];

        if (!NodeApi.isText(child)) continue;
        let kept: Record<string, unknown> | null = null;

        for (const [key, value] of Object.entries(getTextProperties(child))) {
          if (keepsText(key, value)) continue;
          kept ??= { ...child };
          delete kept[key];
        }
        if (!kept) continue;
        children ??= [...element.children];
        children[index] = kept as Descendant;
      }

      return Object.freeze({
        ...keptElementProperties(schema, element, from, to),
        type,
        children: children ?? element.children,
      });
    };

  const elementPropertiesForResetAt: InternalEditorSchemaApi<V>['elementPropertiesForResetAt'] =
    (element, at, root = 'main') => {
      const slot = resolveDefaultSlot(at, root);

      if (slot?.kind !== 'element') return null;
      const { schema, type } = slot;
      const options = getElementTargetOptionsAt(at, root);
      const context = toCompiledTargetContext(type, options);
      const changed = elementForTypeChangeAt(element, type, at, root);
      const sameType = changed === element;
      const seed: Record<string, unknown> = sameType
        ? keptElementProperties(schema, element, context, context)
        : NodeApi.extractProps(changed);

      if (sameType) {
        for (const [key, value] of Object.entries(
          NodeApi.extractProps(element)
        )) {
          const property = resolveCompiledSchemaProperty(
            schema,
            'element',
            key,
            context
          );

          if (
            property &&
            !Object.hasOwn(property.descriptor, 'default') &&
            !property.descriptor.generate
          ) {
            seed[key] = value;
          }
        }
      }

      return refuseMissingProperty(() => {
        const properties = canonicalizeDeclarativePropertyRecord(
          { ...seed, ...slot.properties, type },
          schema,
          'element',
          context,
          new Set(['type']),
          false
        ) as Partial<Element>;

        if (sameType) return properties;

        // Only the refusal matters: the subtree as the update's final
        // canonicalization will see it once `setNodes` changes the type.
        canonicalizeDeclarativeChildren(
          [{ ...properties, children: changed.children, type }],
          schema,
          root,
          options.ancestors ?? [],
          false
        );

        return properties;
      });
    };

  const validateTextProperties = (
    properties: Readonly<Record<string, unknown>>,
    parent: Element | null,
    options: RuntimeTargetOptions = {},
    location: EditorSchemaValidationLocation = toSchemaValidationLocation(
      options.root ?? 'main',
      [],
      'text',
      parent ? [parent, ...(options.ancestors ?? [])] : options.ancestors
    )
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return;

    for (const [key, value] of Object.entries(properties)) {
      const candidates = getCompiledPropertyCandidates(schema, 'text', key);
      const property = parent
        ? resolveCompiledSchemaProperty(
            schema,
            'text',
            key,
            toCompiledTargetContext(getElementType(parent) ?? '', options)
          )
        : candidates.length === 1 && !candidates[0].target
          ? candidates[0]
          : null;

      if (!property) {
        if (candidates.length > 0 || schema.unknown === 'reject') {
          const message =
            candidates.length > 0
              ? `Editor text property "${key}" cannot target editor element "${
                  parent?.type ?? 'root'
                }".`
              : `Unknown text property "${key}" in closed editor schema.`;

          throw createEditorSchemaValidationError(
            candidates.length > 0
              ? 'property-target-mismatch'
              : 'unknown-property',
            message,
            location,
            candidates.length > 0
              ? {
                  property: { candidates, key, placement: 'text' },
                }
              : undefined
          );
        }
        continue;
      }
      try {
        validatePropertyValue(
          `Editor text property "${key}"`,
          property.descriptor,
          value
        );
      } catch (error) {
        throw createEditorSchemaValidationError(
          'invalid-property-value',
          error instanceof Error
            ? error.message
            : `Editor text property "${key}" is invalid.`,
          location,
          {
            cause: error,
            property: { candidates: [property], key, placement: 'text' },
          }
        );
      }
    }
    const context = parent
      ? toCompiledTargetContext(getElementType(parent) ?? '', options)
      : null;

    if (context) {
      for (const id of schema.properties.textAllowedByParentType.get(
        context.type
      ) ?? []) {
        const property = schema.properties.byId.get(id);

        if (
          !property ||
          typeof property.key !== 'string' ||
          Object.hasOwn(properties, property.key) ||
          !matchesCompiledSchemaTarget(schema, property.target, context)
        ) {
          continue;
        }
        const hasCanonicalDefault =
          typeof property.descriptor.generate === 'function' ||
          (Object.hasOwn(property.descriptor, 'default') &&
            !property.descriptor.omitDefault);

        if (!property.descriptor.required && !hasCanonicalDefault) continue;

        throw createEditorSchemaValidationError(
          'missing-property',
          property.descriptor.required
            ? `Editor text requires property "${property.key}".`
            : `Editor text requires canonical property "${property.key}".`,
          location,
          {
            property: {
              candidates: [property],
              key: property.key,
              placement: 'text',
            },
          }
        );
      }
      const canonical = canonicalizeCompiledExclusiveTextProperties(
        schema,
        properties,
        context
      );

      if (Object.keys(canonical).length !== Object.keys(properties).length) {
        throw createEditorSchemaValidationError(
          'exclusive-property-conflict',
          'Editor text properties contain mutually exclusive schema properties.',
          location
        );
      }
    }
  };

  const validateTextPropertiesAtValue = (
    properties: Readonly<Record<string, unknown>>,
    path: Path,
    value: EditorDocumentValue,
    root: RootKey = 'main'
  ) => {
    const options = getTextTargetOptions(value, path, root);

    validateTextProperties(
      properties,
      options.parent ?? null,
      options,
      toSchemaValidationLocation(
        root,
        path,
        'text',
        options.parent
          ? [options.parent, ...(options.ancestors ?? [])]
          : options.ancestors
      )
    );
  };

  const validateDeclarativeNodeProperties = (
    node: Descendant,
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[],
    path: readonly number[],
    openAncestorBoundary = false
  ) => {
    const location = toSchemaValidationLocation(
      root,
      path,
      getValidationNodeType(node),
      ancestors
    );

    if (NodeApi.isText(node)) {
      validateTextProperties(
        getTextProperties(node),
        ancestors[0] ?? null,
        {
          ancestors: ancestors.slice(1),
          root,
        },
        location
      );

      return null;
    }

    const type = getElementType(node);
    const element = type ? schema.elements.byType.get(type) : null;

    if (!element) {
      if (schema.unknown === 'reject') {
        throw createEditorSchemaValidationError(
          'unknown-element',
          `Unknown editor element type "${type ?? 'missing'}" at [${path}].`,
          location
        );
      }

      return null;
    }

    canonicalizeDeclarativePropertyRecord(
      node,
      schema,
      'element',
      toCompiledTargetContext(getDefined(type), { ancestors, root }),
      new Set([
        'children',
        'type',
        ...(element.contentRoots.size > 0 ? ['childRoots'] : []),
      ]),
      false,
      openAncestorBoundary,
      location
    );

    return element;
  };

  const validateDeclarativeChildren = (
    children: readonly Descendant[],
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[],
    parentPath: readonly number[],
    openAncestorBoundary = false,
    validated?: (node: Descendant) => boolean
  ): void => {
    children.forEach((node, index) => {
      if (validated?.(node)) return;
      const path = [...parentPath, index];

      const element = validateDeclarativeNodeProperties(
        node,
        schema,
        root,
        ancestors,
        path,
        openAncestorBoundary
      );

      if (NodeApi.isText(node)) return;

      const type = getElementType(node);
      const location = toSchemaValidationLocation(
        root,
        path,
        type ?? undefined,
        ancestors
      );

      const content = element?.content;

      if (content) {
        if (node.children.length < content.min) {
          throw createEditorSchemaValidationError(
            'invalid-content',
            `Editor element "${type}" at [${path}] requires at least ${content.min} children.`,
            location
          );
        }
        if (content.max !== null && node.children.length > content.max) {
          throw createEditorSchemaValidationError(
            'invalid-content',
            `Editor element "${type}" at [${path}] allows at most ${content.max} children.`,
            location
          );
        }
        for (const [childIndex, child] of node.children.entries()) {
          const childType = NodeApi.isText(child)
            ? null
            : getElementType(child);
          const allowed = contentAllowsAt(schema, content, child, childIndex, {
            ancestors: [node, ...ancestors],
            root,
          });

          if (!allowed) {
            throw createEditorSchemaValidationError(
              'invalid-content',
              `Editor element "${type}" at [${path}] cannot contain "${
                NodeApi.isText(child) ? 'text' : (childType ?? 'element')
              }".`,
              toSchemaValidationLocation(
                root,
                [...path, childIndex],
                getValidationNodeType(child),
                [node, ...ancestors]
              )
            );
          }
        }
      }

      validateDeclarativeChildren(
        node.children,
        schema,
        root,
        [node, ...ancestors],
        path,
        openAncestorBoundary
      );
    });
  };

  const validateFragmentContents = (
    children: readonly Descendant[],
    root: RootKey = 'main'
  ) => {
    const declarative = getDeclarativeSchema();

    if (declarative) {
      validateDeclarativeChildren(children, declarative, root, [], [], true);
    }
  };
  const assertSchemaJsonValue = (
    value: unknown,
    label: string,
    location: EditorSchemaValidationLocation
  ) => {
    try {
      assertEditorJsonValue(value, label);
    } catch (error) {
      throw createEditorSchemaValidationError(
        'invalid-json',
        error instanceof Error
          ? error.message
          : `${label} must encode to JSON-compatible data.`,
        location,
        { cause: error }
      );
    }
  };
  const assertFragment: EditorStateSchemaApi<V>['assertFragment'] = (
    input: unknown
  ): asserts input is ReadonlyArray<DescendantIn<V>> => {
    const location = toSchemaValidationLocation('main', []);

    assertSchemaJsonValue(input, 'Editor document fragment', location);
    if (!Array.isArray(input)) {
      throw createEditorSchemaValidationError(
        'invalid-json',
        'Editor document fragment must be an array.',
        location
      );
    }
    const children = input as readonly Descendant[];

    validateFragmentContents(children);
  };

  const validateSliceVocabulary = (children: readonly Descendant[]) => {
    const declarative = getDeclarativeSchema();

    if (declarative) {
      const visitDeclarative = (node: Descendant): void => {
        if (NodeApi.isText(node)) {
          for (const [key, value] of Object.entries(getTextProperties(node))) {
            const candidates = getCompiledPropertyCandidates(
              declarative,
              'text',
              key
            );

            if (candidates.length === 0) {
              if (declarative.unknown === 'reject') {
                throw new EditorSchemaValidationError(
                  `Unknown text property "${key}" in closed editor schema.`
                );
              }
              continue;
            }
            if (
              !candidates.some((property) => {
                try {
                  validatePropertyValue(
                    `Editor text property "${key}"`,
                    property.descriptor,
                    value
                  );
                  return true;
                } catch {
                  return false;
                }
              })
            ) {
              throw new EditorSchemaValidationError(
                `Editor text property "${key}" is invalid.`
              );
            }
          }
          return;
        }

        const type = getElementType(node);
        const element = type
          ? declarative.elements.byType.get(type)
          : undefined;

        if (!element && declarative.unknown === 'reject') {
          throw new EditorSchemaValidationError(
            `Unknown editor element type "${type ?? 'missing'}".`
          );
        }
        for (const [key, value] of Object.entries(node)) {
          if (
            key === 'children' ||
            key === 'type' ||
            (key === 'childRoots' && (element?.contentRoots.size ?? 0) > 0)
          ) {
            continue;
          }
          const candidates = getCompiledPropertyCandidates(
            declarative,
            'element',
            key
          );

          if (candidates.length === 0) {
            if (declarative.unknown === 'reject') {
              throw new EditorSchemaValidationError(
                `Unknown editor element property "${key}" on "${
                  type ?? 'missing'
                }" in closed editor schema.`
              );
            }
            continue;
          }
          if (
            !candidates.some((property) => {
              try {
                validatePropertyValue(
                  `Editor element property "${key}"`,
                  property.descriptor,
                  value
                );
                return true;
              } catch {
                return false;
              }
            })
          ) {
            throw new EditorSchemaValidationError(
              `Editor element property "${key}" is invalid.`
            );
          }
        }
        node.children.forEach(visitDeclarative);
      };

      children.forEach(visitDeclarative);
    }
  };

  const assertContentSliceForSchema: InternalEditorSchemaApi<V>['assertContentSliceForSchema'] =
    (input): asserts input is ContentSlice<V> => {
      const slice = ContentSliceValue.fromJSON<V>(input);
      const declarative = getDeclarativeSchema();

      validateSliceVocabulary(slice.content);
      for (const children of Object.values(slice.roots ?? {})) {
        validateSliceVocabulary(children);
      }
      if (!declarative) return;

      const detachedRoots = slice.roots ?? {};
      const reached = new Set<string>();
      const pending: Array<
        Readonly<{ children: readonly Descendant[]; root: RootKey }>
      > = [{ children: slice.content, root: 'main' }];

      while (pending.length > 0) {
        const current = getDefined(pending.shift());

        if (reached.has(current.root)) continue;
        reached.add(current.root);

        const visit = (node: Descendant, path: readonly number[]): void => {
          if (NodeApi.isText(node)) return;
          const type = getElementType(node);
          const element = type
            ? declarative.elements.byType.get(type)
            : undefined;

          if (element && element.contentRoots.size > 0) {
            const { childRoots } = node as { childRoots?: unknown };

            if (
              typeof childRoots !== 'object' ||
              childRoots === null ||
              Array.isArray(childRoots)
            ) {
              throw new EditorSchemaValidationError(
                `Detached content slice element "${type}" at ${current.root}:[${path}] is missing its content-root references.`
              );
            }

            const references = childRoots as Readonly<Record<string, unknown>>;
            const unknownSlot = Object.keys(references).find(
              (slot) => !element.contentRoots.has(slot)
            );

            if (unknownSlot) {
              throw new EditorSchemaValidationError(
                `Detached content slice element "${type}" at ${current.root}:[${path}] has undeclared content-root reference "${unknownSlot}".`
              );
            }

            for (const slot of element.contentRoots.keys()) {
              const childRoot = references[slot];

              if (
                typeof childRoot !== 'string' ||
                childRoot.length === 0 ||
                childRoot === 'main'
              ) {
                throw new EditorSchemaValidationError(
                  `Detached content slice element "${type}" at ${current.root}:[${path}] has an invalid content-root reference for "${slot}".`
                );
              }
              const children = detachedRoots[childRoot];

              if (!children) {
                throw new EditorSchemaValidationError(
                  `Detached content slice is missing referenced root "${childRoot}".`
                );
              }
              pending.push({ children, root: childRoot });
            }
          }

          node.children.forEach((child, index) =>
            visit(child, [...path, index])
          );
        };

        current.children.forEach((node, index) => visit(node, [index]));
      }

      const orphan = Object.keys(detachedRoots).find(
        (root) => !reached.has(root)
      );

      if (orphan) {
        throw new EditorSchemaValidationError(
          `Detached content slice root "${orphan}" is not reachable from its content.`
        );
      }
    };

  const validateDeclarativeRootContent = (
    root: RootKey,
    children: readonly Descendant[],
    content: CompiledSchemaContentProgram,
    schema: CompiledEditorSchema
  ) => {
    if (children.length < content.min) {
      throw createEditorSchemaValidationError(
        'invalid-content',
        `Editor ${editorRootLabel(root)} requires at least ${
          content.min
        } children.`,
        toSchemaValidationLocation(root, [])
      );
    }
    if (content.max !== null && children.length > content.max) {
      throw createEditorSchemaValidationError(
        'invalid-content',
        `Editor ${editorRootLabel(root)} allows at most ${
          content.max
        } children.`,
        toSchemaValidationLocation(root, [])
      );
    }
    for (const [index, child] of children.entries()) {
      const allowed = contentAllowsAt(schema, content, child, index, { root });

      if (!allowed) {
        throw createEditorSchemaValidationError(
          'invalid-content',
          `Editor ${editorRootLabel(root)} cannot contain "${
            NodeApi.isText(child)
              ? 'text'
              : (getElementType(child) ?? 'element')
          }".`,
          toSchemaValidationLocation(
            root,
            [index],
            getValidationNodeType(child)
          )
        );
      }
    }
  };

  const locateElementOwnedRootPath = (
    value: EditorDocumentValue,
    input: ElementOwnedRootBinding | ElementOwnedRootIssue,
    index: ElementOwnedRootIndex
  ) => {
    const children =
      input.ownerRoot === 'main'
        ? value.children
        : (value.roots?.[input.ownerRoot] ?? []);
    const path = resolveElementOwnedRootPath(index, input);
    const owner = path ? getDescendant(children, path) : undefined;
    const matches = owner
      ? matchesElementOwnedRootDeclaration(input, owner)
      : false;

    if (!path || !matches) {
      throw new EditorSchemaValidationError(
        `Element-owned root index provenance for "${input.ownerType}.${
          input.slot ?? 'contentRoots'
        }" is stale.`
      );
    }

    return path;
  };

  const elementOwnedRootLocation = (
    value: EditorDocumentValue,
    input: ElementOwnedRootBinding | ElementOwnedRootIssue,
    index: ElementOwnedRootIndex
  ) =>
    toSchemaValidationLocation(
      input.ownerRoot,
      locateElementOwnedRootPath(value, input, index),
      input.ownerType
    );

  const throwElementOwnedRootIssue = (
    value: EditorDocumentValue,
    issue: ElementOwnedRootIssue,
    index: ElementOwnedRootIndex
  ): never => {
    const location = elementOwnedRootLocation(value, issue, index);

    if (issue.kind === 'missing-content-roots') {
      throw createEditorSchemaValidationError(
        'invalid-root',
        `Editor element "${issue.ownerType}" is missing its declared content roots.`,
        location
      );
    }
    if (issue.kind === 'missing-slot') {
      throw createEditorSchemaValidationError(
        'invalid-root',
        `Editor element "${issue.ownerType}" is missing content root "${issue.slot}".`,
        location
      );
    }
    throw createEditorSchemaValidationError(
      'invalid-root',
      `Editor element "${issue.ownerType}" content root "${issue.slot}" must reference a secondary root key.`,
      location
    );
  };

  const getProjectedRoot = (
    value: EditorDocumentValue,
    schema: CompiledEditorSchema,
    childRoot: string,
    indexes = getDocumentOwnershipIndexes(schema, value)
  ) => {
    let exclusive = false;
    let ownerCount = 0;
    let projection:
      | Readonly<{
          content: CompiledSchemaContentProgram;
          index: ElementOwnedRootIndex;
          owner: ElementOwnedRootBinding;
        }>
      | undefined;

    for (const { index } of indexes) {
      for (const grammar of getElementOwnedRootGrammarBindings(
        index,
        childRoot
      )) {
        exclusive ||= grammar.ownership === 'exclusive';
        ownerCount += grammar.count;
        if (
          projection &&
          !contentProgramsEqual(projection.content, grammar.content)
        ) {
          const previous = elementOwnedRootLocation(
            value,
            projection.owner,
            projection.index
          );
          const conflicting = elementOwnedRootLocation(
            value,
            grammar.owner,
            index
          );

          throw createEditorSchemaValidationError(
            'invalid-root',
            `Editor root "${childRoot}" has conflicting projected content grammars from ${editorRootLabel(
              projection.owner.ownerRoot
            )}:[${previous.path}] "${projection.owner.ownerType}.${
              projection.owner.slot
            }" and ${editorRootLabel(grammar.owner.ownerRoot)}:[${
              conflicting.path
            }] "${grammar.owner.ownerType}.${grammar.owner.slot}".`,
            conflicting
          );
        }
        projection ??= Object.freeze({
          content: grammar.content,
          index,
          owner: grammar.owner,
        });
      }
    }

    if (exclusive && ownerCount !== 1 && projection) {
      const location = elementOwnedRootLocation(
        value,
        projection.owner,
        projection.index
      );

      throw createEditorSchemaValidationError(
        'invalid-root',
        `Exclusive editor content root "${childRoot}" must have exactly one owner; received ${ownerCount}.`,
        location
      );
    }

    return projection;
  };

  const validateDeclarativeDocument = (
    value: EditorDocumentValue,
    schema: CompiledEditorSchema
  ) => {
    const roots: Record<string, readonly Descendant[]> = {
      main: value.children,
      ...value.roots,
    };
    // Element-owned roots validate across owners, so their nodes are not reused.
    const reuseRootNodes = !hasContentRoots();
    const ownershipIndexes = hasContentRoots()
      ? getDocumentOwnershipIndexes(schema, value)
      : [];
    const projectedRoots = new Map<
      string,
      Readonly<{
        content: CompiledSchemaContentProgram;
        location: EditorSchemaValidationLocation;
      }>
    >();
    const projectedRootKeys = new Set<string>();

    for (const { index } of ownershipIndexes) {
      const issue = getElementOwnedRootIssues(index)[0];

      if (issue) throwElementOwnedRootIssue(value, issue, index);
      for (const childRoot of getElementOwnedRootKeys(index)) {
        projectedRootKeys.add(childRoot);
      }
    }
    for (const childRoot of projectedRootKeys) {
      const projection = getProjectedRoot(
        value,
        schema,
        childRoot,
        ownershipIndexes
      );

      if (projection) {
        projectedRoots.set(childRoot, {
          content: projection.content,
          location: elementOwnedRootLocation(
            value,
            projection.owner,
            projection.index
          ),
        });
      }
    }

    for (const [name, root] of schema.roots) {
      if (!Object.hasOwn(roots, name) && root.content.min > 0) {
        throw createEditorSchemaValidationError(
          'invalid-root',
          `Editor root "${name}" is missing from the document.`,
          toSchemaValidationLocation(name, [])
        );
      }
    }
    for (const [root, projection] of projectedRoots) {
      if (!Object.hasOwn(roots, root)) {
        throw createEditorSchemaValidationError(
          'invalid-root',
          `Editor content root "${root}" is missing from the document.`,
          projection.location
        );
      }
      if (schema.roots.has(root)) {
        throw createEditorSchemaValidationError(
          'invalid-root',
          `Editor root "${root}" cannot be both named and element-owned.`,
          projection.location
        );
      }
    }

    for (const [root, children] of Object.entries(roots)) {
      const content =
        getDeclarativeRootProgram(schema, root) ??
        projectedRoots.get(root)?.content;

      if (content === undefined && schema.unknown === 'reject') {
        throw createEditorSchemaValidationError(
          'invalid-root',
          `Undeclared editor root "${root}" in closed editor schema.`,
          toSchemaValidationLocation(root, [])
        );
      }
      const validated = reuseRootNodes
        ? VALIDATED_ROOT_NODES.get(schema)
        : undefined;

      validateDeclarativeChildren(
        children,
        schema,
        root,
        [],
        [],
        false,
        validated ? (node) => validated.get(node) === root : undefined
      );
      if (content) {
        validateDeclarativeRootContent(root, children, content, schema);
      }
    }
  };

  const documentRoots = (value: EditorDocumentValue) => {
    const roots: Record<string, DocumentIndex> = {
      main: rootIndexOf(value, 'children'),
    };

    for (const [root, children] of Object.entries(value.roots ?? {})) {
      roots[root] = DocumentIndex.fromValue(children);
    }

    return roots;
  };
  const rememberValidatedDocumentRoots = (
    value: EditorDocumentValue,
    schema?: CompiledEditorSchema | null
  ) => {
    const authority = getValidationAuthority();

    for (const [root, document] of Object.entries(documentRoots(value))) {
      if (
        isRootValidatedBy(document, authority) ||
        (isImmutable(document.value) &&
          (document.value as readonly Descendant[]).every((node) =>
            isDeepFrozenNode(node)
          ))
      ) {
        markRootValidatedBy(document, authority);
        if (schema && hasContentRoots()) {
          sealElementOwnedRootIndex(schema, root, document);
        }
      }
    }
  };

  const assertDocument: EditorStateSchemaApi<V>['assertDocument'] = (
    input: unknown
  ): asserts input is EditorDocumentValue<V> => {
    profileCoreDuration('schema-validation-full-document-boundary', () => {
      const location = toSchemaValidationLocation('main', []);
      const rejectShape = (issue: EditorDocumentShapeIssue): never => {
        const root = issue.kind === 'root' ? issue.root : 'main';

        throw createEditorSchemaValidationError(
          issue.kind === 'field'
            ? 'invalid-document'
            : issue.kind === 'root' ||
                issue.kind === 'roots' ||
                issue.kind === 'primary-root'
              ? 'invalid-root'
              : 'invalid-json',
          getEditorDocumentShapeIssueMessage(issue),
          toSchemaValidationLocation(root, [])
        );
      };
      const value = readEditorDocument(input, rejectShape, (record) =>
        assertSchemaJsonValue(record, 'Editor document value', location)
      ) as EditorDocumentValue<V>;

      const declarative = getDeclarativeSchema();

      if (declarative) {
        assertDeclaredRecordSets(
          Object.keys(getValueRecords(value)),
          declarative
        );
        validateDeclarativeDocument(value, declarative);
        if (!hasContentRoots()) {
          let validated = VALIDATED_ROOT_NODES.get(declarative);

          if (!validated) {
            validated = new WeakMap();
            VALIDATED_ROOT_NODES.set(declarative, validated);
          }
          for (const [root, document] of Object.entries(documentRoots(value))) {
            for (const node of document.value) {
              // Owned JSON values are deeply frozen.
              if (isOwnedJsonValue(node)) validated.set(node, root);
            }
          }
        }
      }

      rememberValidatedDocumentRoots(value, declarative);
    });
  };

  const checkDocumentChange = ({
    after,
    before,
    change,
    indexedAfter,
    indexedBefore,
  }: DocumentChangeValidationInput) => {
    const beforeRoots = documentRoots(before);
    const checked: DocumentIndex[] = [];

    if (after.roots && Object.hasOwn(after.roots, 'main')) {
      throw new EditorSchemaValidationError(
        'Editor document roots cannot redefine the primary root; use children.'
      );
    }

    const schema = getDeclarativeSchema();
    profileCoreDuration('schema-validation-incremental-hit', () => undefined);
    if (schema) {
      assertDeclaredRecordSets(
        getInternalDocumentChangeRecords(change).keys(),
        schema
      );
    }

    const afterRoots = documentRoots(after);
    const changedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
      ...change.createRoots,
      ...change.deleteRoots,
    ]);
    const touchedRoots = new Set(changedRoots);
    const ownershipIndexes: Array<
      Readonly<{
        index: ElementOwnedRootIndex;
        root: RootKey;
      }>
    > = [];

    if (schema && hasContentRoots()) {
      const dirtyChildRoots = new Set<string>();
      const dirtyIssues: Array<
        Readonly<{
          index: ElementOwnedRootIndex;
          issue: ElementOwnedRootIssue;
          root: string;
        }>
      > = [];

      for (const [root, document] of Object.entries(afterRoots)) {
        const afterDocument = indexedAfter.get(root) ?? document;
        const beforeDocument =
          indexedBefore.get(root) ??
          beforeRoots[root] ??
          emptyIndexedDocument();
        const rootChange = getInternalDocumentRootChange(change, root);
        const index = touchedRoots.has(root)
          ? rebaseElementOwnedRootIndex(
              schema,
              root,
              rootChange,
              beforeDocument,
              afterDocument
            )
          : ensureElementOwnedRootIndex(schema, root, afterDocument);

        ownershipIndexes.push({ index, root });
        const childRoots =
          index.validation === 'full'
            ? getElementOwnedRootKeys(index)
            : index.dirtyChildRoots;

        for (const childRoot of childRoots) {
          dirtyChildRoots.add(childRoot);
        }
        dirtyIssues.push(
          ...(index.validation === 'full'
            ? getElementOwnedRootIssues(index)
            : getDirtyElementOwnedRootIssues(index)
          ).map((issue) => ({ index, issue, root }))
        );
      }
      for (const root of change.deleteRoots) {
        const beforeDocument =
          indexedBefore.get(root) ??
          beforeRoots[root] ??
          emptyIndexedDocument();
        const index = rebaseElementOwnedRootIndex(
          schema,
          root,
          getInternalDocumentRootChange(change, root),
          beforeDocument,
          emptyIndexedDocument()
        );

        const childRoots =
          index.validation === 'full'
            ? getElementOwnedRootKeys(index)
            : index.dirtyChildRoots;

        for (const childRoot of childRoots) {
          dirtyChildRoots.add(childRoot);
        }
        dirtyIssues.push(
          ...(index.validation === 'full'
            ? getElementOwnedRootIssues(index)
            : getDirtyElementOwnedRootIssues(index)
          ).map((issue) => ({ index, issue, root }))
        );
      }

      const baselineHasIssue = (root: string, issue: ElementOwnedRootIssue) =>
        !!beforeRoots[root] &&
        getElementOwnedRootIssues(
          ensureElementOwnedRootIndex(
            schema,
            root,
            indexedBefore.get(root) ?? beforeRoots[root]
          )
        ).some(
          (known) =>
            known.owner === issue.owner &&
            known.kind === issue.kind &&
            known.slot === issue.slot
        );
      const introduced = dirtyIssues.find(
        ({ issue, root }) => !baselineHasIssue(root, issue)
      );

      if (introduced) {
        throwElementOwnedRootIssue(after, introduced.issue, introduced.index);
      }
      const ownershipRoots = new Set([
        ...dirtyChildRoots,
        ...change.createRoots,
        ...change.deleteRoots,
      ]);
      const checkOwnedRoot = (
        value: EditorDocumentValue,
        roots: typeof afterRoots,
        root: string,
        indexes?: typeof ownershipIndexes
      ) => {
        const projection = getProjectedRoot(value, schema, root, indexes);

        if (projection) {
          const location = elementOwnedRootLocation(
            value,
            projection.owner,
            projection.index
          );

          if (!Object.hasOwn(roots, root)) {
            throw createEditorSchemaValidationError(
              'invalid-root',
              `Editor content root "${root}" is missing from the document.`,
              location
            );
          }
          if (schema.roots.has(root)) {
            throw createEditorSchemaValidationError(
              'invalid-root',
              `Editor root "${root}" cannot be both named and element-owned.`,
              location
            );
          }

          return true;
        }
        if (
          Object.hasOwn(roots, root) &&
          !schema.roots.has(root) &&
          schema.unknown === 'reject'
        ) {
          throw createEditorSchemaValidationError(
            'invalid-root',
            `Undeclared editor root "${root}" in closed editor schema.`,
            toSchemaValidationLocation(root, [])
          );
        }

        return false;
      };
      const baselineHasRootError = (root: string) => {
        try {
          checkOwnedRoot(before, beforeRoots, root);

          return false;
        } catch (error) {
          if (error instanceof EditorSchemaValidationError) return true;
          throw error;
        }
      };

      for (const root of ownershipRoots) {
        if (root === 'main') continue;
        try {
          if (checkOwnedRoot(after, afterRoots, root, ownershipIndexes)) {
            touchedRoots.add(root);
          }
        } catch (error) {
          if (
            !(error instanceof EditorSchemaValidationError) ||
            !baselineHasRootError(root)
          ) {
            throw error;
          }
        }
      }
    }
    const pathId = (path: readonly number[]) => JSON.stringify(path);
    const assertOwnJsonProperties = (
      node: Descendant,
      root: string,
      path: readonly number[]
    ) => {
      if (!Object.isFrozen(node)) {
        throw new EditorSchemaValidationError(
          `Changed editor node at ${root}:[${path}] must be immutable.`
        );
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'children' || key === 'text') continue;
        assertEditorJsonValue(
          value,
          `Editor node property "${key}" at ${root}:[${path}]`
        );
      }
    };
    const validateContentIndexes = (
      children: NodeList<Descendant>,
      content: CompiledSchemaContentProgram,
      indexes: ReadonlySet<number>,
      owner: string,
      options: RuntimeTargetOptions
    ) => {
      if (children.length < content.min) {
        throw new EditorSchemaValidationError(
          `${owner} requires at least ${content.min} children.`
        );
      }
      if (content.max !== null && children.length > content.max) {
        throw new EditorSchemaValidationError(
          `${owner} allows at most ${content.max} children.`
        );
      }
      for (const index of indexes) {
        const child = children.at(index);

        if (
          !child ||
          !schema ||
          contentAllowsAt(schema, content, child, index, options)
        ) {
          continue;
        }
        throw new EditorSchemaValidationError(
          `${owner} cannot contain "${
            NodeApi.isText(child)
              ? 'text'
              : (getElementType(child) ?? 'element')
          }".`
        );
      }
    };

    if (schema) {
      for (const [name, root] of schema.roots) {
        if (!Object.hasOwn(afterRoots, name) && root.content.min > 0) {
          throw new EditorSchemaValidationError(
            `Editor root "${name}" is missing from the document.`
          );
        }
      }
    }

    for (const root of touchedRoots) {
      if (change.deleteRoots.has(root)) continue;
      const document = afterRoots[root];

      if (!document) {
        throw new EditorSchemaValidationError(
          `Changed editor root "${root}" is missing from the document.`
        );
      }
      const afterDocument =
        indexedAfter.get(root) ??
        (changedRoots.has(root) ? undefined : document);

      if (!afterDocument || afterDocument !== document) {
        throw new EditorSchemaValidationError(
          `Changed editor root "${root}" lost its immutable construction index.`
        );
      }

      const children = rootNodes(afterDocument);
      const beforeDocument =
        indexedBefore.get(root) ?? beforeRoots[root] ?? emptyIndexedDocument();
      const rootChange = getInternalDocumentRootChange(change, root);
      const ownPaths = new Map<string, readonly number[]>();
      const recursivePaths = new Map<string, readonly number[]>();
      const parentIndexes = new Map<
        string,
        { indexes: Set<number>; path: readonly number[] }
      >();
      const addParentIndex = (path: readonly number[], index?: number) => {
        const key = pathId(path);
        const entry = parentIndexes.get(key) ?? {
          indexes: new Set<number>(),
          path: Object.freeze([...path]),
        };

        if (index !== undefined && index >= 0) entry.indexes.add(index);
        parentIndexes.set(key, entry);
        if (path.length > 0) ownPaths.set(key, entry.path);
      };
      const addOwnPath = (path: readonly number[]) => {
        ownPaths.set(pathId(path), Object.freeze([...path]));
        const index = path.at(-1);

        if (index !== undefined) addParentIndex(path.slice(0, -1), index);
      };

      profileCoreDuration('schema-validation-window-discovery', () =>
        rootChange?.iterChangedRanges(
          (fromBefore, toBefore, fromAfter, toAfter) => {
            for (const entry of afterDocument.nodeRangesTouching(
              fromAfter,
              toAfter
            )) {
              addOwnPath(entry.path);
              if (entry.from >= fromAfter && entry.to <= toAfter) {
                recursivePaths.set(pathId(entry.path), entry.path);
              }
            }

            for (const position of [fromAfter, toAfter]) {
              const boundary = afterDocument.childBoundaryAt(position);

              if (boundary) addParentIndex(boundary.parentPath);
            }

            const beforeEntry = beforeDocument.nodeStartingAt(fromBefore);
            const afterEntry = afterDocument.nodeStartingAt(fromAfter);

            if (
              beforeEntry &&
              afterEntry &&
              toBefore === fromBefore + 1 &&
              toAfter === fromAfter + 1
            ) {
              const previous = beforeDocument.node(beforeEntry.path);
              const next = afterDocument.node(afterEntry.path);

              if (
                ElementApi.isElement(previous) &&
                ElementApi.isElement(next) &&
                getElementType(previous) !== getElementType(next)
              ) {
                recursivePaths.set(pathId(afterEntry.path), afterEntry.path);
              }
            }
          }
        )
      );

      const moved = profileCoreDuration(
        'schema-validation-move-detection',
        () => rootChange?.movedNode(beforeDocument)
      );

      if (moved) {
        recursivePaths.set(pathId(moved.targetPath), moved.targetPath);
        addOwnPath(moved.targetPath);
      }

      type RecursivePathIndex = {
        children: Map<number, RecursivePathIndex>;
        terminal: boolean;
      };
      const recursiveIndex: RecursivePathIndex = {
        children: new Map(),
        terminal: false,
      };
      const isRecursivelyValidated = (path: readonly number[]) => {
        let entry = recursiveIndex;

        if (entry.terminal) return true;
        for (const part of path) {
          const child = entry.children.get(part);

          if (!child) return false;
          entry = child;
          if (entry.terminal) return true;
        }

        return false;
      };
      const indexRecursivePath = (path: readonly number[]) => {
        let entry = recursiveIndex;

        for (const part of path) {
          let child = entry.children.get(part);

          if (!child) {
            child = { children: new Map(), terminal: false };
            entry.children.set(part, child);
          }
          entry = child;
        }
        entry.terminal = true;
      };
      const recursive: Array<readonly number[]> = [];

      for (const path of [...recursivePaths.values()].sort(
        (left, right) => left.length - right.length
      )) {
        if (isRecursivelyValidated(path)) continue;
        indexRecursivePath(path);
        recursive.push(path);
      }
      const validateSubtree = (
        node: Descendant,
        path: readonly number[],
        ancestors: readonly Element[]
      ): void => {
        if (!Object.isFrozen(node)) {
          throw new EditorSchemaValidationError(
            `Changed editor node at ${root}:[${path}] must be immutable.`
          );
        }
        assertEditorJsonValue(node, `Changed editor node at ${root}:[${path}]`);
        if (!schema) return;
        const element = validateDeclarativeNodeProperties(
          node,
          schema,
          root,
          ancestors,
          path
        );

        if (NodeApi.isText(node)) return;
        if (!Object.isFrozen(node.children)) {
          throw new EditorSchemaValidationError(
            `Changed editor children at ${root}:[${path}] must be immutable.`
          );
        }
        if (element?.content) {
          validateContentIndexes(
            node.children,
            element.content,
            new Set(node.children.map((_child, index) => index)),
            `Editor element "${node.type}" at [${path}]`,
            { ancestors: [node, ...ancestors], root }
          );
        }
        node.children.forEach((child, index) => {
          validateSubtree(child, [...path, index], [node, ...ancestors]);
        });
      };

      for (const path of recursive) {
        const node = getDescendant(children, path);

        if (!node) {
          throw new EditorSchemaValidationError(
            `Cannot validate changed editor node at ${root}:[${path}].`
          );
        }
        validateSubtree(node, path, getElementAncestors(children, path));
      }

      for (const path of ownPaths.values()) {
        if (isRecursivelyValidated(path)) continue;
        const node = getDescendant(children, path);

        if (!node) continue;
        assertOwnJsonProperties(node, root, path);
        if (schema) {
          validateDeclarativeNodeProperties(
            node,
            schema,
            root,
            getElementAncestors(children, path),
            path
          );
        }
      }

      for (const { indexes, path } of parentIndexes.values()) {
        const parent = path.length === 0 ? null : getDescendant(children, path);
        const content =
          path.length === 0
            ? schema
              ? getDocumentRootProgram(schema, root, after)
              : null
            : schema && ElementApi.isElement(parent)
              ? schema.elements.byType.get(getElementType(parent) ?? '')
                  ?.content
              : null;

        if (path.length === 0 && schema && !content) {
          if (schema.unknown === 'reject') {
            throw new EditorSchemaValidationError(
              `Undeclared editor root "${root}" in closed editor schema.`
            );
          }
          continue;
        }
        if (!content) continue;
        const parentChildren =
          path.length === 0
            ? children
            : ElementApi.isElement(parent)
              ? parent.children
              : [];

        validateContentIndexes(
          parentChildren,
          content,
          indexes,
          path.length === 0
            ? `Editor ${editorRootLabel(root)}`
            : `Editor element "${(parent as Element).type}" at [${path}]`,
          {
            ancestors:
              parent && ElementApi.isElement(parent)
                ? [parent, ...getElementAncestors(children, path)]
                : [],
            root,
          }
        );
      }

      checked.push(afterDocument);
    }

    return { afterRoots, checked, schema, touchedRoots };
  };
  const validateDocumentChange: InternalEditorSchemaApi['validateDocumentChange'] =
    (input) => {
      const authority = getValidationAuthority();
      const unvalidatedRoot = Object.entries(documentRoots(input.before)).find(
        ([, document]) => !isRootValidatedBy(document, authority)
      )?.[0];

      if (unvalidatedRoot) {
        throw new Error(
          `Incremental schema validation requires an explicitly validated immutable baseline for ${editorRootLabel(
            unvalidatedRoot
          )}. Call assertDocument() at the external document boundary before constructing changes.`
        );
      }

      const { afterRoots, checked, schema, touchedRoots } =
        checkDocumentChange(input);

      for (const document of checked) markRootValidatedBy(document, authority);
      for (const [root, document] of Object.entries(afterRoots)) {
        if (
          !isRootValidatedBy(document, authority) &&
          !touchedRoots.has(root)
        ) {
          throw new EditorSchemaValidationError(
            `Unchanged editor root "${root}" lost validation authority.`
          );
        }
      }
      if (schema) {
        for (const [root, document] of Object.entries(afterRoots)) {
          sealElementOwnedRootIndex(schema, root, document);
        }
      }
    };

  const api: InternalEditorSchemaApi<V> = Object.freeze({
    adoptDocumentBaseline: (value) => {
      rememberValidatedDocumentRoots(value, getDeclarativeSchema());
    },
    allowsElementType,
    canContain,
    canContainAt,
    canContainAtRoot,
    canPlaceAt,
    canPlaceAtPath,
    canWrap,
    canonicalizeTextPropertiesAt,
    canonicalizeTextPropertiesIn,
    canonicalizeChildren,
    copyChildren,
    copyNodeAt,
    elementPropertiesForResetAt,
    placeElementAt: placeDerivedElement,
    elementPropertiesForSplitAt,
    elementSplitKeepsAt,
    elementForTypeChangeAt,
    elementPropertyLanding,
    assertContentSliceForSchema,
    assertDocument,
    assertFragment,
    create,
    copy: (node, options) =>
      copyNodeAt(node, options.at, options.root ?? 'main') as typeof node,
    createAt,
    createDefaultChild,
    emptyTextKeeps,
    fitReportSink,
    delta: () => getRegistry().schemaContributions.delta,
    element: getPublicElement,
    fit,
    fitContent,
    fitDocument,
    fitDocumentWithReport,
    fitDocumentWithSelection,
    findWrapping,
    getElementBehavior,
    getElementContent,
    getElementContentRoots,
    getOrphanedElementOwnedRoots,
    getElementOwnedRoots,
    getProperty,
    getElementSlicePolicy,
    getRootContent,
    indexConstructedRoot,
    getTextPropertyAt,
    getVocabulary,
    hasContentRoots,
    identity: () => getRegistry().schemaContributions.compiled.identity,
    isAtom: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).atom,
    isBlock: (element: Node) =>
      ElementApi.isElement(element) && !getElementBehavior(element).inline,
    isElementTypeInGroup,
    isSetValuedProperty,
    isTextPropertyAllowedAt,
    isTextPropertyEqualAt,
    isInline: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).inline,
    isIsolating: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).isolating,
    isObject: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).object,
    isReadOnly: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).readOnly,
    isSelectable: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).selectable,
    isVoid: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).void,
    isMarkableVoid: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).markableVoid,
    property: getPublicProperty,
    mergeTextPropertyAt,
    textPropertiesForSplitAt,
    tryCreateDefaultChild,
    validateDocumentChange,
    checkDocumentChange,
    validateTextPropertiesAtValue,
  });

  COMPILED_SCHEMA_BY_API.set(api, getDeclarativeSchema);
  INTERNAL_BY_API.set(api, api);

  return api;
};

/** Create immutable schema authority that cannot read or retain a live editor. @internal */
export const createDetachedEditorSchema = <V extends Value = Value>(
  schema: CompiledEditorSchema,
  document?: EditorDocumentValue<V>
): InternalEditorSchemaApi<V> => {
  const registry = {
    schemaContributions: { compiled: schema },
    schemaRevision: schema.revision,
  } as PluginRegistry<any>;

  return createEditorSchema<V>(
    () => {
      throw new Error('Detached editor schema cannot read a live editor.');
    },
    () => registry,
    () => {
      if (document) return document;

      throw new Error(
        'Detached editor schema requires an explicit document for document-relative operations.'
      );
    }
  );
};
