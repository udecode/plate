import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentRootChange,
  valueRootIndex,
} from '../../core/change/document-change';
import type {
  DocumentIndex,
  IndexedNodeRange,
} from '../../core/change/document-index';
import { type JsonRecord, jsonEqual } from '../../core/change/json';
import {
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import {
  ElementGenerationMaskedError,
  generateElementPropertyValue,
} from '../../core/editor-schema';
import { EditorRefusalError } from '../../core/refusal';
import {
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  isSupportedGeneratedElementProperty,
  matchesCompiledSchemaTarget,
  toCompiledTargetContext,
} from '../../core/schema-compiler';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import { factsOf } from '../facts/facts';
import type { PeekedView } from '../ledger/ledger';
import { contentRootsOf, rootOf } from '../ledger/roots';
import {
  type Holder,
  holderKey,
  isPendingHolder,
  pendingIn,
  shownOf,
  stillHolds,
  type ValueHolders,
} from './holders';
import {
  type FormatTag,
  type FormatWriter,
  recordFormats,
  type Standing,
} from './layers';
import {
  AUTHORED_MARKS_KEY,
  type AsMember,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from './marks';
import { buildsElement } from './resolve';

export type CommandValuesInput = Readonly<{
  before: JsonEditorValue;
  /** The recorded change from `before` to the recorded document. */
  change: DocumentChange;
  compiled: CompiledEditorSchema;
  /** Whether the write lands with its commit, as Editing's does. */
  editing: boolean;
  /**
   * What the commands wrote: the proposed view itself when they ran in a
   * command frame, else the stored draft with the marks it already held.
   */
  frame: JsonEditorValue;
  framed: boolean;
  holders: ValueHolders;
  /** The indexes of the recorded document's written roots. */
  indexes: ReadonlyMap<string, DocumentIndex>;
  /** What the proposed view shows of each of some stored documents. */
  peek: (
    values: readonly JsonEditorValue[],
    read: (view: PeekedView, at: number) => void
  ) => void;
  standing: Standing;
  /** The recorded document with `indexes` as its written roots. */
  storedOf: (indexes: ReadonlyMap<string, DocumentIndex>) => JsonEditorValue;
  writer: FormatWriter;
}>;

const GENERATED = new WeakMap<
  CompiledEditorSchema,
  ReadonlyMap<string, readonly CompiledSchemaProperty[]>
>();

/** The supported generated element properties, by key. */
export const generatedOf = (schema: CompiledEditorSchema) => {
  let byKey = GENERATED.get(schema);

  if (!byKey) {
    const found = new Map<string, CompiledSchemaProperty[]>();

    for (const property of schema.properties.byId.values()) {
      if (
        isSupportedGeneratedElementProperty(property) &&
        !property.descriptor.omitDefault &&
        typeof property.key === 'string'
      ) {
        found.set(property.key, [...(found.get(property.key) ?? []), property]);
      }
    }
    byKey = found;
    GENERATED.set(schema, byKey);
  }

  return byKey;
};

const isText = (node: JsonNode) => typeof node.text === 'string';

const elementsBefore = (nodes: readonly JsonNode[], at: number) => {
  let count = 0;

  for (let index = 0; index < at; index += 1) {
    if (!isText(getDefined(nodes[index]))) count += 1;
  }

  return count;
};

const elementsOf = (nodes: readonly JsonNode[]) =>
  nodes.filter((node) => !isText(node));

/**
 * The frame element in the place of the shown element at `path`: the
 * element at the same place among the elements of each level, while both
 * hold as many elements there and each element on the way has the same type.
 */
const partnerOf = (
  shown: DocumentIndex,
  path: readonly number[],
  framed: DocumentIndex
) => {
  const [head, ...rest] = path as [number, ...number[]];

  // No root grammar allows text, so a root's children are its elements.
  if (shown.size !== framed.size) return null;

  let left = shown.child(head);
  let right = framed.child(head);

  if (!left || !right || left.type !== right.type) return null;
  for (const at of rest) {
    const children: readonly JsonNode[] = left.children ?? [];
    const rights = elementsOf(right.children ?? []);

    if (elementsOf(children).length !== rights.length) return null;

    left = children[at];
    right = rights[elementsBefore(children, at)];
    if (!left || !right || left.type !== right.type) return null;
  }

  return right;
};

const ownProps = (node: JsonNode): JsonRecord => {
  const { children: _children, text: _text, ...props } = node;

  return props;
};

type Edit = Readonly<{
  from: number;
  next: JsonRecord;
  path: readonly number[];
}>;

/**
 * The property delta from `previous` to `next`, two element records without
 * children, review members compared one by one.
 */
const deltaOf = (previous: JsonRecord, next: JsonRecord) => {
  const set: Record<string, unknown> = {};
  const unset: string[] = [];

  for (const key of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    if (key === AUTHORED_MARKS_KEY) continue;
    if (next[key] === undefined) {
      if (previous[key] !== undefined) unset.push(key);
    } else if (!jsonEqual(previous[key], next[key])) {
      set[key] = next[key];
    }
  }

  const before = readMembers(previous);
  const after = readMembers(next);
  const beforeKeys = new Set(before.map(canonicalJsonKey));
  const afterKeys = new Set(after.map(canonicalJsonKey));
  const added = after.filter(
    (member) => !beforeKeys.has(canonicalJsonKey(member))
  );
  const removed = before.filter(
    (member) => !afterKeys.has(canonicalJsonKey(member))
  );

  return {
    ...(added.length > 0 ? { add: { [AUTHORED_MARKS_KEY]: added } } : {}),
    ...(removed.length > 0
      ? { remove: { [AUTHORED_MARKS_KEY]: removed } }
      : {}),
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset } : {}),
  };
};

/**
 * The closing pass of a recording: each element the recording inserted or
 * changed takes the generated values the command's frame shows in its place
 * once every pending change is accepted. An inserted element stores the frame
 * value, or, when another stored element holds that value, as its stored
 * value or as an `as` value, a fresh one and an `as` member that shows the
 * frame value; a settled element that stores it is the source of a copy the
 * schema keeps, so the copy stores it too. A kept element whose shown value
 * differs takes a format tag with the frame value, or the value itself when
 * the write lands. An element whose place the proposed view and the frame
 * disagree on is left as recorded. Returns null when nothing changes. The
 * proposed view of a document whose blocks hold no review member is that
 * document, so only a document holding one is resolved, and only around
 * what the recording changed.
 */
export const closeCommandValues = (
  input: CommandValuesInput
): Readonly<{
  change: DocumentChange;
  indexes: ReadonlyMap<string, DocumentIndex>;
}> | null => {
  const generated = generatedOf(input.compiled);

  if (generated.size === 0) return null;

  type Touched = Readonly<{ inserted: boolean; range: IndexedNodeRange }>;
  const touchedByRoot = new Map<string, Touched[]>();

  for (const [root, index] of input.indexes) {
    const rootChange = getInternalDocumentRootChange(input.change, root);

    if (!rootChange || rootChange.empty) continue;
    if (root !== 'main' && !Object.hasOwn(input.frame.roots ?? {}, root)) {
      continue;
    }

    const beforeIndex =
      root === 'main' || Object.hasOwn(input.before.roots ?? {}, root)
        ? valueRootIndex(input.before, root)
        : null;
    const kept = new Set<number>();
    const touched = new Map<number, IndexedNodeRange>();

    rootChange.iterChangedRanges((fromA, toA, fromB, toB) => {
      for (const range of index.nodeRangesTouching(fromB, toB)) {
        if (range.kind !== 'text' && range.from >= fromB && range.from < toB) {
          touched.set(range.from, range);
        }
      }
      if (!beforeIndex) return;
      for (const range of beforeIndex.nodeRangesTouching(fromA, toA)) {
        if (range.kind !== 'text' && range.from >= fromA && range.from < toA) {
          const at = rootChange.mapPos(range.from, 1, 'after');

          if (at !== null) kept.add(at);
        }
      }
    });
    if (touched.size > 0) {
      touchedByRoot.set(
        root,
        [...touched.values()].map((range) => ({
          // A suggestion claims each element it builds, wherever the change
          // aligns it; a write that lands claims nothing, so its change says.
          inserted: input.editing
            ? !kept.has(range.from)
            : readAuthoredMarks(index.node(range.path)).some(
                (mark) =>
                  mark.change === input.writer.change && buildsElement(mark)
              ),
          range,
        }))
      );
    }
  }
  if (touchedByRoot.size === 0) return null;

  const propertyOf = (key: string, type: string) =>
    generated
      .get(key)
      ?.find((candidate) =>
        matchesCompiledSchemaTarget(
          input.compiled,
          candidate.target,
          toCompiledTargetContext(type)
        )
      );
  // A touched element that lacks a value its construction stores takes a
  // fresh one, as the canonical pass would give it, so the proposed view
  // builds it as it stands.
  const filled = new Map(input.indexes);

  for (const [root, touched] of touchedByRoot) {
    let index = getDefined(input.indexes.get(root));

    for (const { range } of touched) {
      const node = index.node(range.path);
      const type = String(node.type);
      const materialized =
        input.compiled.elements.byType.get(type)?.construction
          .materializedPropertyIds;
      const fills = [...generated.keys()].flatMap((key) => {
        const property = propertyOf(key, type);

        return node[key] === undefined &&
          property &&
          materialized?.has(property.id)
          ? [[key, generateElementPropertyValue(property)] as const]
          : [];
      });

      if (fills.length > 0) {
        index = index.withExactNodeProperties(range.path, {
          ...ownProps(node),
          ...Object.fromEntries(fills),
        });
      }
    }
    filled.set(root, index);
  }

  const stored = input.storedOf(filled);
  const storedRoots = contentRootsOf(stored);
  const facts = factsOf(stored);
  // Unframed, the frame is the stored draft with the marks it held.
  const peekFrame =
    !input.framed &&
    [...contentRootsOf(input.frame)].some(
      ([root, index]) =>
        !input.holders.at(
          { contexts: factsOf(input.frame), generated, schema: input.compiled },
          root,
          index
        ).unmarked
    );
  const held = [...storedRoots].map(([root, index]) =>
    input.holders.at(
      { contexts: facts, generated, schema: input.compiled },
      root,
      index
    )
  );
  const peekStored = held.some((root) => !root.unmarked);
  type Shown = Readonly<{
    index: DocumentIndex;
    paths: ReadonlyArray<readonly number[] | null>;
  }>;
  const framedRoots = new Map<string, DocumentIndex | null>();
  const shownRoots = new Map<string, Shown | null>();
  const readFrame = (view: PeekedView | null) => {
    for (const root of touchedByRoot.keys()) {
      framedRoots.set(
        root,
        view ? view.index(root) : rootOf(input.frame, root)
      );
    }
  };
  const readStored = (view: PeekedView | null) => {
    for (const [root, touched] of touchedByRoot) {
      const index = view ? view.index(root) : getDefined(storedRoots.get(root));

      shownRoots.set(
        root,
        index && {
          index,
          paths: touched.map(({ range }) =>
            view ? view.path(root, range.path) : range.path
          ),
        }
      );
    }
  };

  try {
    if (peekFrame || peekStored) {
      input.peek(
        [...(peekFrame ? [input.frame] : []), ...(peekStored ? [stored] : [])],
        (view, at) => {
          if (peekFrame && at === 0) readFrame(view);
          else readStored(view);
        }
      );
    }
  } catch (error) {
    // A view the stored spares cannot build is the ledger's to refuse.
    if (
      error instanceof ElementGenerationMaskedError ||
      error instanceof EditorRefusalError
    ) {
      return null;
    }
    throw error;
  }
  if (!peekFrame) readFrame(null);
  if (!peekStored) readStored(null);

  const overlay = new Map<string, Holder[]>();
  const holdersOf = (key: string, value: unknown) => {
    const at = holderKey(key, value);

    return overlay.get(at) ?? held.flatMap((root) => root.holders(at));
  };
  const pending = pendingIn(facts);
  const possibleHolders = (key: string, value: unknown) =>
    stillHolds(holdersOf(key, value), pending);
  const moveHolder = (
    node: JsonNode,
    key: string,
    from: Readonly<{ holds: 'stores'; value: unknown }> | null,
    to: Readonly<{ holds: 'shows' | 'stores'; value: unknown }>
  ) => {
    if (from) {
      overlay.set(
        holderKey(key, from.value),
        holdersOf(key, from.value).filter(
          (holder) => holder.node !== node || holder.holds !== from.holds
        )
      );
    }
    overlay.set(holderKey(key, to.value), [
      ...holdersOf(key, to.value),
      {
        holds: to.holds,
        node,
        standing: { stuck: true, waitsOn: [] },
      },
    ]);
  };

  const changes = new Map<string, RootChange>();
  const indexes = new Map(input.indexes);

  for (const [root, touched] of touchedByRoot) {
    const shownRoot = shownRoots.get(root);

    if (!shownRoot) continue;

    const framedRoot = framedRoots.get(root);
    const index = getDefined(input.indexes.get(root));
    const filledRoot = getDefined(filled.get(root));
    const edits: Edit[] = [];

    for (const [at, { inserted, range }] of touched.entries()) {
      const node = filledRoot.node(range.path);
      const recorded = index.node(range.path);
      const path = shownRoot.paths[at];
      const shown = path ? shownRoot.index.node(path) : null;
      const framed =
        path && framedRoot
          ? partnerOf(shownRoot.index, path, framedRoot)
          : null;

      if (!shown || !framed) {
        // The frame shows nothing in its place, such as a block a pending join
        // takes up, so a value another element holds is only a copy.
        const props = ownProps(node);
        const writes: Record<string, EditorJsonValue> = {};

        for (const key of inserted ? generated.keys() : []) {
          const property = propertyOf(key, String(node.type));
          const value = props[key];

          if (
            !property ||
            value === undefined ||
            possibleHolders(key, value).every((holder) => holder.node === node)
          ) {
            continue;
          }

          writes[key] = generateElementPropertyValue(property);
          moveHolder(
            node,
            key,
            { holds: 'stores', value },
            { holds: 'stores', value: writes[key] }
          );
        }
        if (node !== recorded || Object.keys(writes).length > 0) {
          edits.push({
            from: range.from,
            next: { ...props, ...writes },
            path: range.path,
          });
        }
        continue;
      }

      const type = String(node.type);
      const props = ownProps(node);
      const writes: Record<string, EditorJsonValue> = {};
      const as: Record<string, EditorJsonValue> = {
        ...shownOf(node),
      };
      const formatted: string[] = [];

      for (const key of generated.keys()) {
        const property = propertyOf(key, type);
        const value = framed[key] as EditorJsonValue | undefined;

        if (!property || value === undefined) continue;
        if (!inserted) {
          if (!jsonEqual(shown[key], value)) {
            writes[key] = value;
            if (!property.lifecycle.unique) formatted.push(key);
          }
          continue;
        }

        const others = possibleHolders(key, value).filter(
          (holder) => holder.node !== node
        );
        const own = props[key] as EditorJsonValue | undefined;
        const copies = others.every(
          (holder) =>
            holder.holds === 'stores' && !isPendingHolder(holder, pending)
        );

        if (copies) {
          if (!jsonEqual(own, value) || Object.hasOwn(as, key)) {
            writes[key] = value;
            delete as[key];
            moveHolder(
              node,
              key,
              own === undefined ? null : { holds: 'stores', value: own },
              { holds: 'stores', value }
            );
          }
          continue;
        }

        const fresh =
          own !== undefined &&
          !jsonEqual(own, value) &&
          possibleHolders(key, own).every((holder) => holder.node === node)
            ? own
            : generateElementPropertyValue(property);

        if (!jsonEqual(own, fresh)) {
          writes[key] = fresh;
          moveHolder(
            node,
            key,
            own === undefined ? null : { holds: 'stores', value: own },
            { holds: 'stores', value: fresh }
          );
        }
        if (!jsonEqual(as[key], value)) {
          as[key] = value;
          moveHolder(node, key, null, { holds: 'shows', value });
        }
      }

      let next: JsonRecord =
        Object.keys(writes).length > 0 ? { ...props, ...writes } : props;

      if (formatted.length > 0) {
        const previous = ownProps(recorded);
        const members = readMembers(props);
        const tags = members.filter(
          (member): member is FormatTag => member.kind === 'format'
        );
        const written = recordFormats({
          keys: formatted,
          next,
          ownInsertion: false,
          previous,
          source: 'command',
          standing: input.standing,
          tags,
          writer: input.writer,
        });

        next = withMembers(next, [
          ...members.filter((member) => member.kind !== 'format'),
          ...written,
        ]);
      }

      const shownBefore = shownOf(node);
      const asChanged = !jsonEqual(shownBefore ?? {}, as);

      if (asChanged) {
        const members = readMembers(next).filter(
          (member) => member.kind !== 'as'
        );
        const member: AsMember | null =
          Object.keys(as).length > 0 ? { kind: 'as', values: as } : null;

        next = withMembers(next, member ? [...members, member] : members);
      }
      if (next !== props || node !== recorded) {
        edits.push({ from: range.from, next, path: range.path });
      }
    }
    if (edits.length === 0) continue;

    const sections: RootChangeSection[] = edits
      .toSorted((a, b) => a.from - b.from)
      .map(({ from, next, path }) => ({
        from,
        properties: deltaOf(ownProps(index.node(path)), next),
      }));
    let edited = index;

    for (const { next, path } of edits) {
      edited = edited.withExactNodeProperties(path, next);
    }
    changes.set(root, RootChange.create(index, sections));
    indexes.set(root, edited);
  }

  return changes.size === 0
    ? null
    : { change: createInternalDocumentChange(changes), indexes };
};
