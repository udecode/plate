import type { Descendant, Element, RootKey } from '../interfaces';
import { ElementApi } from '../interfaces';
import type { SchemaContentRootOwnership } from '../interfaces/schema';
import { failInvariant } from '../internal/fail-invariant';
import { getDefined } from '../internal/get-defined';
import type { DocumentIndex } from './change/document-index';
import type { RootChange } from './change/root-change';
import type { JsonNode } from './change/tokens';
import {
  persistentMapChanges,
  persistentMapDelete,
  persistentMapEntries,
  persistentMapGet,
  type PersistentMapNode,
  persistentMapSet,
} from './persistent-map';
import { profileCoreDuration } from './profiling';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
} from './schema-compiler';
import { countCoreWork } from './work';

const stableProgramValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableProgramValue);
  if (value instanceof Set) {
    const entries = [...value];

    if (!entries.every((entry): entry is string => typeof entry === 'string')) {
      throw new Error('Schema content program sets must contain strings.');
    }

    return entries.sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0
    );
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

export type ElementOwnedRootBinding = Readonly<{
  childRoot: string;
  content: CompiledSchemaContentProgram;
  ownership: SchemaContentRootOwnership;
  ownerRoot: RootKey;
  ownerType: string;
  slot: string;
}>;

export type ElementOwnedRootIssue = Readonly<{
  kind: 'invalid-root' | 'missing-content-roots' | 'missing-slot';
  ownerRoot: RootKey;
  ownerType: string;
  slot?: string;
}>;

const matchesElementOwnedRootDeclaration = (
  input: ElementOwnedRootBinding | ElementOwnedRootIssue,
  node: JsonNode
) => {
  if (!ElementApi.isElement(node) || getElementType(node) !== input.ownerType) {
    return false;
  }
  const { childRoots } = node as { childRoots?: unknown };
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
    const childRoot = (childRoots as Record<string, unknown>)[input.slot];

    return (
      typeof childRoot !== 'string' ||
      childRoot.length === 0 ||
      childRoot === 'main'
    );
  }

  return (
    ownsSlot &&
    (childRoots as Record<string, unknown>)[input.slot] ===
      (input as ElementOwnedRootBinding).childRoot
  );
};

const issueKey = ({ kind, ownerType, slot }: ElementOwnedRootIssue) =>
  JSON.stringify([kind, ownerType, slot ?? null]);

type Counted<T> = Readonly<{ count: number; value: T }>;

type GrammarOwners = Readonly<{
  bindings: PersistentMapNode<Counted<ElementOwnedRootBinding>>;
  content: CompiledSchemaContentProgram;
  count: number;
  ownership: SchemaContentRootOwnership;
}>;

type ChildRootOwners = Readonly<{
  grammars: PersistentMapNode<GrammarOwners>;
}>;

/**
 * How many elements of one root make each declaration. Elements are counted
 * by what they declare, never by identity, so an edit that rebuilds or reuses
 * element objects cannot leave a count behind.
 */
export type ElementOwnedRootIndex = Readonly<{
  childRoots: PersistentMapNode<ChildRootOwners> | null;
  issues: PersistentMapNode<Counted<ElementOwnedRootIssue>> | null;
}>;

type MutableIndex = {
  -readonly [Key in keyof ElementOwnedRootIndex]: ElementOwnedRootIndex[Key];
};

const freezeIndex = ({ childRoots, issues }: MutableIndex) =>
  Object.freeze({ childRoots, issues });

const schemaIndexes = new WeakMap<
  DocumentIndex,
  Map<string, Map<RootKey, ElementOwnedRootIndex>>
>();
const schemaIndexKey = (schema: CompiledEditorSchema) =>
  `${schema.identity.fingerprint}:${schema.revision}`;

const cacheIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: DocumentIndex,
  index: ElementOwnedRootIndex
) => {
  let bySchema = schemaIndexes.get(document);

  if (!bySchema) {
    bySchema = new Map();
    schemaIndexes.set(document, bySchema);
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
  document: DocumentIndex
) =>
  schemaIndexes.get(document)?.get(schemaIndexKey(schema))?.get(root) ?? null;

const getElementType = (element: { type?: unknown }) =>
  typeof element.type === 'string' && element.type.length > 0
    ? element.type
    : null;

type OwnerDeclaration = Readonly<{
  bindings: ReadonlyArray<
    Readonly<{
      binding: ElementOwnedRootBinding;
      key: string;
      programKey: string;
    }>
  >;
  issues: readonly ElementOwnedRootIssue[];
}>;

const declaredContentRoots = (
  schema: CompiledEditorSchema,
  element: { type?: unknown }
) => {
  const ownerType = getElementType(element);
  const contentRoots = ownerType
    ? schema.elements.byType.get(ownerType)?.contentRoots
    : null;

  return ownerType && contentRoots && contentRoots.size > 0
    ? { contentRoots, ownerType }
    : null;
};

const NO_OWNED_ROOTS: readonly string[] = Object.freeze([]);

/**
 * The content roots `element` owns: for each slot its type declares, the root
 * its `childRoots` names there, when that names a root other than main.
 *
 * @internal
 */
export const ownedRootsOf = (
  schema: CompiledEditorSchema,
  element: Readonly<Record<string, unknown>>
): readonly string[] => {
  const declared = declaredContentRoots(schema, element);
  const { childRoots } = element;

  if (!declared || typeof childRoots !== 'object' || childRoots === null) {
    return NO_OWNED_ROOTS;
  }

  const owned: string[] = [];

  for (const slot of declared.contentRoots.keys()) {
    const childRoot = Object.hasOwn(childRoots, slot)
      ? (childRoots as Record<string, unknown>)[slot]
      : undefined;

    if (
      typeof childRoot === 'string' &&
      childRoot.length > 0 &&
      childRoot !== 'main'
    ) {
      owned.push(childRoot);
    }
  }

  return owned;
};

const readOwnerDeclaration = (
  schema: CompiledEditorSchema,
  ownerRoot: RootKey,
  owner: Element
): OwnerDeclaration | null => {
  const declared = declaredContentRoots(schema, owner);

  if (!declared) return null;

  const { contentRoots, ownerType } = declared;

  return profileCoreDuration('schema-root-ownership-index-owner-visit', () => {
    const issue = (
      kind: ElementOwnedRootIssue['kind'],
      slot?: string
    ): ElementOwnedRootIssue =>
      Object.freeze({ kind, ownerRoot, ownerType, slot });
    const { childRoots } = owner as { childRoots?: unknown };

    if (typeof childRoots !== 'object' || childRoots === null) {
      return Object.freeze({
        bindings: Object.freeze([]),
        issues: Object.freeze([issue('missing-content-roots')]),
      });
    }

    const bindings: Array<OwnerDeclaration['bindings'][number]> = [];
    const issues: ElementOwnedRootIssue[] = [];

    for (const [slot, root] of contentRoots) {
      if (!Object.hasOwn(childRoots, slot)) {
        issues.push(issue('missing-slot', slot));
        continue;
      }
      const childRoot = (childRoots as Record<string, unknown>)[slot];

      if (
        typeof childRoot !== 'string' ||
        childRoot.length === 0 ||
        childRoot === 'main'
      ) {
        issues.push(issue('invalid-root', slot));
        continue;
      }
      bindings.push(
        Object.freeze({
          binding: Object.freeze({
            childRoot,
            content: root.content,
            ownerRoot,
            ownership: root.ownership,
            ownerType,
            slot,
          }),
          key: JSON.stringify([ownerType, slot]),
          programKey: `${root.ownership}:${contentProgramKey(root.content)}`,
        })
      );
    }

    return Object.freeze({
      bindings: Object.freeze(bindings),
      issues: Object.freeze(issues),
    });
  });
};

const countAfter = (count: number, delta: number, what: string) => {
  const next = count + delta;

  if (next < 0) {
    failInvariant(`Element-owned root index removed an uncounted ${what}.`);
  }

  return next;
};

const updateDeclaration = (
  index: MutableIndex,
  declaration: OwnerDeclaration,
  delta: 1 | -1
) => {
  for (const issue of declaration.issues) {
    const key = issueKey(issue);
    const entry = persistentMapGet(index.issues, key);
    const count = countAfter(entry?.count ?? 0, delta, issue.kind);

    index.issues =
      count > 0
        ? persistentMapSet(index.issues, key, {
            count,
            value: entry?.value ?? issue,
          })
        : persistentMapDelete(index.issues, key);
  }

  for (const { binding, key, programKey } of declaration.bindings) {
    const { childRoot } = binding;
    const owners = persistentMapGet(index.childRoots, childRoot);
    const grammar = persistentMapGet(owners?.grammars ?? null, programKey);
    const entry = persistentMapGet(grammar?.bindings ?? null, key);
    const count = countAfter(entry?.count ?? 0, delta, `${key} owner`);
    const bindings =
      count > 0
        ? persistentMapSet(grammar?.bindings ?? null, key, {
            count,
            value: entry?.value ?? binding,
          })
        : persistentMapDelete(grammar?.bindings ?? null, key);
    let grammars = owners?.grammars ?? null;

    if (bindings) {
      grammars = persistentMapSet(grammars, programKey, {
        bindings,
        content: grammar?.content ?? binding.content,
        count: (grammar?.count ?? 0) + delta,
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

const countOwners = (
  schema: CompiledEditorSchema,
  ownerRoot: RootKey,
  node: JsonNode,
  index: MutableIndex
) => {
  if (!ElementApi.isElement(node)) return;
  const declaration = readOwnerDeclaration(schema, ownerRoot, node);

  if (declaration) updateDeclaration(index, declaration, 1);
  for (const child of node.children) {
    countOwners(schema, ownerRoot, child, index);
  }
};

/**
 * Count each element whose open token lies in `[from, to)`. An element's type
 * and `childRoots` sit on its open token, so these are the only elements whose
 * declarations a change can make or unmake.
 */
const countChangedOwners = (
  schema: CompiledEditorSchema,
  ownerRoot: RootKey,
  document: DocumentIndex,
  from: number,
  to: number,
  index: MutableIndex,
  delta: 1 | -1
) => {
  for (const entry of document.nodeRangesTouching(from, to)) {
    if (entry.kind !== 'element' || entry.from < from || entry.from >= to) {
      continue;
    }
    const declaration = readOwnerDeclaration(
      schema,
      ownerRoot,
      document.node(entry.path) as Element
    );

    if (declaration) updateDeclaration(index, declaration, delta);
  }
};

const lastBuilt = new WeakMap<
  CompiledEditorSchema,
  Map<RootKey, DocumentIndex>
>();

const builtFor = (schema: CompiledEditorSchema) => {
  let built = lastBuilt.get(schema);

  if (!built) {
    built = new Map();
    lastBuilt.set(schema, built);
  }

  return built;
};

export const forgetElementOwnedRootBuilds = (
  schema: CompiledEditorSchema,
  roots: Readonly<Record<string, unknown>>
) => {
  const built = lastBuilt.get(schema);

  if (!built) return;
  for (const root of built.keys()) {
    if (root !== 'main' && !Object.hasOwn(roots, root)) built.delete(root);
  }
};

/** @internal */
export const countElementOwnedRootBuilds = (schema: CompiledEditorSchema) =>
  lastBuilt.get(schema)?.size ?? 0;

const rebasingCostsLess = (last: DocumentIndex, document: DocumentIndex) =>
  Math.abs(last.size - document.size) < document.size;

const buildIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: DocumentIndex
): ElementOwnedRootIndex =>
  profileCoreDuration('schema-root-ownership-index-build', () => {
    const builtBySchema = builtFor(schema);
    const last = builtBySchema.get(root);

    if (
      last &&
      last !== document &&
      rebasingCostsLess(last, document) &&
      getElementOwnedRootIndex(schema, root, last)
    ) {
      builtBySchema.set(root, document);

      return advanceElementOwnedRootIndex(schema, root, last, document);
    }
    if (!last) builtBySchema.set(root, document);
    countCoreWork('ownershipBuilds');
    const index: MutableIndex = { childRoots: null, issues: null };

    for (const node of document.value) {
      countOwners(schema, root, node, index);
    }

    return cacheIndex(schema, root, document, freezeIndex(index));
  });

export const ensureElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  document: DocumentIndex
) =>
  getElementOwnedRootIndex(schema, root, document) ??
  buildIndex(schema, root, document);

export const advanceElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const cached = getElementOwnedRootIndex(schema, root, after);

  if (cached) return cached;
  const previous = getElementOwnedRootIndex(schema, root, before);

  if (!previous) return buildIndex(schema, root, after);
  const index: MutableIndex = { ...previous };

  for (const [from, to, afterFrom, afterTo] of before.changedChildren(after)) {
    countChangedOwners(
      schema,
      root,
      before,
      before.childPosition([], from),
      before.childPosition([], to),
      index,
      -1
    );
    countChangedOwners(
      schema,
      root,
      after,
      after.childPosition([], afterFrom),
      after.childPosition([], afterTo),
      index,
      1
    );
  }

  return cacheIndex(schema, root, after, freezeIndex(index));
};

export const rebaseElementOwnedRootIndex = (
  schema: CompiledEditorSchema,
  root: RootKey,
  change: RootChange | undefined,
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const cached = getElementOwnedRootIndex(schema, root, after);

  if (cached) return cached;
  // A move changes no open token, so it leaves every count as it was.
  if (before === after || !change || change.empty || change.exactMove(before)) {
    const previous = getElementOwnedRootIndex(schema, root, before);

    return previous
      ? cacheIndex(schema, root, after, previous)
      : buildIndex(schema, root, after);
  }

  return profileCoreDuration('schema-root-ownership-index-rebase', () => {
    const previous = getElementOwnedRootIndex(schema, root, before);

    if (!previous) return buildIndex(schema, root, after);
    const index: MutableIndex = { ...previous };

    change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      countChangedOwners(schema, root, before, fromBefore, toBefore, index, -1);
      countChangedOwners(schema, root, after, fromAfter, toAfter, index, 1);
    });
    builtFor(schema).set(root, after);

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
      count: grammar.count,
      ownership: grammar.ownership,
      owner: getDefined(persistentMapEntries(grammar.bindings).next().value)[1]
        .value,
    }))
  );
};

export function* getElementOwnedRootOwnerCounts(
  index: ElementOwnedRootIndex
): Generator<readonly [string, number]> {
  for (const [childRoot, owners] of persistentMapEntries(index.childRoots)) {
    let count = 0;

    for (const [, grammar] of persistentMapEntries(owners.grammars)) {
      count += grammar.count;
    }
    yield [childRoot, count];
  }
}

export const getElementOwnedRootKeys = (index: ElementOwnedRootIndex) =>
  Object.freeze(
    [...persistentMapEntries(index.childRoots)].map(([childRoot]) => childRoot)
  );

export const getElementOwnedRootIssues = (index: ElementOwnedRootIndex) =>
  Object.freeze(
    [...persistentMapEntries(index.issues)].map(([, { value }]) => value)
  );

export const getChangedElementOwnedRootKeys = (
  before: ElementOwnedRootIndex | null,
  after: ElementOwnedRootIndex | null
) =>
  persistentMapChanges(before?.childRoots ?? null, after?.childRoots ?? null);

export const getIntroducedElementOwnedRootIssues = (
  before: ElementOwnedRootIndex | null,
  after: ElementOwnedRootIndex | null
) =>
  persistentMapChanges(before?.issues ?? null, after?.issues ?? null).flatMap(
    (key) => {
      const added = persistentMapGet(after?.issues ?? null, key);

      return added &&
        added.count >
          (persistentMapGet(before?.issues ?? null, key)?.count ?? 0)
        ? [added.value]
        : [];
    }
  );

/**
 * The first element in `children` that makes `input`'s declaration. The index
 * counts declarations without positions, so validation finds an error's
 * location only when it reports one.
 *
 * @internal
 */
export const findElementOwnedRootOwnerPath = (
  children: readonly Descendant[],
  input: ElementOwnedRootBinding | ElementOwnedRootIssue
) => {
  const visit = (
    nodes: readonly Descendant[],
    path: readonly number[]
  ): readonly number[] | null => {
    for (const [position, node] of nodes.entries()) {
      if (!ElementApi.isElement(node)) continue;
      const nodePath = [...path, position];

      if (matchesElementOwnedRootDeclaration(input, node)) {
        return Object.freeze(nodePath);
      }
      const found = visit(node.children, nodePath);

      if (found) return found;
    }

    return null;
  };

  return visit(children, []);
};
