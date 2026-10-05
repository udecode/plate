import type { AnyEditor, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import type { Descendant, NodeEntry } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { editorReads } from './editor-reads';
import { getEditorRuntimeRoot, getEditorSchema } from './editor-runtime';
import { definePluginPoint, getPluginContributions } from './plugin';
import { executeEditorRead } from './read-registry';
import type {
  TransferEdge,
  TransferIntent,
  TransferLandingInput,
  TransferPayload,
  TransferRefusalReason,
  TransferRelation,
  TransferVeto,
} from './transfer-types';

/** Contribute a veto that refuses a landing on its final edge. */
export const transferVeto = definePluginPoint<TransferVeto>(
  'plite.transfer.veto'
);

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

const liveTarget = (editor: AnyEditor, edge: TransferEdge) => {
  const entry = editor.read.nodes.get(edge.key);

  if (!entry || !ElementApi.isElement(entry[0])) refuse('policy');

  return entry as NodeEntry<Element>;
};

const insertionIndex = (edge: TransferEdge, targetPath: Path) =>
  (targetPath.at(-1) as number) + (edge.edge === 'after' ? 1 : 0);

const checkIdentity = (
  editor: AnyEditor,
  { moving }: LandingRequest,
  edge: TransferEdge,
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
  if (moving.root !== targetRoot) return;

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
  targetPath: Path
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
      { removing, root, strict: intent === 'copy' }
    )
  ) {
    refuse('schema');
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

export const landAt = (
  editor: AnyEditor,
  request: LandingRequest,
  edge: TransferEdge
): TransferEdge => {
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

  checkPlacement(editor, request, to, final[1]);

  for (const veto of getPluginContributions(editor, transferVeto)) {
    if ((veto as TransferVeto)(input, editor)) refuse('policy');
  }

  return to;
};
