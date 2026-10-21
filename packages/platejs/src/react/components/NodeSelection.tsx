'use client';

import React from 'react';
import ReactDOM from 'react-dom';

import { writeDOMSelection } from '../../dom/plite-dom.internal';
import {
  ElementApi,
  PathApi,
  SelectionApi,
  type Descendant,
  type EditorCommit,
  type Element,
  type Path,
  type NodeKey,
} from '../../facade';
import type { Editor } from '../editor/Editor';
import { useEditorEditableElement, useEditorViewState } from '../plite-react';
import { useEditor } from '../stores/plate/useEditor';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

const EDITOR_ELEMENT_SELECTOR = '[data-editor-node="element"]';

const isSelectionCandidate = (editor: Editor, element: Element) =>
  editor.read.schema.isBlockContent(element) &&
  editor.read.nodes.isSelectable(element);

const sameNodes = (
  left: readonly Element[] | null,
  right: readonly Element[]
) =>
  left !== null &&
  left.length === right.length &&
  left.every((node, index) => node === right[index]);

const getHighlightedElements = (editor: Editor) =>
  editor.read.selection.nodeMode() === 'object'
    ? []
    : editor.read.selection
        .nodes()
        .flatMap(([node]) => (ElementApi.isElement(node) ? [node] : []));

const shouldUpdateSelectionHighlights = (change?: EditorCommit) =>
  !change ||
  change.selectionChanged ||
  change.changed.hasAny('properties') ||
  change.changed.hasAny('structure');

const samePaths = (left: readonly Path[], right: readonly Path[]) =>
  left.length === right.length &&
  left.every((path, index) => PathApi.equals(path, right[index]));

export type NodeSelectionHighlightProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children'
>;

type NodeSelectionHighlightTarget = Readonly<{
  key: string;
  target: HTMLElement;
}>;

const sameHighlightTargets = (
  left: readonly NodeSelectionHighlightTarget[],
  right: readonly NodeSelectionHighlightTarget[]
) =>
  left.length === right.length &&
  left.every(
    (target, index) =>
      target.key === right[index]?.key && target.target === right[index]?.target
  );

function getHighlightTargets(
  editor: Editor,
  editable: HTMLElement,
  selectedNodes: readonly Element[],
  targetRevision: number
): readonly NodeSelectionHighlightTarget[] {
  return selectedNodes.flatMap((node) => {
    if (!isSelectionCandidate(editor, node)) return [];

    const nodeKey = editor.key(node);
    const target = editor.api.dom.resolveDOMNode(nodeKey);

    return target &&
      editable.contains(target) &&
      target.dataset.nodeSelectionHighlight !== 'self'
      ? [{ key: `${targetRevision}:${nodeKey}`, target }]
      : [];
  });
}

function NodeSelectionHighlightPortalComponent({
  className,
  style,
  target,
  ...props
}: NodeSelectionHighlightProps & { target: HTMLElement }) {
  return ReactDOM.createPortal(
    <div
      {...props}
      aria-hidden
      className={className}
      contentEditable={false}
      data-editor-root-chrome-ignore="true"
      data-slot="node-selection-highlight"
      style={{
        ...style,
        inset: 0,
        pointerEvents: 'none',
        position: 'absolute',
      }}
    />,
    target
  );
}

const NodeSelectionHighlightPortal = React.memo(
  NodeSelectionHighlightPortalComponent
);

/**
 * Renders a highlight inside each selected selectable block.
 *
 * Set `data-node-selection-highlight="self"` on a block that renders its own
 * highlight.
 */
export function NodeSelectionHighlight({
  className,
  style,
  ...props
}: NodeSelectionHighlightProps) {
  const editor = useEditor();
  const editable = useEditorEditableElement(editor);
  const selectedNodes = useEditorSelector(getHighlightedElements, {
    equalityFn: sameNodes,
    shouldUpdate: shouldUpdateSelectionHighlights,
  });
  const [targetRevision, setTargetRevision] = React.useState(0);
  const targets = React.useMemo(
    () =>
      editable
        ? getHighlightTargets(editor, editable, selectedNodes, targetRevision)
        : [],
    [editable, editor, selectedNodes, targetRevision]
  );

  React.useLayoutEffect(() => {
    if (!editable) return;

    const committedTargets = getHighlightTargets(
      editor,
      editable,
      selectedNodes,
      targetRevision
    );

    if (sameHighlightTargets(targets, committedTargets)) return;

    // oxlint-disable-next-line react-doctor/no-chain-state-updates, react-doctor/no-self-updating-effect, react/set-state-in-effect -- A structural commit can replace a portal host after render; the equality guard terminates the layout-timed retry before paint.
    setTargetRevision((revision) => revision + 1);
  }, [editable, editor, selectedNodes, targetRevision, targets]);

  if (!editable) return null;

  return (
    <>
      {targets.map(({ key, target }) => (
        <NodeSelectionHighlightPortal
          {...props}
          key={key}
          className={className}
          style={style}
          target={target}
        />
      ))}
    </>
  );
}

type SelectionRect = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

const rectFromPoints = (
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>
): SelectionRect => ({
  height: Math.abs(end.y - start.y),
  left: Math.min(start.x, end.x),
  top: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
});

const clipRect = (
  rect: SelectionRect,
  visible: Readonly<{
    bottom: number;
    left: number;
    right: number;
    top: number;
  }> | null
): SelectionRect => {
  if (!visible) return { height: 0, left: rect.left, top: rect.top, width: 0 };

  const left = Math.max(rect.left, visible.left);
  const top = Math.max(rect.top, visible.top);

  return {
    height: Math.max(0, Math.min(rect.top + rect.height, visible.bottom) - top),
    left,
    top,
    width: Math.max(0, Math.min(rect.left + rect.width, visible.right) - left),
  };
};

const intersects = (selection: SelectionRect, target: DOMRect) =>
  selection.left <= target.right &&
  selection.left + selection.width >= target.left &&
  selection.top <= target.bottom &&
  selection.top + selection.height >= target.top;

type SelectionEntry = Readonly<{ key: NodeKey; node: Element; path: Path }>;

type SelectionCandidate = SelectionEntry &
  Readonly<{ rect: DOMRect; target: HTMLElement }>;

type ClientPoint = Readonly<{ x: number; y: number }>;

type ContentPoint = Readonly<{ x: number; y: number }>;

type MarqueeStart = ContentPoint & {
  readonly follow?: Readonly<{
    edge: 'above' | 'below' | 'within';
    key: NodeKey;
    offset: number;
  }>;
};

const hasBox = (rect: DOMRect) => rect.width > 0 || rect.height > 0;

const distance = (value: number, low: number, high: number) =>
  Math.max(low - value, value - high, 0);

const isNearer = (
  point: ClientPoint,
  candidate: SelectionCandidate,
  nearest: SelectionCandidate
) => {
  const vertical =
    distance(point.y, candidate.rect.top, candidate.rect.bottom) -
    distance(point.y, nearest.rect.top, nearest.rect.bottom);
  if (vertical !== 0) return vertical < 0;

  const horizontal =
    distance(point.x, candidate.rect.left, candidate.rect.right) -
    distance(point.x, nearest.rect.left, nearest.rect.right);
  if (horizontal !== 0) return horizontal < 0;

  return candidate.path.length > nearest.path.length;
};

const captureStart = (
  point: ClientPoint,
  candidates: readonly SelectionCandidate[],
  content: ClientPoint
): MarqueeStart => {
  const start = { x: point.x - content.x, y: point.y - content.y };
  let nearest: SelectionCandidate | undefined;

  for (const candidate of candidates) {
    if (
      hasBox(candidate.rect) &&
      (!nearest || isNearer(point, candidate, nearest))
    ) {
      nearest = candidate;
    }
  }
  if (!nearest) return start;

  const { bottom, top } = nearest.rect;
  const follow =
    point.y < top
      ? ({ edge: 'above', offset: top - point.y } as const)
      : point.y > bottom
        ? ({ edge: 'below', offset: point.y - bottom } as const)
        : ({ edge: 'within', offset: point.y - top } as const);

  return { ...start, follow: { ...follow, key: nearest.key } };
};

const followStart = (
  start: MarqueeStart,
  candidates: readonly SelectionCandidate[],
  content: ClientPoint
): MarqueeStart => {
  const { follow } = start;
  const rect = follow
    ? candidates.find(({ key }) => key === follow.key)?.rect
    : undefined;

  if (!follow || !rect || !hasBox(rect)) return start;

  const y =
    follow.edge === 'above'
      ? rect.top - follow.offset
      : follow.edge === 'below'
        ? rect.bottom + follow.offset
        : Math.min(rect.top + follow.offset, rect.bottom);

  return { ...start, y: y - content.y };
};

const INVALIDATION_RANK = { none: 0, geometry: 1, candidates: 2 } as const;

type Invalidation = keyof typeof INVALIDATION_RANK;

const getSelectionCandidates = (
  editor: Editor,
  editable: HTMLElement
): readonly SelectionCandidate[] => {
  const entries = new Map<string, SelectionCandidate>();
  const targets = new Map<HTMLElement, HTMLElement>();

  editable
    .querySelectorAll<HTMLElement>('[data-node-selection-target]')
    .forEach((target) => {
      const owner = target.closest<HTMLElement>(EDITOR_ELEMENT_SELECTOR);

      if (owner && !targets.has(owner)) targets.set(owner, target);
    });

  editable
    .querySelectorAll<HTMLElement>(EDITOR_ELEMENT_SELECTOR)
    .forEach((element) => {
      const node = editor.api.dom.resolveNode(element);

      if (!ElementApi.isElement(node) || !isSelectionCandidate(editor, node)) {
        return;
      }

      const path = editor.read.nodes.path(node);

      if (!path) return;

      const target = targets.get(element) ?? element;

      entries.set(path.join(','), {
        key: editor.key(node),
        node,
        path,
        target,
        rect: target.getBoundingClientRect(),
      });
    });

  return [...entries.values()];
};

const getSelectionEntries = (
  editor: Editor,
  keys: readonly NodeKey[]
): readonly SelectionEntry[] =>
  keys.flatMap((key) => {
    const entry = editor.read.nodes.get(key, {
      match: ElementApi.isElement,
    });

    return entry && isSelectionCandidate(editor, entry[0])
      ? [{ key, node: entry[0], path: entry[1] }]
      : [];
  });

const getSelectableEntries = (
  candidates: readonly SelectionCandidate[],
  selectionRect: SelectionRect,
  baseEntries: readonly SelectionEntry[]
) => {
  const entries = new Map<string, SelectionEntry>();

  for (const entry of baseEntries) {
    entries.set(entry.path.join(','), entry);
  }
  for (const candidate of candidates) {
    if (intersects(selectionRect, candidate.rect)) {
      entries.set(candidate.path.join(','), candidate);
    }
  }

  const orderedEntries = [...entries.values()].sort((left, right) =>
    PathApi.compare(left.path, right.path)
  );
  const [firstEntry, ...restEntries] = orderedEntries;

  if (!firstEntry) return [];

  return SelectionApi.nodes(
    [firstEntry.path, ...restEntries.map(({ path }) => path)],
    { mode: 'block' }
  ).paths.flatMap((path) => {
    const entry = entries.get(path.join(','));

    return entry ? [entry] : [];
  });
};

export type NodeSelectionDragProps = Omit<
  React.ComponentProps<'div'>,
  'children'
>;

/**
 * Renders a drag rectangle and updates node selection during pointer drags.
 *
 * A renderer can mark a descendant wrapper with `data-node-selection-target`
 * to limit its hit area. The wrapper must belong to that editor element,
 * outside any nested editor element; otherwise the full element is used.
 */
export function NodeSelectionDrag({
  className,
  style,
  ...props
}: NodeSelectionDragProps) {
  const editor = useEditor();
  const editable = useEditorEditableElement(editor);
  const selectionElementRef = React.useRef<HTMLDivElement>(null);
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const [selectionRect, setSelectionRect] =
    React.useState<SelectionRect | null>(null);

  React.useEffect(() => {
    if (!editable || readOnly) return undefined;
    const { ownerDocument } = editable;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return undefined;

    let clickResetTimer: number | undefined;
    let finishFrame: number | undefined;
    let frame: number | undefined;
    let suppressClick = false;
    let gesture:
      | {
          baseAnchor?: NodeKey;
          baseEntries: readonly SelectionEntry[];
          candidates: readonly SelectionCandidate[];
          invalid: Invalidation;
          lastAnchorPath?: Path;
          lastFocusPath?: Path;
          lastPaths: readonly Path[] | null;
          pointer: { x: number; y: number };
          pointerId: number;
          start: MarqueeStart;
        }
      | undefined;

    const contentOrigin = (rect: DOMRect): ClientPoint => ({
      x: rect.left - editable.scrollLeft,
      y: rect.top - editable.scrollTop,
    });
    const scheduleUpdate = (invalidation: Invalidation = 'none') => {
      if (!gesture) return;
      if (
        INVALIDATION_RANK[invalidation] > INVALIDATION_RANK[gesture.invalid]
      ) {
        gesture.invalid = invalidation;
      }
      if (frame !== undefined) return;
      frame = ownerWindow.requestAnimationFrame(() => updateSelection(true));
    };
    const updateSelection = (autoScroll: boolean) => {
      frame = undefined;
      if (!gesture) return;
      if (editor.read.view.isReadOnly()) {
        cancelGesture();
        return;
      }

      // Scroll before reading any rectangle, so each frame lays out once
      // after its own scroll write.
      if (autoScroll && editor.api.dom.drag.autoScroll(gesture.pointer) !== 0) {
        scheduleUpdate('geometry');
      }
      if (gesture.invalid === 'candidates') {
        gesture.candidates = getSelectionCandidates(editor, editable);
        sizeObserver.disconnect();
        observeSizes(gesture.candidates);
        gesture.baseEntries = getSelectionEntries(
          editor,
          gesture.baseEntries.map(({ key }) => key)
        );
      } else if (gesture.invalid === 'geometry') {
        gesture.candidates = gesture.candidates.map((candidate) => ({
          ...candidate,
          rect: candidate.target.getBoundingClientRect(),
        }));
      }

      gesture.invalid = 'none';
      const editableRect = editable.getBoundingClientRect();
      const content = contentOrigin(editableRect);

      gesture.start = followStart(gesture.start, gesture.candidates, content);
      const start = {
        x: content.x + gesture.start.x,
        y: content.y + gesture.start.y,
      };
      const hitRect = rectFromPoints(start, gesture.pointer);
      const entries = getSelectableEntries(
        gesture.candidates,
        hitRect,
        gesture.baseEntries
      );

      const selectionElement = selectionElementRef.current;

      if (selectionElement) {
        const paint = clipRect(hitRect, editor.api.dom.visibleRect(editable));

        selectionElement.style.height = `${paint.height}px`;
        selectionElement.style.transform = `translate3d(${paint.left}px, ${paint.top}px, 0)`;
        selectionElement.style.width = `${paint.width}px`;
      }
      if (entries.length === 0) {
        if (gesture.lastPaths === null || gesture.lastPaths.length > 0) {
          editor.update.selection.setNodes([]);
        }
        gesture.lastAnchorPath = undefined;
        gesture.lastFocusPath = undefined;
        gesture.lastPaths = [];
        return;
      }

      const first = entries[0];
      const last = entries.at(-1);

      if (!first || !last) return;

      const reverse =
        gesture.pointer.y < start.y ||
        (gesture.pointer.y === start.y && gesture.pointer.x < start.x);
      const edge = reverse ? first : last;
      const gestureBaseAnchor = gesture.baseAnchor;
      const baseAnchor = gestureBaseAnchor
        ? entries.find(({ key }) => key === gestureBaseAnchor)
        : undefined;
      const anchor = baseAnchor ? baseAnchor : reverse ? last : first;

      gesture.baseAnchor = anchor.key;
      const paths = entries.map(({ path }) => path);
      const selectionChanged =
        gesture.lastPaths === null ||
        !samePaths(gesture.lastPaths, paths) ||
        !gesture.lastAnchorPath ||
        !PathApi.equals(gesture.lastAnchorPath, anchor.path) ||
        !gesture.lastFocusPath ||
        !PathApi.equals(gesture.lastFocusPath, edge.path);

      gesture.lastAnchorPath = anchor.path;
      gesture.lastFocusPath = edge.path;
      gesture.lastPaths = paths;

      if (selectionChanged) {
        editor.update.selection.setNodes(paths, {
          anchor: anchor.path,
          focus: edge.path,
        });
      }
    };
    const startGesture = (
      point: { x: number; y: number },
      {
        pointerId,
        shiftKey,
      }: {
        pointerId: number;
        shiftKey: boolean;
      }
    ) => {
      if (finishFrame !== undefined) {
        ownerWindow.cancelAnimationFrame(finishFrame);
        finishFrame = undefined;
      }
      if (clickResetTimer !== undefined) {
        ownerWindow.clearTimeout(clickResetTimer);
        clickResetTimer = undefined;
      }
      suppressClick = false;

      const selectedKeys = editor.read.selection
        .nodes()
        .map(([node]) => editor.key(node));
      const selection = editor.read.selection();
      const baseAnchor =
        shiftKey && selection
          ? editor.read.nodes.block({ at: selection.anchor })?.[0]
          : undefined;
      const nextRect = rectFromPoints(point, point);
      const editableRect = editable.getBoundingClientRect();
      const candidates = getSelectionCandidates(editor, editable);

      setSelectionRect(nextRect);

      gesture = {
        baseEntries: shiftKey ? getSelectionEntries(editor, selectedKeys) : [],
        baseAnchor: baseAnchor ? editor.key(baseAnchor) : undefined,
        candidates,
        invalid: 'none',
        lastPaths: null,
        pointer: point,
        pointerId,
        start: captureStart(point, candidates, contentOrigin(editableRect)),
      };
      editable.setPointerCapture(pointerId);
      candidateObserver.observe(editable, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-node-selection-target'],
      });
      observeSizes(candidates);
      editable.focus({ preventScroll: true });
    };
    const moveGesture = (point: { x: number; y: number }) => {
      if (!gesture) return;
      gesture.pointer = point;
      scheduleUpdate();
    };
    const cancelGesture = () => {
      clearGesture();
      if (frame !== undefined) ownerWindow.cancelAnimationFrame(frame);
      frame = undefined;
      if (finishFrame !== undefined) {
        ownerWindow.cancelAnimationFrame(finishFrame);
      }
      finishFrame = undefined;
      if (clickResetTimer !== undefined) {
        ownerWindow.clearTimeout(clickResetTimer);
      }
      clickResetTimer = undefined;
      suppressClick = false;
      setSelectionRect(null);
    };
    const finishGesture = () => {
      if (!gesture) return;

      if (frame !== undefined) ownerWindow.cancelAnimationFrame(frame);
      updateSelection(false);
      if (!gesture) return;
      const committedPaths = editor.read.selection
        .nodes()
        .map(([, path]) => path);
      const committedAnchorPath = gesture.lastAnchorPath;
      const committedFocusPath = gesture.lastFocusPath;
      const committedChange = editor.read.lastCommit();

      clearGesture();
      suppressClick = true;
      clickResetTimer = ownerWindow.setTimeout(() => {
        clickResetTimer = undefined;
        suppressClick = false;
      }, 0);
      setSelectionRect(null);
      finishFrame = ownerWindow.requestAnimationFrame(() => {
        finishFrame = undefined;
        if (editor.read.lastCommit() !== committedChange) return;
        editable.focus({ preventScroll: true });
        writeDOMSelection(
          editable.getRootNode() as Document | ShadowRoot,
          null
        );

        if (
          committedPaths.length > 0 &&
          committedAnchorPath &&
          committedFocusPath
        ) {
          editor.update.selection.setNodes(committedPaths, {
            anchor: committedAnchorPath,
            focus: committedFocusPath,
          });
        }
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.button === 2 &&
        SelectionApi.isNode(editor.read.runtime.snapshot().selection) &&
        event.target instanceof ownerWindow.Element &&
        editable.contains(event.target)
      ) {
        const element = event.target.closest(EDITOR_ELEMENT_SELECTOR);
        const node = element ? editor.api.dom.resolveNode(element) : null;
        if (
          ElementApi.isElement(node) &&
          editor.read.selection.contains(node)
        ) {
          event.preventDefault();
          return;
        }
      }

      if (
        gesture ||
        event.button !== 0 ||
        event.target !== editable ||
        editor.read.view.isReadOnly()
      ) {
        return;
      }

      startGesture(
        { x: event.clientX, y: event.clientY },
        { pointerId: event.pointerId, shiftKey: event.shiftKey }
      );
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (gesture?.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      moveGesture({ x: event.clientX, y: event.clientY });
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (gesture?.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'pointerup') {
        moveGesture({ x: event.clientX, y: event.clientY });
        finishGesture();
      } else {
        cancelGesture();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;

      suppressClick = false;
      if (clickResetTimer !== undefined) {
        ownerWindow.clearTimeout(clickResetTimer);
        clickResetTimer = undefined;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const onGeometryChange = () => {
      scheduleUpdate('geometry');
    };
    const candidateObserver = new ownerWindow.MutationObserver((records) => {
      if (!gesture) return;
      const selector = `${EDITOR_ELEMENT_SELECTOR},[data-node-selection-target]`;
      const hasCandidates = (node: Node) =>
        node instanceof ownerWindow.Element &&
        (node.matches(selector) || node.querySelector(selector) !== null);
      if (
        records.some(
          (record) =>
            record.type === 'attributes' ||
            [...record.addedNodes, ...record.removedNodes].some(hasCandidates)
        )
      ) {
        scheduleUpdate('candidates');
      }
    });
    const sizeObserver = new ownerWindow.ResizeObserver(onGeometryChange);
    const observeSizes = (candidates: readonly SelectionCandidate[]) => {
      sizeObserver.observe(editable);
      for (const { target } of candidates) {
        sizeObserver.observe(target, { box: 'border-box' });
      }
    };
    const clearGesture = () => {
      candidateObserver.disconnect();
      sizeObserver.disconnect();
      const pointerId = gesture?.pointerId;
      gesture = undefined;
      if (pointerId !== undefined && editable.hasPointerCapture(pointerId)) {
        editable.releasePointerCapture(pointerId);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (gesture && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancelGesture();
        return;
      }
      if (
        event.target !== editable ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.key !== 'ArrowUp' &&
          event.key !== 'ArrowDown' &&
          event.key !== 'Shift')
      ) {
        return;
      }
      const { selection } = editor.read.runtime.snapshot();
      if (!SelectionApi.isNode(selection)) return;
      const parent = PathApi.parent(selection.focusPath);
      if (
        selection.paths.some(
          (path) => !PathApi.equals(PathApi.parent(path), parent)
        )
      ) {
        return;
      }
      const children =
        parent.length === 0
          ? editor.read.children()
          : (editor.read.nodes.get(parent, { match: ElementApi.isElement })?.[0]
              .children ?? []);
      const isCandidate = (node: Descendant | undefined): node is Element =>
        ElementApi.isElement(node) && isSelectionCandidate(editor, node);
      const anchor = selection.anchorPath.at(-1) ?? -1;
      const focus = selection.focusPath.at(-1) ?? -1;
      const focusNode = children[focus];
      const ownerHandlesArrows =
        !isCandidate(children[anchor]) ||
        !isCandidate(focusNode) ||
        (!event.shiftKey && selection.mode === 'object');
      if (ownerHandlesArrows) return;
      event.preventDefault();
      event.stopPropagation();
      // A focused contenteditable can recreate its native caret before keyup.
      writeDOMSelection(editable.getRootNode() as Document | ShadowRoot, null);
      if (event.type === 'keyup' || event.key === 'Shift') return;
      const step = event.key === 'ArrowUp' ? -1 : 1;
      let next = focus + step;
      while (
        next >= 0 &&
        next < children.length &&
        !isCandidate(children[next])
      ) {
        next += step;
      }
      const targetNode = children[next];
      // An unmounted sibling, such as one a content boundary hides, ends the
      // move, so arrows never select hidden content. Stopping instead of
      // skipping keeps each key to one missed DOM lookup, which queries the
      // whole editable.
      if (
        !isCandidate(targetNode) ||
        !editor.api.dom.resolveDOMNode(targetNode)
      ) {
        return;
      }
      const target = [...parent, next];
      const [from, to] = event.shiftKey
        ? [Math.min(anchor, next), Math.max(anchor, next)]
        : [next, next];
      const selected: Path[] = [];
      for (let index = from; index <= to; index++) {
        if (isCandidate(children[index])) selected.push([...parent, index]);
      }
      editor.update.selection.setNodes(selected, {
        anchor: event.shiftKey ? selection.anchorPath : target,
        focus: target,
      });
      editor.api.dom.scrollIntoView(target);
    };
    const unsubscribe = editor.subscribeCommit((commit) => {
      if (commit.changed.hasAny('document')) scheduleUpdate('candidates');
    });

    ownerWindow.addEventListener('blur', cancelGesture);
    ownerDocument.addEventListener('keydown', onKey, true);
    ownerDocument.addEventListener('keyup', onKey, true);
    ownerDocument.addEventListener('click', onClick, true);
    ownerDocument.addEventListener('lostpointercapture', onPointerEnd, true);
    ownerDocument.addEventListener('pointercancel', onPointerEnd, true);
    ownerDocument.addEventListener('pointerdown', onPointerDown, true);
    ownerDocument.addEventListener('pointermove', onPointerMove, {
      capture: true,
      passive: false,
    });
    ownerDocument.addEventListener('pointerup', onPointerEnd, true);
    ownerDocument.addEventListener('scroll', onGeometryChange, true);
    ownerWindow.addEventListener('resize', onGeometryChange);

    return () => {
      unsubscribe();
      cancelGesture();
      ownerWindow.removeEventListener('blur', cancelGesture);
      ownerDocument.removeEventListener('keydown', onKey, true);
      ownerDocument.removeEventListener('keyup', onKey, true);
      ownerDocument.removeEventListener('click', onClick, true);
      ownerDocument.removeEventListener(
        'lostpointercapture',
        onPointerEnd,
        true
      );
      ownerDocument.removeEventListener('pointercancel', onPointerEnd, true);
      ownerDocument.removeEventListener('pointerdown', onPointerDown, true);
      ownerDocument.removeEventListener('pointermove', onPointerMove, true);
      ownerDocument.removeEventListener('pointerup', onPointerEnd, true);
      ownerDocument.removeEventListener('scroll', onGeometryChange, true);
      ownerWindow.removeEventListener('resize', onGeometryChange);
    };
  }, [editable, editor, readOnly]);

  if (!selectionRect || !editable || readOnly) return null;

  return ReactDOM.createPortal(
    <div
      {...props}
      ref={selectionElementRef}
      aria-hidden
      className={className}
      data-slot="node-selection-drag"
      style={{
        ...style,
        height: selectionRect.height,
        left: 0,
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        transform: `translate3d(${selectionRect.left}px, ${selectionRect.top}px, 0)`,
        width: selectionRect.width,
      }}
    />,
    editable.ownerDocument.body
  );
}
