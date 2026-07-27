import type {
  Descendant,
  Editor,
  ContentSlice,
  EditorDocumentValue,
  EditorElementBehavior,
  EditorSchemaVocabulary,
  EditorSchemaElement,
  EditorSchemaProperty,
  EditorSchemaPropertyHandle,
  EditorSchemaPropertyQuery,
  EditorStateSchemaApi,
  Element,
  NamedRootKey,
  Node,
  Path,
  RootKey,
  Text,
  Value,
} from '../interfaces';
import { ElementApi, NodeApi } from '../interfaces';
import type {
  PropertyJsonValue,
  PropertyValueDescriptor,
  SchemaTarget,
} from '../interfaces/schema';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { RootChange, DocumentPropertyContext } from './change/root-change';
import type { JsonNode } from './change/tokens';
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
import {
  getExtensionRegistry,
  type ExtensionRegistry,
} from './extension-registry';
import { cloneFrozen } from './clone';
import { assertEditorJsonValue, snapshotEditorJsonValue } from './value-codec';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
  CompiledSchemaProperty,
  CompiledSchemaTargetContext,
} from './schema-compiler';
import {
  getCompiledSchemaPropertyId,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
} from './schema-compiler';
import {
  createCompiledSliceFitterDelegate,
  type InternalSliceFitOptions,
  type SliceFitRuntimeTargetOptions,
} from './slice-fit/compiled-slice-fitter';
import {
  createEditorSchemaValidationError,
  EditorSchemaValidationError,
  type EditorSchemaValidationLocation,
} from './schema-validation';
import { profileCoreDuration } from './profiling';

type RuntimeSchemaElementPropertyHandle = Readonly<{
  element: Readonly<{ type: string }>;
  key: string;
  kind: 'schema-element-property';
}>;

/** @internal Schema implementation used only by the slice transaction owner. */
export type InternalEditorSchemaApi<V extends Value = Value> =
  EditorStateSchemaApi<V> & {
    canonicalizeChildren: (
      children: readonly Descendant[],
      root: RootKey,
      ancestors: readonly Element[],
      dropMisplaced: boolean
    ) => readonly Descendant[];
    elementPropertiesForSplitAt: (
      element: Element,
      path: Path,
      root?: RootKey
    ) => Readonly<Record<string, unknown>>;
    elementPropertiesForTypeChangeAt: (
      element: Element,
      to: Element,
      path: Path,
      root?: RootKey
    ) => Readonly<Record<string, unknown>>;
    fit: (slice: ContentSlice, options: InternalSliceFitOptions) => boolean;
    fitContent: (
      slice: ContentSlice,
      options: Readonly<{ parent: Element; root?: RootKey }>
    ) => readonly Descendant[] | null;
    getElementContent: (type: string) => CompiledSchemaContentProgram | null;
    getElementOwnedRoots: (element: Element) => readonly Readonly<{
      ownership: import('../interfaces/schema').SchemaContentRootOwnership;
      root: NamedRootKey;
      slot: string;
    }>[];
    getOrphanedElementOwnedRoots: (
      input: Readonly<{
        after: EditorDocumentValue;
        before: EditorDocumentValue;
        change: DocumentChange;
        indexedAfter: ReadonlyMap<string, DocumentIndex>;
        tracked: ReadonlySet<string>;
      }>
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
    textPropertiesForTypeChangeAt: (
      text: Text,
      from: Element,
      to: Element,
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
    validateDocumentChange: (
      input: Readonly<{
        after: EditorDocumentValue;
        before: EditorDocumentValue;
        change: DocumentChange;
        indexedAfter: ReadonlyMap<string, DocumentIndex>;
        indexedBefore: ReadonlyMap<string, DocumentIndex>;
      }>
    ) => void;
  };

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
) =>
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
    structurallyEqual(left.defaultPlan, right.defaultPlan));

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

const canonicalPropertyKey = (value: unknown) =>
  JSON.stringify(snapshotEditorJsonValue(value, 'Schema property value'));

const canonicalizePropertyValue = (
  owner: string,
  descriptor: PropertyValueDescriptor,
  value: unknown
): PropertyJsonValue => {
  let canonical: PropertyJsonValue;

  if (descriptor.kind === 'set') {
    if (!Array.isArray(value)) {
      throw new EditorSchemaValidationError(`${owner} must be an array.`);
    }

    const items = new Map<string, PropertyJsonValue>();

    const itemDescriptor = (
      descriptor as PropertyValueDescriptor & {
        item: PropertyValueDescriptor;
      }
    ).item;

    for (const item of value) {
      const next = canonicalizePropertyValue(owner, itemDescriptor, item);

      items.set(canonicalPropertyKey(next), next);
    }

    canonical = Object.freeze(
      [...items]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, item]) => item)
    );
  } else {
    try {
      canonical = snapshotEditorJsonValue(value, owner) as PropertyJsonValue;
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
    current: PropertyJsonValue
  ): void => {
    if (currentDescriptor.kind === 'set') {
      const itemDescriptor = (
        currentDescriptor as PropertyValueDescriptor & {
          item: PropertyValueDescriptor;
        }
      ).item;

      for (const item of current as readonly PropertyJsonValue[]) {
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

const getOwnElementProperty = (element: Element, property: string) => {
  if (!Object.hasOwn(element, property)) return;

  return (element as unknown as Record<string, unknown>)[property];
};

const getDocumentRoot = (value: EditorDocumentValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const editorRootLabel = (root: string) =>
  root === 'main' ? 'primary root' : `root "${root}"`;

const getDescendant = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = descendants[index];
    if (!node) return null;
    descendants = ElementApi.isElement(node) ? node.children : [];
  }

  return node ?? null;
};

const getElementAncestors = (
  children: readonly Descendant[],
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
const VALIDATED_DOCUMENT_ROOTS = new WeakMap<object, string>();
const EMPTY_INDEXED_DOCUMENT = DocumentIndex.fromValue(
  Object.freeze([]) as readonly JsonNode[]
);

/** @internal Resolve the exact compiled artifact behind a candidate schema API. */
export const getCompiledEditorSchemaFromApi = (
  schemaApi: EditorStateSchemaApi<any>
) => COMPILED_SCHEMA_BY_API.get(schemaApi)?.() ?? null;

export const createEditorSchema = <V extends Value = Value>(
  getEditor: () => Editor<V, any>,
  getRegistry: () => ExtensionRegistry<any> = () =>
    getExtensionRegistry(getEditor())
): InternalEditorSchemaApi<V> => {
  const getDeclarativeSchema = () => {
    const registry = getRegistry().schemaContributions;

    return registry.compiled;
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
            ? Object.freeze({ type: content.defaultPlan.type })
            : null,
      max: content.max,
      min: content.min,
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
      lifecycle: property.lifecycle,
      merge: property.merge,
      placement: property.placement,
      target: property.target,
      value: property.descriptor,
    });

    publicPropertyViews.set(property.id, value);

    return value;
  };

  const getPublicProperty = (
    input:
      | EditorSchemaPropertyHandle
      | EditorSchemaPropertyQuery
      | RuntimeSchemaElementPropertyHandle
  ): EditorSchemaProperty | null => {
    const schema = getDeclarativeSchema();

    if (!schema) return null;
    if (!('key' in input)) {
      const property = schema.properties.byId.get(input.id);

      return property ? toPublicProperty(property) : null;
    }
    if ('kind' in input) {
      const property = schema.properties.byId.get(
        getCompiledSchemaPropertyId({
          key: input.key,
          placement: 'element',
          target: Object.freeze({
            kind: 'type',
            type: input.element.type,
          }),
        })
      );

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
        ? candidates[0]!
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
  ): readonly Readonly<{
    index: ElementOwnedRootIndex;
    root: RootKey;
  }>[] =>
    Object.freeze(
      Object.entries({
        main: value.children,
        ...(value.roots ?? {}),
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
  ): readonly Readonly<{
    index: ElementOwnedRootIndex;
    root: RootKey;
  }>[] => {
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
        DocumentIndex.fromValue(children as readonly JsonNode[])
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
      case 'type':
        return context.type === target.type;
      case 'types':
        return target.types.includes(context.type);
      case 'group':
        return (
          schema.elements.groups.get(target.group)?.has(context.type) ?? false
        );
      case 'root':
        return context.root === target.root;
      case 'parent': {
        const [parent, ...ancestors] = context.ancestors ?? [];

        return parent
          ? matchesTargetWithOpenAncestorBoundary(schema, target.target, {
              ancestors,
              root: context.root,
              type: parent,
            })
          : 'unknown';
      }
      case 'not': {
        const result = matchesTargetWithOpenAncestorBoundary(
          schema,
          target.target,
          context
        );

        return result === 'unknown' ? result : !result;
      }
      case 'and': {
        let unknown = false;

        for (const child of target.targets) {
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
        let unknown = false;

        for (const child of target.targets) {
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
  };

  const DEFAULT_ELEMENT_BEHAVIOR: EditorElementBehavior = Object.freeze({
    atom: false,
    editableIsland: false,
    inline: false,
    isolating: false,
    keyboardSelectable: false,
    markableVoid: false,
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
    value?: EditorDocumentValue
  ) => {
    const schema = getDeclarativeSchema();

    return schema
      ? (getDocumentRootProgram(schema, root, value) ?? null)
      : null;
  };

  const indexConstructedRoot: InternalEditorSchemaApi['indexConstructedRoot'] =
    ({ after, before, change, root }) => {
      const schema = getDeclarativeSchema();

      if (schema) {
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
    const childRoots = (element as { childRoots?: unknown }).childRoots;

    if (typeof childRoots !== 'object' || childRoots === null) {
      return Object.freeze({});
    }

    return Object.freeze(
      Object.fromEntries(
        [...slots.keys()].flatMap((slot) => {
          const root = (childRoots as Readonly<Record<string, unknown>>)[slot];

          return typeof root === 'string' && root.length > 0
            ? [[slot, root as NamedRootKey] as const]
            : [];
        })
      )
    );
  };

  const getElementOwnedRoots: InternalEditorSchemaApi['getElementOwnedRoots'] =
    (element) => {
      const contentRoots = getCompiledElement(element)?.contentRoots;
      const childRoots = (element as { childRoots?: unknown }).childRoots;

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
                  root: root as NamedRootKey,
                  slot,
                }),
              ]
            : [];
        })
      );
    };

  const hasContentRoots = () =>
    [...(getDeclarativeSchema()?.elements.byType.values() ?? [])].some(
      (element) => element.contentRoots.size > 0
    );

  const getOrphanedElementOwnedRoots: InternalEditorSchemaApi['getOrphanedElementOwnedRoots'] =
    ({ after, before, change, indexedAfter, tracked }) => {
      const schema = getDeclarativeSchema();

      if (!schema || !hasContentRoots()) return Object.freeze([]);

      const beforeRoots: Readonly<Record<string, readonly Descendant[]>> = {
        main: before.children,
        ...(before.roots ?? {}),
      };
      const afterRoots: Readonly<Record<string, readonly Descendant[]>> = {
        main: after.children,
        ...(after.roots ?? {}),
      };
      const beforeIndexes = new Map(
        getDocumentOwnershipIndexes(schema, before).map(({ index, root }) => [
          root,
          index,
        ])
      );
      const afterIndexes = new Map<RootKey, ElementOwnedRootIndex>();
      const changedRoots = new Set([
        ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
        ...change.createRoots,
        ...change.deleteRoots,
      ]);
      const candidates = new Set(tracked);

      for (const [root, children] of Object.entries(afterRoots)) {
        const beforeDocument = DocumentIndex.fromValue(
          (beforeRoots[root] ?? []) as readonly JsonNode[]
        );
        const afterDocument =
          indexedAfter.get(root) ??
          DocumentIndex.fromValue(children as readonly JsonNode[]);
        const index = changedRoots.has(root)
          ? rebaseElementOwnedRootIndex(
              schema,
              root,
              getInternalDocumentRootChange(change, root),
              beforeDocument,
              afterDocument
            )
          : ensureElementOwnedRootIndex(schema, root, afterDocument);

        afterIndexes.set(root, index);
        if (changedRoots.has(root)) {
          for (const childRoot of index.dirtyChildRoots) {
            candidates.add(childRoot);
          }
        }
      }
      for (const root of change.deleteRoots) {
        const beforeDocument = DocumentIndex.fromValue(
          (beforeRoots[root] ?? []) as readonly JsonNode[]
        );
        const index = rebaseElementOwnedRootIndex(
          schema,
          root,
          getInternalDocumentRootChange(change, root),
          beforeDocument,
          EMPTY_INDEXED_DOCUMENT
        );

        for (const childRoot of index.dirtyChildRoots) {
          candidates.add(childRoot);
        }
      }

      const countOwners = (
        indexes: ReadonlyMap<RootKey, ElementOwnedRootIndex>,
        childRoot: string,
        ownership?: 'exclusive'
      ) => {
        let count = 0;

        for (const index of indexes.values()) {
          for (const binding of getElementOwnedRootGrammarBindings(
            index,
            childRoot
          )) {
            if (!ownership || binding.ownership === ownership) {
              count += binding.count;
            }
          }
        }

        return count;
      };

      return Object.freeze(
        [...candidates]
          .filter(
            (root): root is NamedRootKey =>
              root !== 'main' &&
              Object.hasOwn(afterRoots, root) &&
              countOwners(afterIndexes, root) === 0 &&
              (tracked.has(root) ||
                countOwners(beforeIndexes, root, 'exclusive') > 0)
          )
          .sort()
      );
    };

  const getElementSlicePolicy = (element: Element) =>
    getCompiledElement(element)?.slice ??
    Object.freeze({
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

  const getElementProperty = ((
    element: Element,
    property:
      | string
      | Readonly<{ key: string; kind: 'schema-element-property' }>,
    options: RuntimeTargetOptions = {}
  ): unknown => {
    const key = typeof property === 'string' ? property : property.key;
    const ownValue = getOwnElementProperty(element, key);

    if (ownValue !== undefined) return ownValue;
    const resolved = resolveElementProperty(element, key, options);

    return resolved ? getPropertyDefault(resolved) : undefined;
  }) as InternalEditorSchemaApi['getElementProperty'];

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

  const elementUsesInlineContent = (element: Element) => {
    const behavior = getElementBehavior(element);

    if (behavior.void && !behavior.editableIsland) return false;
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

    for (const propertyId of compiled.construction.defaultPropertyIds) {
      const property = schema.properties.byId.get(propertyId)!;

      if (
        typeof property.key !== 'string' ||
        !matchesCompiledSchemaTarget(schema, property.target, context) ||
        property.descriptor.omitDefault ||
        Object.hasOwn(properties ?? {}, property.key)
      ) {
        continue;
      }

      nextProperties[property.key] = property.descriptor.default;
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
        !Object.hasOwn(property.descriptor, 'default') ||
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
    const minimum = compiled.content?.min ?? 0;
    const nextCreating = new Set(creating).add(type);

    while (element.children.length < minimum) {
      const plan = compiled.content?.defaultPlan;
      const child =
        plan?.kind === 'text'
          ? ({ text: '' } as Text)
          : plan?.kind === 'element' && !nextCreating.has(plan.type)
            ? createDeclarativeAndFill(
                schema,
                plan.type,
                undefined,
                nextCreating,
                {
                  ancestors: [element, ...(options.ancestors ?? [])],
                  root: options.root,
                }
              )
            : null;

      if (!child) {
        throw new Error(
          `Editor element "${type}" requires defaultable content.`
        );
      }

      children.push(child);
    }

    assertEditorJsonValue(element, `Editor element "${type}"`);

    return cloneFrozen(element);
  };

  const createAndFill = ((
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
  }) as InternalEditorSchemaApi['createAndFill'];

  const createDefaultRootChild = (root = 'main'): Descendant | null => {
    const declarative = getDeclarativeSchema();

    if (!declarative) return null;
    const plan = getDeclarativeRootProgram(declarative, root)?.defaultPlan;

    if (plan?.kind === 'text') return { text: '' };
    if (!plan) return null;

    return createDeclarativeAndFill(
      declarative,
      plan.type,
      undefined,
      new Set(),
      { root }
    );
  };

  const sliceFitter = createCompiledSliceFitterDelegate<V>(() => ({
    canContain,
    contentAllows,
    createDeclarativeAndFill,
    editorRootLabel,
    elementUsesInlineContent,
    getCompiledElement,
    getDescendant,
    getDocumentRoot,
    getDocumentRootProgram,
    getEditor,
    getElementAncestors,
    getElementBehavior,
    getElementContentRoots,
    getElementSlicePolicy,
    getElementType,
    getRegistry,
    getRootContent,
    getVocabulary,
    indexConstructedRoot,
    isSetValuedProperty,
    nodePropertiesEqual,
    revision: getRegistry().schemaRevision,
    schema: getDeclarativeSchema(),
    schemaApi: api,
    structurallyEqual,
    validateDeclarativeChildren,
    validateDocument,
    validateSliceVocabulary,
  }));
  const fit: InternalEditorSchemaApi<V>['fit'] = sliceFitter.fit;
  const fitContent: InternalEditorSchemaApi<V>['fitContent'] =
    sliceFitter.fitContent;
  const fitDocument = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> => sliceFitter.fitDocument(input);
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
      } catch (cause) {
        if (!validationLocation) throw cause;

        throw createEditorSchemaValidationError(
          'invalid-property-value',
          cause instanceof Error
            ? cause.message
            : `Editor ${placement} property "${key}" is invalid.`,
          validationLocation,
          {
            cause,
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
          const message = `Schema ${placement} property "${key}" cannot target ${placement === 'text' ? `text under "${context.type}"` : `element "${context.type}"`}.`;

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
        !Object.hasOwn(property.descriptor, 'default') ||
        property.descriptor.omitDefault
      ) {
        continue;
      }
      output[property.key] = property.descriptor.default;
    }

    const sourceKeys = Object.keys(source);
    const outputKeys = Object.keys(output);

    return sourceKeys.length === outputKeys.length &&
      sourceKeys.every(
        (key) =>
          Object.hasOwn(output, key) &&
          structurallyEqual(source[key], output[key])
      )
      ? source
      : output;
  };

  const canonicalizeDeclarativeChildren = (
    children: readonly Descendant[],
    schema: CompiledEditorSchema,
    root: RootKey,
    ancestors: readonly Element[],
    dropMisplaced: boolean
  ): readonly Descendant[] => {
    const canonical = children.map((node) => {
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
          dropMisplaced
        );

        return nested === node.children
          ? node
          : ({ ...node, children: nested } as Element);
      }

      const properties = canonicalizeDeclarativePropertyRecord(
        node as unknown as Readonly<Record<string, unknown>>,
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
        dropMisplaced
      );

      if (candidate === node && nested === node.children) return node;

      return { ...candidate, children: nested, type } as Element;
    });

    return canonical.every((node, index) => node === children[index])
      ? children
      : canonical;
  };

  const canonicalizeChildren: InternalEditorSchemaApi['canonicalizeChildren'] =
    (children, root, ancestors, dropMisplaced) => {
      const schema = getDeclarativeSchema();

      return schema
        ? canonicalizeDeclarativeChildren(
            children,
            schema,
            root,
            ancestors,
            dropMisplaced
          )
        : children;
    };

  const getTextProperty = (
    schema: CompiledEditorSchema,
    key: string,
    options: RuntimeTextTargetOptions = {}
  ) => {
    const candidates = getCompiledPropertyCandidates(schema, 'text', key);
    const parentType = options.parent
      ? (getElementType(options.parent) ?? '')
      : '';

    return parentType
      ? resolveCompiledSchemaProperty(
          schema,
          'text',
          key,
          toCompiledTargetContext(parentType, options)
        )
      : candidates.length === 1
        ? candidates[0]!
        : null;
  };

  const getTextTargetOptions = (
    value: EditorDocumentValue,
    path: Path,
    root: RootKey = 'main'
  ): RuntimeTextTargetOptions => {
    const children = getDocumentRoot(value, root);
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
    getTextTargetOptions(getEditor().read.value(), path, root);

  const getElementTargetOptionsAt = (
    path: Path,
    root: RootKey = 'main'
  ): RuntimeTargetOptions => ({
    ancestors: getElementAncestors(
      getDocumentRoot(getEditor().read.value(), root),
      path
    ),
    root,
  });

  const elementPropertiesForSplitAt = (
    element: Element,
    path: Path,
    root: RootKey = 'main'
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return NodeApi.extractProps(element);
    const type = getElementType(element) ?? '';
    const context = toCompiledTargetContext(
      type,
      getElementTargetOptionsAt(path, root)
    );

    return Object.freeze(
      Object.fromEntries(
        Object.entries(NodeApi.extractProps(element)).filter(([key]) => {
          if (key === 'type') return true;
          const candidates = getCompiledPropertyCandidates(
            schema,
            'element',
            key
          );
          const property = resolveCompiledSchemaProperty(
            schema,
            'element',
            key,
            context
          );

          return property
            ? property.lifecycle.split === 'preserve'
            : candidates.length === 0 && schema.unknown === 'preserve';
        })
      )
    );
  };

  const elementPropertiesForTypeChangeAt = (
    element: Element,
    to: Element,
    path: Path,
    root: RootKey = 'main'
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return NodeApi.extractProps(element);
    const options = getElementTargetOptionsAt(path, root);
    const sourceContext = toCompiledTargetContext(
      getElementType(element) ?? '',
      options
    );
    const destinationContext = toCompiledTargetContext(
      getElementType(to) ?? '',
      options
    );

    return Object.freeze(
      Object.fromEntries(
        Object.entries(NodeApi.extractProps(element)).flatMap(
          ([key, value]) => {
            if (key === 'type') return [];
            const candidates = getCompiledPropertyCandidates(
              schema,
              'element',
              key
            );
            const sourceProperty = resolveCompiledSchemaProperty(
              schema,
              'element',
              key,
              sourceContext
            );
            const destination = resolveCompiledSchemaProperty(
              schema,
              'element',
              key,
              destinationContext
            );

            if (!sourceProperty) {
              return candidates.length === 0 && schema.unknown === 'preserve'
                ? [[key, value]]
                : [];
            }
            if (
              sourceProperty.lifecycle.typeChange !== 'preserve-if-allowed' ||
              !destination
            ) {
              return [];
            }

            try {
              return [
                [
                  key,
                  validatePropertyValue(
                    `Editor element property "${key}"`,
                    destination.descriptor,
                    value
                  ),
                ],
              ];
            } catch {
              return [];
            }
          }
        )
      )
    );
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
            ? `Editor text property "${key}" cannot target editor element "${options.parent?.type ?? 'root'}".`
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
    const items = new Map<string, PropertyJsonValue>();

    for (const item of [
      ...(previousItems as readonly PropertyJsonValue[]),
      ...(canonical as readonly PropertyJsonValue[]),
    ]) {
      items.set(canonicalPropertyKey(item), item);
    }

    return Object.freeze(
      [...items]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, item]) => item)
    );
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

  const textPropertiesForTypeChange = (
    text: Text,
    from: Element,
    to: Element,
    options: RuntimeTargetOptions = {}
  ) => {
    const schema = getDeclarativeSchema();

    if (!schema) return Object.freeze(getTextProperties(text));

    return Object.freeze(
      Object.fromEntries(
        Object.entries(getTextProperties(text)).flatMap(([key, value]) => {
          const sourceProperty = getTextProperty(schema, key, {
            ...options,
            parent: from,
          });
          const destination = getTextProperty(schema, key, {
            ...options,
            parent: to,
          });

          if (!sourceProperty && schema.unknown === 'preserve') {
            return [[key, value]];
          }
          if (
            !sourceProperty ||
            sourceProperty.lifecycle.typeChange !== 'preserve-if-allowed' ||
            !destination
          ) {
            return [];
          }

          try {
            return [
              [
                key,
                validatePropertyValue(
                  `Editor text property "${key}"`,
                  destination.descriptor,
                  value
                ),
              ],
            ];
          } catch {
            return [];
          }
        })
      )
    );
  };

  const textPropertiesForTypeChangeAt = (
    text: Text,
    from: Element,
    to: Element,
    path: Path,
    root: RootKey = 'main'
  ) =>
    textPropertiesForTypeChange(
      text,
      from,
      to,
      getTextTargetOptionsAt(path, root)
    );

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
        : candidates.length === 1 && !candidates[0]!.target
          ? candidates[0]!
          : null;

      if (!property) {
        if (candidates.length > 0 || schema.unknown === 'reject') {
          const message =
            candidates.length > 0
              ? `Editor text property "${key}" cannot target editor element "${parent?.type ?? 'root'}".`
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
      } catch (cause) {
        throw createEditorSchemaValidationError(
          'invalid-property-value',
          cause instanceof Error
            ? cause.message
            : `Editor text property "${key}" is invalid.`,
          location,
          {
            cause,
            property: { candidates: [property], key, placement: 'text' },
          }
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
      node as unknown as Readonly<Record<string, unknown>>,
      schema,
      'element',
      toCompiledTargetContext(type!, { ancestors, root }),
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
    openAncestorBoundary = false
  ): void => {
    children.forEach((node, index) => {
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
          const allowed = validationContentAllows(schema, content, child);

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
    } catch (cause) {
      throw createEditorSchemaValidationError(
        'invalid-json',
        cause instanceof Error
          ? cause.message
          : `${label} must encode to JSON-compatible data.`,
        location,
        { cause }
      );
    }
  };
  const validateFragment = (children: readonly Descendant[]) => {
    assertSchemaJsonValue(
      children,
      'Editor document fragment',
      toSchemaValidationLocation('main', [])
    );
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
                `Unknown editor element property "${key}" on "${type ?? 'missing'}" in closed editor schema.`
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

  const validateDeclarativeRootContent = (
    root: RootKey,
    children: readonly Descendant[],
    content: CompiledSchemaContentProgram,
    schema: CompiledEditorSchema
  ) => {
    if (children.length < content.min) {
      throw createEditorSchemaValidationError(
        'invalid-content',
        `Editor ${editorRootLabel(root)} requires at least ${content.min} children.`,
        toSchemaValidationLocation(root, [])
      );
    }
    if (content.max !== null && children.length > content.max) {
      throw createEditorSchemaValidationError(
        'invalid-content',
        `Editor ${editorRootLabel(root)} allows at most ${content.max} children.`,
        toSchemaValidationLocation(root, [])
      );
    }
    for (const [index, child] of children.entries()) {
      const allowed = contentAllows(schema, content, child);

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
      ? matchesElementOwnedRootDeclaration(input, owner as JsonNode)
      : false;

    if (!path || !matches) {
      throw new EditorSchemaValidationError(
        `Element-owned root index provenance for "${input.ownerType}.${input.slot ?? 'contentRoots'}" is stale.`
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
    if (value.roots && Object.hasOwn(value.roots, 'main')) {
      throw createEditorSchemaValidationError(
        'invalid-root',
        'Editor document roots cannot redefine the primary root; use children.',
        toSchemaValidationLocation('main', [])
      );
    }
    const roots: Record<string, readonly Descendant[]> = {
      main: value.children,
      ...(value.roots ?? {}),
    };
    const ownershipIndexes = getDocumentOwnershipIndexes(schema, value);
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
      validateDeclarativeChildren(children, schema, root, [], []);
      if (content) {
        validateDeclarativeRootContent(root, children, content, schema);
      }
    }
  };

  const documentRoots = (
    value: EditorDocumentValue
  ): Readonly<Record<string, readonly Descendant[]>> => ({
    main: value.children,
    ...(value.roots ?? {}),
  });
  const isDeepFrozenNode = (node: Descendant): boolean =>
    Object.isFrozen(node) &&
    (NodeApi.isText(node) ||
      (Object.isFrozen(node.children) &&
        node.children.every(isDeepFrozenNode)));
  const rememberValidatedDocumentRoots = (
    value: EditorDocumentValue,
    schema?: CompiledEditorSchema | null
  ) => {
    const authority = getValidationAuthority();

    for (const [root, children] of Object.entries(documentRoots(value))) {
      if (
        Object.isFrozen(children) &&
        children.every((node) => isDeepFrozenNode(node))
      ) {
        VALIDATED_DOCUMENT_ROOTS.set(children, authority);
        if (schema) {
          sealElementOwnedRootIndex(
            schema,
            root,
            DocumentIndex.fromValue(children as readonly JsonNode[])
          );
        }
      }
    }
  };

  const validateDocument = (value: EditorDocumentValue) => {
    profileCoreDuration('schema-validation-full-document-boundary', () => {
      const location = toSchemaValidationLocation('main', []);

      assertSchemaJsonValue(value, 'Editor document value', location);
      assertSchemaJsonValue(
        value.children,
        'Editor document children',
        location
      );
      if (value.roots !== undefined) {
        assertSchemaJsonValue(value.roots, 'Editor document roots', location);
      }

      const declarative = getDeclarativeSchema();

      if (declarative) {
        validateDeclarativeDocument(value, declarative);
      } else if (value.roots && Object.hasOwn(value.roots, 'main')) {
        throw createEditorSchemaValidationError(
          'invalid-root',
          'Editor document roots cannot redefine the primary root; use children.',
          location
        );
      }

      rememberValidatedDocumentRoots(value, declarative);
    });
  };

  const validateDocumentChange = ({
    after,
    before,
    change,
    indexedAfter,
    indexedBefore,
  }: Readonly<{
    after: EditorDocumentValue;
    before: EditorDocumentValue;
    change: DocumentChange;
    indexedAfter: ReadonlyMap<string, DocumentIndex>;
    indexedBefore: ReadonlyMap<string, DocumentIndex>;
  }>) => {
    const beforeRoots = documentRoots(before);
    const authority = getValidationAuthority();

    const unvalidatedRoot = Object.entries(beforeRoots).find(
      ([, children]) => VALIDATED_DOCUMENT_ROOTS.get(children) !== authority
    )?.[0];

    if (unvalidatedRoot) {
      throw new Error(
        `Incremental schema validation requires an explicitly validated immutable baseline for ${editorRootLabel(unvalidatedRoot)}. Call validateDocument() at the external document boundary before constructing changes.`
      );
    }
    if (after.roots && Object.hasOwn(after.roots, 'main')) {
      throw new EditorSchemaValidationError(
        'Editor document roots cannot redefine the primary root; use children.'
      );
    }

    const schema = getDeclarativeSchema();
    profileCoreDuration('schema-validation-incremental-hit', () => undefined);

    const afterRoots = documentRoots(after);
    const changedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
      ...change.createRoots,
      ...change.deleteRoots,
    ]);
    const touchedRoots = new Set(changedRoots);
    const ownershipIndexes: Readonly<{
      index: ElementOwnedRootIndex;
      root: RootKey;
    }>[] = [];

    if (schema && hasContentRoots()) {
      const dirtyChildRoots = new Set<string>();
      const dirtyIssues: Readonly<{
        index: ElementOwnedRootIndex;
        issue: ElementOwnedRootIssue;
      }>[] = [];

      for (const [root, children] of Object.entries(afterRoots)) {
        const afterDocument =
          indexedAfter.get(root) ??
          DocumentIndex.fromValue(children as readonly JsonNode[]);
        const beforeChildren = beforeRoots[root] ?? [];
        const beforeDocument =
          indexedBefore.get(root) ??
          DocumentIndex.fromValue(beforeChildren as readonly JsonNode[]);
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
          ).map((issue) => ({ index, issue }))
        );
      }
      for (const root of change.deleteRoots) {
        const beforeChildren = beforeRoots[root] ?? [];
        const beforeDocument =
          indexedBefore.get(root) ??
          DocumentIndex.fromValue(beforeChildren as readonly JsonNode[]);
        const index = rebaseElementOwnedRootIndex(
          schema,
          root,
          getInternalDocumentRootChange(change, root),
          beforeDocument,
          EMPTY_INDEXED_DOCUMENT
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
          ).map((issue) => ({ index, issue }))
        );
      }

      if (dirtyIssues[0]) {
        throwElementOwnedRootIssue(
          after,
          dirtyIssues[0].issue,
          dirtyIssues[0].index
        );
      }
      const ownershipRoots = new Set([
        ...dirtyChildRoots,
        ...change.createRoots,
        ...change.deleteRoots,
      ]);

      for (const root of ownershipRoots) {
        if (root === 'main') continue;
        const projection = getProjectedRoot(
          after,
          schema,
          root,
          ownershipIndexes
        );

        if (projection) {
          const location = elementOwnedRootLocation(
            after,
            projection.owner,
            projection.index
          );

          if (!Object.hasOwn(afterRoots, root)) {
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
          touchedRoots.add(root);
        } else if (
          Object.hasOwn(afterRoots, root) &&
          !schema.roots.has(root) &&
          schema.unknown === 'reject'
        ) {
          throw createEditorSchemaValidationError(
            'invalid-root',
            `Undeclared editor root "${root}" in closed editor schema.`,
            toSchemaValidationLocation(root, [])
          );
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
      children: readonly Descendant[],
      content: CompiledSchemaContentProgram,
      indexes: ReadonlySet<number>,
      owner: string
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
        const child = children[index];

        if (
          !child ||
          !schema ||
          validationContentAllows(schema, content, child)
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
      const children = afterRoots[root];

      if (!children) {
        throw new EditorSchemaValidationError(
          `Changed editor root "${root}" is missing from the document.`
        );
      }
      const afterDocument =
        indexedAfter.get(root) ??
        (changedRoots.has(root)
          ? undefined
          : DocumentIndex.fromValue(children as readonly JsonNode[]));

      if (!afterDocument || afterDocument.value !== children) {
        throw new EditorSchemaValidationError(
          `Changed editor root "${root}" lost its immutable construction index.`
        );
      }

      const beforeChildren = beforeRoots[root] ?? [];
      const beforeDocument =
        indexedBefore.get(root) ??
        DocumentIndex.fromValue(beforeChildren as readonly JsonNode[]);
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
            `Editor element "${node.type}" at [${path}]`
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
            : `Editor element "${(parent as Element).type}" at [${path}]`
        );
      }

      VALIDATED_DOCUMENT_ROOTS.set(children, authority);
    }

    for (const [root, children] of Object.entries(afterRoots)) {
      if (
        VALIDATED_DOCUMENT_ROOTS.get(children) !== authority &&
        !touchedRoots.has(root)
      ) {
        throw new EditorSchemaValidationError(
          `Unchanged editor root "${root}" lost validation authority.`
        );
      }
    }
    if (schema) {
      for (const [root, children] of Object.entries(afterRoots)) {
        sealElementOwnedRootIndex(
          schema,
          root,
          DocumentIndex.fromValue(children as readonly JsonNode[])
        );
      }
    }
  };

  const api: InternalEditorSchemaApi<V> = Object.freeze({
    allowsElementType,
    canonicalizeChildren,
    elementPropertiesForSplitAt,
    elementPropertiesForTypeChangeAt,
    createAndFill,
    createDefaultRootChild,
    delta: () => getExtensionRegistry(getEditor()).schemaContributions.delta,
    element: getPublicElement,
    fit,
    fitContent,
    fitDocument,
    findWrapping,
    getElementBehavior,
    getElementContent,
    getElementContentRoots,
    getOrphanedElementOwnedRoots,
    getElementOwnedRoots,
    getElementProperty,
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
    isEditableIsland: (element: Node) =>
      ElementApi.isElement(element) &&
      getElementBehavior(element).editableIsland,
    isElementTypeInGroup,
    isSetValuedProperty,
    isTextPropertyAllowedAt,
    isTextPropertyEqualAt,
    isInline: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).inline,
    isIsolating: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).isolating,
    isKeyboardSelectable: (element: Node) =>
      ElementApi.isElement(element) &&
      getElementBehavior(element).keyboardSelectable,
    isReadOnly: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).readOnly,
    isSelectable: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).selectable,
    isVoid: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).void,
    markableVoid: (element: Node) =>
      ElementApi.isElement(element) && getElementBehavior(element).markableVoid,
    property: getPublicProperty,
    mergeTextPropertyAt,
    textPropertiesForSplitAt,
    textPropertiesForTypeChangeAt,
    validateDocument,
    validateDocumentChange,
    validateFragment,
    validateTextPropertiesAtValue,
  });

  COMPILED_SCHEMA_BY_API.set(api, getDeclarativeSchema);

  return api;
};
