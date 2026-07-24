import type { Element, RootKey } from '../interfaces';
import { ElementApi } from '../interfaces';
import {
  type ChangeSet,
  getChangeSetRelocations,
  type IndexedDocument,
  type JsonNode,
} from './document-change';
import { profileCoreDuration } from './profiling';
import {
  appendCanonicalDocumentPathMapping,
  type CanonicalDocumentPathMapping,
  EMPTY_CANONICAL_DOCUMENT_PATH_MAPPING,
  getCanonicalDocumentPathMappingStats,
  mapCanonicalDocumentPath,
} from './snapshot-index';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
} from './schema-compiler';
import type { SchemaContentRootOwnership } from '../interfaces/schema';

type PersistentMapNode<T> = Readonly<{
  height: number;
  key: string;
  left: PersistentMapNode<T> | null;
  right: PersistentMapNode<T> | null;
  size: number;
  value: T;
}>;

const mapHeight = <T>(node: PersistentMapNode<T> | null) => node?.height ?? 0;
const mapSize = <T>(node: PersistentMapNode<T> | null) => node?.size ?? 0;
const mapNode = <T>(
  key: string,
  value: T,
  left: PersistentMapNode<T> | null,
  right: PersistentMapNode<T> | null
): PersistentMapNode<T> =>
  Object.freeze({
    height: Math.max(mapHeight(left), mapHeight(right)) + 1,
    key,
    left,
    right,
    size: mapSize(left) + mapSize(right) + 1,
    value,
  });

const rotateMapLeft = <T>(node: PersistentMapNode<T>) => {
  const right = node.right!;

  return mapNode(
    right.key,
    right.value,
    mapNode(node.key, node.value, node.left, right.left),
    right.right
  );
};

const rotateMapRight = <T>(node: PersistentMapNode<T>) => {
  const left = node.left!;

  return mapNode(
    left.key,
    left.value,
    left.left,
    mapNode(node.key, node.value, left.right, node.right)
  );
};

const balanceMap = <T>(node: PersistentMapNode<T>) => {
  const balance = mapHeight(node.left) - mapHeight(node.right);

  if (balance > 1) {
    const left = node.left!;

    return rotateMapRight(
      mapHeight(left.left) < mapHeight(left.right)
        ? mapNode(node.key, node.value, rotateMapLeft(left), node.right)
        : node
    );
  }
  if (balance < -1) {
    const right = node.right!;

    return rotateMapLeft(
      mapHeight(right.right) < mapHeight(right.left)
        ? mapNode(node.key, node.value, node.left, rotateMapRight(right))
        : node
    );
  }

  return node;
};

const persistentMapGet = <T>(
  node: PersistentMapNode<T> | null,
  key: string
): T | undefined => {
  let current = node;

  while (current) {
    if (key === current.key) return current.value;
    current = key < current.key ? current.left : current.right;
  }

  return;
};

const persistentMapSet = <T>(
  node: PersistentMapNode<T> | null,
  key: string,
  value: T
): PersistentMapNode<T> => {
  if (!node) return mapNode(key, value, null, null);
  if (key === node.key) {
    return Object.is(value, node.value)
      ? node
      : mapNode(key, value, node.left, node.right);
  }

  return balanceMap(
    key < node.key
      ? mapNode(
          node.key,
          node.value,
          persistentMapSet(node.left, key, value),
          node.right
        )
      : mapNode(
          node.key,
          node.value,
          node.left,
          persistentMapSet(node.right, key, value)
        )
  );
};

const removeSmallestMapNode = <T>(
  node: PersistentMapNode<T>
): readonly [PersistentMapNode<T>, PersistentMapNode<T> | null] => {
  if (!node.left) return [node, node.right];
  const [smallest, nextLeft] = removeSmallestMapNode(node.left);

  return [
    smallest,
    balanceMap(mapNode(node.key, node.value, nextLeft, node.right)),
  ];
};

const persistentMapDelete = <T>(
  node: PersistentMapNode<T> | null,
  key: string
): PersistentMapNode<T> | null => {
  if (!node) return null;
  if (key < node.key) {
    const left = persistentMapDelete(node.left, key);

    return left === node.left
      ? node
      : balanceMap(mapNode(node.key, node.value, left, node.right));
  }
  if (key > node.key) {
    const right = persistentMapDelete(node.right, key);

    return right === node.right
      ? node
      : balanceMap(mapNode(node.key, node.value, node.left, right));
  }
  if (!node.left) return node.right;
  if (!node.right) return node.left;
  const [successor, right] = removeSmallestMapNode(node.right);

  return balanceMap(mapNode(successor.key, successor.value, node.left, right));
};

function* persistentMapEntries<T>(
  node: PersistentMapNode<T> | null
): Generator<readonly [string, T]> {
  if (!node) return;
  yield* persistentMapEntries(node.left);
  yield [node.key, node.value];
  yield* persistentMapEntries(node.right);
}

const stableProgramValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableProgramValue);
  if (value instanceof Set) {
    return [...value].map(stableProgramValue).sort();
  }
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableProgramValue(child)])
  );
};

const contentProgramKeys = new WeakMap<CompiledSchemaContentProgram, string>();
const contentProgramKey = (content: CompiledSchemaContentProgram) => {
  let key = contentProgramKeys.get(content);

  if (!key) {
    key = JSON.stringify(
      stableProgramValue({
        allowedElementTypes: content.allowedElementTypes,
        allowsText: content.allowsText,
        allowsUnknownElements: content.allowsUnknownElements,
        defaultPlan: content.defaultPlan,
        max: content.max,
        min: content.min,
      })
    );
    contentProgramKeys.set(content, key);
  }

  return key;
};

const ownerIds = new WeakMap<object, string>();
let nextOwnerId = 0;
const getOwnerId = (owner: object) => {
  let id = ownerIds.get(owner);

  if (!id) {
    id = (++nextOwnerId).toString(36).padStart(8, '0');
    ownerIds.set(owner, id);
  }

  return id;
};

let nextPathOriginId = 0;
const createPathOriginId = () =>
  (++nextPathOriginId).toString(36).padStart(8, '0');

export type ElementOwnedRootBinding = Readonly<{
  childRoot: string;
  content: CompiledSchemaContentProgram;
  ownership: SchemaContentRootOwnership;
  owner: Element;
  ownerRoot: RootKey;
  ownerType: string;
  path: readonly number[];
  pathOrigin: string;
  slot: string;
}>;

export type ElementOwnedRootIssue = Readonly<{
  kind: 'invalid-root' | 'missing-content-roots' | 'missing-slot';
  owner: Element;
  ownerRoot: RootKey;
  ownerType: string;
  path: readonly number[];
  pathOrigin: string;
  slot?: string;
}>;

/** @internal Verify one indexed declaration without scanning for owner identity. */
export const matchesElementOwnedRootDeclaration = (
  input: ElementOwnedRootBinding | ElementOwnedRootIssue,
  node: JsonNode
) => {
  if (!ElementApi.isElement(node) || getElementType(node) !== input.ownerType) {
    return false;
  }
  const childRoots = (node as { childRoots?: unknown }).childRoots;
  const ownsSlot =
    typeof childRoots === 'object' &&
    childRoots !== null &&
    input.slot !== undefined &&
    Object.hasOwn(childRoots, input.slot);
  const issue = 'kind' in input ? input : null;

  if (issue?.kind === 'missing-content-roots') {
    return typeof childRoots !== 'object' || childRoots === null;
  }
  if (issue?.kind === 'missing-slot') {
    return typeof childRoots === 'object' && childRoots !== null && !ownsSlot;
  }
  if (issue?.kind === 'invalid-root') {
    if (!ownsSlot) return false;
    const childRoot = (childRoots as Record<string, unknown>)[input.slot!];

    return (
      typeof childRoot !== 'string' ||
      childRoot.length === 0 ||
      childRoot === 'main'
    );
  }

  return (
    ownsSlot &&
    (childRoots as Record<string, unknown>)[input.slot!] ===
      (input as ElementOwnedRootBinding).childRoot
  );
};

type GrammarOwners = Readonly<{
  bindings: PersistentMapNode<ElementOwnedRootBinding>;
  content: CompiledSchemaContentProgram;
  ownership: SchemaContentRootOwnership;
}>;

type ChildRootOwners = Readonly<{
  grammars: PersistentMapNode<GrammarOwners>;
}>;

export type ElementOwnedRootIndex = Readonly<{
  childRoots: PersistentMapNode<ChildRootOwners> | null;
  dirtyChildRoots: ReadonlySet<string>;
  dirtyOwnerIds: ReadonlySet<string>;
  issues: PersistentMapNode<readonly ElementOwnedRootIssue[]> | null;
  ownerPathOrigins: PersistentMapNode<string> | null;
  pathMappingCounts: PersistentMapNode<number> | null;
  pathMappings: PersistentMapNode<CanonicalDocumentPathMapping> | null;
  validation: 'full' | 'incremental' | 'sealed';
}>;

type MutableIndex = {
  childRoots: PersistentMapNode<ChildRootOwners> | null;
  dirtyChildRoots: Set<string>;
  dirtyOwnerIds: Set<string>;
  issues: PersistentMapNode<readonly ElementOwnedRootIssue[]> | null;
  ownerPathOrigins: PersistentMapNode<string> | null;
  pathMappingCounts: PersistentMapNode<number> | null;
  pathMappings: PersistentMapNode<CanonicalDocumentPathMapping> | null;
  validation: ElementOwnedRootIndex['validation'];
};

const EMPTY_INDEX: ElementOwnedRootIndex = Object.freeze({
  childRoots: null,
  dirtyChildRoots: Object.freeze(new Set<string>()),
  dirtyOwnerIds: Object.freeze(new Set<string>()),
  issues: null,
  ownerPathOrigins: null,
  pathMappingCounts: null,
  pathMappings: null,
  validation: 'sealed',
});

const freezeIndex = (index: MutableIndex): ElementOwnedRootIndex =>
  Object.freeze({
    childRoots: index.childRoots,
    dirtyChildRoots: Object.freeze(index.dirtyChildRoots),
    dirtyOwnerIds: Object.freeze(index.dirtyOwnerIds),
    issues: index.issues,
    ownerPathOrigins: index.ownerPathOrigins,
    pathMappingCounts: index.pathMappingCounts,
    pathMappings: index.pathMappings,
    validation: index.validation,
  });

const schemaIndexes = new WeakMap<
  object,
  Map<string, Map<RootKey, ElementOwnedRootIndex>>
>();
const schemaIndexKey = (schema: CompiledEditorSchema) =>
  `${schema.identity.fingerprint}:${schema.revision}`;

const cacheIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: IndexedDocument,
  index: ElementOwnedRootIndex
) => {
  let bySchema = schemaIndexes.get(document.value);

  if (!bySchema) {
    bySchema = new Map();
    schemaIndexes.set(document.value, bySchema);
  }
  const key = schemaIndexKey(schema);
  let byRoot = bySchema.get(key);

  if (!byRoot) {
    byRoot = new Map();
    bySchema.set(key, byRoot);
  }
  byRoot.set(root, index);

  return index;
};

export const getElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: IndexedDocument
) =>
  schemaIndexes.get(document.value)?.get(schemaIndexKey(schema))?.get(root) ??
  null;

const getElementType = (element: { type?: unknown }) =>
  typeof element.type === 'string' && element.type.length > 0
    ? element.type
    : null;

type OwnerDeclaration = Readonly<{
  bindings: readonly Readonly<{
    binding: ElementOwnedRootBinding;
    childRoot: string;
    key: string;
    programKey: string;
  }>[];
  id: string;
  issues: readonly ElementOwnedRootIssue[];
  pathOrigin: string;
}>;

const readOwnerDeclaration = (
  schema: CompiledEditorSchema,
  ownerRoot: RootKey,
  owner: Element,
  path: readonly number[],
  pathOrigin: string
): OwnerDeclaration | null => {
  const ownerType = getElementType(owner);
  const contentRoots = ownerType
    ? schema.elements.byType.get(ownerType)?.contentRoots
    : null;

  if (!ownerType || !contentRoots || contentRoots.size === 0) return null;

  return profileCoreDuration('schema-root-ownership-index-owner-visit', () => {
    const id = getOwnerId(owner);
    const location = {
      owner,
      ownerRoot,
      ownerType,
      path: Object.freeze([...path]),
      pathOrigin,
    } as const;
    const childRoots = (owner as { childRoots?: unknown }).childRoots;

    if (typeof childRoots !== 'object' || childRoots === null) {
      return Object.freeze({
        bindings: Object.freeze([]),
        id,
        issues: Object.freeze([
          Object.freeze({
            ...location,
            kind: 'missing-content-roots' as const,
          }),
        ]),
        pathOrigin,
      });
    }

    const bindings: OwnerDeclaration['bindings'][number][] = [];
    const issues: ElementOwnedRootIssue[] = [];

    for (const [slot, root] of contentRoots) {
      if (!Object.hasOwn(childRoots, slot)) {
        issues.push(Object.freeze({ ...location, kind: 'missing-slot', slot }));
        continue;
      }
      const childRoot = (childRoots as Record<string, unknown>)[slot];

      if (
        typeof childRoot !== 'string' ||
        childRoot.length === 0 ||
        childRoot === 'main'
      ) {
        issues.push(Object.freeze({ ...location, kind: 'invalid-root', slot }));
        continue;
      }
      bindings.push(
        Object.freeze({
          binding: Object.freeze({
            ...location,
            childRoot,
            content: root.content,
            ownership: root.ownership,
            slot,
          }),
          childRoot,
          key: `${id}:${slot}`,
          programKey: `${root.ownership}:${contentProgramKey(root.content)}`,
        })
      );
    }

    return Object.freeze({
      bindings: Object.freeze(bindings),
      id,
      issues: Object.freeze(issues),
      pathOrigin,
    });
  });
};

const updateDeclaration = (
  index: MutableIndex,
  declaration: OwnerDeclaration,
  action: 'add' | 'remove',
  dirty: boolean
) => {
  const previousPathOrigin = persistentMapGet(
    index.ownerPathOrigins,
    declaration.id
  );

  if (action === 'add') {
    index.ownerPathOrigins = persistentMapSet(
      index.ownerPathOrigins,
      declaration.id,
      declaration.pathOrigin
    );
    const count =
      persistentMapGet(index.pathMappingCounts, declaration.pathOrigin) ?? 0;

    index.pathMappingCounts = persistentMapSet(
      index.pathMappingCounts,
      declaration.pathOrigin,
      count + 1
    );
    if (!persistentMapGet(index.pathMappings, declaration.pathOrigin)) {
      index.pathMappings = persistentMapSet(
        index.pathMappings,
        declaration.pathOrigin,
        EMPTY_CANONICAL_DOCUMENT_PATH_MAPPING
      );
    }
  } else if (previousPathOrigin) {
    index.ownerPathOrigins = persistentMapDelete(
      index.ownerPathOrigins,
      declaration.id
    );
    const count =
      persistentMapGet(index.pathMappingCounts, previousPathOrigin) ?? 0;

    if (count <= 1) {
      index.pathMappingCounts = persistentMapDelete(
        index.pathMappingCounts,
        previousPathOrigin
      );
      index.pathMappings = persistentMapDelete(
        index.pathMappings,
        previousPathOrigin
      );
    } else {
      index.pathMappingCounts = persistentMapSet(
        index.pathMappingCounts,
        previousPathOrigin,
        count - 1
      );
    }
  }

  if (dirty) index.dirtyOwnerIds.add(declaration.id);
  index.issues =
    action === 'add' && declaration.issues.length > 0
      ? persistentMapSet(index.issues, declaration.id, declaration.issues)
      : persistentMapDelete(index.issues, declaration.id);

  for (const { binding, childRoot, key, programKey } of declaration.bindings) {
    if (dirty) index.dirtyChildRoots.add(childRoot);
    const owners = persistentMapGet(index.childRoots, childRoot);
    const grammar = persistentMapGet(owners?.grammars ?? null, programKey);
    const bindings =
      action === 'add'
        ? persistentMapSet(grammar?.bindings ?? null, key, binding)
        : persistentMapDelete(grammar?.bindings ?? null, key);
    let grammars = owners?.grammars ?? null;

    if (bindings) {
      grammars = persistentMapSet(grammars, programKey, {
        bindings,
        content: grammar?.content ?? binding.content,
        ownership: grammar?.ownership ?? binding.ownership,
      });
    } else {
      grammars = persistentMapDelete(grammars, programKey);
    }
    index.childRoots = grammars
      ? persistentMapSet(index.childRoots, childRoot, { grammars })
      : persistentMapDelete(index.childRoots, childRoot);
  }
};

const visitOwnerDeclarations = (
  schema: CompiledEditorSchema,
  ownerRoot: RootKey,
  node: JsonNode,
  path: readonly number[],
  visit: (declaration: OwnerDeclaration) => void,
  skip: WeakSet<object>,
  pathOrigin: string,
  recursive = true
) => {
  if (!ElementApi.isElement(node) || skip.has(node)) return;
  const declaration = readOwnerDeclaration(
    schema,
    ownerRoot,
    node,
    path,
    pathOrigin
  );

  if (declaration) visit(declaration);
  if (!recursive) return;
  for (const [index, child] of node.children.entries()) {
    visitOwnerDeclarations(
      schema,
      ownerRoot,
      child as JsonNode,
      [...path, index],
      visit,
      skip,
      pathOrigin
    );
  }
};

const changedNodes = (
  document: IndexedDocument,
  from: number,
  to: number,
  metrics?: {
    prefixNodes: number;
    prefixSteps: number;
    touching: number;
  }
): readonly Readonly<{ path: readonly number[]; recursive: boolean }>[] => {
  const touching = document.nodeRangesTouching(from, to);

  if (metrics) metrics.touching = touching.length;
  const contained: (typeof touching)[number][] = [];
  const boundary: (typeof touching)[number][] = [];

  for (const entry of touching) {
    if (entry.from >= from && entry.to <= to) {
      contained.push(entry);
    } else if (entry.from >= from && entry.from < to) {
      boundary.push(entry);
    }
  }
  contained.sort((left, right) => left.path.length - right.path.length);
  boundary.sort((left, right) => left.path.length - right.path.length);
  const selected: Readonly<{
    path: readonly number[];
    recursive: boolean;
  }>[] = [];
  type SelectedPathNode = {
    children?: Map<number, SelectedPathNode>;
    selected: boolean;
  };
  const selectedPaths: SelectedPathNode = {
    children: new Map(),
    selected: false,
  };

  if (metrics) metrics.prefixNodes = 1;
  const select = (path: readonly number[], recursive: boolean) => {
    let node = selectedPaths;

    if (node.selected) return;
    for (const part of path) {
      if (metrics) metrics.prefixSteps += 1;
      let child = node.children?.get(part);

      if (!child) {
        child = { selected: false };
        node.children ??= new Map();
        node.children.set(part, child);
        if (metrics) metrics.prefixNodes += 1;
      }
      node = child;
      if (node.selected) return;
    }
    node.selected = true;
    selected.push(Object.freeze({ path, recursive }));
  };

  for (const entry of contained) {
    select(entry.path, true);
  }

  for (const entry of boundary) {
    select(entry.path, false);
  }

  const entry = document.nodeStartingAt(from);

  if (entry) select(entry.path, false);

  return Object.freeze(selected);
};

/** @internal Inspect changed-owner selection and its prefix-index work. */
export const inspectElementOwnedRootChangedNodes = (
  document: IndexedDocument,
  from: number,
  to: number
) => {
  const metrics = { prefixNodes: 0, prefixSteps: 0, touching: 0 };
  const candidates = changedNodes(document, from, to, metrics);

  return Object.freeze({ candidates, ...metrics });
};

const buildIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: IndexedDocument,
  dirty: boolean
) =>
  profileCoreDuration('schema-root-ownership-index-build', () => {
    const pathOrigin = createPathOriginId();
    const index: MutableIndex = {
      childRoots: null,
      dirtyChildRoots: new Set(),
      dirtyOwnerIds: new Set(),
      issues: null,
      ownerPathOrigins: null,
      pathMappingCounts: null,
      pathMappings: null,
      validation: 'full',
    };
    const skip = new WeakSet<object>();

    for (const [position, node] of document.value.entries()) {
      visitOwnerDeclarations(
        schema,
        root,
        node,
        [position],
        (declaration) => updateDeclaration(index, declaration, 'add', dirty),
        skip,
        pathOrigin
      );
    }

    return cacheIndex(schema, root, document, freezeIndex(index));
  });

export const ensureElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: IndexedDocument
) =>
  getElementOwnedRootIndex(schema, root, document) ??
  buildIndex(schema, root, document, false);

const ownerDeclarationIdentityEqual = (
  schema: CompiledEditorSchema,
  before: Element,
  after: Element
) => {
  const type = getElementType(before);

  if (!type || getElementType(after) !== type) return false;
  const slots = schema.elements.byType.get(type)?.contentRoots;

  if (!slots || slots.size === 0) return false;
  const beforeRoots = (before as { childRoots?: unknown }).childRoots;
  const afterRoots = (after as { childRoots?: unknown }).childRoots;

  if (
    typeof beforeRoots !== 'object' ||
    beforeRoots === null ||
    typeof afterRoots !== 'object' ||
    afterRoots === null
  ) {
    return beforeRoots === afterRoots;
  }

  return [...slots.keys()].every(
    (slot) =>
      Object.hasOwn(beforeRoots, slot) === Object.hasOwn(afterRoots, slot) &&
      Object.is(
        (beforeRoots as Record<string, unknown>)[slot],
        (afterRoots as Record<string, unknown>)[slot]
      )
  );
};

const transferChangedOwnerIdentities = (
  schema: CompiledEditorSchema,
  before: IndexedDocument,
  after: IndexedDocument,
  change: ChangeSet,
  ranges: readonly Readonly<{
    fromBefore: number;
    toBefore: number;
  }>[]
) => {
  const mapping = appendCanonicalDocumentPathMapping(
    EMPTY_CANONICAL_DOCUMENT_PATH_MAPPING,
    before,
    after,
    change
  );
  const visited = new Set<string>();
  const continuedBefore = new WeakSet<object>();
  const continuedAfter = new WeakSet<object>();

  for (const { fromBefore, toBefore } of ranges) {
    for (const candidate of changedNodes(before, fromBefore, toBefore)) {
      const candidateTargetPath = mapCanonicalDocumentPath(
        mapping,
        candidate.path
      );

      if (
        candidateTargetPath &&
        before.node(candidate.path) === after.node(candidateTargetPath)
      ) {
        continuedBefore.add(before.node(candidate.path));
        continuedAfter.add(after.node(candidateTargetPath));
      }
      for (let depth = 1; depth <= candidate.path.length; depth += 1) {
        const path = candidate.path.slice(0, depth);
        const key = path.join('.');

        if (visited.has(key)) continue;
        visited.add(key);
        const beforeNode = before.node(path);
        const id =
          typeof beforeNode === 'object' && beforeNode !== null
            ? ownerIds.get(beforeNode)
            : undefined;

        if (!id || !ElementApi.isElement(beforeNode)) continue;
        const targetPath = mapCanonicalDocumentPath(mapping, path);

        if (!targetPath) continue;
        const afterNode = after.node(targetPath);

        if (
          ElementApi.isElement(afterNode) &&
          ownerDeclarationIdentityEqual(schema, beforeNode, afterNode)
        ) {
          ownerIds.set(afterNode, id);
          continuedBefore.add(beforeNode);
          continuedAfter.add(afterNode);
        }
      }
    }
  }

  return { continuedAfter, continuedBefore };
};

export const rebaseElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  change: ChangeSet | undefined,
  before: IndexedDocument,
  after: IndexedDocument
) => {
  const cached = getElementOwnedRootIndex(schema, root, after);

  if (cached) return cached;
  if (before === after || !change || change.empty) {
    const previous = getElementOwnedRootIndex(schema, root, before);

    return previous
      ? cacheIndex(schema, root, after, previous)
      : buildIndex(schema, root, after, true);
  }

  return profileCoreDuration('schema-root-ownership-index-rebase', () => {
    const previous = getElementOwnedRootIndex(schema, root, before);

    if (!previous) return buildIndex(schema, root, after, true);
    const relocations = getChangeSetRelocations(change, before, after);
    let pathMappings: MutableIndex['pathMappings'] = null;

    for (const [pathOrigin, mapping] of persistentMapEntries(
      previous.pathMappings
    )) {
      pathMappings = persistentMapSet(
        pathMappings,
        pathOrigin,
        appendCanonicalDocumentPathMapping(mapping, before, after, change)
      );
    }
    const index: MutableIndex = {
      childRoots: previous.childRoots,
      dirtyChildRoots: new Set(previous.dirtyChildRoots),
      dirtyOwnerIds: new Set(previous.dirtyOwnerIds),
      issues: previous.issues,
      ownerPathOrigins: previous.ownerPathOrigins,
      pathMappingCounts: previous.pathMappingCounts,
      pathMappings,
      validation: 'incremental',
    };
    const ranges: Array<{
      fromAfter: number;
      fromBefore: number;
      toAfter: number;
      toBefore: number;
    }> = [];

    change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      ranges.push({ fromAfter, fromBefore, toAfter, toBefore });
    });
    const { continuedAfter: relocatedAfter, continuedBefore: relocatedBefore } =
      transferChangedOwnerIdentities(schema, before, after, change, ranges);
    const pathOrigin = createPathOriginId();
    const relocatedBeforePaths = new Set(
      relocations.map(({ path }) => path.join('.'))
    );
    const relocatedAfterPaths = new Set(
      relocations.map(({ targetPath }) => targetPath.join('.'))
    );
    const isInsideRelocation = (
      paths: ReadonlySet<string>,
      path: readonly number[]
    ) => {
      for (let depth = 1; depth <= path.length; depth += 1) {
        if (paths.has(path.slice(0, depth).join('.'))) return true;
      }

      return false;
    };

    for (const relocation of relocations) {
      const beforeNode = before.node(relocation.path);
      const afterNode = after.node(relocation.targetPath);

      if (typeof beforeNode === 'object' && beforeNode !== null) {
        relocatedBefore.add(beforeNode);
      }
      if (typeof afterNode === 'object' && afterNode !== null) {
        relocatedAfter.add(afterNode);
      }
    }
    const removed = new WeakSet<object>();
    const added = new WeakSet<object>();

    for (const { fromAfter, fromBefore, toAfter, toBefore } of ranges) {
      for (const candidate of changedNodes(before, fromBefore, toBefore)) {
        if (isInsideRelocation(relocatedBeforePaths, candidate.path)) continue;
        const node = before.node(candidate.path);

        if (removed.has(node)) continue;
        removed.add(node);
        visitOwnerDeclarations(
          schema,
          root,
          node,
          candidate.path,
          (declaration) =>
            updateDeclaration(index, declaration, 'remove', true),
          relocatedBefore,
          pathOrigin,
          candidate.recursive
        );
      }
      for (const candidate of changedNodes(after, fromAfter, toAfter)) {
        if (isInsideRelocation(relocatedAfterPaths, candidate.path)) continue;
        const node = after.node(candidate.path);

        if (added.has(node)) continue;
        added.add(node);
        visitOwnerDeclarations(
          schema,
          root,
          node,
          candidate.path,
          (declaration) => updateDeclaration(index, declaration, 'add', true),
          relocatedAfter,
          pathOrigin,
          candidate.recursive
        );
      }
    }

    return cacheIndex(schema, root, after, freezeIndex(index));
  });
};

export const getElementOwnedRootGrammarBindings = (
  index: ElementOwnedRootIndex,
  childRoot: string
) => {
  const owners = persistentMapGet(index.childRoots, childRoot);

  if (!owners) return Object.freeze([]);

  return Object.freeze(
    [...persistentMapEntries(owners.grammars)].map(([, grammar]) => ({
      content: grammar.content,
      count: mapSize(grammar.bindings),
      ownership: grammar.ownership,
      owner: persistentMapEntries(grammar.bindings).next().value![1],
    }))
  );
};

export const getElementOwnedRootKeys = (index: ElementOwnedRootIndex) =>
  Object.freeze(
    [...persistentMapEntries(index.childRoots)].map(([childRoot]) => childRoot)
  );

export const getElementOwnedRootIssues = (index: ElementOwnedRootIndex) =>
  Object.freeze(
    [...persistentMapEntries(index.issues)].flatMap(([, issues]) => issues)
  );

export const getDirtyElementOwnedRootIssues = (index: ElementOwnedRootIndex) =>
  Object.freeze(
    [...index.dirtyOwnerIds].flatMap(
      (ownerId) => persistentMapGet(index.issues, ownerId) ?? []
    )
  );

export const resolveElementOwnedRootPath = (
  index: ElementOwnedRootIndex,
  input: ElementOwnedRootBinding | ElementOwnedRootIssue
) => {
  const mapping = persistentMapGet(index.pathMappings, input.pathOrigin);

  return mapping
    ? mapCanonicalDocumentPath(
        mapping,
        input.path,
        (before, after) =>
          matchesElementOwnedRootDeclaration(input, before) &&
          matchesElementOwnedRootDeclaration(input, after)
      )
    : Object.freeze([...input.path]);
};

/** @internal Test-only bounds for retained element-owned root path history. */
export const getElementOwnedRootPathMappingStats = (
  index: ElementOwnedRootIndex
) => {
  const mappings = [...persistentMapEntries(index.pathMappings)].map(
    ([, mapping]) => getCanonicalDocumentPathMappingStats(mapping)
  );

  return Object.freeze({
    mappedChanges: Math.max(
      0,
      ...mappings.map(({ mappedChanges }) => mappedChanges)
    ),
    origins: mappings.length,
    retainedDocuments: mappings.reduce(
      (count, { retainedDocuments }) => count + retainedDocuments,
      0
    ),
    segments: mappings.reduce((count, { segments }) => count + segments, 0),
  });
};

export const sealElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: IndexedDocument
) => {
  const index = getElementOwnedRootIndex(schema, root, document);

  if (
    !index ||
    (index.validation === 'sealed' &&
      index.dirtyChildRoots.size === 0 &&
      index.dirtyOwnerIds.size === 0)
  ) {
    return index;
  }

  return cacheIndex(
    schema,
    root,
    document,
    Object.freeze({
      ...index,
      dirtyChildRoots: EMPTY_INDEX.dirtyChildRoots,
      dirtyOwnerIds: EMPTY_INDEX.dirtyOwnerIds,
      validation: 'sealed',
    })
  );
};
