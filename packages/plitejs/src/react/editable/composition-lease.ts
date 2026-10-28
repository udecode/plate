// oxlint-disable-next-line react-doctor/no-flush-sync -- A composition that starts before React drew the previous commit must snapshot that render, or its lease would restore stale text.
import { flushSync } from 'react-dom';

import {
  type NodeKey,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../..';
import { getSelection, isDOMElement } from '../../dom';
import type { PliteDecorationStore } from '../decoration-context';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { getNodeKey, getPathByNodeKey } from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';

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

type CompositionLeaseState = {
  coveredBlockKeys: readonly NodeKey[];
  hostBlockKey: NodeKey | null;
  leafKey: NodeKey | null;
  snapshot: CompositionLeaseSnapshot | null;
  writes: Map<globalThis.Node, () => void>;
};

const TEXT_HOST_SELECTOR = '[data-editor-node="text"]';

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
  }: {
    coveredBlockKeys?: readonly NodeKey[];
    host: Element | null;
    hostBlockKey: NodeKey | null;
    leafKey: NodeKey | null;
  }) {
    this.state = {
      coveredBlockKeys,
      hostBlockKey,
      leafKey,
      snapshot: host ? snapshotCompositionHost(host) : null,
      writes: new Map(),
    };
  }

  protects(node: globalThis.Node) {
    const snapshot = this.state?.snapshot;

    return (
      !!snapshot && (snapshot.host.contains(node) || snapshot.nodes.has(node))
    );
  }

  protectsMutation(mutation: MutationRecord) {
    return (
      this.protects(mutation.target) ||
      [...mutation.removedNodes].some((node) => this.protects(node))
    );
  }

  queue(node: globalThis.Node, write: () => void) {
    if (!this.state || !this.protects(node)) return false;

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
    this.state = null;
    this.settledSinceRender = false;
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
    (PointApi.equals(point, caret) || isLeafEdgePair(editor, point, caret))
    ? focus.host
    : null;
};

export const grantCompositionLease = ({
  editor,
  lease,
  root,
  selection,
}: {
  editor: ReactRuntimeEditor;
  lease: CompositionLease;
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
      hostBlockKey: null,
      leafKey: null,
    });
    return;
  }

  const host = resolveLeaseHost(editor, root, selection.focus);

  lease.grant({
    host,
    hostBlockKey: readLowestBlockKey(editor, selection.focus),
    leafKey: (host?.getAttribute('data-editor-node-key') ??
      null) as NodeKey | null,
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
  const { snapshot } = state;
  const verdict = snapshot
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
    let firstError: unknown;
    let hasError = false;

    for (const write of state.writes.values()) {
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
  }

  return verdict;
};

export const settleCompositionLeaseAndFlushRender = (
  input: Parameters<typeof settleCompositionLease>[0]
) => {
  if (input.lease.held) settleCompositionLease(input);
  if (input.lease.takeSettledSinceRender()) flushSync(() => {});
};
