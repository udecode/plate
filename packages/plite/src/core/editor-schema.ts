import type {
  Descendant,
  Editor,
  ContentSlice,
  EditorDocumentValue,
  EditorElementBehavior,
  EditorSchemaVocabulary,
  EditorSchemaElement,
  EditorSelectionMapContext,
  EditorSchemaProperty,
  EditorSchemaPropertyHandle,
  EditorSchemaPropertyQuery,
  EditorStateSchemaApi,
  Element,
  NamedRootKey,
  Node,
  Path,
  Point,
  Range,
  RootKey,
  Selection,
  Text,
  Value,
} from '../interfaces';
import { ElementApi, NodeApi, RangeApi, SelectionApi } from '../interfaces';
import type {
  PropertyJsonValue,
  PropertyValueDescriptor,
  SchemaTarget,
} from '../interfaces/schema';
import {
  ContentSlice as ContentSliceValue,
  encodeContentSlice,
  encodeContentSliceContent,
  isDetachedContentSlice,
  prepareContentSliceVariant,
} from './content-slice';
import {
  ChangeSet,
  createInternalDocumentChange,
  DocumentChangeBuilder,
  type DocumentPropertyContext,
  type DocumentChangeStep,
  DocumentChange,
  DocumentSlice,
  DocumentSliceStructureError,
  getPreparedDocumentSlice,
  IndexedDocument,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeSet,
  mapInternalDocumentChangePosition,
  reconcileChildrenStep,
  type JsonEditorValue,
  type JsonNode,
} from './document-change';
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
import {
  bindCanonicalFitPreparation,
  type CanonicalFitPreparation,
  constructCanonicalDocumentChange,
  getProtectedInlineSpacerEntries,
  mapCanonicalRepresentationPoint,
  prepareCanonicalFitSlice,
  prepareCanonicalRootFit,
} from './representation';
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
  resolveCompiledSchemaWrapperPlan,
} from './schema-compiler';
import {
  createEditorSchemaValidationError,
  EditorSchemaValidationError,
  type EditorSchemaValidationLocation,
} from './schema-validation';
import { profileCoreDuration } from './profiling';
import { mapSelectionWithContext } from './selection-protocol';

type InternalSliceFitTarget =
  | Readonly<{
      at: Range;
      /** Private token bounds for a detached parent-content target. */
      contentBounds?: Readonly<{ from: number; to: number }>;
      /** Exact replacement bounds when closed content replaces a detached parent. */
      exactBounds?: Readonly<{ from: number; to: number }>;
      kind: 'range';
    }>
  | Readonly<{
      kind: 'root';
      root: RootKey;
      /** External root selection mapped through fitting and construction. */
      selection?: NonNullable<Selection>;
    }>;

type InternalSliceFitOptions = Readonly<{
  apply?: (
    step: DocumentChangeStep,
    selection?: NonNullable<Selection>
  ) => void;
  builder: DocumentChangeBuilder;
  target: InternalSliceFitTarget;
}>;

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
    indexConstructedRoot: (
      input: Readonly<{
        after: IndexedDocument;
        before: IndexedDocument;
        change?: ChangeSet;
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
        indexedAfter: ReadonlyMap<string, IndexedDocument>;
        indexedBefore: ReadonlyMap<string, IndexedDocument>;
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

    if (descriptor.kind !== 'json' && typeof canonical !== descriptor.kind) {
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

    if (
      currentDescriptor.policy &&
      !currentDescriptor.policy.validate(current)
    ) {
      throw new EditorSchemaValidationError(
        `${owner} fails property policy "${currentDescriptor.policy.id}".`
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

type SliceBoundaryCandidate = Readonly<{
  cost: number;
  from: number;
  to: number;
}>;

type SliceVariant = Readonly<{
  cost: number;
  slice: ContentSlice;
}>;

type SliceVariantFamily = Readonly<{
  baseOpenEnd: number;
  baseOpenStart: number;
  contentCost: number;
  index: number;
  maxOpenEnd: number;
  maxOpenStart: number;
  priority: number;
  source: ContentSlice;
}>;

type SliceFitCandidateBase = Readonly<{
  cost: number;
  from: number;
  preparation?: CanonicalFitPreparation;
  selectionAssociation?: -1 | 1;
  to: number;
}>;

type PreparedOpenBlockFitCandidate = Readonly<{
  fullInsert: DocumentSlice;
  prefix: string;
  semanticInsert: DocumentSlice;
  sourceBlocks: readonly Element[];
  suffix: string;
  targetPath: readonly number[];
}>;

type MaterializedSliceFitCandidate = SliceFitCandidateBase &
  Readonly<{
    insert: DocumentSlice;
    runtimeCandidatePaths?: readonly (readonly number[])[];
    semanticChange?: Readonly<{
      from: number;
      insert: DocumentSlice;
      to: number;
    }>;
    selectionOffset: number;
    trustedCanonical?: true;
  }>;

type SliceFitCandidate = SliceFitCandidateBase &
  (
    | Readonly<{
        insert: DocumentSlice;
        selectionOffset: number;
      }>
    | Readonly<{
        preparedOpenBlock: PreparedOpenBlockFitCandidate;
      }>
  );

type SliceFitFrontierState = Readonly<{
  boundary: SliceBoundaryCandidate | null;
  boundaryIndex: number;
  cost: number;
  family: SliceVariantFamily;
  kind: 'local' | 'structural';
  openEnd: number;
  openStart: number;
  serial: number;
}>;

type SliceFitSeed = Readonly<{
  boundary: SliceBoundaryCandidate | null;
  boundaryIndex: number;
  family: SliceVariantFamily;
  kind: SliceFitFrontierState['kind'];
  openEnd: number;
  openStart: number;
}>;

type PreparedSliceFitCandidate = Readonly<{
  state: SliceFitFrontierState;
  variant: SliceVariant;
}>;

const getSliceVariantCost = (
  family: SliceVariantFamily,
  openStart: number,
  openEnd: number
) =>
  family.contentCost +
  Math.abs(openStart - family.baseOpenStart) * 2 +
  Math.abs(openEnd - family.baseOpenEnd) * 2;

/** One deterministic candidate-order owner shared by document and detached fits. */
const createSliceFitFrontier = (
  inputSlice: ContentSlice,
  preferOpenVariants: boolean,
  exactFrom?: number
) => {
  const compare = (
    left: SliceFitFrontierState,
    right: SliceFitFrontierState
  ) => {
    if (left.kind !== right.kind) return left.kind === 'local' ? -1 : 1;
    if (left.family.priority !== right.family.priority) {
      return left.family.priority - right.family.priority;
    }
    if (left.cost !== right.cost) return left.cost - right.cost;
    if (left.boundaryIndex !== right.boundaryIndex) {
      return left.boundaryIndex - right.boundaryIndex;
    }
    if (left.family.index !== right.family.index) {
      return left.family.index - right.family.index;
    }

    const leftOpen = left.openStart + left.openEnd;
    const rightOpen = right.openStart + right.openEnd;

    if (left.kind === 'local' && preferOpenVariants && leftOpen !== rightOpen) {
      return rightOpen - leftOpen;
    }

    const leftDistance =
      Math.abs(left.openStart - inputSlice.openStart) +
      Math.abs(left.openEnd - inputSlice.openEnd);
    const rightDistance =
      Math.abs(right.openStart - inputSlice.openStart) +
      Math.abs(right.openEnd - inputSlice.openEnd);

    return (
      leftDistance - rightDistance ||
      left.openStart - right.openStart ||
      left.openEnd - right.openEnd ||
      left.serial - right.serial
    );
  };
  const states: SliceFitFrontierState[] = [];
  const visited = new Set<string>();
  let serial = 0;

  const enqueue = (
    kind: SliceFitFrontierState['kind'],
    family: SliceVariantFamily,
    boundary: SliceBoundaryCandidate | null,
    boundaryIndex: number,
    openStart: number,
    openEnd: number
  ) => {
    if (
      openStart < 0 ||
      openEnd < 0 ||
      openStart > family.maxOpenStart ||
      openEnd > family.maxOpenEnd
    ) {
      return;
    }

    const key = `${kind}:${boundaryIndex}:${family.index}:${openStart}:${openEnd}`;

    if (visited.has(key)) return;
    visited.add(key);

    const variantCost = getSliceVariantCost(family, openStart, openEnd);
    const cost =
      kind === 'local'
        ? variantCost - (preferOpenVariants ? (openStart + openEnd) * 4 : 0)
        : variantCost +
          (boundary?.cost ?? 0) -
          (inputSlice.content.length === 0 &&
          boundary &&
          exactFrom !== undefined &&
          boundary.from < exactFrom
            ? 4
            : 0);
    const state = Object.freeze({
      boundary,
      boundaryIndex,
      cost,
      family,
      kind,
      openEnd,
      openStart,
      serial: serial++,
    });
    let index = states.length;

    states.push(state);
    while (index > 0) {
      const parent = (index - 1) >> 1;

      if (compare(states[parent]!, state) <= 0) break;
      states[index] = states[parent]!;
      index = parent;
    }
    states[index] = state;
  };
  const pop = () => {
    const first = states[0];
    const last = states.pop();

    if (!first || !last || states.length === 0) return first ?? null;

    let index = 0;

    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;

      if (left >= states.length) break;

      const next =
        right < states.length && compare(states[right]!, states[left]!) < 0
          ? right
          : left;

      if (compare(states[next]!, last) >= 0) break;

      states[index] = states[next]!;
      index = next;
    }

    states[index] = last;

    return first;
  };

  return Object.freeze({ enqueue, pop });
};

const selectSliceFitCandidate = (
  input: Readonly<{
    candidates: (
      prepared: PreparedSliceFitCandidate
    ) => readonly SliceFitCandidate[];
    exactFrom?: number;
    inputSlice: ContentSlice;
    preferOpenVariants: boolean;
    seeds: readonly SliceFitSeed[];
  }>
): SliceFitCandidate | null => {
  const frontier = createSliceFitFrontier(
    input.inputSlice,
    input.preferOpenVariants,
    input.exactFrom
  );

  for (const seed of input.seeds) {
    frontier.enqueue(
      seed.kind,
      seed.family,
      seed.boundary,
      seed.boundaryIndex,
      seed.openStart,
      seed.openEnd
    );
  }

  while (true) {
    const state = frontier.pop();

    if (!state) return null;
    const directions =
      state.kind === 'local' && input.preferOpenVariants
        ? ([
            [-1, 0],
            [0, -1],
          ] as const)
        : ([
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const);

    for (const [startDelta, endDelta] of directions) {
      frontier.enqueue(
        state.kind,
        state.family,
        state.boundary,
        state.boundaryIndex,
        state.openStart + startDelta,
        state.openEnd + endDelta
      );
    }

    const prepared = Object.freeze({
      state,
      variant: profileCoreDuration(
        'slice-fit-variant-materialize',
        (): SliceVariant => ({
          cost: getSliceVariantCost(
            state.family,
            state.openStart,
            state.openEnd
          ),
          slice: prepareContentSliceVariant(
            state.family.source,
            state.openStart,
            state.openEnd
          ),
        })
      ),
    });

    const candidates = input.candidates(prepared);

    if (candidates.length > 0) return candidates[0]!;
  }
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

type ClosedFitOriginTracker = Readonly<{
  originOf: (node: Descendant) => Descendant | null;
  record: (output: Descendant, source: Descendant) => void;
}>;

type RootFitPathProvenance = Readonly<{
  advance: (
    source: readonly Descendant[],
    fitted: readonly Descendant[],
    origins: ClosedFitOriginTracker
  ) => void;
  createContextChange: (
    source: IndexedDocument,
    raw: IndexedDocument,
    root: RootKey
  ) => DocumentChange;
  mapPath: (
    path: Path,
    source: IndexedDocument,
    association: -1 | 1,
    deletion?: 'drop' | 'nearest'
  ) => Path | null;
  mapPoint: (
    point: Point,
    source: IndexedDocument,
    raw: IndexedDocument,
    association: -1 | 1,
    deletion?: 'drop' | 'nearest'
  ) => Point | null;
}>;

const pathKey = (path: readonly number[]) => path.join('/');

const visitDescendantPaths = (
  children: readonly Descendant[],
  visit: (node: Descendant, path: Path) => void,
  parentPath: Path = []
) => {
  children.forEach((node, index) => {
    const path = [...parentPath, index];

    visit(node, path);
    if (ElementApi.isElement(node)) {
      visitDescendantPaths(node.children, visit, path);
    }
  });
};

const createClosedFitOriginTracker = (): ClosedFitOriginTracker => {
  const origins = new WeakMap<object, Descendant>();
  const originOf = (node: Descendant) => origins.get(node) ?? null;

  return {
    originOf,
    record(output, source) {
      origins.set(output, originOf(source) ?? source);
    },
  };
};

/**
 * Tracks only source paths retained by closed fitting. Wrappers/defaults have
 * no source path, while cloned fitted nodes explicitly retain their origin.
 * This is selection provenance, not another document diff.
 */
const createRootFitPathProvenance = (
  source: readonly Descendant[]
): RootFitPathProvenance => {
  let changed = false;
  let mappedPaths = new Map<string, Path>();

  visitDescendantPaths(source, (_node, path) => {
    mappedPaths.set(pathKey(path), path);
  });

  const nearestMappedPath = (
    path: Path,
    document: IndexedDocument,
    association: -1 | 1
  ): Path | null => {
    const target = document.nodeRange(path).from;
    const nearest: {
      next: Readonly<{ path: Path; position: number }> | null;
      previous: Readonly<{ path: Path; position: number }> | null;
    } = { next: null, previous: null };

    visitDescendantPaths(source, (_node, sourcePath) => {
      const mapped = mappedPaths.get(pathKey(sourcePath));

      if (!mapped) return;
      const range = document.nodeRange(sourcePath);

      if (
        range.to <= target &&
        (!nearest.previous || range.to > nearest.previous.position)
      ) {
        nearest.previous = { path: mapped, position: range.to };
      }
      if (
        range.from >= target &&
        (!nearest.next || range.from < nearest.next.position)
      ) {
        nearest.next = { path: mapped, position: range.from };
      }
    });

    return association === -1
      ? (nearest.previous?.path ?? nearest.next?.path ?? null)
      : (nearest.next?.path ?? nearest.previous?.path ?? null);
  };

  return {
    advance(current, fitted, origins) {
      const currentPaths = new WeakMap<object, Path>();
      const stagePaths = new Map<string, Path>();

      visitDescendantPaths(current, (node, path) => {
        currentPaths.set(node, path);
      });
      visitDescendantPaths(fitted, (node, path) => {
        const origin = origins.originOf(node);
        const sourcePath = origin ? currentPaths.get(origin) : undefined;

        if (sourcePath) stagePaths.set(pathKey(sourcePath), path);
      });

      const nextPaths = new Map<string, Path>();

      for (const [original, currentPath] of mappedPaths) {
        const nextPath = stagePaths.get(pathKey(currentPath));

        if (nextPath) nextPaths.set(original, nextPath);
      }

      mappedPaths = nextPaths;
      changed = true;
    },
    createContextChange(sourceDocument, rawDocument, root) {
      if (!changed) return new DocumentChange();
      const change = ChangeSet.create(sourceDocument, {
        from: 0,
        insert: rawDocument.slice(0),
        to: sourceDocument.length,
      });

      return createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      );
    },
    mapPath(path, sourceDocument, association, deletion) {
      const mapped = mappedPaths.get(pathKey(path));

      if (mapped) return [...mapped];
      if (deletion === 'drop') return null;

      return nearestMappedPath(path, sourceDocument, association);
    },
    mapPoint(point, sourceDocument, rawDocument, association, deletion) {
      const mapped = mappedPaths.get(pathKey(point.path));

      if (mapped) {
        const node = rawDocument.node(mapped);

        return NodeApi.isText(node)
          ? { offset: Math.min(point.offset, node.text.length), path: mapped }
          : null;
      }
      if (deletion === 'drop') return null;

      const sourcePosition = sourceDocument.positionAt(point);
      const candidates: {
        next: Readonly<{ path: Path; position: number }> | null;
        previous: Readonly<{ path: Path; position: number }> | null;
      } = { next: null, previous: null };

      visitDescendantPaths(source, (node, sourcePath) => {
        if (!NodeApi.isText(node)) return;
        const rawPath = mappedPaths.get(pathKey(sourcePath));

        if (!rawPath) return;
        const start = sourceDocument.positionAt({
          offset: 0,
          path: sourcePath,
        });
        const end = sourceDocument.positionAt({
          offset: node.text.length,
          path: sourcePath,
        });

        if (
          end <= sourcePosition &&
          (!candidates.previous || end > candidates.previous.position)
        ) {
          candidates.previous = { path: rawPath, position: end };
        }
        if (
          start >= sourcePosition &&
          (!candidates.next || start < candidates.next.position)
        ) {
          candidates.next = { path: rawPath, position: start };
        }
      });

      const nearest =
        association === -1
          ? (candidates.previous ?? candidates.next)
          : (candidates.next ?? candidates.previous);

      if (!nearest) return null;
      const node = rawDocument.node(nearest.path);

      return NodeApi.isText(node)
        ? {
            offset: nearest === candidates.previous ? node.text.length : 0,
            path: [...nearest.path],
          }
        : null;
    },
  };
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

const getTextEdge = (
  node: Descendant,
  path: Path,
  edge: 'end' | 'start'
): Point | null => {
  if (NodeApi.isText(node)) {
    return {
      offset: edge === 'start' ? 0 : node.text.length,
      path,
    };
  }

  const index = edge === 'start' ? 0 : node.children.length - 1;
  const child = node.children[index];

  return child ? getTextEdge(child, [...path, index], edge) : null;
};

const pointsEqual = (left: Point, right: Point) =>
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((part, index) => part === right.path[index]);

const isEmptyDescendant = (node: Descendant): boolean =>
  NodeApi.isText(node)
    ? node.text.length === 0
    : node.children.every(isEmptyDescendant);

const COMPILED_SCHEMA_BY_API = new WeakMap<
  EditorStateSchemaApi<any>,
  () => CompiledEditorSchema | null
>();
const VALIDATED_DOCUMENT_ROOTS = new WeakMap<object, string>();
const EMPTY_INDEXED_DOCUMENT = IndexedDocument.fromValue(
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

  type RuntimeTargetOptions = Readonly<{
    /** Immediate parent first. */
    ancestors?: readonly Element[];
    fitOrigins?: ClosedFitOriginTracker;
    root?: RootKey;
  }>;
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
          [...element.contentRoots].map(([slot, content]) => [
            slot,
            toPublicContent(content),
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
          IndexedDocument.fromValue(children as readonly JsonNode[])
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
        IndexedDocument.fromValue(children as readonly JsonNode[])
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

  const hasContentRoots = () =>
    [...(getDeclarativeSchema()?.elements.byType.values() ?? [])].some(
      (element) => element.contentRoots.size > 0
    );

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

    const element = {
      ...nextProperties,
      children: [] as Descendant[],
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

      element.children.push(child);
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

  const createDefaultForContent = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    creating: ReadonlySet<string>,
    options: RuntimeTargetOptions
  ): Descendant | null => {
    const plan = content.defaultPlan;

    if (plan?.kind === 'text') return { text: '' };
    if (!plan || creating.has(plan.type)) return null;

    return createDeclarativeAndFill(
      schema,
      plan.type,
      undefined,
      creating,
      options
    );
  };

  const fitDirectContent = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    source: readonly Descendant[],
    createdDefaults: readonly Descendant[] = [],
    options: RuntimeTargetOptions = {}
  ): readonly Descendant[] | null => {
    if (
      (content.max !== null && source.length > content.max) ||
      source.some((child) => !contentAllows(schema, content, child))
    ) {
      return null;
    }

    const fitted = [...source];

    while (fitted.length < content.min) {
      const createdDefault = createdDefaults[fitted.length];
      const child =
        createdDefault && contentAllows(schema, content, createdDefault)
          ? createdDefault
          : createDefaultForContent(schema, content, new Set(), options);

      if (!child) return null;
      fitted.push(child);
    }

    return Object.freeze(fitted);
  };

  const createWrappedContent = (
    schema: CompiledEditorSchema,
    wrappers: readonly string[],
    source: readonly Descendant[],
    options: RuntimeTargetOptions = {}
  ): readonly Descendant[] | null => {
    const created: Element[] = [];
    let ancestors = options.ancestors ?? [];

    for (const type of wrappers) {
      const wrapper = createDeclarativeAndFill(
        schema,
        type,
        undefined,
        new Set(),
        {
          ancestors,
          root: options.root,
        }
      );

      created.push(wrapper);
      ancestors = [wrapper, ...ancestors];
    }

    let children = [...source];

    for (const wrapper of created.toReversed()) {
      const content = getCompiledElement(wrapper)?.content;
      const fitted = content
        ? fitDirectContent(schema, content, children, wrapper.children, options)
        : children;

      if (!fitted) return null;
      children = [{ ...wrapper, children: [...fitted] } as Element];
    }

    return children;
  };

  const wrapperGroupHasCapacity = (
    wrappers: readonly string[],
    childCount: number
  ) => {
    const innermost = wrappers.at(-1);
    const maximum = innermost
      ? getDeclarativeSchema()?.elements.byType.get(innermost)?.content?.max
      : null;

    return maximum === null || maximum === undefined || childCount < maximum;
  };

  const findWrapping = (
    parent: Element,
    child: Descendant
  ): readonly string[] | null => {
    if (canContain(parent, child)) return [];
    const schema = getDeclarativeSchema();
    const parentType = getElementType(parent);
    const childType = NodeApi.isText(child) ? null : getElementType(child);

    if (!schema || !parentType || (!NodeApi.isText(child) && !childType)) {
      return null;
    }

    return resolveCompiledSchemaWrapperPlan(
      schema,
      `element:${parentType}`,
      childType
    );
  };

  const findWrappingForContent = (
    schema: CompiledEditorSchema,
    programId: string,
    content: CompiledSchemaContentProgram,
    child: Descendant
  ): readonly string[] | null => {
    if (contentAllows(schema, content, child)) return [];
    const childType = NodeApi.isText(child) ? null : getElementType(child);

    if (!NodeApi.isText(child) && !childType) return null;

    return resolveCompiledSchemaWrapperPlan(schema, programId, childType);
  };

  const fitClosedNode = (
    schema: CompiledEditorSchema,
    node: Descendant,
    options: RuntimeTargetOptions
  ): Descendant | null => {
    const retainOrigin = (output: Descendant, subtree = false) => {
      options.fitOrigins?.record(output, node);
      if (subtree && ElementApi.isElement(node)) {
        visitDescendantPaths(node.children, (descendant) => {
          options.fitOrigins?.record(descendant, descendant);
        });
      }

      return output;
    };

    if (NodeApi.isText(node)) return retainOrigin(node);

    const type = getElementType(node);
    const element = type ? schema.elements.byType.get(type) : undefined;

    if (!element) {
      return schema.unknown === 'preserve' ? retainOrigin(node, true) : null;
    }
    if (!element.content) return retainOrigin(node, true);

    const children = fitClosedContent(
      schema,
      `element:${type}`,
      element.content,
      node.children,
      {
        ancestors: [node, ...(options.ancestors ?? [])],
        fitOrigins: options.fitOrigins,
        root: options.root,
      },
      true
    );

    if (!children) return null;
    if (
      children.length === node.children.length &&
      children.every((child, index) => child === node.children[index])
    ) {
      return retainOrigin(node, true);
    }

    return retainOrigin({ ...node, children: [...children] } as Element);
  };

  const fitClosedDefaultShell = (
    schema: CompiledEditorSchema,
    content: CompiledSchemaContentProgram,
    node: Element,
    options: RuntimeTargetOptions
  ): Element | null => {
    const plan = content.defaultPlan;

    if (plan?.kind !== 'element') return null;
    const shell = createDeclarativeAndFill(
      schema,
      plan.type,
      undefined,
      new Set(),
      options
    );
    const shellContent = schema.elements.byType.get(plan.type)?.content;

    if (!shellContent) return null;
    const children = fitClosedContent(
      schema,
      `element:${plan.type}`,
      shellContent,
      node.children,
      {
        ancestors: [shell, ...(options.ancestors ?? [])],
        fitOrigins: options.fitOrigins,
        root: options.root,
      },
      true
    );

    if (!children) return null;
    const fitted = { ...shell, children: [...children] } as Element;

    options.fitOrigins?.record(fitted, node);

    return fitted;
  };

  function fitClosedContent(
    schema: CompiledEditorSchema,
    programId: string,
    content: CompiledSchemaContentProgram,
    source: readonly Descendant[],
    options: RuntimeTargetOptions = {},
    coerceDefaultShell = false,
    dropMisplacedText = false
  ): readonly Descendant[] | null {
    const groups: Array<{
      children: Descendant[];
      wrappers: readonly string[];
    }> = [];

    for (const sourceChild of source) {
      const child = fitClosedNode(schema, sourceChild, options);

      if (!child) return null;
      let wrappers = findWrappingForContent(schema, programId, content, child);

      let fittedChild = child;

      if (!wrappers && coerceDefaultShell && ElementApi.isElement(child)) {
        const shell = fitClosedDefaultShell(schema, content, child, options);

        if (shell) {
          fittedChild = shell;
          wrappers = [];
        }
      }
      if (!wrappers) {
        if (dropMisplacedText && NodeApi.isText(child)) continue;

        return null;
      }
      const previous = groups.at(-1);

      if (
        wrappers.length > 0 &&
        previous &&
        previous.wrappers.length === wrappers.length &&
        wrappers.every((type, index) => type === previous.wrappers[index]) &&
        wrapperGroupHasCapacity(wrappers, previous.children.length)
      ) {
        previous.children.push(fittedChild);
      } else {
        groups.push({ children: [fittedChild], wrappers });
      }
    }

    const fitted: Descendant[] = [];

    for (const group of groups) {
      const children = createWrappedContent(
        schema,
        group.wrappers,
        group.children,
        options
      );

      if (!children) return null;
      fitted.push(...children);
    }

    if (content.max !== null && fitted.length > content.max) return null;

    return fitDirectContent(schema, content, fitted, [], options);
  }

  const fitClosedSliceInterior = (
    schema: CompiledEditorSchema,
    slice: ContentSlice,
    root: RootKey,
    provenance?: RootFitPathProvenance
  ): ContentSlice | null => {
    const fitOrigins = provenance ? createClosedFitOriginTracker() : undefined;
    const visit = (
      children: readonly Descendant[],
      openStart: number,
      openEnd: number,
      ancestors: readonly Element[]
    ): readonly Descendant[] | null => {
      let changed = false;
      const fitted: Descendant[] = [];

      for (const [index, child] of children.entries()) {
        const opensStart = openStart > 0 && index === 0;
        const opensEnd = openEnd > 0 && index === children.length - 1;
        let next: Descendant | null = child;

        if (!opensStart && !opensEnd) {
          next = fitClosedNode(schema, child, {
            ancestors,
            fitOrigins,
            root,
          });
        } else if (ElementApi.isElement(child)) {
          const nested = visit(
            child.children,
            opensStart ? openStart - 1 : 0,
            opensEnd ? openEnd - 1 : 0,
            [child, ...ancestors]
          );

          if (!nested) return null;
          if (
            nested.length !== child.children.length ||
            nested.some(
              (node, childIndex) => node !== child.children[childIndex]
            )
          ) {
            next = { ...child, children: [...nested] } as Element;
          }
        }

        if (!next) return null;
        changed ||= next !== child;
        fitted.push(next);
      }

      return changed ? Object.freeze(fitted) : children;
    };
    const content = visit(slice.content, slice.openStart, slice.openEnd, []);

    if (!content) return null;
    if (content !== slice.content && provenance && fitOrigins) {
      provenance.advance(slice.content, content, fitOrigins);
    }

    return content === slice.content
      ? slice
      : ContentSliceValue.withContent(slice, content, { open: 'preserve' });
  };

  const getSliceEdgeOpenDepth = (
    content: readonly Descendant[],
    edge: 'end' | 'start',
    canOpenPreservedContext: (element: Element) => boolean = () => false
  ) => {
    let children = content;
    let depth = 0;

    while (children.length > 0) {
      const node = edge === 'start' ? children[0] : children.at(-1);

      if (!ElementApi.isElement(node)) break;

      const behavior = getElementBehavior(node);

      if (
        behavior.isolating ||
        behavior.void ||
        (getElementSlicePolicy(node).preserveContext &&
          !canOpenPreservedContext(node))
      ) {
        break;
      }

      depth++;
      children = node.children;
    }

    return depth;
  };

  const fitContent = (
    slice: ContentSlice,
    options: Readonly<{ parent: Element; root?: RootKey }>
  ): readonly Descendant[] | null => {
    const schema = getDeclarativeSchema();
    const parentType = getElementType(options.parent);

    if (!schema || !parentType) return null;
    const element = schema.elements.byType.get(parentType);

    if (!element?.content) return null;
    const parentContent = element.content;
    const root = options.root ?? 'main';
    const structuralParent: Element = {
      children: options.parent.children,
      type: parentType,
      ...(element.contentRoots.size > 0 &&
      Object.hasOwn(options.parent, 'childRoots')
        ? {
            childRoots: (options.parent as { childRoots?: unknown }).childRoots,
          }
        : {}),
    };
    let parent = snapshotEditorJsonValue(
      structuralParent,
      'Detached slice-fit parent'
    );
    let virtualChildren = Object.freeze([parent]);
    let virtualDocument = IndexedDocument.fromValue(
      virtualChildren as readonly JsonNode[]
    );
    let parentRange = virtualDocument.nodeRange([0]);
    let anchor = virtualDocument.pointAt(parentRange.from + 1, 1);
    let focus = virtualDocument.pointAt(parentRange.to - 1, -1);

    if (!anchor || !focus) {
      parent = snapshotEditorJsonValue(
        { ...parent, children: [{ text: '' }] },
        'Detached slice-fit parent'
      );
      virtualChildren = Object.freeze([parent]);
      virtualDocument = IndexedDocument.fromValue(
        virtualChildren as readonly JsonNode[]
      );
      parentRange = virtualDocument.nodeRange([0]);
      anchor = virtualDocument.pointAt(parentRange.from + 1, 1);
      focus = virtualDocument.pointAt(parentRange.to - 1, -1);
    }

    if (!anchor || !focus) return null;

    const virtualValue = snapshotEditorJsonValue<EditorDocumentValue>(
      root === 'main'
        ? { children: [parent] }
        : { children: [], roots: { [root]: [parent] } },
      'Detached slice-fit document'
    );
    const builder = new DocumentChangeBuilder(virtualValue, {
      construct: ({ after, change }, preparation) =>
        constructCanonicalDocumentChange(getEditor(), after, change, {
          fitPreparation: preparation,
          schema: api,
        }),
      indexConstructedRoot,
      isSetValued: (node, key, context) =>
        isSetValuedProperty(node, key, context),
      validateConstructed: ({ after }) =>
        profileCoreDuration('slice-fit-content-validation', () => {
          const fittedParent = getDocumentRoot(
            after as EditorDocumentValue,
            root
          )[0];

          if (
            !fittedParent ||
            !ElementApi.isElement(fittedParent) ||
            getElementType(fittedParent) !== parentType
          ) {
            throw new EditorSchemaValidationError(
              'Detached slice fitting must retain its parent element.'
            );
          }
          const children = fittedParent.children;

          if (
            children.length < parentContent.min ||
            (parentContent.max !== null &&
              children.length > parentContent.max) ||
            children.some(
              (child) => !contentAllows(schema, parentContent, child)
            )
          ) {
            throw new EditorSchemaValidationError(
              `Editor element "${parentType}" has invalid fitted content.`
            );
          }

          validateDeclarativeChildren(
            children,
            schema,
            root,
            [fittedParent],
            []
          );
        }),
    });
    const at: Range = {
      anchor: {
        offset: anchor.offset,
        path: [...anchor.path],
        ...(root === 'main' ? {} : { root }),
      },
      focus: {
        offset: focus.offset,
        path: [...focus.path],
        ...(root === 'main' ? {} : { root }),
      },
    };
    const input = ContentSliceValue.fromJSON(slice);
    const contentBounds = {
      from: parentRange.from + 1,
      to: parentRange.to - 1,
    };
    const fitted = fit(slice, {
      builder,
      target: {
        at,
        contentBounds,
        ...(input.openStart === 0 && input.openEnd === 0
          ? { exactBounds: contentBounds }
          : {}),
        kind: 'range',
      },
    });

    if (!fitted) return null;

    try {
      const after = builder.value as EditorDocumentValue;
      const fittedParent = getDocumentRoot(after, root)[0];

      return fittedParent && ElementApi.isElement(fittedParent)
        ? cloneFrozen(fittedParent.children)
        : null;
    } catch (error) {
      if (error instanceof EditorSchemaValidationError) return null;
      throw error;
    }
  };

  const getSliceVariantFamilies = (
    slice: ContentSlice,
    at: Range,
    root: string,
    rootChildren: readonly Descendant[],
    targetRootProgram: CompiledSchemaContentProgram | null
  ) => {
    const contents: Array<{
      content: readonly Descendant[];
      cost: number;
      openEnd?: number;
      openStart?: number;
      priority: number;
    }> = [{ content: slice.content, cost: 0, priority: 0 }];
    const contentPrograms = new Map<
      CompiledSchemaContentProgram,
      Readonly<{ id: string; options: RuntimeTargetOptions }>
    >();
    const declarative = getDeclarativeSchema();
    const rootProgram = targetRootProgram;

    if (rootProgram) {
      contentPrograms.set(rootProgram, {
        id: root === 'main' ? 'root' : `root:${root}`,
        options: { root },
      });
    }

    const [start] = RangeApi.edges(at);
    const nestedStructuralVariant = (() => {
      if (
        slice.openStart !== 0 ||
        slice.openEnd !== 0 ||
        slice.content.length !== 1
      ) {
        return null;
      }

      const targetPath = start.path.slice(0, -1);
      const target = getDescendant(rootChildren, targetPath);
      const targetParent = getDescendant(rootChildren, targetPath.slice(0, -1));
      const source = slice.content[0];

      if (
        targetPath.length < 2 ||
        !target ||
        !ElementApi.isElement(target) ||
        !elementUsesInlineContent(target) ||
        !targetParent ||
        !ElementApi.isElement(targetParent) ||
        elementUsesInlineContent(targetParent) ||
        !ElementApi.isElement(source)
      ) {
        return null;
      }

      const canOpenStructuralContext = (element: Element) => {
        const behavior = getElementBehavior(element);
        const policy = getElementSlicePolicy(element);

        return (
          !behavior.inline &&
          !behavior.isolating &&
          !behavior.void &&
          !policy.preserveContext &&
          !elementUsesInlineContent(element)
        );
      };

      if (!canOpenStructuralContext(source)) return null;

      let children = source.children;

      while (true) {
        const first = children[0];

        if (!first || !ElementApi.isElement(first)) return null;
        if (elementUsesInlineContent(first)) break;
        if (!canOpenStructuralContext(first)) return null;

        children = [...first.children, ...children.slice(1)];
      }

      const first = children[0];

      if (
        children.length < 2 ||
        !first ||
        !ElementApi.isElement(first) ||
        !children.every((child) => ElementApi.isElement(child)) ||
        getElementType(first) !== getElementType(target)
      ) {
        return null;
      }

      return children;
    })();

    if (nestedStructuralVariant) {
      contents.push({
        content: nestedStructuralVariant,
        cost: 0,
        openEnd: 0,
        openStart: 1,
        priority: -1,
      });
    }

    for (let depth = start.path.length - 1; depth > 0; depth--) {
      const node = getDescendant(rootChildren, start.path.slice(0, depth));
      const type =
        node && ElementApi.isElement(node) ? getElementType(node) : null;
      const content = type
        ? declarative?.elements.byType.get(type)?.content
        : null;

      if (content && node && ElementApi.isElement(node)) {
        contentPrograms.set(content, {
          id: `element:${type}`,
          options: {
            ancestors: getElementAncestors(
              rootChildren,
              start.path.slice(0, depth),
              { includeTarget: true }
            ),
            root,
          },
        });
      }
    }

    for (const [content, { id, options }] of contentPrograms) {
      const fitted = declarative
        ? fitClosedContent(declarative, id, content, slice.content, options)
        : null;

      if (
        fitted &&
        (fitted.length !== slice.content.length ||
          fitted.some((child, index) => child !== slice.content[index]))
      ) {
        contents.push({ content: fitted, cost: 2, priority: 0 });
      }
    }

    return contents.map(
      (
        { content, cost: contentCost, openEnd, openStart, priority },
        contentIndex
      ): SliceVariantFamily => {
        const preparedContent =
          contentIndex === 0
            ? slice
            : openStart === undefined || openEnd === undefined
              ? ContentSliceValue.closed(content)
              : ContentSliceValue.fromJSON({ content, openEnd, openStart });
        const baseOpenStart = preparedContent.openStart;
        const baseOpenEnd = preparedContent.openEnd;
        const targetTypes = new Set(
          start.path
            .slice(0, -1)
            .map((_part, index) =>
              getDescendant(rootChildren, start.path.slice(0, index + 1))
            )
            .filter((node): node is Element =>
              Boolean(node && ElementApi.isElement(node))
            )
            .map((element) => getElementType(element))
        );
        const canOpenInTargetContext = [content[0], content.at(-1)].some(
          (edge) =>
            ElementApi.isElement(edge) && targetTypes.has(getElementType(edge))
        );
        const canOpenAtRoot = declarative
          ? [declarative.primaryRoot, ...declarative.roots.values()].some(
              (compiledRoot) =>
                content.every((child) =>
                  contentAllows(declarative, compiledRoot.content, child)
                )
            )
          : content.every(
              (child) =>
                ElementApi.isElement(child) &&
                !getElementBehavior(child).inline &&
                child.children.every(
                  (grandchild) =>
                    NodeApi.isText(grandchild) ||
                    (ElementApi.isElement(grandchild) &&
                      getElementBehavior(grandchild).inline)
                )
            );
        const canOpenContent =
          contentIndex === 0 &&
          (slice.openStart > 0 ||
            slice.openEnd > 0 ||
            contents.length === 1 ||
            canOpenInTargetContext) &&
          (canOpenAtRoot || canOpenInTargetContext);
        const maxOpenStart = canOpenContent
          ? getSliceEdgeOpenDepth(content, 'start', (element) =>
              targetTypes.has(getElementType(element))
            )
          : baseOpenStart;
        const maxOpenEnd = canOpenContent
          ? getSliceEdgeOpenDepth(content, 'end', (element) =>
              targetTypes.has(getElementType(element))
            )
          : baseOpenEnd;

        return Object.freeze({
          baseOpenEnd,
          baseOpenStart,
          contentCost,
          index: contentIndex,
          maxOpenEnd,
          maxOpenStart,
          priority,
          source: preparedContent,
        });
      }
    );
  };

  const getBoundaryCandidates = (
    at: Range,
    rootChildren: readonly Descendant[],
    document: IndexedDocument,
    source: ContentSlice,
    targetRootProgram: CompiledSchemaContentProgram | null,
    contentBounds?: Readonly<{ from: number; to: number }>,
    exactBounds?: Readonly<{ from: number; to: number }>
  ) => {
    const [start, end] = RangeApi.edges(at);
    const from = exactBounds?.from ?? document.positionAt(start);
    const to = exactBounds?.to ?? document.positionAt(end);
    const candidates = new Map<string, SliceBoundaryCandidate>();
    const add = (candidate: SliceBoundaryCandidate) => {
      if (candidate.from > candidate.to) return;
      if (
        contentBounds &&
        (candidate.from < contentBounds.from || candidate.to > contentBounds.to)
      ) {
        return;
      }

      const key = `${candidate.from}:${candidate.to}`;
      const previous = candidates.get(key);

      if (!previous || candidate.cost < previous.cost) {
        candidates.set(key, candidate);
      }
    };

    add({ cost: 0, from, to });

    const collapsed = from === to;
    const startBounds = [{ cost: 0, position: from }];
    const endBounds = [{ cost: 0, position: to }];
    const deleting = source.content.length === 0;
    const directSourceContexts = (() => {
      const contexts: Descendant[] = [];
      let content = source.content;

      for (let depth = 0; depth <= source.openStart; depth++) {
        const node = content[0];

        if (!node) break;
        contexts.push(node);
        if (!ElementApi.isElement(node)) break;
        if (depth < source.openStart) {
          const behavior = getElementBehavior(node);

          if (
            behavior.isolating ||
            behavior.void ||
            getElementSlicePolicy(node).preserveContext
          ) {
            return [];
          }
        }
        content = node.children;
      }

      return contexts;
    })();
    const canReplaceCoveredNode = (path: readonly number[]) => {
      if (deleting) return true;
      if (directSourceContexts.length === 0) return false;
      const parentPath = path.slice(0, -1);
      const parent =
        parentPath.length > 0 ? getDescendant(rootChildren, parentPath) : null;

      if (parent) {
        return (
          ElementApi.isElement(parent) &&
          directSourceContexts.some((candidate) =>
            canContain(parent, candidate)
          )
        );
      }

      const declarative = getDeclarativeSchema();
      const rootContent = targetRootProgram;

      return directSourceContexts.some((candidate) =>
        declarative && rootContent
          ? contentAllows(declarative, rootContent, candidate)
          : ElementApi.isElement(candidate) &&
            !getElementBehavior(candidate).inline
      );
    };
    const coveredCost = (depth: number, distance: number) => {
      if (deleting) return -distance;

      return -2 + 1 / (depth + 1);
    };

    for (let depth = start.path.length - 1; depth > 0; depth--) {
      const path = start.path.slice(0, depth);
      const node = getDescendant(rootChildren, path);

      if (!node || !ElementApi.isElement(node)) continue;
      if (getElementBehavior(node).isolating) break;

      const range = document.nodeRange(path);
      const startEdge = getTextEdge(node, path, 'start');
      const endEdge = getTextEdge(node, path, 'end');
      const cost = start.path.length - depth + 2;
      const { preserveContext, replaceWhenCovered } =
        getElementSlicePolicy(node);

      if (startEdge && pointsEqual(start, startEdge)) {
        // At the exact start of a selected container, replace that container
        // instead of retaining its type around content from the far edge.
        if (!collapsed && replaceWhenCovered && canReplaceCoveredNode(path)) {
          startBounds.push({
            cost: coveredCost(depth, cost),
            position: range.from,
          });
        }
        if (collapsed) add({ cost, from: range.from, to: range.from });
      }
      if (collapsed && endEdge && pointsEqual(start, endEdge)) {
        add({ cost, from: range.to, to: range.to });
      }
      if (collapsed && isEmptyDescendant(node)) {
        add({ cost: cost - 2, from: range.from, to: range.to });
      }
      if (preserveContext) break;
    }

    if (!collapsed) {
      for (let depth = end.path.length - 1; depth > 0; depth--) {
        const path = end.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node || !ElementApi.isElement(node)) continue;
        if (getElementBehavior(node).isolating) break;

        const range = document.nodeRange(path);
        const endEdge = getTextEdge(node, path, 'end');

        const { preserveContext, replaceWhenCovered } =
          getElementSlicePolicy(node);

        if (
          replaceWhenCovered &&
          endEdge &&
          pointsEqual(end, endEdge) &&
          canReplaceCoveredNode(path)
        ) {
          endBounds.push({
            cost: coveredCost(depth, end.path.length - depth + 2),
            position: range.to,
          });
        }
        if (preserveContext) break;
      }

      for (const startBound of startBounds) {
        for (const endBound of endBounds) {
          add({
            cost: startBound.cost + endBound.cost,
            from: startBound.position,
            to: endBound.position,
          });
        }
      }
    }

    return [...candidates.values()].sort(
      (left, right) => left.cost - right.cost
    );
  };

  const getNodeToken = (node: Descendant, kind: 'close' | 'open') => {
    if (kind === 'close') {
      return {
        kind,
        nodeKind: NodeApi.isText(node)
          ? ('text' as const)
          : ('element' as const),
      };
    }

    if (NodeApi.isText(node)) {
      const { text: _text, ...props } = node;

      return { kind, nodeKind: 'text' as const, props };
    }

    const { children: _children, ...props } = node;

    return { kind, nodeKind: 'element' as const, props };
  };

  const getContentEndOffset = (slice: DocumentSlice) => {
    let offset = slice.length;

    for (let index = slice.tokens.length - 1; index >= 0; index--) {
      if (slice.tokens[index]?.kind !== 'close') break;

      offset -= 1;
    }

    return offset;
  };

  const endsInInlineVoid = (slice: ContentSlice) => {
    let node = slice.content.at(-1);

    while (node && ElementApi.isElement(node)) {
      const behavior = getElementBehavior(node);

      if (behavior.inline && behavior.void) return true;
      node = node.children.at(-1);
    }

    return false;
  };

  const restorePartiallyDeletedContext = (
    document: IndexedDocument,
    rootChildren: readonly Descendant[],
    start: Point,
    end: Point,
    boundary: SliceBoundaryCandidate,
    exactFrom: number,
    exactTo: number,
    insert: DocumentSlice
  ) => {
    const tokens: ReturnType<typeof getNodeToken>[] = [];

    if (boundary.from < exactFrom && boundary.to === exactTo) {
      for (let depth = 1; depth <= end.path.length; depth++) {
        const path = end.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node) continue;

        const range = document.nodeRange(path);

        if (range.from >= boundary.from && range.from < exactTo) {
          tokens.push(getNodeToken(node, 'open'));
        }
      }
    }

    const prefix = DocumentSlice.fromJSON(tokens);

    tokens.length = 0;
    if (boundary.from === exactFrom && boundary.to > exactTo) {
      for (let depth = start.path.length; depth > 0; depth--) {
        const path = start.path.slice(0, depth);
        const node = getDescendant(rootChildren, path);

        if (!node) continue;

        const range = document.nodeRange(path);

        if (range.to > exactFrom && range.to <= boundary.to) {
          tokens.push(getNodeToken(node, 'close'));
        }
      }
    }

    const suffix = DocumentSlice.fromJSON(tokens);

    const restored =
      prefix.length === 0 && suffix.length === 0
        ? insert
        : DocumentSlice.concat([prefix, insert, suffix]);

    return {
      insert: restored,
      selectionOffset: prefix.length + getContentEndOffset(insert),
    };
  };

  const prepareFittedDocument = (
    builder: DocumentChangeBuilder,
    rawChange: DocumentChange,
    fitPreparation?: CanonicalFitPreparation,
    trustedCanonical?: Readonly<{
      createIndexes: () => ReadonlyMap<string, IndexedDocument>;
      runtimeCandidatePaths: ReadonlyMap<
        string,
        readonly (readonly number[])[]
      >;
    }>
  ) => {
    if (trustedCanonical) {
      const indexedAfter = profileCoreDuration(
        'slice-fit-changeset-apply',
        trustedCanonical.createIndexes
      );
      const runtimeCandidates = new Map(
        [...trustedCanonical.runtimeCandidatePaths].map(([root, paths]) => {
          const index = indexedAfter.get(root);

          if (!index) {
            throw new Error(
              `Missing trusted indexed result for runtime candidates in root "${root}".`
            );
          }

          return [
            root,
            Object.freeze(
              paths.map((path) =>
                Object.freeze({
                  node: index.node([...path] as Path),
                  path,
                })
              )
            ),
          ] as const;
        })
      );
      const step = builder.applyTrustedCanonical(rawChange, {
        indexedAfter,
        runtimeCandidates,
      });

      return {
        canonicalAfter: step.after as EditorDocumentValue,
        canonicalIndexes: step.indexedAfter,
        change: rawChange,
        constructionChange: new DocumentChange(),
        prepared: builder.prepare(rawChange, { classify: false }),
        rawAfter: step.after as EditorDocumentValue,
        rawIndexes: step.indexedAfter,
      };
    }

    const rawStep = profileCoreDuration('slice-fit-changeset-apply', () =>
      builder.apply(rawChange, { classify: false })
    );
    const constructionStep = profileCoreDuration(
      'slice-fit-canonical-change-finalize',
      () => builder.finalize(fitPreparation, { classify: false })
    );
    const canonicalAfter = builder.value as EditorDocumentValue;
    const change = profileCoreDuration('slice-fit-canonical-change-map', () =>
      builder.classify()
    );
    const constructionChange = constructionStep?.change ?? new DocumentChange();

    return {
      canonicalAfter,
      canonicalIndexes: constructionStep?.indexedAfter ?? rawStep.indexedAfter,
      change,
      constructionChange,
      prepared: builder.prepare(change),
      rawAfter: rawStep.after as EditorDocumentValue,
      rawIndexes: rawStep.indexedAfter,
    };
  };

  const mapFittedSelectionPoint = (
    rawDocument: IndexedDocument,
    canonicalDocument: IndexedDocument,
    constructionChange: DocumentChange,
    root: string,
    rawPosition: number,
    selectionAssociation: -1 | 1 = -1
  ) => {
    const rawPoint = rawDocument.pointAt(rawPosition, selectionAssociation);

    return rawPoint
      ? mapCanonicalRepresentationPoint(
          getEditor(),
          rawDocument,
          canonicalDocument,
          constructionChange,
          root,
          { offset: rawPoint.offset, path: [...rawPoint.path] },
          selectionAssociation === 1 || rawPoint.offset === 0 ? 1 : -1
        )
      : null;
  };

  const resolveExternalDocumentPoint = (
    source: readonly Descendant[],
    document: IndexedDocument,
    point: Point
  ): Point | null => {
    const direct = getDescendant(source, point.path);

    if (direct && NodeApi.isText(direct)) {
      return {
        offset: Math.min(point.offset, direct.text.length),
        path: [...point.path],
        ...(point.root === undefined ? {} : { root: point.root }),
      };
    }
    if (direct && ElementApi.isElement(direct)) {
      const [first, path] = NodeApi.first(direct, []);

      if (NodeApi.isText(first)) {
        return {
          offset: Math.min(point.offset, first.text.length),
          path: [...point.path, ...path],
          ...(point.root === undefined ? {} : { root: point.root }),
        };
      }
    }

    const fallback = document.pointAt(0, 1);

    return fallback
      ? {
          offset: fallback.offset,
          path: [...fallback.path],
          ...(point.root === undefined ? {} : { root: point.root }),
        }
      : null;
  };

  const mapExternalRootSelection = (
    selection: NonNullable<Selection>,
    source: readonly Descendant[],
    provenance: RootFitPathProvenance,
    constructionChange: DocumentChange,
    root: RootKey,
    rawDocument: IndexedDocument,
    canonicalDocument: IndexedDocument
  ): NonNullable<Selection> | null => {
    const sourceDocument = IndexedDocument.fromValue(source);
    const resolveSourcePoint = (point: Point) =>
      resolveExternalDocumentPoint(source, sourceDocument, point);
    const getCanonicalAssociation = (point: Point, fallback: -1 | 1) => {
      const node = getDescendant(source, point.path);

      if (!node || !NodeApi.isText(node) || node.text !== '') return fallback;
      const index = point.path.at(-1);

      if (index === undefined) return fallback;
      const parent = getDescendant(source, point.path.slice(0, -1));

      if (!parent || !ElementApi.isElement(parent)) return fallback;
      const previous = parent.children[index - 1];

      return previous &&
        ElementApi.isElement(previous) &&
        api.isInline(previous)
        ? 1
        : fallback;
    };
    const mapPoint: EditorSelectionMapContext['mapPoint'] = (
      point,
      options = {}
    ) => {
      const sourcePoint = resolveSourcePoint(point);

      if (!sourcePoint) return null;
      const association = getCanonicalAssociation(
        sourcePoint,
        options.association === 'backward' ? -1 : 1
      );
      const rawPoint = provenance.mapPoint(
        sourcePoint,
        sourceDocument,
        rawDocument,
        association,
        options.deletion
      );

      if (!rawPoint) return null;
      const mapped = constructionChange.empty
        ? { offset: rawPoint.offset, path: [...rawPoint.path] }
        : mapCanonicalRepresentationPoint(
            getEditor(),
            rawDocument,
            canonicalDocument,
            constructionChange,
            root,
            { offset: rawPoint.offset, path: [...rawPoint.path] },
            association
          );

      return mapped
        ? {
            offset: mapped.offset,
            path: [...mapped.path],
            ...(point.root === undefined ? {} : { root }),
          }
        : null;
    };
    const mapPath: EditorSelectionMapContext['mapPath'] = (
      path,
      options = {}
    ) => {
      const association = options.association === 'backward' ? -1 : 1;
      const rawPath = provenance.mapPath(
        path,
        sourceDocument,
        association,
        options.deletion
      );
      const rawNode = rawPath ? rawDocument.nodeRange(rawPath) : null;

      if (!rawNode) return null;
      const mappedPosition = mapInternalDocumentChangePosition(
        constructionChange,
        root,
        rawNode.from,
        association,
        options.deletion === 'drop' ? 'around' : undefined
      );
      const mappedNode =
        mappedPosition === null
          ? null
          : canonicalDocument.nodeStartingAt(mappedPosition);

      return mappedNode ? [...mappedNode.path] : null;
    };
    const mapRange: EditorSelectionMapContext['mapRange'] = (
      range,
      options = {}
    ) => {
      const sourceAnchor = resolveSourcePoint(range.anchor);
      const sourceFocus = resolveSourcePoint(range.focus);

      if (!sourceAnchor || !sourceFocus) return null;
      const anchorPosition = sourceDocument.positionAt(sourceAnchor);
      const focusPosition = sourceDocument.positionAt(sourceFocus);
      const forward = anchorPosition <= focusPosition;
      const associations =
        options.association === 'backward'
          ? (['backward', 'backward'] as const)
          : options.association === 'forward'
            ? (['forward', 'forward'] as const)
            : options.association === 'outward'
              ? forward
                ? (['backward', 'forward'] as const)
                : (['forward', 'backward'] as const)
              : forward
                ? (['forward', 'backward'] as const)
                : (['backward', 'forward'] as const);
      const anchor = mapPoint(range.anchor, {
        association: associations[0],
        deletion: options.deletion,
      });
      const focus = mapPoint(range.focus, {
        association: associations[1],
        deletion: options.deletion,
      });

      return anchor && focus ? { anchor, focus } : null;
    };
    const composedChange = provenance
      .createContextChange(sourceDocument, rawDocument, root)
      .compose(constructionChange);
    const context = Object.freeze({
      change: composedChange,
      editor: getEditor(),
      mapPath,
      mapPoint,
      mapRange,
      root,
    }) satisfies EditorSelectionMapContext;

    return mapSelectionWithContext(
      getEditor(),
      selection,
      context,
      { association: 'backward' },
      getRegistry()
    );
  };

  const fit = (
    slice: ContentSlice,
    options: InternalSliceFitOptions
  ): boolean => {
    const value = options.builder.value as EditorDocumentValue;
    const sourceSlice = profileCoreDuration('slice-fit-input', () =>
      ContentSliceValue.fromJSON(slice)
    );
    const rootPathProvenance =
      options.target.kind === 'root' && options.target.selection
        ? createRootFitPathProvenance(sourceSlice.content)
        : null;
    const rangeTarget = options.target.kind === 'range' ? options.target : null;
    const root =
      options.target.kind === 'root'
        ? options.target.root
        : (RangeApi.edges(options.target.at)[0].root ?? 'main');
    const missingRoot =
      root !== 'main' && !Object.hasOwn(value.roots ?? {}, root);

    if (rangeTarget) {
      const [rangeStart, rangeEnd] = RangeApi.edges(rangeTarget.at);

      if ((rangeEnd.root ?? 'main') !== (rangeStart.root ?? 'main')) {
        throw new Error('A slice replacement cannot span editor roots.');
      }
    }
    if (rangeTarget && missingRoot) {
      throw new Error(
        `Cannot fit content into missing editor ${editorRootLabel(root)}.`
      );
    }
    if (
      options.target.kind === 'root' &&
      (sourceSlice.openStart !== 0 || sourceSlice.openEnd !== 0)
    ) {
      return false;
    }

    try {
      profileCoreDuration('slice-fit-vocabulary-validation', () =>
        validateSliceVocabulary(sourceSlice.content)
      );
    } catch (error) {
      if (error instanceof EditorSchemaValidationError) return false;

      throw error;
    }

    const declarative = getDeclarativeSchema();
    const grammarFittedInput = declarative
      ? fitClosedSliceInterior(
          declarative,
          sourceSlice,
          root,
          rootPathProvenance ?? undefined
        )
      : sourceSlice;

    if (!grammarFittedInput) return false;

    const preparedInput =
      options.target.kind === 'root'
        ? null
        : profileCoreDuration('slice-fit-canonical-preparation', () =>
            prepareCanonicalFitSlice(
              getEditor(),
              declarative,
              grammarFittedInput,
              getDeclarativeSchema,
              api
            )
          );
    let inputSlice = preparedInput?.slice ?? grammarFittedInput;
    const targetRootProgram = declarative
      ? (getDocumentRootProgram(declarative, root, value) ?? null)
      : null;

    if (options.target.kind === 'root' && declarative && targetRootProgram) {
      const fitOrigins = rootPathProvenance
        ? createClosedFitOriginTracker()
        : undefined;
      const fittedRoot = fitClosedContent(
        declarative,
        root === 'main' ? 'root' : `root:${root}`,
        targetRootProgram,
        inputSlice.content,
        { fitOrigins, root },
        false,
        true
      );

      if (!fittedRoot) return false;
      if (
        fittedRoot.length !== inputSlice.content.length ||
        fittedRoot.some((node, index) => node !== inputSlice.content[index])
      ) {
        if (rootPathProvenance && fitOrigins) {
          rootPathProvenance.advance(
            inputSlice.content,
            fittedRoot,
            fitOrigins
          );
        }
        inputSlice = ContentSliceValue.closed(fittedRoot);
      }
    }

    if (
      inputSlice.openStart >
        getSliceEdgeOpenDepth(inputSlice.content, 'start') ||
      inputSlice.openEnd > getSliceEdgeOpenDepth(inputSlice.content, 'end')
    ) {
      return false;
    }

    const rootChildren = getDocumentRoot(value, root);
    const document = profileCoreDuration('slice-fit-target-index', () =>
      IndexedDocument.fromValue(rootChildren as readonly JsonNode[])
    );
    const rootPoint: Point = {
      offset: 0,
      path: [],
      ...(root === 'main' ? {} : { root }),
    };
    const at: Range =
      options.target.kind === 'root'
        ? { anchor: rootPoint, focus: rootPoint }
        : options.target.at;
    const [start, end] = RangeApi.edges(at);
    const exactBounds =
      options.target.kind === 'root'
        ? { from: 0, to: document.length }
        : options.target.exactBounds;
    const exactFrom = exactBounds?.from ?? document.positionAt(start);
    const exactTo = exactBounds?.to ?? document.positionAt(end);
    const collapsed = exactFrom === exactTo;
    const sameTextPath =
      start.path.length === end.path.length &&
      start.path.every((part, index) => part === end.path[index]);
    const targetText =
      sameTextPath && start.path.length > 0 ? document.node(start.path) : null;
    const boundaries =
      options.target.kind === 'root'
        ? []
        : profileCoreDuration('slice-fit-boundaries', () =>
            getBoundaryCandidates(
              at,
              rootChildren,
              document,
              inputSlice,
              targetRootProgram,
              rangeTarget?.contentBounds,
              exactBounds
            )
          );
    const variantFamilies =
      options.target.kind === 'root'
        ? []
        : profileCoreDuration('slice-fit-variants', () =>
            getSliceVariantFamilies(
              inputSlice,
              at,
              root,
              rootChildren,
              targetRootProgram
            )
          );
    type FitToken = (typeof document.tokens.tokens)[number];
    type FitOpenToken = Extract<FitToken, { kind: 'open' }>;

    const tokenLength = (token: FitToken) =>
      token.kind === 'text' ? token.text.length : 1;
    const contextsShareContent = (left: Element, right: Element) => {
      if (getElementType(left) === getElementType(right)) return true;

      const leftBehavior = getElementBehavior(left);
      const rightBehavior = getElementBehavior(right);

      return (
        !leftBehavior.inline &&
        !rightBehavior.inline &&
        elementUsesInlineContent(left) &&
        elementUsesInlineContent(right)
      );
    };
    const openTokenNode = (token: FitOpenToken): Descendant => {
      if (token.sourceNode) return token.sourceNode as Descendant;

      return token.nodeKind === 'text'
        ? ({ ...token.props, text: '' } as Text)
        : ({ ...token.props, children: [] } as unknown as Element);
    };
    const rootCanContain = (child: Descendant) => {
      const schema = getDeclarativeSchema();
      const rootContent = targetRootProgram;

      return schema && rootContent
        ? contentAllows(schema, rootContent, child)
        : ElementApi.isElement(child) && !getElementBehavior(child).inline;
    };
    const getOpenContext = (position: number): FitOpenToken[] =>
      profileCoreDuration('slice-fit-open-context', () =>
        document
          .openContextAt(position)
          .filter(({ from, to }) => from < position && position < to)
          .map(({ from }) => {
            const token = document.slice(from, from + 1).tokens[0];

            if (token?.kind !== 'open') {
              throw new Error(
                `Missing open token at document position ${from}.`
              );
            }

            return token;
          })
      );
    const openContextsMatch = (left: FitOpenToken, right: FitOpenToken) => {
      const leftNode = openTokenNode(left);
      const rightNode = openTokenNode(right);

      return NodeApi.isText(leftNode) && NodeApi.isText(rightNode)
        ? true
        : ElementApi.isElement(leftNode) &&
            ElementApi.isElement(rightNode) &&
            getElementType(leftNode) === getElementType(rightNode);
    };
    let startContext: FitOpenToken[] | undefined;
    let endContext: FitOpenToken[] | undefined;
    const getStartContext = () => (startContext ??= getOpenContext(exactFrom));
    const getEndContext = () => (endContext ??= getOpenContext(exactTo));
    const getLocalSyncPosition = () => {
      let sync = exactTo;
      let parentPath = end.path.slice(0, -1);

      while (parentPath.length > 0) {
        const parent = getDescendant(rootChildren, parentPath);

        if (!parent || !ElementApi.isElement(parent)) break;

        const childIndex = end.path[parentPath.length];

        if (
          !elementUsesInlineContent(parent) &&
          childIndex !== parent.children.length - 1
        ) {
          break;
        }

        sync = document.nodeRange(parentPath).to;
        parentPath = parentPath.slice(0, -1);
      }

      return sync;
    };
    const targetHasInlineAncestor = start.path
      .slice(0, -1)
      .map((_part, index) =>
        getDescendant(rootChildren, start.path.slice(0, index + 1))
      )
      .some(
        (node) => ElementApi.isElement(node) && getElementBehavior(node).inline
      );
    const createLocalTextCandidate = (
      variant: ContentSlice,
      cost: number,
      allowAsymmetric = false
    ): SliceFitCandidate | null => {
      if (!targetText || !NodeApi.isText(targetText)) return null;
      if (
        !allowAsymmetric &&
        inputSlice.openStart === inputSlice.openEnd &&
        variant.openStart !== variant.openEnd
      ) {
        return null;
      }
      if (
        variant.openStart === inputSlice.openStart &&
        variant.openStart > 1 &&
        start.offset === end.offset &&
        start.offset === targetText.text.length &&
        targetText.text.length > 0
      ) {
        return null;
      }

      const preparedOpenBlockCandidate = (() => {
        if (
          variant.openStart !== 1 ||
          variant.openEnd !== 1 ||
          start.path.length !== 2 ||
          !sameTextPath
        ) {
          return null;
        }

        const targetPath = start.path.slice(0, -1);
        const targetBlock = getDescendant(rootChildren, targetPath);

        if (
          !targetBlock ||
          !ElementApi.isElement(targetBlock) ||
          targetBlock.children.length !== 1 ||
          targetBlock.children[0] !== targetText
        ) {
          return null;
        }

        const firstSourceBlock = variant.content[0];
        if (
          !firstSourceBlock ||
          !ElementApi.isElement(firstSourceBlock) ||
          !rootCanContain(firstSourceBlock)
        )
          return null;
        const sourceBlocks = variant.content as readonly Element[];
        const targetType = getElementType(targetBlock);
        const targetElementKeys = Object.keys(targetBlock).filter(
          (key) => key !== 'children'
        );
        const targetTextKeys = Object.keys(targetText).filter(
          (key) => key !== 'text'
        );

        if (
          sourceBlocks.some((block) => {
            const text = ElementApi.isElement(block)
              ? block.children[0]
              : undefined;

            return (
              !NodeApi.isText(text) ||
              getElementType(block) !== targetType ||
              block.children.length !== 1 ||
              !nodePropertiesEqual(
                block,
                targetBlock,
                'children',
                targetElementKeys
              ) ||
              !nodePropertiesEqual(text, targetText, 'text', targetTextKeys)
            );
          })
        ) {
          return null;
        }

        const prefix = targetText.text.slice(0, start.offset);
        const suffix = targetText.text.slice(end.offset);

        if (!isDetachedContentSlice(variant)) return null;
        const fullInsert = encodeContentSliceContent(variant);

        if (!getPreparedDocumentSlice(fullInsert)) return null;
        const openInsert = encodeContentSlice(variant);
        const semanticInsert = openInsert.slice(1, openInsert.length - 1);
        const targetRange = document.nodeRange(targetPath);

        return Object.freeze({
          cost,
          from: targetRange.from,
          preparedOpenBlock: Object.freeze({
            fullInsert,
            prefix,
            semanticInsert,
            sourceBlocks: Object.freeze(sourceBlocks),
            suffix,
            targetPath: Object.freeze(targetPath),
          }),
          to: targetRange.to,
        });
      })();

      if (preparedOpenBlockCandidate) return preparedOpenBlockCandidate;

      let encoded = encodeContentSlice(variant);

      if (
        collapsed &&
        variant.openStart === 0 &&
        variant.openEnd === 0 &&
        start.path.length === 2 &&
        start.offset === 0 &&
        targetText.text.length === 0 &&
        getPreparedDocumentSlice(encoded) &&
        variant.content.every(rootCanContain)
      ) {
        const targetRange = document.nodeRange(start.path.slice(0, -1));

        return Object.freeze({
          cost,
          from: targetRange.from,
          insert: encoded,
          selectionOffset:
            encoded.length - getSliceEdgeOpenDepth(variant.content, 'end') - 1,
          to: targetRange.to,
        });
      }

      if (
        variant.openEnd === 0 &&
        start.offset === 0 &&
        start.offset === end.offset
      ) {
        const targetParent = getDescendant(
          rootChildren,
          start.path.slice(0, -1)
        );
        const terminal = variant.content.at(-1);

        if (
          targetParent &&
          ElementApi.isElement(targetParent) &&
          terminal &&
          ElementApi.isElement(terminal) &&
          getElementType(targetParent) === getElementType(terminal) &&
          encoded.tokens.at(-1)?.kind === 'close'
        ) {
          encoded = encoded.slice(0, encoded.length - 1);
        }
      }

      if (encoded.length === 0) return null;

      const output: FitToken[] = [];
      const localStartContext = getStartContext();
      const stack = [...localStartContext];
      let outputPosition = 0;
      let selectionPosition: number | null = null;
      const append = (token: FitToken) => {
        output.push(token);
        outputPosition += tokenLength(token);
      };
      const closeTop = () => {
        const top = stack.pop();

        if (!top) return false;

        append({ kind: 'close', nodeKind: top.nodeKind });

        return true;
      };
      const canCurrentContain = (child: Descendant) => {
        const parentToken = stack.at(-1);

        if (!parentToken) return rootCanContain(child);
        if (parentToken.nodeKind === 'text') return false;

        const parent = openTokenNode(parentToken);

        if (!ElementApi.isElement(parent)) return false;

        const blockTypes = parent.children
          .filter(
            (current): current is Element =>
              ElementApi.isElement(current) &&
              !getElementBehavior(current).inline
          )
          .map((current) => getElementType(current));
        const homogeneousType = blockTypes[0];

        if (
          !getCompiledElement(parent)?.content &&
          homogeneousType &&
          parent.children.some(
            (current) =>
              ElementApi.isElement(current) &&
              getElementType(current) === homogeneousType &&
              elementUsesInlineContent(current)
          ) &&
          blockTypes.every((type) => type === homogeneousType) &&
          ElementApi.isElement(child) &&
          !getElementBehavior(child).inline
        ) {
          return getElementType(child) === homogeneousType;
        }

        return canContain(parent, child);
      };
      const openFitted = (token: FitOpenToken) => {
        const child = openTokenNode(token);

        while (!canCurrentContain(child)) {
          if (!closeTop()) {
            return false;
          }
        }

        append(token);
        stack.push(token);

        return true;
      };

      if (variant.openStart > 0) {
        let children = variant.content;
        let preferred: Element | null = null;

        for (let depth = 0; depth < variant.openStart; depth++) {
          const node = children[0];

          if (!node || !ElementApi.isElement(node)) return null;
          preferred = node;
          children = node.children;
        }

        const targetDepth = start.path
          .slice(0, -1)
          .map((_part, index) =>
            getDescendant(rootChildren, start.path.slice(0, index + 1))
          )
          .findLastIndex(
            (node) =>
              preferred &&
              ElementApi.isElement(node) &&
              contextsShareContent(node, preferred)
          );

        if (targetDepth < 0) return null;

        while (stack.length > targetDepth + 1) {
          closeTop();
        }
      }

      if (
        variant.openStart === 0 &&
        variant.openEnd === 0 &&
        targetHasInlineAncestor
      ) {
        while (stack.length > 0) {
          const top = openTokenNode(stack.at(-1)!);

          if (
            NodeApi.isText(top) ||
            (ElementApi.isElement(top) && getElementBehavior(top).inline)
          ) {
            closeTop();
            continue;
          }

          break;
        }
      }

      const localEndContext = getEndContext();
      const endTextToken = localEndContext.findLast(
        (token) => token.nodeKind === 'text'
      );
      const ensureTextContext = () => {
        if (stack.at(-1)?.nodeKind === 'text') return true;

        if (stack.length === 0) {
          for (const token of localEndContext) {
            if (!openFitted(token)) return false;
            if (token.nodeKind === 'text') return true;
          }
        }

        const token =
          endTextToken ??
          ({ kind: 'open', nodeKind: 'text', props: {} } as FitOpenToken);

        return openFitted(token);
      };
      const process = (token: FitToken) => {
        if (token.kind === 'open') return openFitted(token);
        if (token.kind === 'close') {
          if (stack.length === 0) return true;

          return closeTop();
        }
        if (!ensureTextContext()) return false;

        append(token);

        return true;
      };
      const selectionFollowsInlineVoid = endsInInlineVoid(variant);
      const contentEnd = selectionFollowsInlineVoid
        ? encoded.length
        : getContentEndOffset(encoded);
      let insertedPosition = 0;

      for (const token of encoded.tokens) {
        if (!process(token)) return null;

        insertedPosition += tokenLength(token);
        if (selectionPosition === null && insertedPosition >= contentEnd) {
          selectionPosition = outputPosition - (insertedPosition - contentEnd);
        }
      }

      selectionPosition ??= outputPosition;

      const syncPosition = getLocalSyncPosition();
      const expected =
        syncPosition === exactTo
          ? localEndContext
          : getOpenContext(syncPosition);
      const sourceAlreadyAtSync =
        allowAsymmetric &&
        stack.length === expected.length &&
        stack.every((token, index) =>
          openContextsMatch(token, expected[index]!)
        );

      if (
        !sourceAlreadyAtSync &&
        stack.length > 0 &&
        stack.length < localEndContext.length &&
        stack.every((token, index) =>
          openContextsMatch(token, localEndContext[index]!)
        )
      ) {
        for (
          let index = stack.length;
          index < localEndContext.length;
          index++
        ) {
          append(localEndContext[index]!);
          stack.push(localEndContext[index]!);
        }
      }

      if (!sourceAlreadyAtSync) {
        for (const token of document.tokens.slice(exactTo, syncPosition)
          .tokens) {
          if (!process(token)) return null;
        }
      }

      let shared = 0;

      while (shared < stack.length && shared < expected.length) {
        if (!openContextsMatch(stack[shared]!, expected[shared]!)) break;
        shared++;
      }

      while (stack.length > shared) closeTop();
      for (let index = shared; index < expected.length; index++) {
        append(expected[index]!);
        stack.push(expected[index]!);
      }

      let candidateFrom = exactFrom;
      let candidateOutput = output;
      let removedPrefixLength = 0;

      for (const boundary of boundaries) {
        if (boundary.from >= exactFrom || boundary.to !== exactTo) continue;
        const opened = document.tokens.slice(boundary.from, exactFrom).tokens;

        if (
          opened.length === 0 ||
          !opened.every((token) => token.kind === 'open') ||
          !opened.every((_token, index) => {
            const close = output[index];
            const open = opened.at(-(index + 1));

            return (
              close?.kind === 'close' &&
              open?.kind === 'open' &&
              close.nodeKind === open.nodeKind
            );
          })
        ) {
          continue;
        }

        candidateFrom = boundary.from;
        removedPrefixLength = opened.length;
        candidateOutput = output.slice(opened.length);
        break;
      }

      return Object.freeze({
        cost,
        from: candidateFrom,
        insert: DocumentSlice.fromTokens(candidateOutput),
        ...(selectionFollowsInlineVoid
          ? { selectionAssociation: 1 as const }
          : {}),
        selectionOffset: selectionPosition - removedPrefixLength,
        to: syncPosition,
      });
    };

    const targetParent = getDescendant(rootChildren, start.path.slice(0, -1));
    const sourceEdges = [inputSlice.content[0], inputSlice.content.at(-1)];
    const sourceSharesTargetContent =
      ElementApi.isElement(targetParent) &&
      sourceEdges.some(
        (edge) =>
          ElementApi.isElement(edge) &&
          (getElementType(edge) === getElementType(targetParent) ||
            (NodeApi.string(edge).length > 0 &&
              contextsShareContent(targetParent, edge)))
      );
    const hasContextualStructuralVariant = variantFamilies.some(
      (family) => family.priority < 0
    );
    const preserveClosedInlineBoundary =
      inputSlice.openStart === 0 &&
      inputSlice.openEnd === 0 &&
      targetHasInlineAncestor;
    const preserveClosedStructuralBoundary =
      sourceSlice.openStart === 0 &&
      sourceSlice.openEnd === 0 &&
      inputSlice.content.every(rootCanContain) &&
      !sourceSharesTargetContent;
    const shouldGenerateLocalCandidate =
      !exactBounds &&
      sameTextPath &&
      inputSlice.content.length > 0 &&
      ((hasContextualStructuralVariant &&
        start.path.length > 2 &&
        Boolean(targetText && NodeApi.isText(targetText) && targetText.text)) ||
        (inputSlice.openStart !== inputSlice.openEnd &&
          start.path.length > 2) ||
        (inputSlice.openStart === 1 &&
          inputSlice.openEnd === 1 &&
          start.path.length === 2) ||
        (inputSlice.content.length > 1 && start.path.length > 2) ||
        (inputSlice.openStart > 0 && targetHasInlineAncestor) ||
        (!collapsed && targetHasInlineAncestor) ||
        (inputSlice.openStart === 0 &&
          inputSlice.openEnd === 0 &&
          Boolean(
            targetText &&
              NodeApi.isText(targetText) &&
              (targetText.text
                ? sourceSharesTargetContent
                  ? start.offset > 0 || end.offset < targetText.text.length
                  : start.offset > 0 && end.offset < targetText.text.length
                : sourceSharesTargetContent && start.path.length > 2)
          )));
    const preferOpenVariants =
      !preserveClosedInlineBoundary &&
      !preserveClosedStructuralBoundary &&
      (!collapsed ||
        (start.offset > 0 &&
          targetText &&
          NodeApi.isText(targetText) &&
          start.offset < targetText.text.length) ||
        sourceSharesTargetContent);

    const getInsertionContent = (variant: ContentSlice) => {
      if (variant.openStart !== variant.openEnd) return null;

      let content = variant.content;

      for (let depth = 0; depth < variant.openStart; depth++) {
        const node = content.length === 1 ? content[0] : null;

        if (!node || !ElementApi.isElement(node)) return null;
        content = node.children;
      }

      return content;
    };
    const canInsertContentAtBoundary = (
      boundary: SliceBoundaryCandidate,
      content: readonly Descendant[]
    ) => {
      if (content.length === 0) return true;
      if (
        !exactBounds &&
        boundary.from === exactFrom &&
        boundary.to === exactTo &&
        sameTextPath
      ) {
        const parent = getDescendant(rootChildren, start.path.slice(0, -1));

        return (
          Boolean(parent && ElementApi.isElement(parent)) &&
          content.every((child) => canContain(parent as Element, child))
        );
      }

      const from = document.childBoundaryAt(boundary.from);
      const to = document.childBoundaryAt(boundary.to);

      if (
        !from ||
        !to ||
        from.parentPath.length !== to.parentPath.length ||
        from.parentPath.some((part, index) => part !== to.parentPath[index])
      ) {
        return false;
      }
      const schema = getDeclarativeSchema();
      const parent =
        from.parentPath.length === 0
          ? null
          : getDescendant(rootChildren, from.parentPath);
      const parentChildren = parent
        ? ElementApi.isElement(parent)
          ? parent.children
          : null
        : rootChildren;

      if (!parentChildren) return false;
      const nextChildren = [
        ...parentChildren.slice(0, from.index),
        ...content,
        ...parentChildren.slice(to.index),
      ];

      if (!schema) {
        if (parent) {
          if (!ElementApi.isElement(parent)) return false;

          return content.every((child) => canContain(parent, child));
        }

        if (options.target.kind === 'root') return true;

        return content.every((child) => {
          if (!ElementApi.isElement(child)) return false;

          return !getElementBehavior(child).inline;
        });
      }

      if (parent && !ElementApi.isElement(parent)) return false;
      const parentType = parent ? getElementType(parent) : null;
      const program = parentType
        ? schema.elements.byType.get(parentType)?.content
        : targetRootProgram;

      if (!program) return false;

      const fitted = fitDirectContent(schema, program, nextChildren, [], {
        ancestors:
          parent && ElementApi.isElement(parent)
            ? getElementAncestors(rootChildren, from.parentPath, {
                includeTarget: true,
              })
            : [],
        root,
      });

      return Boolean(
        fitted &&
          fitted.length === nextChildren.length &&
          fitted.every((child, index) => child === nextChildren[index])
      );
    };
    const materializeCandidate = (
      candidate: SliceFitCandidate
    ): MaterializedSliceFitCandidate => {
      if ('insert' in candidate) return candidate;
      const { preparedOpenBlock, ...base } = candidate;
      const {
        fullInsert,
        prefix,
        semanticInsert,
        sourceBlocks,
        suffix,
        targetPath,
      } = preparedOpenBlock;
      const mergeText = (block: Element, text: string): Element => {
        const sourceText = block.children[0];

        if (!sourceText || !NodeApi.isText(sourceText)) {
          throw new Error('Prepared open block fit requires one text leaf.');
        }

        const children: Descendant[] = [Object.freeze({ ...sourceText, text })];

        Object.freeze(children);

        return Object.freeze({ ...block, children });
      };
      const first = sourceBlocks[0];
      const last = sourceBlocks.at(-1);

      if (!first || !last) {
        throw new Error('Prepared open block fit requires source blocks.');
      }
      const firstText = first.children[0];
      const lastText = last.children[0];

      if (
        !firstText ||
        !lastText ||
        !NodeApi.isText(firstText) ||
        !NodeApi.isText(lastText)
      ) {
        throw new Error('Prepared open block fit requires text boundaries.');
      }

      const preparedContent: readonly Descendant[] =
        prefix.length === 0 && suffix.length === 0
          ? sourceBlocks
          : sourceBlocks.length === 1
            ? [mergeText(first, prefix + firstText.text + suffix)]
            : [
                mergeText(first, prefix + firstText.text),
                ...sourceBlocks.slice(1, -1),
                mergeText(last, lastText.text + suffix),
              ];

      Object.freeze(preparedContent);
      const insert =
        prefix.length === 0 && suffix.length === 0
          ? fullInsert
          : DocumentSlice.fromPreparedNodes(preparedContent);
      const targetIndex = targetPath[0]!;
      const lastIndex = targetIndex + preparedContent.length - 1;
      const runtimeCandidatePaths: Array<readonly number[]> = [
        Object.freeze([targetIndex]),
        Object.freeze([targetIndex, 0]),
      ];

      if (lastIndex !== targetIndex) {
        runtimeCandidatePaths.push(
          Object.freeze([lastIndex]),
          Object.freeze([lastIndex, 0])
        );
      }
      Object.freeze(runtimeCandidatePaths);

      return Object.freeze({
        ...base,
        insert,
        runtimeCandidatePaths,
        semanticChange: Object.freeze({
          from: exactFrom,
          insert: semanticInsert,
          to: exactTo,
        }),
        selectionOffset:
          insert.length -
          suffix.length -
          getSliceEdgeOpenDepth(preparedContent, 'end') -
          1,
        trustedCanonical: true,
      });
    };
    const getStructuralContext = (position: number) =>
      document
        .openContextAt(position)
        .filter((entry) => entry.from < position && position < entry.to)
        .map((entry) => entry.kind);
    const isStructurallyApplicable = (candidate: SliceFitCandidate) => {
      if ('preparedOpenBlock' in candidate) {
        const from = document.childBoundaryAt(candidate.from);
        const to = document.childBoundaryAt(candidate.to);

        if (
          !from ||
          !to ||
          from.parentPath.length !== to.parentPath.length ||
          from.parentPath.some((part, index) => part !== to.parentPath[index])
        ) {
          return false;
        }

        const parent =
          from.parentPath.length === 0
            ? null
            : getDescendant(rootChildren, from.parentPath);

        return candidate.preparedOpenBlock.sourceBlocks.every((child) =>
          parent && ElementApi.isElement(parent)
            ? canContain(parent, child)
            : rootCanContain(child)
        );
      }

      const prepared = getPreparedDocumentSlice(candidate.insert);

      if (prepared) {
        const from = document.childBoundaryAt(candidate.from);
        const to = document.childBoundaryAt(candidate.to);

        if (
          !from ||
          !to ||
          from.parentPath.length !== to.parentPath.length ||
          from.parentPath.some((part, index) => part !== to.parentPath[index])
        ) {
          return false;
        }

        const parent =
          from.parentPath.length === 0
            ? null
            : getDescendant(rootChildren, from.parentPath);

        return prepared.nodes.every(
          (child) =>
            NodeApi.isDescendant(child) &&
            (parent && ElementApi.isElement(parent)
              ? canContain(parent, child)
              : rootCanContain(child))
        );
      }

      const stack = [...getStructuralContext(candidate.from)];

      for (const token of candidate.insert.tokens) {
        if (token.kind === 'open') {
          if (stack.at(-1) === 'text') return false;
          stack.push(token.nodeKind);
          continue;
        }
        if (token.kind === 'text') {
          if (stack.at(-1) !== 'text') return false;
          continue;
        }
        if (stack.pop() !== token.nodeKind) return false;
      }

      const expected = getStructuralContext(candidate.to);

      return (
        stack.length === expected.length &&
        stack.every((kind, index) => kind === expected[index])
      );
    };

    const seeds = profileCoreDuration('slice-fit-candidate-scoring', () => {
      const result: SliceFitSeed[] = [];

      for (const family of variantFamilies) {
        if (shouldGenerateLocalCandidate) {
          result.push({
            boundary: null,
            boundaryIndex: -1,
            family,
            kind: 'local',
            openEnd: preferOpenVariants
              ? family.maxOpenEnd
              : family.baseOpenEnd,
            openStart: preferOpenVariants
              ? family.maxOpenStart
              : family.baseOpenStart,
          });
        }

        boundaries.forEach((boundary, boundaryIndex) => {
          result.push({
            boundary,
            boundaryIndex,
            family,
            kind: 'structural',
            openEnd: family.baseOpenEnd,
            openStart: family.baseOpenStart,
          });
        });
      }

      return result;
    });

    const createStructuralCandidates = (
      boundary: SliceBoundaryCandidate,
      variant: SliceVariant,
      cost: number
    ) => {
      const sourceSpine = (depth: number, edge: 'end' | 'start'): Element[] => {
        const result: Element[] = [];
        let children = variant.slice.content;

        for (let index = 0; index < depth; index++) {
          const node = edge === 'start' ? children[0] : children.at(-1);

          if (!node || !ElementApi.isElement(node)) return [];
          result.push(node);
          children = node.children;
        }

        return result;
      };
      const matchesTargetContext = (
        depth: number,
        edge: 'end' | 'start',
        position: number
      ) => {
        if (depth === 0) return true;
        const source = sourceSpine(depth, edge);
        const target = getOpenContext(position)
          .map(openTokenNode)
          .filter((node): node is Element => ElementApi.isElement(node));

        if (source.length !== depth) {
          return false;
        }
        const preferred = source.at(-1)!;

        return target.some((targetNode) => {
          const sameType =
            getElementType(targetNode) === getElementType(preferred);

          return (
            contextsShareContent(targetNode, preferred) &&
            (!getElementSlicePolicy(targetNode).preserveContext || sameType)
          );
        });
      };

      if (
        !matchesTargetContext(
          variant.slice.openStart,
          'start',
          boundary.from
        ) ||
        !matchesTargetContext(variant.slice.openEnd, 'end', boundary.to)
      ) {
        return [];
      }

      const insertionContent = getInsertionContent(variant.slice);

      if (
        insertionContent &&
        !canInsertContentAtBoundary(boundary, insertionContent)
      ) {
        return [];
      }

      const encoded = encodeContentSlice(variant.slice);
      const contextInsert = restorePartiallyDeletedContext(
        document,
        rootChildren,
        start,
        end,
        boundary,
        exactFrom,
        exactTo,
        encoded
      );
      const inserts =
        contextInsert.insert === encoded
          ? [contextInsert]
          : [
              contextInsert,
              {
                insert: encoded,
                selectionOffset: getContentEndOffset(encoded),
              },
            ];

      if (
        boundary.from === exactFrom &&
        boundary.to === exactTo &&
        targetText &&
        NodeApi.isText(targetText)
      ) {
        const { text: _text, ...properties } = targetText;
        const closeTarget = DocumentSlice.fromJSON([
          { kind: 'close', nodeKind: 'text' },
        ]);
        const openTarget = DocumentSlice.fromJSON([
          { kind: 'open', nodeKind: 'text', props: properties },
        ]);

        inserts.unshift({
          insert: DocumentSlice.concat([closeTarget, encoded, openTarget]),
          selectionOffset: closeTarget.length + getContentEndOffset(encoded),
        });
      }

      return (
        endsInInlineVoid(variant.slice)
          ? inserts.map(({ insert }) => ({
              insert,
              selectionAssociation: 1 as const,
              selectionOffset: insert.length,
            }))
          : inserts
      ).map(
        ({ insert, selectionOffset }): SliceFitCandidate => ({
          cost,
          from: boundary.from,
          insert,
          selectionOffset,
          to: boundary.to,
        })
      );
    };

    const selectedCandidate: SliceFitCandidate | null =
      options.target.kind === 'root'
        ? (() => {
            const insert = encodeContentSlice(inputSlice);

            return Object.freeze({
              cost: 0,
              from: 0,
              insert,
              selectionOffset: getContentEndOffset(insert),
              to: document.length,
            });
          })()
        : selectSliceFitCandidate({
            candidates: ({ state, variant }) => {
              if (state.kind === 'local') {
                const candidate = profileCoreDuration(
                  'slice-fit-local-candidates',
                  () =>
                    createLocalTextCandidate(
                      variant.slice,
                      state.cost,
                      state.family.priority < 0
                    )
                );

                if (candidate && isStructurallyApplicable(candidate)) {
                  return [
                    state.family.index === 0
                      ? {
                          ...candidate,
                          ...(preparedInput
                            ? {
                                preparation: preparedInput.preparation,
                              }
                            : {}),
                        }
                      : candidate,
                  ];
                }

                return [];
              }

              const candidates = profileCoreDuration(
                'slice-fit-structural-candidates',
                () =>
                  createStructuralCandidates(
                    state.boundary!,
                    variant,
                    state.cost
                  )
              );

              const structurallyApplicable = candidates.filter(
                isStructurallyApplicable
              );

              return state.family.index === 0
                ? structurallyApplicable.map((candidate) => ({
                    ...candidate,
                    ...(preparedInput
                      ? {
                          preparation: preparedInput.preparation,
                        }
                      : {}),
                  }))
                : structurallyApplicable;
            },
            exactFrom,
            inputSlice,
            preferOpenVariants,
            seeds,
          });

    if (!selectedCandidate) return false;
    const materializedCandidate = profileCoreDuration(
      'slice-fit-candidate-materialize',
      () => materializeCandidate(selectedCandidate)
    );
    const candidate = materializedCandidate.preparation
      ? Object.freeze({
          ...materializedCandidate,
          preparation: bindCanonicalFitPreparation(
            materializedCandidate.preparation,
            materializedCandidate.insert
          ),
        })
      : materializedCandidate;

    const canonicalRootChange = profileCoreDuration(
      'slice-fit-changeset-build',
      () =>
        options.target.kind === 'root' &&
        candidate.from === 0 &&
        candidate.to === document.length
          ? reconcileChildrenStep(
              document,
              [],
              0,
              document.value.length,
              inputSlice.content as readonly JsonNode[]
            ).change
          : ChangeSet.create(document, {
              from: candidate.from,
              insert: candidate.insert,
              to: candidate.to,
            })
    );
    const rootChange = candidate.semanticChange
      ? ChangeSet.create(document, candidate.semanticChange)
      : canonicalRootChange;

    if (
      options.target.kind === 'range' &&
      rootChange.empty &&
      (inputSlice.content.length > 0 || exactFrom !== exactTo)
    ) {
      return false;
    }

    const candidateChange = createInternalDocumentChange(
      rootChange.empty ? new Map() : new Map([[root, rootChange]]),
      {
        ...(missingRoot ? { createRoots: [root] } : {}),
      }
    );
    const rootInputMatchesTarget =
      options.target.kind === 'root' &&
      !missingRoot &&
      structurallyEqual(rootChildren, inputSlice.content);
    const rawChange = rootInputMatchesTarget
      ? new DocumentChange()
      : candidateChange;
    const rootFitProvenance =
      options.target.kind === 'root' &&
      options.target.selection &&
      rootPathProvenance
        ? Object.freeze({
            paths: rootPathProvenance,
            rawDocument: rootInputMatchesTarget
              ? document
              : rootChange.apply(document),
            sourceDocument: IndexedDocument.fromValue(sourceSlice.content),
          })
        : null;
    let fittedDocument: ReturnType<typeof prepareFittedDocument>;
    const protectedInlineSpacerPaths =
      options.target.kind === 'root' &&
      options.target.selection &&
      rootFitProvenance
        ? (() => {
            const provenance = rootFitProvenance;
            const points = [
              options.target.selection.anchor,
              options.target.selection.focus,
            ].flatMap((point) => {
              const sourcePoint = resolveExternalDocumentPoint(
                sourceSlice.content,
                provenance.sourceDocument,
                point
              );

              if (!sourcePoint) return [];
              const mapped = provenance.paths.mapPoint(
                sourcePoint,
                provenance.sourceDocument,
                provenance.rawDocument,
                -1
              );

              return mapped
                ? [{ offset: mapped.offset, path: [...mapped.path] }]
                : [];
            });

            return getProtectedInlineSpacerEntries(
              getEditor(),
              provenance.rawDocument.value as readonly Descendant[],
              points,
              api
            ).map(({ path }) => path);
          })()
        : undefined;
    const fitPreparation =
      options.target.kind === 'root'
        ? prepareCanonicalRootFit(
            getDeclarativeSchema(),
            getDeclarativeSchema,
            root,
            protectedInlineSpacerPaths
          )
        : candidate.preparation;

    try {
      fittedDocument = profileCoreDuration('slice-fit-canonicalize', () =>
        prepareFittedDocument(
          options.builder.fork(),
          rawChange,
          fitPreparation,
          candidate.trustedCanonical
            ? {
                createIndexes: () =>
                  new Map([[root, canonicalRootChange.apply(document)]]),
                runtimeCandidatePaths: new Map([
                  [root, candidate.runtimeCandidatePaths ?? Object.freeze([])],
                ]),
              }
            : undefined
        )
      );
    } catch (error) {
      if (
        error instanceof DocumentSliceStructureError ||
        error instanceof EditorSchemaValidationError
      ) {
        return false;
      }

      throw error;
    }

    const { canonicalIndexes, constructionChange, prepared, rawIndexes } =
      fittedDocument;
    const rawIndex =
      rawIndexes.get(root) ?? rootFitProvenance?.rawDocument ?? null;
    const canonicalIndex = canonicalIndexes.get(root) ?? rawIndex;

    const point =
      options.target.kind === 'range'
        ? profileCoreDuration('slice-fit-selection-map', () => {
            if (!rawIndex || !canonicalIndex) {
              throw new Error('Fitted range did not retain its root indexes.');
            }
            const rawSelectionPosition =
              candidate.from + candidate.selectionOffset;

            return mapFittedSelectionPoint(
              rawIndex,
              canonicalIndex,
              constructionChange,
              root,
              rawSelectionPosition,
              candidate.selectionAssociation
            );
          })
        : null;

    const externalSelection =
      options.target.kind === 'root' && options.target.selection
        ? rootFitProvenance && rawIndex && canonicalIndex
          ? mapExternalRootSelection(
              options.target.selection,
              sourceSlice.content,
              rootFitProvenance.paths,
              constructionChange,
              root,
              rawIndex,
              canonicalIndex
            )
          : null
        : null;

    if (
      options.target.kind === 'root' &&
      options.target.selection &&
      !externalSelection
    ) {
      return false;
    }

    const selection = externalSelection
      ? externalSelection
      : point
        ? cloneFrozen(
            SelectionApi.text({
              anchor: {
                offset: point.offset,
                path: [...point.path],
                ...(root === 'main' ? {} : { root }),
              },
              focus: {
                offset: point.offset,
                path: [...point.path],
                ...(root === 'main' ? {} : { root }),
              },
            })
          )
        : undefined;
    const step = options.builder.adopt(prepared);

    if (!step) {
      throw new Error('Prepared slice fit does not match its transaction.');
    }

    options.apply?.(step, selection);

    return true;
  };

  const fitDocument = <TValue extends Value>(
    input: EditorDocumentValue<TValue>
  ): EditorDocumentValue<V> => {
    assertEditorJsonValue(input, 'Editor schema document');

    const inputRoots = input.roots ?? {};
    const initial = cloneFrozen({
      children: [],
      ...(input.meta !== undefined ? { meta: input.meta } : {}),
    }) as JsonEditorValue;
    const builder = new DocumentChangeBuilder(initial, {
      construct: ({ after, change }, preparation) =>
        constructCanonicalDocumentChange(getEditor(), after, change, {
          fitPreparation: preparation,
          schema: api,
        }),
      indexConstructedRoot,
      isSetValued: (node, key, context) =>
        isSetValuedProperty(node, key, context),
      preparationAuthority: api,
      preparationRevision: () => api,
    });
    const roots = new Map<string, readonly Descendant[]>([
      ['main', input.children],
      ...Object.entries(inputRoots).sort(([left], [right]) =>
        left.localeCompare(right)
      ),
    ]);

    for (const root of getVocabulary().rootNames) {
      if (getRootContent(root, input)?.min)
        roots.set(root, inputRoots[root] ?? []);
    }

    const collectProjectedRoots = (children: readonly Descendant[]) => {
      for (const node of children) {
        if (!ElementApi.isElement(node)) continue;

        for (const root of Object.values(getElementContentRoots(node))) {
          if (!roots.has(root)) roots.set(root, inputRoots[root] ?? []);
        }
        collectProjectedRoots(node.children);
      }
    };

    collectProjectedRoots(input.children);
    for (const children of Object.values(inputRoots)) {
      collectProjectedRoots(children);
    }

    const fitRoot = (root: string, children: readonly Descendant[]) => {
      const fitted = fit(ContentSliceValue.closed(children), {
        builder,
        target: { kind: 'root', root },
      });

      if (!fitted) {
        validateDocument(input);
        throw new EditorSchemaValidationError(
          `Editor ${
            root === 'main' ? 'primary root' : `root "${root}"`
          } cannot fit external content.`
        );
      }
    };

    for (const [root, children] of roots) fitRoot(root, children);

    // Projected root grammar depends on its owning element. Refit after every
    // input root exists so nested projections use their final compiled policy.
    for (const [root, children] of roots) fitRoot(root, children);

    builder.finalize();
    const document = builder.value as EditorDocumentValue<V>;

    validateDocument(document);
    return document;
  };

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
            IndexedDocument.fromValue(children as readonly JsonNode[])
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
    indexedAfter: ReadonlyMap<string, IndexedDocument>;
    indexedBefore: ReadonlyMap<string, IndexedDocument>;
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
          IndexedDocument.fromValue(children as readonly JsonNode[]);
        const beforeChildren = beforeRoots[root] ?? [];
        const beforeDocument =
          indexedBefore.get(root) ??
          IndexedDocument.fromValue(beforeChildren as readonly JsonNode[]);
        const rootChange = getInternalDocumentChangeSet(change, root);
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
          IndexedDocument.fromValue(beforeChildren as readonly JsonNode[]);
        const index = rebaseElementOwnedRootIndex(
          schema,
          root,
          getInternalDocumentChangeSet(change, root),
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
          : IndexedDocument.fromValue(children as readonly JsonNode[]));

      if (!afterDocument || afterDocument.value !== children) {
        throw new EditorSchemaValidationError(
          `Changed editor root "${root}" lost its immutable construction index.`
        );
      }

      const beforeChildren = beforeRoots[root] ?? [];
      const beforeDocument =
        indexedBefore.get(root) ??
        IndexedDocument.fromValue(beforeChildren as readonly JsonNode[]);
      const rootChange = getInternalDocumentChangeSet(change, root);
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
          IndexedDocument.fromValue(children as readonly JsonNode[])
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
    getElementProperty,
    getElementSlicePolicy,
    getRootContent,
    indexConstructedRoot,
    getTextPropertyAt,
    getVocabulary,
    hasContentRoots,
    identity: () =>
      getRegistry().schemaContributions.compiled?.identity ?? null,
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
