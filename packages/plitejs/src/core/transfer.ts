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
import { getDefined } from '../internal/get-defined';
import { removeNodes } from '../transforms-node';
import { deleteText, resolveDeletedRange } from '../transforms-text';
import type { Anchor } from './anchor';
import { readAuthoredView } from './authored-runtime';
import type { DocumentIndex } from './change/document-index';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { isDocumentView } from './document-view-read';
import { readDraftTrack, trackDraftSpans } from './draft-track';
import { editorReads } from './editor-reads';
import {
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  getEditorSchema,
} from './editor-runtime';
import { getContentSlice } from './get-content-slice';
import {
  type Adopted,
  adoptAt,
  insertionPath,
  judgeLanding,
  type JsonValue,
  landAt,
  type Landed,
  landBeside,
  type LandedWrap,
  type LandingRequest,
  refuse,
  resolveLanding,
  TransferRefusalError,
  transferVeto,
} from './landing';
import { definePlugin } from './plugin';
import { getConfiguredPluginRegistry } from './plugin-registry';
import {
  applyTransactionSpec,
  finalizeTransactionRepresentation,
  getAppliedSpecLanding,
  getEditorStateView,
  getTransactionSnapshot,
  replaceSliceAtBlockBoundary,
  withDraftMove,
  withEditorUpdateRootScope,
} from './public-state';
import { executeEditorRead } from './read-registry';
import { EditorSchemaValidationError } from './schema-validation';
import { screenReaderAnnouncementEffect } from './screen-reader-announcement';
import {
  type LandingSource,
  payloadKeyOf,
  withLandingSources,
} from './slice-fit/provenance';
import { planPaste, writePaste } from './slice-landing';
import {
  ancestorsAt,
  carryMove,
  type CopyNormalizer,
  type DraftLanding,
  droppedKeysOf,
  eachFragmentNode,
  guardLanding,
  type LandingExpectation,
  landingHolds,
  rebaseLanding,
  rootChildren,
  type SourceByPayloadNode,
  selectionRange,
  trackedRange,
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
import { countCoreWork } from './work';

export { transferVeto };

type NodeSource = Readonly<{
  entries: ReadonlyArray<NodeEntry<Descendant>>;
  kind: 'nodes';
  root: RootKey;
}>;

type TextSource = Readonly<{
  deleted: Range | null;
  kind: 'text';
  range: Range;
  root: RootKey;
}>;

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
  relocatedAdoption: Adopted | null;
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

// A preview reads another document than the stored one; Editing and
// Suggesting views read the same.
const authoredIdentity = (editor: AnyEditor) => {
  const view = readAuthoredView(editor);

  return view && 'preview' in view ? view.preview : 'native';
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
    {
      selection: SelectionApi.nodes(paths as [Path, ...Path[]], {
        mode: 'block',
      }),
    },
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

    return {
      deleted: resolveDeletedRange(from, input.range),
      kind: 'text',
      range: input.range,
      root,
    };
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

type PayloadSources = Readonly<{
  landing: readonly LandingSource[];
  nodes: SourceByPayloadNode;
}>;

/**
 * Where each node of a moved range's payload came from, so its landing can
 * judge a value the node carried. An open edge block merges into the
 * landing's block instead of landing as itself, so it gets no source.
 */
const payloadSourcesOf = (
  index: DocumentIndex,
  range: Range,
  slice: ContentSlice,
  inline: (element: Element) => boolean
): PayloadSources => {
  const open = new Set<Descendant>();
  const edges = [
    [slice.openStart, (list: readonly Descendant[]) => list[0]],
    [slice.openEnd, (list: readonly Descendant[]) => list.at(-1)],
  ] as const;

  for (const [depth, edge] of edges) {
    let list = slice.content;

    for (let level = 0; level < depth; level += 1) {
      const node = edge(list);

      if (!node || !ElementApi.isElement(node)) break;
      if (!inline(node)) open.add(node);
      list = node.children;
    }
  }

  const [start] = RangeApi.edges(range);
  const landing: LandingSource[] = [];
  const nodes = new Map<object, object>();

  eachFragmentNode(slice.content, start.path, (node, path) => {
    if (NodeApi.isText(node) ? node.text === '' : open.has(node)) return;
    countCoreWork('landingSources');
    landing.push({
      at: index.nodeRange(path).from,
      document: index,
      kind: NodeApi.isText(node) ? 'text' : 'element',
      payload: payloadKeyOf(node),
    });
    nodes.set(node, index.node(path));
  });

  return { landing, nodes };
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

  const [selectedStart, selectedEnd] = RangeApi.edges(source.range);
  const [deletedStart, deletedEnd] = RangeApi.edges(
    source.deleted ?? source.range
  );

  if (
    [selectedStart, selectedEnd, deletedStart, deletedEnd].some((edge) =>
      PointApi.equals(point, edge)
    )
  ) {
    refuse('no-op');
  }

  const start = PointApi.isBefore(deletedStart, selectedStart)
    ? deletedStart
    : selectedStart;
  const end = PointApi.isAfter(deletedEnd, selectedEnd)
    ? deletedEnd
    : selectedEnd;

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
): Landed => {
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
      const resolved = resolveLanding(editor, request, {
        edge: next ? 'after' : 'before',
        key,
      });

      judgeLanding(editor, request, resolved, null);

      const landed = editor.read.nodes.path(resolved.edge.key);

      // A redirect out of the parent leaves this sibling for the next one.
      if (landed && PathApi.equals(landed.slice(0, -1), parent)) {
        const adopted = adoptAt(editor, request, resolved);

        return adopted
          ? judgeLanding(editor, request, resolved, adopted)
          : { adopted, edge: resolved.edge };
      }
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
  if (source.kind === 'text' && intent === 'move') {
    const { deleted } = source;

    if (!deleted) refuse('lossy');
    else if (RangeApi.isCollapsed(deleted)) refuse('no-op');
  }

  const slice =
    source.kind === 'nodes' &&
    intent === 'move' &&
    source.root === getEditorRuntimeRoot(editor)
      ? null
      : (slices[intent] ??= getContentSlice(
          from,
          source.kind === 'text'
            ? (intent === 'move' && source.deleted) || source.range
            : SelectionApi.nodes(
                source.entries.map(([, path]) => path) as [Path, ...Path[]],
                { mode: 'block' }
              ),
          undefined,
          intent
        ));
  const request = requestOf(from, intent, payload, relation, source, slice);

  const admitted = (landing: Landing): Admission => ({
    relocatedAdoption: null,
    intent,
    landing,
    relation,
    slice,
    source,
  });
  const admittedEdge = ({ adopted, edge }: Landed): Admission => ({
    ...admitted({ edge, kind: 'edge' }),
    relocatedAdoption: slice ? null : adopted,
    slice:
      adopted && slice
        ? ContentSliceValue.withContent(slice, adopted.fit, {
            open: 'preserve',
          })
        : slice,
  });

  if (typeof input.to === 'string') {
    return admittedEdge(resolveStep(editor, request, source, input.to));
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

  return admittedEdge(landAt(editor, request, input.to));
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

  const { intent, landing, relation, relocatedAdoption, slice, source } =
    admission;
  const copy = intent === 'copy';
  const targetRoot = getEditorRuntimeRoot(editor);
  const before = from.read.value() as JsonValue;
  const relocate = !slice;
  const carried =
    landing.kind === 'wrap' && landing.wrap.replaced
      ? [landing.wrap.replaced]
      : [];
  const content = slice
    ? slice.content
    : source.kind === 'nodes'
      ? [
          ...(relocatedAdoption?.payload.nodes ??
            source.entries.map(([node]) => node)),
          ...carried.map(({ node }) => node),
        ]
      : [];
  const schema = getEditorSchema(editor);
  const normalize: CopyNormalizer | null = copy
    ? {
        children: (nodes) => schema.copyChildren(nodes, targetRoot),
        node: (node, children, path) =>
          schema.copyChildren(
            [node],
            targetRoot,
            ancestorsAt(children, path)
          )[0],
      }
    : null;
  const draft: { current: DraftLanding | null } = { current: null };
  const runtime = getEditorRuntimeOwner(editor);
  const trackNodes = (paths: readonly Path[]): DraftLanding => {
    const snapshot = getDefined(getTransactionSnapshot(runtime));
    const index = snapshot.builder.getIndex(targetRoot);

    return {
      expected: {
        content,
        kind: 'nodes',
        roots: slice ? slice.roots : before.roots,
      },
      track: trackDraftSpans(
        snapshot,
        snapshot.builder,
        targetRoot,
        paths.map((path) => index.nodeRange(path))
      ),
    };
  };
  const followsDrop =
    (element: Element, ancestors: readonly Element[]) => (key: string) =>
      schema.elementPropertyLanding(element, key, ancestors, targetRoot) !==
      'preserve';
  const release = guardLanding(
    editor,
    copy,
    draft,
    (drafted, after, frame) => {
      const builder = getTransactionSnapshot(runtime)?.builder;
      const spans =
        builder?.value === after
          ? readDraftTrack(drafted.track, after, frame)
          : null;

      if (!builder || !spans) return false;

      const expected = frame
        ? rebaseLanding(drafted, frame, targetRoot, normalize)
        : drafted.expected;

      return (
        !!expected &&
        landingHolds(
          expected,
          {
            children: rootChildren(after, targetRoot),
            dropped: droppedKeysOf(builder.draftSteps),
            index: builder.getIndex(targetRoot),
            roots: after.roots,
            spans,
          },
          normalize
        )
      );
    },
    diagnostics
  );
  let landed: NodeSelection | Range | null = null;
  const select = typeof input.to !== 'string';
  // The landing's edges, held across the commit, where a recorder may rewrite
  // the draft commands wrote.
  let held: HeldLanding | null = null;
  const hold = (range: Range) => {
    const [start, end] = RangeApi.edges(range);

    held = {
      end: editor.anchor(end, { association: 'backward', deletion: 'nearest' }),
      kind: 'range',
      start: editor.anchor(start, {
        association: 'forward',
        deletion: 'nearest',
      }),
    };
  };
  const holdNodes = (nodes: NodeSelection) => {
    held = {
      first: editor.anchor(nodes.anchorPath, { deletion: 'nearest' }),
      kind: 'nodes',
      last: editor.anchor(nodes.focusPath, { deletion: 'nearest' }),
    };
  };

  const asMove = <T>(role: 'landing' | 'source', run: () => T): T =>
    copy ? run() : withDraftMove(getEditorRuntimeOwner(editor), { role }, run);
  let accepted: true | undefined;

  try {
    accepted = editor.update((tx): true => {
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

        const nodes = SelectionApi.nodes(paths as [Path, ...Path[]], {
          mode: 'block',
        });

        landed = nodes;
        draft.current = trackNodes([
          ...paths,
          ...carried.map(({ key }) => pathOf(key)),
        ]);
        holdNodes(nodes);
        if (select) tx.selection.set(nodes);
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

        return true;
      }
      if (relocate && source.kind === 'nodes' && landing.kind === 'edge') {
        const keys = source.entries.map(
          ([, path]) => from.key(path) as NodeKey
        );
        const { edge } = landing;

        moveChain(keys, () =>
          besidePath(pathOf(edge.key), edge.edge, pathOf(keys[0]))
        );
        for (const { at, properties } of relocatedAdoption?.patches ?? []) {
          const [index, ...rest] = at;

          tx.nodes.set(properties, {
            at: [...pathOf(keys[index]), ...rest],
            voids: true,
          });
        }
        selectLanded(keys);

        return true;
      }

      const removeSource = () => {
        if (copy) return;
        asMove('source', removeSourceSteps);
      };
      const removeSourceSteps = () => {
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

      const landedKind = (element: Element) => {
        const behavior = schema.getElementBehavior(element);

        return behavior.void ? 'void' : behavior.inline ? 'inline' : 'block';
      };
      const landAsPaste = (
        at: Point,
        copied: ContentSlice,
        sources: PayloadSources | null = null
      ) => {
        const plan = planPaste(
          editor,
          getEditorStateView(editor),
          { options: { at }, slice: copied },
          intent,
          { drop: true }
        );

        if (!plan) return null;
        if (!copy && (plan.inputCut || plan.landingCut)) refuse('lossy');

        const written = withLandingSources(sources?.landing ?? null, () =>
          writePaste(editor, plan, { landing: true })
        );

        if (!written) return null;
        if (written.lossy) {
          diagnostics.push({
            impact: 'lossy',
            message: 'Some dragged content does not fit here.',
          });
        }
        applyTransactionSpec(getEditorRuntimeOwner(editor), written.spec);

        const expected: LandingExpectation = copy
          ? { content: written.written.content, kind: 'range-copy' }
          : {
              kind: 'range-move',
              moved:
                carryMove({
                  followsDrop,
                  kind: landedKind,
                  moved: copied,
                  replaced:
                    written.written === plan.emptyBlockReplacement
                      ? (plan.site.target.block?.[0] ?? null)
                      : null,
                  sources: sources?.nodes,
                  written: written.written,
                }) ?? refuse('lossy'),
            };

        return { expected, spec: written.spec };
      };

      if (landing.kind === 'point') {
        const drop = tx.anchor(landing.point, {
          association: 'backward',
          deletion: 'nearest',
        });
        const { builder: moving } = getDefined(getTransactionSnapshot(runtime));
        const sources =
          moving.tracksPlaces &&
          !copy &&
          slice &&
          source.kind === 'text' &&
          source.root === targetRoot
            ? payloadSourcesOf(
                moving.getIndex(targetRoot),
                source.deleted ?? source.range,
                slice,
                (element) => schema.getElementBehavior(element).inline
              )
            : null;

        removeSource();
        // Canonicalize the source's leftovers as their own step. When one
        // canonical step spans them and the landing, `reconcileChildrenStep` can
        // diff everything between as one replace, and every landed position
        // inside it then maps to the replace's ends.
        finalizeTransactionRepresentation(getEditorRuntimeOwner(editor));

        const point = drop.resolve();
        const pasted =
          (point &&
            slice &&
            asMove('landing', () => landAsPaste(point, slice, sources))) ||
          refuse('schema');
        const track = getAppliedSpecLanding(pasted.spec) ?? refuse('schema');
        const { builder } = getDefined(getTransactionSnapshot(runtime));
        const [span] = readDraftTrack(track, builder.value) ?? [];

        landed =
          (span && trackedRange(builder.getIndex(targetRoot), span)) ??
          refuse('schema');
        draft.current = { expected: pasted.expected, track };
        hold(landed);
        if (select) tx.selection.set(landed);

        return true;
      }

      removeSource();

      const target = tx.nodes.get(landing.edge.key);

      if (!target || !slice) refuse('policy');

      const [, targetPath] = target as NodeEntry;
      const boundary = insertionPath(targetPath, landing.edge.edge);

      if (
        !asMove('landing', () =>
          replaceSliceAtBlockBoundary(
            getEditorRuntimeOwner(editor),
            slice as never,
            boundary,
            { drop: true }
          )
        )
      ) {
        refuse('schema');
      }

      const first = boundary.at(-1) as number;
      const paths: Path[] = content.map((_, i) => [
        ...boundary.slice(0, -1),
        first + i,
      ]);

      const nodes = SelectionApi.nodes(paths as [Path, ...Path[]], {
        mode: 'block',
      });

      landed = nodes;
      draft.current = trackNodes(paths);
      holdNodes(nodes);
      if (select) tx.selection.set(nodes);

      return true;
    });
  } catch (error) {
    releaseHeld(held);
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

  if (!accepted) {
    releaseHeld(held);

    return { reason: 'policy', status: 'refused' };
  }

  const at = readHeld(held, landed);

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

type HeldLanding =
  | Readonly<{ end: Anchor<Point>; kind: 'range'; start: Anchor<Point> }>
  | Readonly<{ first: Anchor<Path>; kind: 'nodes'; last: Anchor<Path> }>;

const releaseHeld = (held: HeldLanding | null) => {
  if (held?.kind === 'range') {
    held.start.release();
    held.end.release();
  } else if (held) {
    held.first.release();
    held.last.release();
  }
};

const readHeld = (
  held: HeldLanding | null,
  landed: NodeSelection | Range | null
): NodeSelection | Range | null => {
  if (!held || !landed) return landed;

  const edges =
    held.kind === 'range'
      ? [held.start.resolve(), held.end.resolve()]
      : [held.first.resolve(), held.last.resolve()];

  releaseHeld(held);

  const [start, end] = edges;

  if (!start || !end) return landed;
  if (held.kind === 'range') {
    return selectionRange(start as Point, end as Point);
  }

  const first = start as Path;
  const parent = first.slice(0, -1);
  const from = first.at(-1) as number;
  const to = (end as Path).at(-1) as number;
  const rest = Array.from(
    { length: Math.max(0, to - from) },
    (_, offset): Path => [...parent, from + offset + 1]
  );

  return SelectionApi.nodes([first, ...rest], { mode: 'block' });
};

const CHECKS = new WeakMap<
  AnyEditor,
  Readonly<{ checks: Map<string, TransferCheck>; key: readonly unknown[] }>
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
  const kept = CHECKS.get(editor);
  const cached =
    kept && sameKey(kept.key, key) ? kept : { checks: new Map(), key };
  const to = JSON.stringify(input.to);
  const known = cached.checks.get(to);

  if (known) return known;

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

  cached.checks.set(to, check);
  CHECKS.set(editor, cached);

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
      ).edge,
    };
  } catch (error) {
    if (!(error instanceof TransferRefusalError)) throw error;

    return { admitted: false, reason: error.reason };
  }
};

/** The `editor.read.transfer` group. */
export type TransferRead = Readonly<{
  /**
   * Whether a move would be admitted, without running it: the dry run the
   * drop indicator paints from. A refusal at commit time, such as a lossy
   * landing, is not predicted.
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
