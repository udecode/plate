import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonRecord } from '../../core/change/json';
import {
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { ConstructionSlot } from '../../core/content-completion';
import {
  createDetachedEditorSchema,
  getRepresentationEditorFromApi,
  type InternalEditorSchemaApi,
} from '../../core/editor-schema';
import {
  canonicalRecordJson,
  deriveValue,
  getRecordEntries,
  getValueRecords,
  NO_RECORD_OPS,
  type RecordOps,
} from '../../core/record-store';
import { completeChildrenAt } from '../../core/representation';
import {
  type CompiledEditorSchema,
  type CompiledSchemaContentProgram,
  type CompiledSchemaProperty,
  isSupportedGeneratedElementProperty,
  matchesCompiledSchemaTarget,
  toCompiledTargetContext,
} from '../../core/schema-compiler';
import { EditorSchemaValidationError } from '../../core/schema-validation';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { Element } from '../../interfaces/element';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { createDependencies } from '../facts/dependencies';
import {
  type ContextLookup,
  factsOf,
  type ReviewFacts,
  standingClaimsOf,
  undecided,
} from '../facts/facts';
import { type ReserveRecord, RESERVES, reserveIdOf } from '../facts/records';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  type AuthoredMember,
  type MarkBase,
  type ReserveMember,
  readMembers,
  withMembers,
} from './marks';
import { buildClaimsOf, joinsByIncarnation } from './resolve';
import { type Spare, slotKeyOf, spareFits, sparesIn } from './spares';

/**
 * Where a write's document keeps its roots, and the top-level blocks of each
 * that hold a review member, so a site reads only the blocks a claim can sit
 * on.
 */
export type SpareBlocks = Readonly<{
  indexes: ReadonlyMap<string, DocumentIndex>;
  marked: (root: string) => Iterable<Node>;
}>;

/** A container: the element at `path` of `root`, or the root itself at `[]`. */
export type SpareSite = Readonly<{ path: Path; root: string }>;

/**
 * A fill the recorder defers at a container's maximum: the command frame's
 * own element, which becomes the spare of the slot it fills.
 */
export type DeferredFill = SpareSite &
  Readonly<{
    node: Element;
    slot: ConstructionSlot;
    /** The container's type, or null for a root. */
    type: string | null;
    /**
     * The fill's own writer, or null when the write landed, so the spare
     * belongs to a claim still pending at the site, and there is none
     * without one.
     */
    writer: MarkBase | null;
  }>;

export type SpareWrites = Readonly<{
  /** The spares each container takes, and the unbuilt ones a fill replaces. */
  containers: ReadonlyArray<
    SpareSite &
      Readonly<{
        added: readonly ReserveMember[];
        replaced: readonly ReserveMember[];
      }>
  >;
  /** The root spares to store, and the ones a fill replaces. */
  records: RecordOps;
}>;

export const NO_SPARE_WRITES: SpareWrites = Object.freeze({
  containers: Object.freeze([]),
  records: NO_RECORD_OPS,
});

type Node = JsonRecord & { children?: readonly Node[]; text?: string };

/**
 * Per compiled schema, whether completing an empty element of a type, or a
 * content program, builds an element holding a generated value a write can
 * store, read from the schema alone. Null when no element property
 * generates such a value, so a schema without one does no work.
 */
const GENERATING = new WeakMap<
  CompiledEditorSchema,
  Readonly<{
    builds: (content: CompiledSchemaContentProgram) => boolean;
    generates: (type: string) => boolean;
  }> | null
>();

const SPARE_PROPERTIES = new WeakMap<
  CompiledEditorSchema,
  ReadonlySet<CompiledSchemaProperty>
>();

/**
 * The generated element properties whose values `schema`'s spares hold, so a
 * resolution masks their generators alone.
 */
export const sparePropertiesOf = (schema: CompiledEditorSchema) => {
  let properties = SPARE_PROPERTIES.get(schema);

  if (!properties) {
    properties = new Set(
      [...schema.properties.byId.values()].filter(
        (property) =>
          isSupportedGeneratedElementProperty(property) &&
          !property.descriptor.omitDefault
      )
    );
    SPARE_PROPERTIES.set(schema, properties);
  }

  return properties;
};

const generatingOf = (schema: CompiledEditorSchema) => {
  const cached = GENERATING.get(schema);

  if (cached !== undefined) return cached;

  const generated = [...sparePropertiesOf(schema)];

  if (generated.length === 0) {
    GENERATING.set(schema, null);

    return null;
  }

  const types = new Map<string, boolean>();
  const programs = new WeakMap<CompiledSchemaContentProgram, boolean>();
  const generates = (type: string): boolean => {
    const known = types.get(type);

    if (known !== undefined) return known;
    // A type its own completion reaches builds nothing more.
    types.set(type, false);

    const element = schema.elements.byType.get(type);
    const own =
      !!element &&
      generated.some(
        (property) =>
          element.construction.materializedPropertyIds.has(property.id) &&
          matchesCompiledSchemaTarget(
            schema,
            property.target,
            toCompiledTargetContext(type, {})
          )
      );
    const result = own || (!!element?.content && builds(element.content));

    types.set(type, result);

    return result;
  };
  const builds = (content: CompiledSchemaContentProgram): boolean => {
    const known = programs.get(content);

    if (known !== undefined) return known;

    const prefix = content.prefix ?? [];
    const plan = (content.remainder ?? content).defaultPlan;
    const result =
      prefix.some((slot) => generates(slot.type)) ||
      (content.min > prefix.length &&
        plan?.kind === 'element' &&
        generates(plan.type));

    programs.set(content, result);

    return result;
  };
  const facts = { builds, generates };

  GENERATING.set(schema, facts);

  return facts;
};

/** Whether a write under `schema` can store a spare, so the recorder looks for sites. */
export const storesSpares = (schema: CompiledEditorSchema) =>
  generatingOf(schema) !== null;

const nodeAt = (children: readonly Node[], path: Path) => {
  const ancestors: Node[] = [];
  let level = children;
  let node: Node | null = null;

  for (const index of path) {
    node = level[index] ?? null;
    if (!node) return null;
    ancestors.unshift(node);
    level = node.children ?? [];
  }

  return { ancestors, children: level, node };
};

const rootChildren = (value: JsonEditorValue, root: string) =>
  (root === 'main' ? value.children : (value.roots?.[root] ?? null)) as
    | readonly Node[]
    | null;

// A site as `blocks` keeps it: a root's level is the blocks that hold a
// review member, since no other block holds a claim.
const siteIn = (blocks: SpareBlocks, { path, root }: SpareSite) => {
  const index = blocks.indexes.get(root);

  if (!index) return null;
  if (path.length === 0) {
    return { ancestors: [], children: [...blocks.marked(root)], node: null };
  }

  const [head, ...rest] = path as [number, ...number[]];
  const top = index.child(head);

  if (!top) return null;
  if (rest.length === 0) {
    return { ancestors: [top], children: top.children ?? [], node: top };
  }

  const found = nodeAt(top.children ?? [], rest);

  return found && { ...found, ancestors: [...found.ancestors, top] };
};

const firstOf = (marks: readonly AuthoredMark[]): MarkBase | null => {
  const [first] = marks.toSorted(
    (left, right) =>
      left.at - right.at ||
      left.change.localeCompare(right.change) ||
      (left.inc ?? '').localeCompare(right.inc ?? '')
  );

  if (!first) return null;

  const { at, author, change, inc } = first;

  return inc === undefined
    ? { at, author, change }
    : { at, author, change, inc };
};

const rootSparesOf = (value: JsonEditorValue, root: string) =>
  [...getRecordEntries(getValueRecords(value), RESERVES)].flatMap(
    ([id, json]) => {
      const record = JSON.parse(json) as ReserveRecord;

      return record.root === root ? [{ id, record }] : [];
    }
  );

const validWhereStored = (
  schema: InternalEditorSchemaApi,
  node: Element,
  site: readonly Element[],
  root: string
) => {
  try {
    schema.validateChildrenAt([node], root, site);

    return true;
  } catch (error) {
    if (error instanceof EditorSchemaValidationError) return false;
    throw error;
  }
};

/** Each type a type tag can give its element: what it writes or restores. */
const typesOfTag = (mark: AuthoredMark) => {
  if (mark.kind !== 'format' || mark.key !== 'type') return [];

  const writes = [
    mark.write,
    ...(mark.base ? [mark.base] : []),
    ...(mark.over ?? []).flatMap((step) => step.map(({ write }) => write)),
  ];

  return [
    ...(typeof mark.before === 'string' ? [mark.before] : []),
    ...writes.flatMap((write) =>
      write.kind === 'set' && typeof write.value === 'string'
        ? [write.value]
        : []
    ),
  ];
};

export const buildClaimsIn = <N extends Readonly<{ children?: readonly N[] }>>(
  facts: ReviewFacts,
  lookup: ContextLookup,
  eachBlock: (visit: (node: N) => void) => void
) => {
  const claimsOf = (node: N) => standingClaimsOf(node, facts, lookup);
  const isPending = (mark: AuthoredMark) => undecided(facts, mark);
  let joins: Map<string, AuthoredMark> | null = null;
  const joinOf = (incarnation: string) => {
    if (!joins) {
      const found = new Map<string, AuthoredMark>();
      const visit = (node: N) => {
        for (const [key, mark] of joinsByIncarnation(
          claimsOf(node).filter(isPending)
        )) {
          found.set(key, mark);
        }
        node.children?.forEach(visit);
      };

      eachBlock(visit);
      joins = found;
    }

    return joins.get(incarnation) ?? null;
  };

  return (container: N | null, children: readonly N[]) =>
    buildClaimsOf(container, children, claimsOf, isPending, joinOf);
};

/**
 * The spares a write stores in `sites`, the containers it touched, or every
 * container with a pending claim at a load. A container whose pending claims
 * can remove one of its children or change its type, as `changesBuild`
 * says, takes one spare per slot for each type it can take, its stored type
 * and each type its type tags write or restore, whose completion builds an
 * element with a generated value: the element completing an empty container
 * of that type at that site builds there, generated values included. A type
 * and slot that already hold a spare that fits, as `spareFits` reads it, and
 * that is valid where it is stored take none; otherwise the new spare
 * replaces the slot's unbuilt ones, such as one a schema change left behind
 * or one a validator now rejects. Each of `fills` replaces its slot's
 * unbuilt spares with the command frame's element. Given `blocks`, a site
 * reads its document through them.
 */
export const sparesFor = (
  document: EditorDocumentValue,
  schema: CompiledEditorSchema,
  sites: Iterable<SpareSite>,
  fills: readonly DeferredFill[] = [],
  blocks: SpareBlocks | null = null
): SpareWrites => {
  const generating = generatingOf(schema);

  if (!generating) return NO_SPARE_WRITES;

  const value = document as JsonEditorValue;
  const facts = factsOf(value);
  const buildClaims = buildClaimsIn<Node>(
    facts,
    createDependencies(facts),
    (visit) => {
      if (blocks) {
        for (const root of blocks.indexes.keys()) {
          for (const node of blocks.marked(root)) visit(node);
        }
      } else {
        value.children.forEach(visit);
        for (const children of Object.values(value.roots ?? {})) {
          children.forEach(visit);
        }
      }
    }
  );
  let detached: ReturnType<typeof createDetachedEditorSchema> | null = null;
  const api = () => (detached ??= createDetachedEditorSchema(schema, document));
  const containers: Array<
    SpareSite & { added: ReserveMember[]; replaced: ReserveMember[] }
  > = [];
  const records = new Map<string, string | null>();
  const keyOf = (site: SpareSite) => `${site.root}\u0000${site.path.join(',')}`;
  const fillsAt = Map.groupBy(fills, keyOf);
  const seen = new Set<string>();

  for (const site of [...sites, ...fills]) {
    const siteKey = keyOf(site);

    if (seen.has(siteKey)) continue;
    seen.add(siteKey);

    const children = blocks ? null : rootChildren(value, site.root);
    const found = blocks
      ? siteIn(blocks, site)
      : children && nodeAt(children, site.path);

    if (!found) continue;

    const { ancestors, children: level, node: container } = found;
    const claims = buildClaims(container, level);
    const writer = firstOf(claims);
    const filling = fillsAt.get(siteKey) ?? [];

    if (!writer && filling.length === 0) continue;

    const stored = container ? sparesIn(container) : [];
    const rootStored = container ? [] : rootSparesOf(value, site.root);
    const siteOf = (type: string | null) =>
      container
        ? ([
            { ...withMembers(container, []), children: [], type },
            ...ancestors.slice(1),
          ] as unknown as Element[])
        : [];
    const unbuiltAt = (
      type: string | null,
      slot: ConstructionSlot,
      nodeType: string
    ) => {
      const keeps = (spare: Spare) =>
        spareFits(spare, nodeType) &&
        validWhereStored(api(), spare.node, siteOf(type), site.root);

      return container
        ? stored.flatMap((spare) =>
            !spare.built &&
            spare.type === type &&
            slotKeyOf(spare.slot) === slotKeyOf(slot)
              ? [{ fits: keeps(spare), spare }]
              : []
          )
        : rootStored.flatMap(({ id, record }) =>
            !record.built && slotKeyOf(record.slot) === slotKeyOf(slot)
              ? [
                  {
                    fits: keeps({ ...record, type: null }),
                    id,
                  },
                ]
              : []
          );
    };
    const types = container
      ? [...new Set([String(container.type), ...claims.flatMap(typesOfTag)])]
      : [null];
    const added: ReserveMember[] = [];
    const replaced: ReserveMember[] = [];
    const store = (
      by: MarkBase,
      type: string | null,
      slot: ConstructionSlot,
      node: Element
    ) => {
      if (container) {
        added.push({
          ...by,
          kind: 'reserve',
          node,
          slot,
          type: getDefined(type),
        });
        return;
      }

      const record: ReserveRecord = { ...by, node, root: site.root, slot };

      records.set(reserveIdOf(record), canonicalRecordJson(record));
    };

    const filled = (type: string | null, slot: ConstructionSlot) =>
      filling.some(
        (fill) =>
          (fill.writer ?? writer) &&
          fill.type === type &&
          slotKeyOf(fill.slot) === slotKeyOf(slot)
      );

    for (const fill of filling) {
      const by = fill.writer ?? writer;

      if (!by) continue;
      if (container) {
        replaced.push(
          ...stored.filter(
            (spare) =>
              !spare.built &&
              spare.type === fill.type &&
              slotKeyOf(spare.slot) === slotKeyOf(fill.slot)
          )
        );
      } else {
        for (const { id, record } of rootStored) {
          if (
            !record.built &&
            slotKeyOf(record.slot) === slotKeyOf(fill.slot)
          ) {
            records.set(id, null);
          }
        }
      }
      store(by, fill.type, fill.slot, fill.node);
    }

    for (const type of writer ? types : []) {
      const content =
        type === null
          ? api().getRootContent(site.root, document)
          : api().getElementContent(type);

      if (!content || !generating.builds(content)) continue;

      const completion = completeChildrenAt(
        getRepresentationEditorFromApi(api()),
        siteOf(type),
        [],
        site.root
      );

      for (const { node, slot } of completion.built) {
        if (!generating.generates(String(node.type)) || filled(type, slot)) {
          continue;
        }

        const unbuilt = unbuiltAt(type, slot, String(node.type));

        if (unbuilt.some(({ fits }) => fits)) continue;
        for (const stale of unbuilt) {
          if ('spare' in stale) replaced.push(stale.spare);
          else records.set(stale.id, null);
        }
        store(getDefined(writer), type, slot, node);
      }
    }

    if (added.length > 0 || replaced.length > 0) {
      containers.push({ ...site, added, replaced });
    }
  }

  return containers.length === 0 && records.size === 0
    ? NO_SPARE_WRITES
    : {
        containers,
        records:
          records.size === 0 ? NO_RECORD_OPS : new Map([[RESERVES, records]]),
      };
};

/**
 * Every container a pending claim sits in or on, for a load to visit, found
 * as they are read so a schema that stores no spare walks nothing.
 *
 * @yields {SpareSite} Each such container's site.
 */
export function* claimSitesOf(
  document: EditorDocumentValue
): Generator<SpareSite> {
  const value = document as JsonEditorValue;
  const facts = factsOf(value);
  const dependencies = createDependencies(facts);
  const claims = (node: Node) =>
    standingClaimsOf(node, facts, dependencies).length > 0;
  function* visit(
    nodes: readonly Node[],
    path: Path,
    root: string,
    container: Node | null
  ): Generator<SpareSite> {
    if ((container !== null && claims(container)) || nodes.some(claims)) {
      yield { path, root };
    }
    for (const [index, child] of nodes.entries()) {
      if (child.children && typeof child.text !== 'string') {
        yield* visit(child.children, [...path, index], root, child);
      }
    }
  }

  yield* visit(value.children, [], 'main', null);
  for (const [root, children] of Object.entries(value.roots ?? {})) {
    yield* visit(children, [], root, null);
  }
}

/**
 * `document` holding only the review storage `schema` reads, as a load
 * leaves it. Under a schema that stores no spares, no spare member or record
 * is left; otherwise no record is left for a root the document does not
 * hold. An `as` value whose key no spare holds leaves, and its element keeps
 * the value it stores: whether it could write the shown one depends on
 * decisions a load cannot make.
 */
export const withReadableStorage = <V extends EditorDocumentValue>(
  document: V,
  schema: CompiledEditorSchema
): V => {
  const keys = new Set(
    [...sparePropertiesOf(schema)].flatMap(({ key }) =>
      typeof key === 'string' ? [key] : []
    )
  );
  const stores = keys.size > 0;
  const value = document as JsonEditorValue;
  const visit = (node: Node): Node => {
    const members = readMembers(node);
    const kept = members.flatMap((member): AuthoredMember[] => {
      if (member.kind === 'reserve') return stores ? [member] : [];
      if (member.kind !== 'as') return [member];

      const values = Object.entries(member.values);
      const shown = values.filter(([key]) => keys.has(key));

      return shown.length === 0
        ? []
        : shown.length === values.length
          ? [member]
          : [{ ...member, values: Object.fromEntries(shown) }];
    });
    const children = node.children?.map(visit);
    const changed =
      kept.length !== members.length || kept.some((m, i) => m !== members[i]);

    if (
      !changed &&
      (!children || children.every((child, i) => child === node.children?.[i]))
    ) {
      return node;
    }

    const next = changed ? withMembers(node, kept) : node;

    return children ? { ...next, children } : next;
  };
  const main = (value.children as readonly Node[]).map(visit);
  const named = Object.entries(value.roots ?? {}).map(
    ([key, children]) =>
      [key, (children as readonly Node[]).map(visit)] as const
  );
  const dropped = [...getRecordEntries(getValueRecords(value), RESERVES)]
    .filter(([, json]) => {
      const { root } = JSON.parse(json) as ReserveRecord;

      return (
        !stores || (root !== 'main' && !Object.hasOwn(value.roots ?? {}, root))
      );
    })
    .map(([id]) => [id, null] as const);
  const same = (next: readonly Node[], before: readonly unknown[]) =>
    next.every((node, index) => node === before[index]);

  if (
    dropped.length === 0 &&
    same(main, value.children) &&
    named.every(([key, children]) =>
      same(children, getDefined(value.roots?.[key]))
    )
  ) {
    return document;
  }

  return deriveValue(
    document,
    {
      children: main,
      ...(value.roots ? { roots: Object.fromEntries(named) } : {}),
    } as unknown as Partial<V>,
    dropped.length === 0
      ? NO_RECORD_OPS
      : new Map([[RESERVES, new Map(dropped)]])
  );
};

export const withSpareWrites = <V extends EditorDocumentValue>(
  document: V,
  writes: SpareWrites
): V => {
  if (writes === NO_SPARE_WRITES) return document;

  const value = document as JsonEditorValue;

  const roots = new Map<string, readonly Node[]>();
  const update = (
    nodes: readonly Node[],
    path: Path,
    edit: (node: Node) => Node
  ): Node[] => {
    const [index, ...rest] = path;
    const next = [...nodes];
    const node = getDefined(next[getDefined(index)]);

    next[getDefined(index)] =
      rest.length === 0
        ? edit(node)
        : { ...node, children: update(node.children ?? [], rest, edit) };

    return next;
  };

  for (const { added, path, replaced, root } of writes.containers) {
    const children = roots.get(root) ?? getDefined(rootChildren(value, root));

    roots.set(
      root,
      update(children, path, (node) =>
        withMembers(node, [
          ...readMembers(node).filter(
            (member) => member.kind !== 'reserve' || !replaced.includes(member)
          ),
          ...added,
        ])
      )
    );
  }

  const main = roots.get('main');
  const named = [...roots].filter(([root]) => root !== 'main');

  return deriveValue(
    document,
    {
      ...(main ? { children: main } : {}),
      ...(named.length > 0
        ? {
            roots: {
              ...value.roots,
              ...Object.fromEntries(named),
            },
          }
        : {}),
    } as Partial<V>,
    writes.records
  );
};

/**
 * The containers a recorded `change` touched, read in `indexes`, the
 * document after it: each element whose own tokens it wrote, the element or
 * root holding each node it wrote, and the innermost one where it removed
 * content.
 *
 * @yields {SpareSite} Each such container's site, once.
 */
export function* changedSitesOf(
  change: DocumentChange,
  indexes: ReadonlyMap<string, DocumentIndex>
): Generator<SpareSite> {
  for (const [root, index] of indexes) {
    const rootChange = getInternalDocumentRootChange(change, root);

    if (!rootChange || rootChange.empty) continue;

    const paths = new Map<string, Path>();
    const add = (path: Path) => paths.set(path.join(','), path);

    rootChange.iterChangedRanges((_fromA, _toA, from, to) => {
      const open = index
        .openContextAt(from)
        .filter(
          (entry) =>
            entry.kind === 'element' &&
            entry.contentFrom <= from &&
            from <= entry.contentTo
        );

      add(open.at(-1)?.path ?? []);
      for (const entry of index.nodeRangesTouching(from, to)) {
        const close = entry.to - 1;

        if (
          !(from <= entry.from && entry.from < to) &&
          !(from <= close && close < to)
        ) {
          continue;
        }
        add(entry.path.slice(0, -1));
        if (entry.kind === 'element') add(entry.path);
      }
    });
    for (const path of paths.values()) yield { path, root };
  }
}

/**
 * The change that stores `writes`' container spares in the documents
 * `indexes` hold, and those indexes after it. Root spares are records, which
 * the caller stores with its own.
 */
export const spareWritesChange = (
  writes: SpareWrites,
  indexes: ReadonlyMap<string, DocumentIndex>
) => {
  const changes = new Map<string, RootChange>();
  const edited = new Map(indexes);

  for (const [root, containers] of Map.groupBy(
    writes.containers,
    (write) => write.root
  )) {
    const index = getDefined(indexes.get(root));
    const sections: RootChangeSection[] = [];
    let next = index;

    for (const { added, path, replaced } of containers) {
      const {
        children: _children,
        text: _text,
        ...props
      } = index.node(path) as Node;
      const gone = new Set(replaced.map(canonicalRecordJson));

      sections.push({
        from: index.nodeRange(path).from,
        properties: {
          ...(added.length > 0 ? { add: { [AUTHORED_MARKS_KEY]: added } } : {}),
          ...(replaced.length > 0
            ? { remove: { [AUTHORED_MARKS_KEY]: replaced } }
            : {}),
        },
      });
      next = next.withExactNodeProperties(
        path,
        withMembers(props, [
          ...readMembers(props).filter(
            (member) => !gone.has(canonicalRecordJson(member))
          ),
          ...added,
        ])
      );
    }
    changes.set(root, RootChange.create(index, sections));
    edited.set(root, next);
  }

  return {
    change: createInternalDocumentChange(changes),
    indexes: edited,
  };
};
