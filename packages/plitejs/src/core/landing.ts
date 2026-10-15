import type { AnyEditor, NodeKey, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import { NodeApi, type Descendant, type NodeEntry } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { SelectionApi } from '../interfaces/selection';
import { editorReads } from './editor-reads';
import { getEditorRuntimeRoot, getEditorSchema } from './editor-runtime';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import { executeEditorRead } from './read-registry';
import type {
  TransferEdge,
  TransferIntent,
  TransferLandingInput,
  TransferPatch,
  TransferPatchProperties,
  TransferPayload,
  TransferRefusalReason,
  TransferRelation,
  TransferSide,
  TransferVeto,
  TransferVetoInput,
} from './transfer-types';

/** Contribute a veto that refuses a landing on its final edge. */
export const transferVeto = definePluginPoint<TransferVeto>('transfer.veto');

export class TransferRefusalError extends Error {
  readonly reason: TransferRefusalReason;

  constructor(reason: TransferRefusalReason) {
    super(`Transfer refused: ${reason}`);
    this.name = 'TransferRefusalError';
    this.reason = reason;
  }
}

export const refuse = (reason: TransferRefusalReason): never => {
  throw new TransferRefusalError(reason);
};

export type JsonValue = Readonly<{
  children: readonly Descendant[];
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}>;

export type LandingRequest = Readonly<{
  /**
   * The blocks that land: the payload nodes, copy-normalized for a copy, one
   * file block standing in for a file drop, or none for text.
   */
  fit: readonly Descendant[];
  from: AnyEditor;
  intent: TransferIntent;
  /** The payload's entries and root when it moves inside one document. */
  moving: Readonly<{
    entries: ReadonlyArray<NodeEntry<Descendant>>;
    root: RootKey;
  }> | null;
  payload: TransferPayload;
  relation: TransferRelation;
}>;

const reachableRoots = (
  editor: AnyEditor,
  value: JsonValue,
  nodes: readonly Descendant[]
) => {
  const roots = new Set<string>();
  const visit = (children: readonly Descendant[]) => {
    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;

      for (const root of Object.values(
        editor.read.schema.getElementContentRoots(node)
      )) {
        if (roots.has(root)) continue;
        roots.add(root);
        visit(value.roots?.[root] ?? []);
      }
      visit(node.children);
    }
  };

  visit(nodes);

  return roots;
};

const liveTarget = (editor: AnyEditor, { key }: Readonly<{ key: NodeKey }>) => {
  const entry = editor.read.nodes.get(key);

  if (!entry || !ElementApi.isElement(entry[0])) refuse('policy');

  return entry as NodeEntry<Element>;
};

export const insertionPath = (path: Path, edge: 'after' | 'before'): Path => [
  ...path.slice(0, -1),
  (path.at(-1) as number) + (edge === 'after' ? 1 : 0),
];

const insertionIndex = (edge: TransferEdge, targetPath: Path) =>
  insertionPath(targetPath, edge.edge).at(-1) as number;

const checkInside = (
  editor: AnyEditor,
  { moving }: LandingRequest,
  targetPath: Path
) => {
  if (!moving) return;

  const targetRoot = getEditorRuntimeRoot(editor);

  if (
    moving.root === targetRoot &&
    moving.entries.some(
      ([, path]) =>
        PathApi.equals(path, targetPath) || PathApi.isAncestor(path, targetPath)
    )
  ) {
    refuse('inside-source');
  }
  if (
    targetRoot !== 'main' &&
    reachableRoots(
      editor,
      editor.read.value(),
      moving.entries.map(([node]) => node)
    ).has(targetRoot)
  ) {
    refuse('inside-source');
  }
};

const checkIdentity = (
  editor: AnyEditor,
  request: LandingRequest,
  edge: TransferEdge,
  targetPath: Path
) => {
  checkInside(editor, request, targetPath);

  const { moving } = request;

  if (!moving || moving.root !== getEditorRuntimeRoot(editor)) return;

  const parentPath = targetPath.slice(0, -1);
  const index = insertionIndex(edge, targetPath);
  const indices = moving.entries.map(([, path]) => path.at(-1) as number);
  const contiguous =
    moving.entries.every(([, path]) =>
      PathApi.equals(path.slice(0, -1), parentPath)
    ) && indices.every((value, i) => i === 0 || value === indices[i - 1] + 1);

  if (
    contiguous &&
    index >= indices[0] &&
    index <= (indices.at(-1) as number) + 1
  ) {
    refuse('no-op');
  }
};

const checkPlacement = (
  editor: AnyEditor,
  { fit, intent, moving }: LandingRequest,
  edge: TransferEdge,
  targetPath: Path,
  replacing: readonly number[] = []
) => {
  const parentPath = targetPath.slice(0, -1);
  const parent =
    parentPath.length === 0
      ? null
      : (editor.read.nodes.get(parentPath)?.[0] as Element);
  const root = getEditorRuntimeRoot(editor);
  const removing =
    moving?.root === root
      ? moving.entries
          .filter(([, path]) => PathApi.equals(path.slice(0, -1), parentPath))
          .map(([, path]) => path.at(-1) as number)
      : [];

  if (
    !getEditorSchema(editor).canPlaceAt(
      parent,
      parent ? parent.children : editor.read.children(),
      fit,
      insertionIndex(edge, targetPath),
      { removing: [...removing, ...replacing], root, strict: intent === 'copy' }
    )
  ) {
    refuse('schema');
  }
};

const runVetoes = (editor: AnyEditor, input: TransferVetoInput) => {
  for (const veto of getPluginContributions(editor, transferVeto)) {
    if (veto(input, editor)) refuse('policy');
  }
};

const landingInput = (
  request: LandingRequest,
  edge: TransferEdge,
  target: NodeEntry<Element>
): TransferLandingInput => ({
  edge: edge.edge,
  from: request.from,
  intent: request.intent,
  payload: request.payload,
  relation: request.relation,
  target,
});

const readLanding = (
  editor: AnyEditor,
  input: TransferLandingInput,
  edge: TransferEdge
): TransferEdge =>
  executeEditorRead(
    editor,
    editorReads.transfer.landing,
    input,
    () => edge,
    editor
  );

const sameEdge = (a: TransferEdge, b: TransferEdge) =>
  a.key === b.key && a.edge === b.edge;

type NodesPayload = Extract<TransferPayload, { kind: 'nodes' }>;

export type Adopted = Readonly<{
  fit: readonly Descendant[];
  patches: readonly TransferPatch[];
  payload: NodesPayload;
}>;

export type Landed = Readonly<{ adopted: Adopted | null; edge: TransferEdge }>;

export type ResolvedLanding = Readonly<{
  edge: TransferEdge;
  input: TransferLandingInput;
  target: NodeEntry<Element>;
}>;

/** @internal */
export const landingMetrics = { copiedEntries: 0 };

const copyChildren = (node: Element): Element => {
  landingMetrics.copiedEntries += node.children.length;

  return { ...node, children: [...node.children] };
};

const patchAt = (
  roots: Descendant[],
  path: Path,
  properties: TransferPatchProperties,
  owned: WeakSet<Element>
) => {
  let siblings = roots;

  for (const [depth, index] of path.entries()) {
    const found = siblings[index];
    const node = ElementApi.isElement(found) ? found : refuse('policy');
    const copy = owned.has(node) ? node : copyChildren(node);
    const next =
      depth === path.length - 1
        ? (Object.fromEntries(
            Object.entries({ ...copy, ...properties }).filter(
              ([, value]) => value !== undefined
            )
          ) as Element)
        : copy;

    owned.add(next);
    siblings[index] = next;
    siblings = next.children as Descendant[];
  }
};

export const adoptAt = (
  editor: AnyEditor,
  { fit, intent, payload }: LandingRequest,
  { input }: ResolvedLanding
): Adopted | null => {
  if (payload.kind !== 'nodes') return null;

  const patches = executeEditorRead(
    editor,
    editorReads.transfer.adopt,
    { ...input, payload },
    () => [],
    editor
  );

  if (patches.length === 0) return null;

  const schema = getEditorSchema(editor);
  const root = getEditorRuntimeRoot(editor);
  const [, targetPath] = input.target;
  const destination = targetPath
    .slice(0, -1)
    .map(
      (_, depth) => editor.read.nodes.get(targetPath.slice(0, depth + 1))?.[0]
    )
    .filter((node) => ElementApi.isElement(node))
    .reverse();
  const fitted = [...fit];
  const nodes = [...payload.nodes];
  const owned = new WeakSet<Element>();

  landingMetrics.copiedEntries += fitted.length + nodes.length;

  for (const { at, properties } of patches) {
    const ancestors: Element[] = [];
    let children: readonly Descendant[] = nodes;
    let element: Element | undefined;

    for (const index of at) {
      if (element) ancestors.unshift(element);
      const node = children[index];

      if (!ElementApi.isElement(node)) return refuse('policy');
      element = node;
      ({ children } = node);
    }
    // `tx.nodes.set` removes a null property, so a move cannot land one.
    if (
      !element ||
      (intent === 'move' && Object.values(properties).includes(null)) ||
      Object.keys(properties).some(
        (key) =>
          schema.elementPropertyLanding(
            element,
            key,
            [...ancestors, ...destination],
            root
          ) !== 'adopt'
      )
    ) {
      return refuse('policy');
    }

    patchAt(nodes, at, properties, owned);
    patchAt(fitted, at, properties, owned);
  }

  return { fit: fitted, patches, payload: { ...payload, nodes } };
};

export const judgeLanding = (
  editor: AnyEditor,
  request: LandingRequest,
  { edge, input, target: [, path] }: ResolvedLanding,
  adopted: Adopted | null
): Landed => {
  checkPlacement(
    editor,
    adopted ? { ...request, fit: adopted.fit } : request,
    edge,
    path
  );
  runVetoes(editor, adopted ? { ...input, payload: adopted.payload } : input);

  return { adopted, edge };
};

export const resolveLanding = (
  editor: AnyEditor,
  request: LandingRequest,
  edge: TransferEdge
): ResolvedLanding => {
  const target = liveTarget(editor, edge);

  checkIdentity(editor, request, edge, target[1]);

  const to = readLanding(editor, landingInput(request, edge, target), edge);
  const redirected = !sameEdge(to, edge);
  const final = redirected ? liveTarget(editor, to) : target;
  const input = landingInput(request, to, final);

  if (redirected) {
    if (!sameEdge(readLanding(editor, input, to), to)) refuse('policy');
    checkIdentity(editor, request, to, final[1]);
  }

  return { edge: to, input, target: final };
};

export const landAt = (
  editor: AnyEditor,
  request: LandingRequest,
  edge: TransferEdge
): Landed => {
  const resolved = resolveLanding(editor, request, edge);

  return judgeLanding(
    editor,
    request,
    resolved,
    adoptAt(editor, request, resolved)
  );
};

const withSlot = (
  shell: Element,
  slot: Path,
  children: readonly Descendant[]
): Element => {
  if (slot.length === 0) return { ...shell, children: [...children] };

  const [index, ...rest] = slot;

  return {
    ...shell,
    children: shell.children.map((child, i) =>
      i === index ? withSlot(child as Element, rest, children) : child
    ),
  };
};

const slotIn = (shell: Element, slot: Path) => {
  const element = slot.length === 0 ? shell : NodeApi.getIf(shell, slot);

  return ElementApi.isElement(element) && element.children.length === 0
    ? element
    : null;
};

const checkSlot = (
  editor: AnyEditor,
  slot: Element,
  fit: readonly Descendant[]
) => {
  if (
    !getEditorSchema(editor).canPlaceAt(slot, [], fit, 0, {
      root: getEditorRuntimeRoot(editor),
    })
  ) {
    refuse('schema');
  }
};

export type LandedWrap = Readonly<{
  anchor: TransferEdge;
  payload: Path;
  replaced: Readonly<{ key: NodeKey; node: Element; slot: Path }> | null;
  shell: Element;
}>;

/**
 * A wrap that takes the target's place moves the target alone, so a target
 * whose feature family reaches past it refuses.
 */
export const landBeside = (
  editor: AnyEditor,
  request: LandingRequest,
  moving: NonNullable<LandingRequest['moving']>,
  side: TransferSide
): LandedWrap => {
  const target = liveTarget(editor, side);
  const [targetNode, targetPath] = target;

  checkInside(editor, request, targetPath);

  const wrap = executeEditorRead(
    editor,
    editorReads.transfer.side,
    {
      from: request.from,
      intent: request.intent,
      payload: request.payload,
      relation: request.relation,
      side: side.side,
      target,
    },
    () => null,
    editor
  );

  // A feature's shell must name empty, distinct slots that exist.
  const payloadSlot = wrap && slotIn(wrap.shell, wrap.payload);
  const targetSlot =
    wrap && 'target' in wrap ? slotIn(wrap.shell, wrap.target) : null;

  if (
    !wrap ||
    !payloadSlot ||
    ('target' in wrap &&
      (!targetSlot || PathApi.equals(wrap.target, wrap.payload)))
  ) {
    return refuse('policy');
  }

  let anchor: TransferEdge;
  let replaced: LandedWrap['replaced'] = null;

  if ('target' in wrap) {
    if (
      moving.entries.some(([, path]) => PathApi.isAncestor(targetPath, path))
    ) {
      refuse('inside-source');
    }
    if (
      executeEditorRead(
        editor,
        editorReads.transfer.source,
        { selection: SelectionApi.nodes([targetPath], { mode: 'block' }) },
        ({ selection }) => selection,
        editor
      ).paths.some((path) => !PathApi.equals(path, targetPath))
    ) {
      return refuse('policy');
    }

    anchor = { edge: 'before', key: side.key };
    replaced = { key: side.key, node: targetNode, slot: wrap.target };
  } else {
    const key =
      wrap.ancestor >= 0 && wrap.ancestor < targetPath.length
        ? editor.key(targetPath.slice(0, targetPath.length - wrap.ancestor))
        : null;

    if (!key) return refuse('policy');
    anchor = { edge: wrap.edge, key };
  }

  const anchorEntry = liveTarget(editor, anchor);
  const [, anchorPath] = anchorEntry;
  const filled = withSlot(wrap.shell, wrap.payload, request.fit);

  checkPlacement(
    editor,
    {
      ...request,
      fit: [replaced ? withSlot(filled, replaced.slot, [targetNode]) : filled],
    },
    anchor,
    anchorPath,
    replaced ? [anchorPath.at(-1) as number] : []
  );
  checkSlot(editor, payloadSlot, request.fit);
  if (targetSlot) checkSlot(editor, targetSlot, [targetNode]);

  const input = { ...landingInput(request, anchor, anchorEntry), wrap };

  runVetoes(editor, input);

  if (replaced) {
    const parentPath = targetPath.slice(0, -1);

    runVetoes(editor, {
      ...input,
      from: editor,
      intent: 'move',
      payload: {
        kind: 'nodes',
        nodes: [targetNode],
        parentKeys: [parentPath.length > 0 ? editor.key(parentPath) : null],
      },
      relation: 'document',
    });
  }

  return {
    anchor,
    payload: wrap.payload,
    replaced,
    shell: wrap.shell,
  };
};
