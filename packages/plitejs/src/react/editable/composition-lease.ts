// oxlint-disable-next-line react-doctor/no-flush-sync -- A composition that starts before React drew the previous commit must snapshot that render, or its lease would restore stale text.
import { flushSync } from 'react-dom';

import {
  type Descendant,
  type NodeKey,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
} from '../..';
import { getSelection, isDOMElement } from '../../dom';
import { writeDOMSelection } from '../../dom/utils/selection-writes';
import type { PliteDecorationStore } from '../decoration-context';
import { holdsPliteNodeKeyElement } from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { samePliteRootPoint } from '../view-boundary-graph';
import {
  getNodeKey,
  getPathByNodeKey,
  toInternalRoot,
} from './runtime-editor-api';
import {
  readNodeByKey,
  readPathByNodeKey,
  readRuntimeText,
} from './runtime-live-state';

type ChildListSnapshot = Readonly<{
  children: readonly globalThis.ChildNode[];
  parent: globalThis.Node;
}>;

type TextSnapshot = Readonly<{ node: globalThis.Text; value: string }>;

export type CompositionLeaseSnapshot = Readonly<{
  host: Element;
  lists: readonly ChildListSnapshot[];
  nodes: ReadonlySet<globalThis.Node>;
  texts: readonly TextSnapshot[];
}>;

export type CompositionLeaseVerdict = 'keep' | 'rebuild' | 'restore';

export type HeldChildren = Readonly<{
  childKeys: readonly NodeKey[];
  children: readonly Descendant[];
}>;

const NO_CHILDREN: HeldChildren = { childKeys: [], children: [] };

type HeldLine = Readonly<{
  editor: ReactRuntimeEditor;
  hosts: ReadonlySet<globalThis.Node>;
  key: NodeKey;
  node: Descendant;
  nodes: ReadonlyMap<NodeKey, HeldChildren>;
  refresh: () => void;
}>;

type CompositionLeaseState = {
  coveredBlockKeys: readonly NodeKey[];
  hostBlockKey: NodeKey | null;
  leafKey: NodeKey | null;
  line: HeldLine | null;
  restoredLine: 'owed' | 'reentered' | null;
  snapshot: CompositionLeaseSnapshot | null;
  writes: Map<globalThis.Node, () => void>;
};

const TEXT_HOST_SELECTOR = '[data-editor-node="text"]';

const LINE_HOST_SELECTOR = `${TEXT_HOST_SELECTOR}, [data-editor-text-flow]`;

const readChildKeys = (
  editor: ReactRuntimeEditor,
  children: readonly Descendant[],
  path: Path
) => children.flatMap((_, index) => getNodeKey(editor, [...path, index]) ?? []);

const captureHeldLine = (
  editor: ReactRuntimeEditor,
  key: NodeKey,
  refresh: (nodeKeys: readonly NodeKey[]) => void
): HeldLine | null => {
  const { node, path } = readNodeByKey(editor, key);

  if (!node || !path || !NodeApi.isElement(node)) return null;
  const nodes = new Map<NodeKey, HeldChildren>();
  const visit = (nodeKey: NodeKey, descendant: Descendant, at: Path) => {
    if (!NodeApi.isElement(descendant)) {
      nodes.set(nodeKey, NO_CHILDREN);
      return;
    }
    const childKeys = readChildKeys(editor, descendant.children, at);

    if (childKeys.length !== descendant.children.length) return;
    nodes.set(nodeKey, { childKeys, children: descendant.children });
    descendant.children.forEach((child, index) =>
      visit(childKeys[index], child, [...at, index])
    );
  };

  visit(key, node, path);
  if (!nodes.has(key)) return null;
  const hosts = new Set(
    ReactEditor.resolveDOMNode(editor, key)?.querySelectorAll(
      LINE_HOST_SELECTOR
    )
  );

  return {
    editor,
    hosts,
    key,
    node,
    nodes,
    refresh: () => refresh([...nodes.keys()]),
  };
};

const coversNative = (
  snapshot: CompositionLeaseSnapshot | null | undefined,
  node: globalThis.Node
) => !!snapshot && (snapshot.host.contains(node) || snapshot.nodes.has(node));

const runWrites = (writes: Iterable<() => void>) => {
  let firstError: unknown;
  let hasError = false;

  for (const write of writes) {
    try {
      write();
    } catch (error) {
      if (!hasError) {
        firstError = error;
        hasError = true;
      }
    }
  }
  if (hasError) throw firstError;
};

const writesOutsideNativeHost = ({ snapshot, writes }: CompositionLeaseState) =>
  [...writes].flatMap(([node, write]) =>
    coversNative(snapshot, node) ? [] : [write]
  );

const lineChanged = ({ editor, key, node }: HeldLine) =>
  readNodeByKey(editor, key).node !== node;

const heldNodeRemoved = ({ editor, nodes }: HeldLine) => {
  for (const nodeKey of nodes.keys()) {
    if (!readPathByNodeKey(editor, nodeKey)) return true;
  }
  return false;
};

const drawnByLine = ({ editor, key }: HeldLine) => {
  const linePath = readPathByNodeKey(editor, key);

  return (childKey: NodeKey) => {
    const path = readPathByNodeKey(editor, childKey);

    return !path || (!!linePath && PathApi.isAncestor(linePath, path));
  };
};

export const snapshotCompositionHost = (
  host: Element
): CompositionLeaseSnapshot => {
  const lists: ChildListSnapshot[] = [];
  const nodes = new Set<globalThis.Node>();
  const texts: TextSnapshot[] = [];
  const visit = (node: globalThis.Node) => {
    nodes.add(node);
    if (node.nodeType === Node.TEXT_NODE) {
      texts.push({
        node: node as globalThis.Text,
        value: node.nodeValue ?? '',
      });
      return;
    }
    const children = [...node.childNodes];

    lists.push({ children, parent: node });
    for (const child of children) visit(child);
  };

  visit(host);
  return { host, lists, nodes, texts };
};

const isEditableStringText = (node: globalThis.Text, host: Element) => {
  const parent = node.parentElement;

  return (
    !!parent &&
    (parent.hasAttribute('data-editor-string') ||
      (parent === host && host.hasAttribute('data-editor-text-flow')))
  );
};

const insertsOneRun = (before: string, after: string) => {
  if (after.length <= before.length) return false;
  let start = 0;

  while (start < before.length && before[start] === after[start]) start += 1;
  let end = 0;

  while (
    end < before.length - start &&
    before[before.length - 1 - end] === after[after.length - 1 - end]
  ) {
    end += 1;
  }

  return start + end === before.length;
};

/**
 * A host split into several strings, or whose string sits under a decoration,
 * restores instead of keeping the browser's DOM, because React keeps a segment
 * whose props did not change.
 */
export const judgeCompositionLease = (
  snapshot: CompositionLeaseSnapshot,
  leaf: Readonly<{ decorated: boolean; text: string }> | null
): CompositionLeaseVerdict => {
  const { host, lists, texts } = snapshot;

  if (!host.isConnected) return 'rebuild';
  for (const { children, parent } of lists) {
    const live = parent.childNodes;

    if (
      live.length !== children.length ||
      children.some((child, index) => live[index] !== child)
    ) {
      return 'rebuild';
    }
  }

  const changed = texts.filter(({ node, value }) => node.nodeValue !== value);

  if (changed.length === 0) return 'keep';
  if (changed.some(({ node }) => !isEditableStringText(node, host))) {
    return 'rebuild';
  }

  const strings = texts.filter(({ node }) => isEditableStringText(node, host));
  const [only] = changed;

  return strings.length === 1 &&
    changed.length === 1 &&
    insertsOneRun(only.value, only.node.nodeValue ?? '') &&
    !!leaf &&
    !leaf.decorated &&
    leaf.text === only.node.nodeValue
    ? 'keep'
    : 'restore';
};

export class CompositionLease {
  private state: CompositionLeaseState | null = null;

  private settledSinceRender = false;

  get held() {
    return this.state !== null;
  }

  grant({
    coveredBlockKeys = [],
    host,
    hostBlockKey,
    leafKey,
    line = null,
  }: {
    coveredBlockKeys?: readonly NodeKey[];
    host: Element | null;
    hostBlockKey: NodeKey | null;
    leafKey: NodeKey | null;
    line?: HeldLine | null;
  }) {
    this.state = {
      coveredBlockKeys,
      hostBlockKey,
      leafKey,
      line,
      restoredLine: null,
      snapshot: host ? snapshotCompositionHost(host) : null,
      writes: new Map(),
    };
  }

  keepsDrawn(nodeKey: NodeKey) {
    const line = this.state?.line;
    const held = line?.nodes.get(nodeKey);

    if (!line || !held) return false;
    return held.childKeys.every(drawnByLine(line));
  }

  heldChildren(nodeKey: NodeKey) {
    const line = this.state?.line;
    const held = line?.nodes.get(nodeKey);

    if (!line || !held) return null;
    const drawn = drawnByLine(line);

    if (held.childKeys.every(drawn)) return held;
    const kept = held.childKeys.flatMap((childKey, index) =>
      drawn(childKey) ? [index] : []
    );

    return {
      childKeys: kept.map((index) => held.childKeys[index]),
      children: kept.map((index) => held.children[index]),
    };
  }

  defersWrite(node: globalThis.Node) {
    return this.protectsNative(node) || this.protectsLineText(node);
  }

  protectsMutation(mutation: MutationRecord) {
    return (
      this.protectsNative(mutation.target) ||
      [...mutation.removedNodes].some((node) => this.protectsNative(node))
    );
  }

  private protectsNative(node: globalThis.Node) {
    return coversNative(this.state?.snapshot, node);
  }

  private protectsLineText(node: globalThis.Node) {
    return !!this.state?.line?.hosts.has(node);
  }

  holdsLine(editor: ReactRuntimeEditor, node: globalThis.Node) {
    const lineKey = this.state?.hostBlockKey;

    return !!lineKey && holdsPliteNodeKeyElement(editor, lineKey, node);
  }

  markLineRestored() {
    if (this.state) this.state.restoredLine = 'owed';
  }

  takeRestoredLine() {
    const { state } = this;

    if (state?.restoredLine !== 'owed') return null;
    state.restoredLine = 'reentered';
    return state.hostBlockKey;
  }

  queue(node: globalThis.Node, write: () => void) {
    if (!this.state || !this.defersWrite(node)) return false;

    this.state.writes.set(node, write);
    return true;
  }

  take() {
    const { state } = this;

    this.state = null;
    if (state) this.settledSinceRender = true;
    return state;
  }

  release() {
    const { state } = this;

    this.state = null;
    this.settledSinceRender = false;
    if (!state) return;
    try {
      runWrites(writesOutsideNativeHost(state));
    } finally {
      if (state.line && lineChanged(state.line)) state.line.refresh();
    }
  }

  completeRender() {
    this.settledSinceRender = false;
  }

  takeSettledSinceRender() {
    const debt = this.settledSinceRender;

    this.settledSinceRender = false;
    return debt;
  }
}

const readLowestBlockKey = (
  editor: ReactRuntimeEditor,
  at: Point
): NodeKey | null => {
  const entry = editor.read((state) =>
    state.nodes.block({ at, mode: 'lowest' })
  );

  return entry ? getNodeKey(editor, entry[1]) : null;
};

const isLeafEdgePair = (editor: ReactRuntimeEditor, a: Point, b: Point) => {
  const [before, after] = PathApi.compare(a.path, b.path) < 0 ? [a, b] : [b, a];

  return (
    PathApi.isSibling(before.path, after.path) &&
    PathApi.equals(PathApi.next(before.path), after.path) &&
    after.offset === 0 &&
    before.offset === readRuntimeText(editor, before.path)?.text.length
  );
};

const readDOMFocusHost = (root: HTMLElement) => {
  const domSelection = getSelection(
    root.getRootNode() as Document | ShadowRoot
  );
  const focus = domSelection?.focusNode;

  if (!domSelection || !focus) return null;
  const element = isDOMElement(focus) ? focus : focus.parentElement;
  const host = element?.closest(TEXT_HOST_SELECTOR) ?? null;

  return host && root.contains(host)
    ? { host, node: focus, offset: domSelection.focusOffset }
    : null;
};

const resolveLeaseHost = (
  editor: ReactRuntimeEditor,
  root: HTMLElement,
  caret: Point
) => {
  const focus = readDOMFocusHost(root);

  if (!focus || !ReactEditor.hasEditableTarget(editor, focus.node)) {
    return null;
  }
  const point = ReactEditor.resolvePoint(editor, [focus.node, focus.offset], {
    exactMatch: false,
  });

  return point &&
    (samePliteRootPoint(
      point,
      caret,
      toInternalRoot(editor.read((state) => state.view.root()))
    ) ||
      isLeafEdgePair(editor, point, caret))
    ? focus.host
    : null;
};

export const grantCompositionLease = ({
  editor,
  lease,
  refresh,
  root,
  selection,
}: {
  editor: ReactRuntimeEditor;
  lease: CompositionLease;
  refresh: (nodeKeys: readonly NodeKey[]) => void;
  root: HTMLElement;
  selection: Range | null;
}) => {
  if (!selection) {
    lease.grant({ host: null, hostBlockKey: null, leafKey: null });
    return;
  }
  if (RangeApi.isExpanded(selection)) {
    const coveredBlockKeys = editor
      .read((state) => state.nodes.blocks({ at: selection, mode: 'lowest' }))
      .flatMap(([, path]) => getNodeKey(editor, path) ?? []);

    lease.grant({
      coveredBlockKeys,
      host: null,
      hostBlockKey: readLowestBlockKey(editor, RangeApi.start(selection)),
      leafKey: null,
    });
    return;
  }

  const host = resolveLeaseHost(editor, root, selection.focus);
  const hostBlockKey = readLowestBlockKey(editor, selection.focus);

  lease.grant({
    host,
    hostBlockKey,
    leafKey: (host?.getAttribute('data-editor-node-key') ??
      null) as NodeKey | null,
    line:
      host && hostBlockKey
        ? captureHeldLine(editor, hostBlockKey, refresh)
        : null,
  });
};

const readLeaf = (
  editor: ReactRuntimeEditor,
  decorations: PliteDecorationStore | null,
  leafKey: NodeKey | null
) => {
  const path = leafKey ? getPathByNodeKey(editor, leafKey) : null;
  const text = path ? readRuntimeText(editor, path)?.text : undefined;

  return leafKey && text !== undefined
    ? {
        decorated: (decorations?.getNodeSnapshot(leafKey).length ?? 0) > 0,
        text,
      }
    : null;
};

const readFocusBlockKey = (
  editor: ReactRuntimeEditor,
  focus: NonNullable<ReturnType<typeof readDOMFocusHost>>
) => {
  const point = ReactEditor.resolvePoint(editor, [focus.node, focus.offset], {
    exactMatch: false,
  });

  return point ? readLowestBlockKey(editor, point) : null;
};

const redrawRestoredLineAndCaret = (
  editor: ReactRuntimeEditor,
  lineKey: NodeKey,
  rebuild: (blockKey: NodeKey) => void,
  root: HTMLElement
) => {
  const linePath = getPathByNodeKey(editor, lineKey);

  if (!linePath) return false;
  flushSync(() => rebuild(lineKey));
  const point = editor.read((state) => {
    const selection = state.selection();

    return selection && PathApi.isAncestor(linePath, selection.focus.path)
      ? selection.focus
      : state.points.start(linePath);
  });
  const domPoint = point && ReactEditor.resolveDOMPoint(editor, point);

  if (domPoint) {
    writeDOMSelection(root.getRootNode() as Document | ShadowRoot, {
      anchor: domPoint,
      focus: domPoint,
    });
  }
  return true;
};

export const settleCompositionLease = ({
  decorations,
  editor,
  lease,
  rebuild,
  root,
}: {
  decorations: PliteDecorationStore | null;
  editor: ReactRuntimeEditor;
  lease: CompositionLease;
  rebuild: (blockKey: NodeKey) => void;
  root: HTMLElement | null;
}): CompositionLeaseVerdict | null => {
  const state = lease.take();

  if (!state) return null;
  const { line, snapshot } = state;
  const redrawLine = !!state.restoredLine || (!!line && heldNodeRemoved(line));
  const verdict = redrawLine
    ? 'rebuild'
    : snapshot
      ? judgeCompositionLease(
          snapshot,
          readLeaf(editor, decorations, state.leafKey)
        )
      : null;
  const rebuilt = new Set<NodeKey>();
  const rebuildBlock = (blockKey: NodeKey | null) => {
    if (!blockKey || rebuilt.has(blockKey)) return;
    const element = ReactEditor.resolveDOMNode(editor, blockKey);

    if (!element || !root?.contains(element)) return;
    rebuilt.add(blockKey);
    rebuild(blockKey);
  };

  if (
    redrawLine &&
    state.hostBlockKey &&
    root &&
    redrawRestoredLineAndCaret(editor, state.hostBlockKey, rebuild, root)
  ) {
    rebuilt.add(state.hostBlockKey);
  }

  if (verdict === 'restore' && snapshot) {
    for (const { node, value } of snapshot.texts) {
      if (node.nodeValue !== value) node.nodeValue = value;
    }
  }
  if (verdict === 'rebuild') rebuildBlock(state.hostBlockKey);
  for (const blockKey of state.coveredBlockKeys) rebuildBlock(blockKey);

  const focus = root ? readDOMFocusHost(root) : null;

  if (focus && focus.host !== snapshot?.host) {
    rebuildBlock(readFocusBlockKey(editor, focus));
  }

  const hostRebuilt =
    verdict === 'rebuild' &&
    !!state.hostBlockKey &&
    rebuilt.has(state.hostBlockKey);

  if (!hostRebuilt) {
    try {
      runWrites(state.writes.values());
    } finally {
      line?.refresh();
    }
  }

  return verdict;
};

export const reenterCompositionLine = ({
  editor,
  lease,
  rebuild,
  root,
}: {
  editor: ReactRuntimeEditor;
  lease: CompositionLease;
  rebuild: (blockKey: NodeKey) => void;
  root: HTMLElement | null;
}) => {
  const lineKey = lease.takeRestoredLine();

  if (lineKey && root) {
    redrawRestoredLineAndCaret(editor, lineKey, rebuild, root);
  }
};

export const settleCompositionLeaseAndFlushRender = (
  input: Parameters<typeof settleCompositionLease>[0]
) => {
  if (input.lease.held) settleCompositionLease(input);
  if (input.lease.takeSettledSinceRender()) flushSync(() => {});
};
