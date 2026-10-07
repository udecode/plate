import type {
  AnyEditor,
  ContentSlice,
  NodeKey,
  NodeTarget,
  RootKey,
} from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import { NodeApi, type Descendant, type NodeEntry } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { removeNodes } from '../transforms-node';
import { deleteText } from '../transforms-text';
import { readAuthoredView } from './authored-runtime';
import { isDocumentView } from './document-view-read';
import { editorReads } from './editor-reads';
import {
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  getEditorSchema,
} from './editor-runtime';
import { getContentSlice } from './get-content-slice';
import {
  insertionPath,
  type JsonValue,
  landAt,
  landBeside,
  type LandedWrap,
  type LandingRequest,
  refuse,
  TransferRefusalError,
  transferVeto,
} from './landing';
import { definePlugin } from './plugin';
import { getConfiguredPluginRegistry } from './plugin-registry';
import {
  replaceSliceAtBlockBoundary,
  withEditorUpdateRootScope,
} from './public-state';
import { executeEditorRead } from './read-registry';
import { EditorSchemaValidationError } from './schema-validation';
import { screenReaderAnnouncementEffect } from './screen-reader-announcement';
import {
  type DraftLanding,
  guardLanding,
  mapDraft,
  nodeAt,
  rootChildren,
  sameContent,
  selectionRange,
  textTokens,
} from './transfer-guard';
import type {
  TransferCheck,
  TransferDiagnostic,
  TransferEdge,
  TransferInput,
  TransferIntent,
  TransferLandingTarget,
  TransferOutcome,
  TransferPayload,
  TransferRefusalReason,
  TransferRelation,
  TransferSide,
} from './transfer-types';

export { transferVeto };

type NodeSource = Readonly<{
  entries: ReadonlyArray<NodeEntry<Descendant>>;
  kind: 'nodes';
  root: RootKey;
}>;

type TextSource = Readonly<{ kind: 'text'; range: Range; root: RootKey }>;

type Landing =
  | Readonly<{ edge: TransferEdge; kind: 'edge' }>
  | Readonly<{ kind: 'point'; point: Point }>
  | Readonly<{
      keys: readonly NodeKey[];
      kind: 'wrap';
      side: TransferSide;
      wrap: LandedWrap;
    }>;

type Admission = Readonly<{
  intent: TransferIntent;
  landing: Landing;
  relation: TransferRelation;
  /** What lands, or `null` when the source nodes themselves move. */
  slice: ContentSlice | null;
  source: NodeSource | TextSource;
}>;

const targetOf = (landing: Landing): TransferLandingTarget =>
  landing.kind === 'edge'
    ? landing.edge
    : landing.kind === 'point'
      ? { point: landing.point }
      : landing.side;

const authoredIdentity = (editor: AnyEditor) => {
  const view = readAuthoredView(editor);

  return view ? `${view.intent}:${view.projection}` : 'native';
};

const relationOf = (from: AnyEditor, to: AnyEditor): TransferRelation => {
  if (getEditorRuntimeOwner(from) !== getEditorRuntimeOwner(to)) {
    return 'independent';
  }

  return isDocumentView(from) ||
    isDocumentView(to) ||
    authoredIdentity(from) !== authoredIdentity(to)
    ? 'identity'
    : 'document';
};

const pruneAndSort = (entries: ReadonlyArray<NodeEntry<Descendant>>) => {
  const sorted = [...entries].sort(([, a], [, b]) => PathApi.compare(a, b));
  const kept: Array<NodeEntry<Descendant>> = [];

  for (const entry of sorted) {
    const previous = kept.at(-1);

    if (previous && PathApi.isAncestor(previous[1], entry[1])) continue;
    kept.push(entry);
  }

  return kept;
};

export const expandSource = (from: AnyEditor, paths: readonly Path[]) => {
  const expanded = executeEditorRead(
    from,
    editorReads.transfer.source,
    { selection: SelectionApi.nodes(paths as [Path, ...Path[]]) },
    ({ selection }) => selection,
    from
  );

  return pruneAndSort(
    expanded.paths.flatMap((path) => {
      const entry = from.read.nodes.get(path);

      return entry ? [entry as NodeEntry<Descendant>] : [];
    })
  );
};

export const transferEntries = (
  editor: AnyEditor,
  node?: NodeTarget<Element>
): ReadonlyArray<NodeEntry<Element>> => {
  const selected = editor.read.selection.nodes().map(([, path]) => path);
  const path = node === undefined ? undefined : editor.read.nodes.path(node);

  if (node !== undefined && !path) return [];

  const paths = path
    ? selected.some((candidate) => PathApi.equals(candidate, path))
      ? selected
      : [path]
    : selected.length > 0
      ? selected
      : editor.read.nodes.blocks().map(([, blockPath]) => blockPath);

  return paths.length === 0
    ? []
    : expandSource(editor, paths).filter((entry): entry is NodeEntry<Element> =>
        ElementApi.isElement(entry[0])
      );
};

const resolveSource = (
  from: AnyEditor,
  input: TransferInput
): NodeSource | TextSource => {
  const root = getEditorRuntimeRoot(from);

  if (input.range) {
    if (RangeApi.isCollapsed(input.range)) refuse('source-missing');

    return { kind: 'text', range: input.range, root };
  }

  const found = input.nodes?.map((key) => from.read.nodes.get(key));

  if (found && (found.length === 0 || found.some((entry) => !entry))) {
    refuse('source-missing');
  }

  const entries = found
    ? expandSource(
        from,
        (found as Array<NodeEntry<Descendant>>).map(([, path]) => path)
      )
    : transferEntries(from);

  if (entries.length === 0) refuse('source-missing');

  return { entries, kind: 'nodes', root };
};

const payloadOf = (
  from: AnyEditor,
  source: NodeSource | TextSource
): TransferPayload =>
  source.kind === 'text'
    ? { kind: 'text' }
    : {
        kind: 'nodes',
        nodes: source.entries.map(([node]) => node),
        parentKeys: source.entries.map(([, path]) =>
          path.length > 1 ? from.key(path.slice(0, -1)) : null
        ),
      };

const checkTextLanding = (
  editor: AnyEditor,
  admission: Admission,
  point: Point
) => {
  const { source, intent, relation } = admission;

  if (
    source.kind !== 'text' ||
    intent !== 'move' ||
    relation !== 'document' ||
    source.root !== getEditorRuntimeRoot(editor)
  ) {
    return;
  }

  const [start, end] = RangeApi.edges(source.range);

  if (PointApi.equals(point, start) || PointApi.equals(point, end)) {
    refuse('no-op');
  }
  if (PointApi.isAfter(point, start) && PointApi.isBefore(point, end)) {
    refuse('inside-source');
  }
};

const requestOf = (
  from: AnyEditor,
  intent: TransferIntent,
  payload: TransferPayload,
  relation: TransferRelation,
  source: NodeSource | TextSource,
  slice: ContentSlice | null
): LandingRequest => ({
  // A text slice's content keeps its open ancestors, which the slice fitter
  // unwraps to suit the target, so it is not the blocks that land.
  fit:
    source.kind !== 'nodes'
      ? []
      : slice
        ? slice.content
        : source.entries.map(([node]) => node),
  from,
  intent,
  moving:
    source.kind === 'nodes' && intent === 'move' && relation === 'document'
      ? { entries: source.entries, root: source.root }
      : null,
  payload,
  relation,
});

const resolveStep = (
  editor: AnyEditor,
  request: LandingRequest,
  source: NodeSource | TextSource,
  direction: 'next' | 'previous'
): TransferEdge => {
  if (source.kind !== 'nodes' || source.root !== getEditorRuntimeRoot(editor)) {
    return refuse('policy');
  }

  const parent = source.entries[0][1].slice(0, -1);

  // A step moves blocks among their siblings, so it needs one parent.
  if (
    source.entries.some(
      ([, path]) => !PathApi.equals(path.slice(0, -1), parent)
    )
  ) {
    return refuse('policy');
  }

  const next = direction === 'next';
  const [, anchorPath] = (
    next ? source.entries.at(-1) : source.entries[0]
  ) as NodeEntry<Descendant>;
  const anchorKey = request.from.key(anchorPath);
  const payload = new Set(source.entries.map(([node]) => node));
  let path = anchorKey ? editor.read.nodes.path(anchorKey) : undefined;
  let reason: TransferRefusalReason = 'no-op';

  while (path) {
    path = next
      ? PathApi.next(path)
      : PathApi.hasPrevious(path)
        ? PathApi.previous(path)
        : undefined;

    const entry = path && editor.read.nodes.get(path);
    const key = path && editor.key(path);

    if (!entry || !key) break;
    if (payload.has(entry[0] as Descendant)) continue;

    try {
      const to = landAt(editor, request, {
        edge: next ? 'after' : 'before',
        key,
      });
      const landed = editor.read.nodes.path(to.key);

      // A redirect out of the parent leaves this sibling for the next one.
      if (landed && PathApi.equals(landed.slice(0, -1), parent)) return to;
      reason = 'policy';
    } catch (error) {
      if (!(error instanceof TransferRefusalError)) throw error;
      ({ reason } = error);
    }
  }

  return refuse(reason);
};

const sameKey = (left: readonly unknown[], right: readonly unknown[]) =>
  left.every((part, i) => Object.is(part, right[i]));

type ResolvedPayload = Readonly<{
  key: readonly unknown[];
  payload: TransferPayload;
  slices: Partial<Record<TransferIntent, ContentSlice>>;
  source: NodeSource | TextSource;
}>;

const SOURCES = new WeakMap<AnyEditor, ResolvedPayload>();

const resolvePayload = (from: AnyEditor, input: TransferInput) => {
  const key = [
    input.nodes?.join('\u0000') ??
      (input.range ? JSON.stringify(input.range) : from.read.selection()),
    from.read.runtime.snapshot(),
    getConfiguredPluginRegistry(from).configurationRevision,
  ];
  const cached = SOURCES.get(from);

  if (cached && sameKey(cached.key, key)) return cached;

  const source = resolveSource(from, input);
  const resolved: ResolvedPayload = {
    key,
    payload: payloadOf(from, source),
    slices: {},
    source,
  };

  SOURCES.set(from, resolved);

  return resolved;
};

const admit = (
  editor: AnyEditor,
  input: TransferInput,
  method: TransferIntent
): Admission => {
  const from = input.from ?? editor;
  const { payload, slices, source } = resolvePayload(from, input);
  const relation = relationOf(from, editor);
  const intent: TransferIntent =
    method === 'copy' || relation !== 'document' || from.read.view.isReadOnly()
      ? 'copy'
      : 'move';

  if (editor.read.view.isReadOnly()) refuse('read-only-target');

  const slice =
    source.kind === 'nodes' &&
    intent === 'move' &&
    source.root === getEditorRuntimeRoot(editor)
      ? null
      : (slices[intent] ??= getContentSlice(
          from,
          source.kind === 'text'
            ? source.range
            : SelectionApi.nodes(
                source.entries.map(([, path]) => path) as [Path, ...Path[]]
              ),
          undefined,
          intent
        ));
  const request = requestOf(from, intent, payload, relation, source, slice);

  const admitted = (landing: Landing): Admission => ({
    intent,
    landing,
    relation,
    slice,
    source,
  });

  if (typeof input.to === 'string') {
    return admitted({
      edge: resolveStep(editor, request, source, input.to),
      kind: 'edge',
    });
  }

  if ('point' in input.to) {
    if (source.kind === 'nodes') refuse('schema');

    const admission = admitted({ kind: 'point', point: input.to.point });

    checkTextLanding(editor, admission, input.to.point);

    return admission;
  }

  if ('side' in input.to) {
    // A side lands only blocks that relocate inside one root.
    if (source.kind !== 'nodes' || slice || !request.moving) {
      return refuse('policy');
    }

    return admitted({
      keys: source.entries.map(([, path]) => from.key(path) as NodeKey),
      kind: 'wrap',
      side: input.to,
      wrap: landBeside(editor, request, request.moving, input.to),
    });
  }

  return admitted({ edge: landAt(editor, request, input.to), kind: 'edge' });
};

const runTransfer = (
  editor: AnyEditor,
  input: TransferInput,
  method: TransferIntent
): TransferOutcome => {
  const from = input.from ?? editor;
  const diagnostics: TransferDiagnostic[] = [];
  let admission: Admission;

  try {
    admission = admit(editor, input, method);
  } catch (error) {
    if (error instanceof TransferRefusalError) {
      return { reason: error.reason, status: 'refused' };
    }
    throw error;
  }

  const { intent, landing, relation, slice, source } = admission;
  const copy = intent === 'copy';
  const targetRoot = getEditorRuntimeRoot(editor);
  const before = from.read.value() as JsonValue;
  const relocate = !slice;
  const carried =
    landing.kind === 'wrap' && landing.wrap.replaced
      ? [landing.wrap.replaced]
      : [];
  const expected: readonly Descendant[] = slice
    ? slice.content
    : source.kind === 'nodes'
      ? [
          ...source.entries.map(([node]) => node),
          ...carried.map(({ node }) => node),
        ]
      : [];
  const expectedRoots = slice ? slice.roots : before.roots;
  const schema = getEditorSchema(editor);
  const normalize = (node: Descendant, path: Path) =>
    copy ? schema.copyNodeAt(node, path, targetRoot) : node;
  const draft: { current: DraftLanding | null } = { current: null };
  const release = guardLanding(
    editor,
    copy,
    draft,
    (drafted, after) => {
      const children = rootChildren(after, targetRoot);
      const map = mapDraft(drafted.children, children);

      if ('range' in drafted.landed) {
        const [start, end] = RangeApi.edges(drafted.landed.range);
        const landedStart = map.point(start);
        const landedEnd = map.point(end);

        if (!landedStart || !landedEnd) return false;

        const fragment = NodeApi.fragment(
          { children } as never,
          selectionRange(landedStart, landedEnd)
        ) as Descendant[];

        return (
          textTokens(
            copy ? schema.copyChildren(fragment, targetRoot) : fragment
          ) === textTokens(expected)
        );
      }

      const paths = drafted.landed.paths.map((path) => map.path(path));

      return (
        paths.length === expected.length &&
        paths.every((path, i) => {
          const node = path ? nodeAt(children, path) : null;

          return (
            !!node &&
            sameContent(
              expected[i],
              expectedRoots,
              normalize(node, path as Path),
              after.roots
            )
          );
        })
      );
    },
    diagnostics
  );
  let landed: NodeSelection | Range | null = null;
  const select = typeof input.to !== 'string';

  try {
    editor.update((tx) => {
      if (input.announce) {
        tx.effects.emit(screenReaderAnnouncementEffect, input.announce);
      }
      const pathOf = (key: NodeKey): Path =>
        tx.nodes.get(key)?.[1] ?? refuse('source-missing');
      // The child position before or after `anchor` once `at` leaves its
      // parent, if they share one.
      const besidePath = (
        anchor: Path,
        edge: 'after' | 'before',
        leaving: Path
      ): Path => {
        const index = anchor.at(-1) as number;
        const shifted =
          PathApi.equals(leaving.slice(0, -1), anchor.slice(0, -1)) &&
          (leaving.at(-1) as number) < index
            ? index - 1
            : index;

        return [
          ...anchor.slice(0, -1),
          edge === 'before' ? shifted : shifted + 1,
        ];
      };
      const moveChain = (keys: readonly NodeKey[], first: () => Path) => {
        keys.forEach((key, index) => {
          const at = pathOf(key);

          tx.nodes.move({
            at,
            to:
              index === 0
                ? first()
                : besidePath(pathOf(keys[index - 1]), 'after', at),
          });
        });
      };

      // The draft guard also expects any target a wrap carried into its slot.
      const selectLanded = (keys: readonly NodeKey[]) => {
        const paths = keys.map(pathOf);

        landed = SelectionApi.nodes(paths as [Path, ...Path[]]);
        draft.current = {
          children: tx.nodes.children(),
          landed: {
            paths: [...paths, ...carried.map(({ key }) => pathOf(key))],
          },
        };
        if (select) tx.selection.set(landed);
      };

      if (landing.kind === 'wrap') {
        const { anchor, payload, replaced, shell } = landing.wrap;
        const shellPath = insertionPath(pathOf(anchor.key), anchor.edge);

        tx.nodes.insert(shell, { at: shellPath });

        const shellKey = tx.key(shellPath) ?? refuse('schema');
        const slot = (path: Path, index: number): Path => [
          ...pathOf(shellKey),
          ...path,
          index,
        ];

        if (replaced) {
          tx.nodes.move({
            at: pathOf(replaced.key),
            to: slot(replaced.slot, 0),
          });
        }
        moveChain(landing.keys, () => slot(payload, 0));
        selectLanded(landing.keys);

        return;
      }
      if (relocate && source.kind === 'nodes' && landing.kind === 'edge') {
        const keys = source.entries.map(
          ([, path]) => from.key(path) as NodeKey
        );
        const { edge } = landing;

        moveChain(keys, () =>
          besidePath(pathOf(edge.key), edge.edge, pathOf(keys[0]))
        );
        selectLanded(keys);

        return;
      }

      const removeSource = () => {
        if (copy) return;
        if (source.root === targetRoot) {
          if (source.kind === 'text') {
            tx.text.delete({ at: source.range });
          } else {
            for (const [, path] of [...source.entries].reverse()) {
              tx.nodes.remove({ at: path });
            }
          }

          return;
        }

        const owner = getEditorRuntimeOwner(editor);

        withEditorUpdateRootScope(owner, source.root, () => {
          if (source.kind === 'text') {
            deleteText(owner, { at: source.range });
          } else {
            for (const [, path] of [...source.entries].reverse()) {
              removeNodes(owner, { at: path });
            }
          }
        });
      };

      if (landing.kind === 'point') {
        const start = tx.anchor(landing.point, {
          association: 'backward',
          deletion: 'nearest',
        });
        const end = tx.anchor(landing.point, {
          association: 'forward',
          deletion: 'nearest',
        });

        removeSource();

        const point = start.resolve();

        if (!point || !slice || !tx.slice.replace(slice, { at: point })) {
          refuse('schema');
        }

        const startPoint = start.resolve();
        const endPoint = end.resolve();

        if (!startPoint || !endPoint) refuse('schema');

        landed = selectionRange(startPoint as Point, endPoint as Point);
        draft.current = {
          children: tx.nodes.children(),
          landed: { range: landed },
        };
        if (select) tx.selection.set(landed);

        return;
      }

      removeSource();

      const target = tx.nodes.get(landing.edge.key);

      if (!target || !slice) refuse('policy');

      const [, targetPath] = target as NodeEntry;
      const boundary = insertionPath(targetPath, landing.edge.edge);

      if (
        !replaceSliceAtBlockBoundary(
          getEditorRuntimeOwner(editor),
          slice as never,
          boundary
        )
      ) {
        refuse('schema');
      }

      const first = boundary.at(-1) as number;
      const paths: Path[] = expected.map((_, i) => [
        ...boundary.slice(0, -1),
        first + i,
      ]);

      landed = SelectionApi.nodes(paths as [Path, ...Path[]]);
      draft.current = { children: tx.nodes.children(), landed: { paths } };
      if (select) tx.selection.set(landed);
    });
  } catch (error) {
    if (error instanceof TransferRefusalError) {
      return { reason: error.reason, status: 'refused' };
    }
    if (error instanceof EditorSchemaValidationError) {
      return { reason: 'schema', status: 'refused' };
    }
    throw error;
  } finally {
    release();
  }

  const at = landed as NodeSelection | Range | null;

  if (!at) return { reason: 'schema', status: 'refused' };
  if (!copy) return { at, status: 'moved' };

  return {
    at,
    diagnostics,
    reason:
      method === 'copy'
        ? 'intent'
        : relation === 'independent'
          ? 'independent'
          : relation === 'identity'
            ? 'identity'
            : 'read-only-source',
    status: 'copied',
  };
};

type CachedCheck = Readonly<{ check: TransferCheck; key: readonly unknown[] }>;

// A dragover over a side strip checks the side, then the edge it falls back
// to; one slot each keeps them from evicting each other.
const CHECKS = new WeakMap<
  AnyEditor,
  { edge?: CachedCheck; side?: CachedCheck }
>();

const checkKey = (
  editor: AnyEditor,
  input: TransferInput,
  method: TransferIntent
): readonly unknown[] => {
  const from = input.from ?? editor;

  return [
    from,
    method,
    input.nodes?.join('\u0000') ?? JSON.stringify(input.range ?? null),
    JSON.stringify(input.to),
    editor.read.runtime.snapshot(),
    from.read.runtime.snapshot(),
    editor.read.view.isReadOnly(),
    from.read.view.isReadOnly(),
    authoredIdentity(editor),
    authoredIdentity(from),
    getConfiguredPluginRegistry(editor).configurationRevision,
  ];
};

export const checkTransfer = (
  editor: AnyEditor,
  input: TransferInput,
  method: TransferIntent
): TransferCheck => {
  const key = checkKey(editor, input, method);
  const slot =
    typeof input.to === 'object' && 'side' in input.to ? 'side' : 'edge';
  const slots = CHECKS.get(editor) ?? {};
  const cached = slots[slot];

  if (cached && sameKey(cached.key, key)) return cached.check;

  let check: TransferCheck;

  try {
    check = {
      admitted: true,
      to: targetOf(admit(editor, input, method).landing),
    };
  } catch (error) {
    if (!(error instanceof TransferRefusalError)) throw error;
    check = { admitted: false, reason: error.reason };
  }

  slots[slot] = { check, key };
  CHECKS.set(editor, slots);

  return check;
};

export const checkFilesLanding = (
  editor: AnyEditor,
  types: readonly string[],
  fit: readonly Element[],
  to: TransferEdge
): TransferCheck => {
  try {
    if (editor.read.view.isReadOnly()) refuse('read-only-target');

    return {
      admitted: true,
      to: landAt(
        editor,
        {
          fit,
          from: editor,
          intent: 'copy',
          moving: null,
          payload: { kind: 'files', types },
          relation: 'independent',
        },
        to
      ),
    };
  } catch (error) {
    if (!(error instanceof TransferRefusalError)) throw error;

    return { admitted: false, reason: error.reason };
  }
};

/** The `editor.read.transfer` group. */
export type TransferRead = Readonly<{
  /**
   * Whether a transfer would be admitted, without running it: the dry run the
   * drop indicator paints from, for a move. A refusal at commit time, such as
   * a lossy landing, is not predicted.
   */
  check: (input: TransferInput) => TransferCheck;
  /**
   * The blocks a transfer carries, after feature expansion such as list
   * families, without nested duplicates, in document order. With `node`, a
   * handle's blocks: the node selection when it holds the node, else the node
   * alone. Without it, a keyboard move's blocks: the selected blocks, else the
   * blocks holding the selection.
   */
  nodes: (
    options?: Readonly<{ node?: NodeTarget<Element> }>
  ) => readonly NodeKey[];
}>;

/** The `editor.api.transfer` group. */
export type TransferApi = Readonly<{
  /** Copy blocks or text to a target edge or point. */
  copy: (input: TransferInput) => TransferOutcome;
  /**
   * Move blocks or text inside one document, or copy when the source is
   * read-only or another editor.
   */
  move: (input: TransferInput) => TransferOutcome;
}>;

const TRANSFER_PLUGIN = definePlugin('transfer', {
  read: ({ editor }): TransferRead => ({
    check: (input) => checkTransfer(editor as AnyEditor, input, 'move'),
    nodes: (options) =>
      transferEntries(editor as AnyEditor, options?.node).flatMap(
        ([node]) => editor.key(node) ?? []
      ),
  }),
  api: ({ editor }): TransferApi => ({
    copy: (input: TransferInput) =>
      runTransfer(editor as AnyEditor, input, 'copy'),
    move: (input: TransferInput) =>
      runTransfer(editor as AnyEditor, input, 'move'),
  }),
});

/** Moves and copies blocks and text through one admission law. */
export type TransferPlugin = typeof TRANSFER_PLUGIN;

/** The drag-and-drop and keyboard move action; React editors install it. */
export const transfer = (): TransferPlugin => TRANSFER_PLUGIN;
