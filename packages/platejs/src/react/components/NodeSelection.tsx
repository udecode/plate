'use client';

import {
  ElementApi,
  PathApi,
  SelectionApi,
  type EditorCommit,
  type Element,
  type Path,
} from 'plitejs';
import { useEditorEditableElement } from 'plitejs/react';
import React from 'react';
import ReactDOM from 'react-dom';

import type { Editor } from '../editor/Editor';
import { useEditor } from '../stores/plate/createPlateStore';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

const EDITOR_ELEMENT_SELECTOR = '[data-plite-node="element"]';

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

const getSelectedElements = (editor: Editor) =>
  editor.read.selection
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
      data-plite-root-chrome-ignore="true"
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
  const selectedNodes = useEditorSelector(getSelectedElements, {
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

const intersects = (selection: SelectionRect, target: DOMRect) =>
  selection.left <= target.right &&
  selection.left + selection.width >= target.left &&
  selection.top <= target.bottom &&
  selection.top + selection.height >= target.top;

type SelectionEntry = Readonly<{ node: Element; path: Path }>;

type SelectionCandidate = SelectionEntry & Readonly<{ rect: DOMRect }>;

const getSelectionCandidates = (
  editor: Editor,
  editable: HTMLElement
): readonly SelectionCandidate[] => {
  const entries = new Map<string, SelectionCandidate>();

  editable
    .querySelectorAll<HTMLElement>(EDITOR_ELEMENT_SELECTOR)
    .forEach((element) => {
      const node = editor.api.dom.resolvePliteNode(element);

      if (!ElementApi.isElement(node) || !isSelectionCandidate(editor, node)) {
        return;
      }

      const path = editor.read.nodes.path(node);

      if (!path) return;

      entries.set(path.join(','), {
        node,
        path,
        rect: element.getBoundingClientRect(),
      });
    });

  return [...entries.values()];
};

const getSelectionEntries = (
  editor: Editor,
  paths: readonly Path[]
): readonly SelectionEntry[] =>
  paths.flatMap((path) => {
    const entry = editor.read.nodes.get(path, {
      match: ElementApi.isElement,
    });

    return entry && isSelectionCandidate(editor, entry[0])
      ? [{ node: entry[0], path: entry[1] }]
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

  return SelectionApi.nodes([
    firstEntry.path,
    ...restEntries.map(({ path }) => path),
  ]).paths.flatMap((path) => {
    const entry = entries.get(path.join(','));

    return entry ? [entry] : [];
  });
};

export type NodeSelectionDragProps = Omit<
  React.ComponentProps<'div'>,
  'children'
>;

/** Renders a drag rectangle and updates node selection during pointer drags. */
export function NodeSelectionDrag({
  className,
  style,
  ...props
}: NodeSelectionDragProps) {
  const editor = useEditor();
  const editable = useEditorEditableElement(editor);
  const selectionElementRef = React.useRef<HTMLDivElement>(null);
  const selectionRectRef = React.useRef<SelectionRect | null>(null);
  const [selectionRect, setSelectionRect] =
    React.useState<SelectionRect | null>(null);

  React.useEffect(() => {
    if (!editable) return undefined;

    let clickResetTimer: number | undefined;
    let finishFrame: number | undefined;
    let frame: number | undefined;
    let suppressClick = false;
    let gesture:
      | {
          baseAnchor?: Element;
          baseEntries: readonly SelectionEntry[];
          candidates: readonly SelectionCandidate[];
          current: { x: number; y: number };
          geometryDirty: boolean;
          lastAnchorPath?: Path;
          lastFocusPath?: Path;
          lastPaths: readonly Path[] | null;
          pointerId: number;
          start: { x: number; y: number };
        }
      | undefined;

    const updateSelection = () => {
      frame = undefined;
      if (!gesture) return;

      const nextRect = rectFromPoints(gesture.start, gesture.current);
      if (gesture.geometryDirty) {
        gesture.candidates = getSelectionCandidates(editor, editable);
        gesture.geometryDirty = false;
      }
      const entries = getSelectableEntries(
        gesture.candidates,
        nextRect,
        gesture.baseEntries
      );

      selectionRectRef.current = nextRect;
      const selectionElement = selectionElementRef.current;

      if (selectionElement) {
        selectionElement.style.height = `${nextRect.height}px`;
        selectionElement.style.transform = `translate3d(${nextRect.left}px, ${nextRect.top}px, 0)`;
        selectionElement.style.width = `${nextRect.width}px`;
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
        gesture.current.y < gesture.start.y ||
        (gesture.current.y === gesture.start.y &&
          gesture.current.x < gesture.start.x);
      const edge = reverse ? first : last;
      const gestureBaseAnchor = gesture.baseAnchor;
      const baseAnchor = gestureBaseAnchor
        ? entries.find(({ node }) => node === gestureBaseAnchor)
        : undefined;
      const anchor = baseAnchor ? baseAnchor : reverse ? last : first;

      gesture.baseAnchor = anchor.node;
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
    const scheduleUpdate = () => {
      if (frame !== undefined) return;
      frame = window.requestAnimationFrame(updateSelection);
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
        window.cancelAnimationFrame(finishFrame);
        finishFrame = undefined;
      }
      if (clickResetTimer !== undefined) {
        window.clearTimeout(clickResetTimer);
        clickResetTimer = undefined;
      }
      suppressClick = false;

      const selectedPaths = editor.read.selection
        .nodes()
        .map(([, path]) => path);
      const selection = editor.read.selection();
      const baseAnchor =
        shiftKey && selection
          ? editor.read.nodes.block({ at: selection.anchor })?.[0]
          : undefined;
      const nextRect = rectFromPoints(point, point);

      selectionRectRef.current = nextRect;
      setSelectionRect(nextRect);

      gesture = {
        baseEntries: shiftKey ? getSelectionEntries(editor, selectedPaths) : [],
        baseAnchor,
        candidates: getSelectionCandidates(editor, editable),
        current: point,
        geometryDirty: false,
        lastPaths: null,
        pointerId,
        start: point,
      };
      editable.focus({ preventScroll: true });
    };
    const moveGesture = (point: { x: number; y: number }) => {
      if (!gesture) return;
      gesture.current = point;
      scheduleUpdate();

      const scroll = editor.api.dom.scroll?.();
      const bounds = scroll?.getBoundingClientRect();
      const top = bounds?.top ?? 0;
      const bottom = bounds?.bottom ?? window.innerHeight;
      const delta = point.y < top + 32 ? -12 : point.y > bottom - 32 ? 12 : 0;

      if (delta !== 0) {
        if (scroll) scroll.scrollBy({ top: delta });
        else window.scrollBy({ top: delta });
        gesture.geometryDirty = true;
      }
    };
    const finishGesture = () => {
      if (!gesture) return;

      if (frame !== undefined) window.cancelAnimationFrame(frame);
      updateSelection();
      const committedPaths = editor.read.selection
        .nodes()
        .map(([, path]) => path);
      const committedAnchorPath = gesture.lastAnchorPath;
      const committedFocusPath = gesture.lastFocusPath;

      gesture = undefined;
      suppressClick = true;
      clickResetTimer = window.setTimeout(() => {
        clickResetTimer = undefined;
        suppressClick = false;
      }, 0);
      selectionRectRef.current = null;
      setSelectionRect(null);
      finishFrame = window.requestAnimationFrame(() => {
        finishFrame = undefined;
        editable.focus({ preventScroll: true });
        document.getSelection()?.removeAllRanges();

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
      if (gesture || event.button !== 0 || event.target !== editable) return;

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
      }
      finishGesture();
    };
    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;

      suppressClick = false;
      if (clickResetTimer !== undefined) {
        window.clearTimeout(clickResetTimer);
        clickResetTimer = undefined;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const onGeometryChange = () => {
      if (gesture) gesture.geometryDirty = true;
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('pointercancel', onPointerEnd, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, {
      capture: true,
      passive: false,
    });
    document.addEventListener('pointerup', onPointerEnd, true);
    document.addEventListener('scroll', onGeometryChange, true);
    window.addEventListener('resize', onGeometryChange);

    return () => {
      if (clickResetTimer !== undefined) window.clearTimeout(clickResetTimer);
      if (finishFrame !== undefined) {
        window.cancelAnimationFrame(finishFrame);
      }
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointercancel', onPointerEnd, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerEnd, true);
      document.removeEventListener('scroll', onGeometryChange, true);
      window.removeEventListener('resize', onGeometryChange);
    };
  }, [editable, editor]);

  if (!selectionRect || typeof document === 'undefined') return null;

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
    document.body
  );
}
