import {
  type Element as EditorElement,
  ElementApi,
  NodeApi,
  type NodeKey,
  type Path,
  PathApi,
  type Point,
  type Range,
} from '../..';
import {
  checkFilesLanding,
  checkTransfer,
  transferEntries,
} from '../../core/transfer';
import type { TransferCheck, TransferEdge } from '../../core/transfer-types';
import { type AnyEditor, isBlock } from '../../interfaces/editor';
import { type DragSession, beginDragSession, readDragSession } from '../utils/drag-session';
import { publishDropIndicator } from '../utils/drop-indicator';
import { usesAppleDOMHotkeys } from '../utils/environment';
import { writeDOMSelectionData } from './dom-clipboard-runtime';
import type { DOMApi } from './dom-editor';
import { findEditorDOMRootRuntime } from './dom-root-runtime';

/** What `drag.start` hands the caller for its drag image. */
export type DOMDragStart = Readonly<{
  /** Pointer offset from the first preview's top-left corner. */
  origin: Readonly<{ x: number; y: number }>;
  /** Inert clones of the dragged blocks, in document order. */
  previews: readonly HTMLElement[];
}>;

/** Where a drop lands: beside a block on an axis, or at a text point. */
export type DOMDropTarget =
  | Readonly<{ axis: 'x' | 'y'; edge: 'after' | 'before'; key: NodeKey }>
  | Readonly<{ point: Point }>;

/** A pointer position, from a drag event or a custom driver. */
export type DOMDropTargetInput = Readonly<{
  altKey?: boolean;
  clientX: number;
  clientY: number;
  ctrlKey?: boolean;
  dataTransfer?: DataTransfer | null;
  target?: EventTarget | null;
}>;

export type DOMDropTargetOptions = Readonly<{
  /** Copy instead of move; defaults to the input's modifier. */
  copy?: boolean;
  /** The block dropped files become; resolves a files drop. */
  files?: EditorElement;
  /** Source view of `nodes` or `range`; defaults to the drag session's. */
  from?: AnyEditor;
  nodes?: readonly NodeKey[];
  range?: Range;
}>;

const asDOM = (editor: AnyEditor) =>
  (editor as AnyEditor & { api: { dom: DOMApi } }).api.dom;

// Drop data is readable only at drop, where it would steer the caret to a
// block-fragment boundary; dragover and drop must resolve the same point.
const pointAt = (
  editor: AnyEditor,
  { clientX, clientY, target }: DOMDropTargetInput
) =>
  asDOM(editor).resolveEventRange({ clientX, clientY, target })?.anchor ?? null;

const blockEntryOf = (editor: AnyEditor, host: Element) => {
  const node = asDOM(editor).resolveNode(host);

  if (!ElementApi.isElement(node) || !isBlock(editor, node)) return null;

  const key = editor.key(node);

  return key ? { host: host as HTMLElement, key, node } : null;
};

const axisOf = (
  editor: AnyEditor,
  node: EditorElement,
  host: HTMLElement | null
) => {
  if (!host) return 'y' as const;

  const path = editor.read.nodes.path(node);
  const sibling =
    path &&
    [PathApi.next(path), PathApi.hasPrevious(path) && PathApi.previous(path)]
      .filter((candidate): candidate is Path => !!candidate)
      .map((candidate) => editor.read.nodes.get(candidate)?.[0])
      .find((candidate) => ElementApi.isElement(candidate));
  const siblingHost = sibling ? asDOM(editor).resolveDOMNode(sibling) : null;

  if (!siblingHost) return 'y' as const;

  const a = host.getBoundingClientRect();
  const b = siblingHost.getBoundingClientRect();

  return Math.abs(a.top - b.top) < Math.min(a.height, b.height) / 2 &&
    (b.left >= a.right - 1 || b.right <= a.left + 1)
    ? ('x' as const)
    : ('y' as const);
};

const lineOf = (
  host: HTMLElement,
  axis: 'x' | 'y',
  edge: 'after' | 'before'
) => {
  const rect = host.getBoundingClientRect();

  return Object.freeze(
    axis === 'y'
      ? {
          height: 0,
          width: rect.width,
          x: rect.left,
          y: edge === 'before' ? rect.top : rect.bottom,
        }
      : {
          height: rect.height,
          width: 0,
          x: edge === 'before' ? rect.left : rect.right,
          y: rect.top,
        }
  );
};

type Candidate = {
  host: HTMLElement | null;
  key: NodeKey;
  node: EditorElement;
};

const ELEMENT_HOST = '[data-editor-node="element"]:not([data-editor-inline])';
const BAND = 8;
const SHARED_EDGE = 2;

type Level = Readonly<{
  host: HTMLElement;
  node: EditorElement | null;
  path: Path;
}>;

const holdsBlocks = (editor: AnyEditor, node: EditorElement) =>
  node.children.some(
    (child) => ElementApi.isElement(child) && isBlock(editor, child)
  );

const levelAt = (
  editor: AnyEditor,
  start: globalThis.Element,
  root: HTMLElement
): Readonly<{ anchor: Candidate | null; level: Level }> => {
  let anchor: Candidate | null = null;
  let host = start.closest(ELEMENT_HOST);

  while (host && root.contains(host)) {
    const entry = blockEntryOf(editor, host);
    const path = entry && editor.read.nodes.path(entry.node);

    if (entry && path) {
      if (holdsBlocks(editor, entry.node)) {
        return { anchor, level: { host: entry.host, node: entry.node, path } };
      }
      anchor = entry;
    }
    host = host.parentElement?.closest(ELEMENT_HOST) ?? null;
  }

  return { anchor, level: { host: root, node: null, path: [] } };
};

const rectOf = (host: HTMLElement | null) => {
  const rect = host?.getBoundingClientRect();

  return rect && (rect.width > 0 || rect.height > 0) ? rect : null;
};

// Coverage indexes boundaries by top-level block, so a dragover reads only
// the boundaries under the top-level blocks its range touches.
const boundariesAt = (
  editor: AnyEditor,
  parent: Path,
  first: number,
  last: number
) =>
  findEditorDOMRootRuntime(editor as never)?.domCoverage.getBoundariesForRange({
    anchor: { offset: 0, path: [...parent, Math.max(first, 0)] },
    focus: { offset: 0, path: [...parent, last] },
  }) ?? [];

// The covered range of `path`'s children holding the unmounted child at
// `index`, so a search jumps over a virtualized or collapsed window instead of
// probing it child by child.
const unmountedRangeAt = (
  editor: AnyEditor,
  path: Path,
  index: number
): readonly [number, number] | null => {
  const boundary = findEditorDOMRootRuntime(
    editor as never
  )?.domCoverage.getBoundaryForPoint({ offset: 0, path: [...path, index] });

  for (const { anchor, focus } of boundary?.coveredPathRanges ?? []) {
    const first = anchor.at(-1) as number;
    const last = focus.at(-1) as number;

    if (
      anchor.length === path.length + 1 &&
      PathApi.equals(anchor.slice(0, -1), path) &&
      index >= first &&
      index <= last
    ) {
      return [first, last];
    }
  }

  return null;
};

// The level's child at the pointer's height, hit-tested on the level's
// center line, so a pointer in a gutter or padding costs one hit test.
const probeAt = (
  editor: AnyEditor,
  level: Level,
  root: HTMLElement,
  input: DOMDropTargetInput
): Candidate | null => {
  const box = rectOf(level.host);

  if (!box) return null;

  let host =
    asDOM(editor)
      .getWindow()
      .document.elementFromPoint(box.left + box.width / 2, input.clientY)
      ?.closest(ELEMENT_HOST) ?? null;

  while (host && host !== level.host && root.contains(host)) {
    const entry = blockEntryOf(editor, host);
    const path = entry && editor.read.nodes.path(entry.node);

    if (entry && path && PathApi.equals(path.slice(0, -1), level.path)) {
      return entry;
    }
    host = host.parentElement?.closest(ELEMENT_HOST) ?? null;
  }

  return null;
};

const anchorAt = (
  editor: AnyEditor,
  level: Level,
  root: HTMLElement,
  input: DOMDropTargetInput
): Candidate | null => {
  const probe = probeAt(editor, level, root, input);

  if (probe && axisOf(editor, probe.node, probe.host) === 'y') return probe;

  const dom = asDOM(editor);
  const children = level.node ? level.node.children : editor.read.children();
  const mounted = (index: number) => {
    const child = children[index];

    if (!ElementApi.isElement(child) || !isBlock(editor, child)) return null;

    const host = dom.resolveDOMNode(child);
    const key = editor.key(child);
    const rect = rectOf(host);

    return host && key && rect
      ? { candidate: { host, key, node: child }, rect }
      : null;
  };
  const nearestMounted = (index: number, low: number, high: number) => {
    let down = index;
    let up = index + 1;

    while (down >= low || up <= high) {
      if (down >= low) {
        const hit = mounted(down);

        if (hit) return { ...hit, index: down };
        down = (unmountedRangeAt(editor, level.path, down)?.[0] ?? down) - 1;
      }
      if (up <= high) {
        const hit = mounted(up);

        if (hit) return { ...hit, index: up };
        up = (unmountedRangeAt(editor, level.path, up)?.[1] ?? up) + 1;
      }
    }

    return null;
  };
  const first = nearestMounted(0, 0, children.length - 1);

  if (!first) return null;

  if (axisOf(editor, first.candidate.node, first.candidate.host) === 'x') {
    let nearest = first.candidate;
    let distance = Number.POSITIVE_INFINITY;

    for (let { index } = first; index < children.length; index++) {
      const hit = mounted(index);

      if (!hit) continue;

      const dx = Math.max(
        hit.rect.left - input.clientX,
        0,
        input.clientX - hit.rect.right
      );

      if (dx < distance) {
        distance = dx;
        nearest = hit.candidate;
      }
    }

    return nearest;
  }

  let low = first.index;
  let high = children.length - 1;
  let found = first.candidate;

  while (low <= high) {
    const hit = nearestMounted((low + high) >> 1, low, high);

    if (!hit) break;

    found = hit.candidate;
    if (input.clientY < hit.rect.top) {
      high = hit.index - 1;
    } else if (input.clientY > hit.rect.bottom) {
      low = hit.index + 1;
    } else {
      return hit.candidate;
    }
  }

  return found;
};

const blocksAt = (editor: AnyEditor, path: Path): Candidate[] => {
  const dom = asDOM(editor);
  const candidates: Candidate[] = [];

  for (let { length } = path; length > 0; length--) {
    const node = editor.read.nodes.get(path.slice(0, length))?.[0];
    const key = node && ElementApi.isElement(node) && editor.key(node);

    if (key && isBlock(editor, node)) {
      candidates.push({ host: dom.resolveDOMNode(node), key, node });
    }
  }

  return candidates;
};

type BandHit = Readonly<{
  candidate: Candidate;
  distance: number;
  edge: 'after' | 'before';
  line: number;
  width: number;
}>;

const bandsAt = (
  containers: readonly Candidate[],
  input: DOMDropTargetInput
): BandHit[] =>
  containers.flatMap((candidate): BandHit[] => {
    const rect = rectOf(candidate.host);

    if (!rect) return [];

    const band = Math.min(BAND, rect.height / 4);
    const top = input.clientY - rect.top;
    const bottom = rect.bottom - input.clientY;

    if (top >= 0 && top <= band) {
      return [
        {
          candidate,
          distance: top,
          edge: 'before' as const,
          line: rect.top,
          width: band,
        },
      ];
    }
    if (bottom >= 0 && bottom <= band) {
      return [
        {
          candidate,
          distance: bottom,
          edge: 'after' as const,
          line: rect.bottom,
          width: band,
        },
      ];
    }

    return [];
  });

const COLLAPSED_REASONS = new Set(['app-collapse', 'app-hidden']);

// An edge inside content unmounted for collapse is unreachable to the user,
// ends included; virtualized content keeps its edges.
const collapsedEdge = (
  editor: AnyEditor,
  path: Path,
  edge: 'after' | 'before'
) => {
  const parent = path.slice(0, -1);
  const gap = (path.at(-1) as number) + (edge === 'after' ? 1 : 0);

  return boundariesAt(editor, parent, gap - 1, gap).some(
    (boundary) =>
      COLLAPSED_REASONS.has(boundary.reason) &&
      boundary.coveredPathRanges.some(({ anchor, focus }) => {
        const owner = anchor.slice(0, -1);
        const first = anchor.at(-1) as number;
        const last = focus.at(-1) as number;

        if (PathApi.equals(owner, parent)) {
          return gap >= first && gap <= last + 1;
        }

        const index = path[owner.length];

        return (
          path.length > anchor.length &&
          PathApi.isAncestor(owner, path) &&
          index >= first &&
          index <= last
        );
      })
  );
};

const edgeOf = (
  editor: AnyEditor,
  { host, node }: Candidate,
  axis: 'x' | 'y',
  input: DOMDropTargetInput,
  pointOf: () => Point | null
): 'after' | 'before' => {
  const rect = rectOf(host);

  if (!rect) {
    const path = editor.read.nodes.path(node);
    const point = pointOf();

    return point && path && PathApi.isAncestor(path, point.path)
      ? point.offset * 2 < NodeApi.string(node).length
        ? 'before'
        : 'after'
      : 'after';
  }

  return (
    axis === 'y'
      ? input.clientY < rect.top + rect.height / 2
      : input.clientX < rect.left + rect.width / 2
  )
    ? 'before'
    : 'after';
};

/** Copy intent of a drag event: the platform copy modifier, or a copy drop effect. */
export const copyIntentOf = (input: DOMDropTargetInput) =>
  input.dataTransfer?.dropEffect === 'copy' ||
  !!(usesAppleDOMHotkeys(input) ? input.altKey : input.ctrlKey);

/** Block-drag copy intent: session flag or the platform copy modifier. */
export const blockCopyIntent = (session: DragSession, input: DOMDropTargetInput) =>
  session.copyOnly || !!(usesAppleDOMHotkeys(input) ? input.altKey : input.ctrlKey);

export const resolveDOMDropTarget = (
  editor: AnyEditor,
  input: DOMDropTargetInput,
  options: DOMDropTargetOptions = {}
): DOMDropTarget | null => {
  const { document } = asDOM(editor).getWindow();
  const session = readDragSession(document, input.dataTransfer ?? null);
  const copy = options.copy ?? (session?.copyOnly || copyIntentOf(input));
  const from = options.from ?? session?.sourceEditor;
  const textRange =
    options.range ??
    (session?.source.kind === 'text'
      ? (session.source.anchor.resolve() ?? undefined)
      : undefined);

  if (!options.files && !options.nodes && textRange && from) {
    const point = pointAt(editor, input);

    if (!point) return null;

    const check = checkTransfer(
      editor,
      { from, range: textRange, to: { point } },
      copy ? 'copy' : 'move'
    );

    return check.admitted ? { point } : null;
  }

  const nodes =
    options.nodes ??
    (session?.source.kind === 'nodes' ? session.source.keys : undefined);

  if (!options.files && !nodes) return null;

  const types = input.dataTransfer ? Array.from(input.dataTransfer.types) : [];
  const fileBlock = options.files;
  const fileFit = fileBlock
    ? Array.from(
        {
          length: Math.max(
            1,
            Array.from(input.dataTransfer?.items ?? []).filter(
              (item) => item.kind === 'file'
            ).length
          ),
        },
        () => fileBlock
      )
    : null;
  // Resolving a caret point walks the document, so only the fallbacks pay for it.
  let point: Point | null | undefined;
  const pointOf = () => {
    if (point === undefined) {
      point = pointAt(editor, input);
    }

    return point;
  };
  const dom = asDOM(editor);
  const root = dom.root();
  const hit =
    input.target && 'nodeType' in input.target
      ? (input.target as globalThis.Node)
      : dom.getWindow().document.elementFromPoint(input.clientX, input.clientY);

  if (!root || !hit || !root.contains(hit)) return null;

  const start =
    hit.nodeType === 1 ? (hit as globalThis.Element) : hit.parentElement;

  if (!start) return null;

  const found = levelAt(editor, start, root);
  const { level } = found;
  let anchor = found.anchor ?? anchorAt(editor, level, root, input);
  let containers = blocksAt(editor, level.path);

  // A view without layout, such as one whose blocks measure zero, still
  // drops at the caret's block.
  if (!anchor) {
    const caret = pointOf();
    const chain = caret ? blocksAt(editor, caret.path) : [];

    [anchor = null, ...containers] = chain;
  }
  const intent = copy ? 'copy' : 'move';
  const checkEdge = (to: TransferEdge): TransferCheck => {
    const path = editor.read.nodes.path(to.key);

    if (path && collapsedEdge(editor, path, to.edge)) {
      return { admitted: false, reason: 'policy' };
    }

    return fileFit
      ? checkFilesLanding(editor, types, fileFit, to)
      : checkTransfer(editor, { from, nodes, to }, intent);
  };
  const landed = (
    check: TransferCheck,
    axis: 'x' | 'y'
  ): DOMDropTarget | null => {
    if (!check.admitted || !('key' in check.to)) return null;

    const target = editor.read.nodes.get(check.to.key)?.[0];
    const targetHost = dom.resolveDOMNode(check.to.key);

    return {
      axis:
        target && ElementApi.isElement(target) && targetHost
          ? axisOf(editor, target, targetHost)
          : axis,
      edge: check.to.edge,
      key: check.to.key,
    };
  };
  // A move whose pointer is over its own blocks stays put, even where a
  // container's band overlaps them, so grabbing and releasing moves nothing.
  // A handle's gutter sits outside its block's host, so the resolved anchor
  // counts too while the pointer is alongside it.
  if (!copy && !fileFit && nodes) {
    const dragged = (candidate: Candidate | null) =>
      !!candidate && nodes.includes(candidate.key);
    const alongside = (candidate: Candidate) => {
      const rect = rectOf(candidate.host);

      if (!rect) return false;

      return axisOf(editor, candidate.node, candidate.host) === 'y'
        ? input.clientY >= rect.top && input.clientY <= rect.bottom
        : input.clientX >= rect.left && input.clientX <= rect.right;
    };

    if (
      [found.anchor, ...containers].some(dragged) ||
      (anchor && dragged(anchor) && alongside(anchor))
    ) {
      return null;
    }
  }

  const bands = bandsAt(containers, input);

  const grouped = new Set<BandHit>();

  // Nested containers can share one flow edge; their band is split among the
  // ones that admit the payload, the outermost nearest the edge. Bands run
  // innermost first, as `blocksAt` returns containers.
  for (const band of bands) {
    if (grouped.has(band)) continue;

    const shared = bands.filter(
      (other) =>
        other.edge === band.edge &&
        Math.abs(other.line - band.line) <= SHARED_EDGE
    );

    for (const other of shared) grouped.add(other);
    const admitted = shared.flatMap((other) => {
      const check = checkEdge({ edge: other.edge, key: other.candidate.key });

      return check.admitted ? [{ check, other }] : [];
    });

    if (admitted.length === 0) continue;

    const width = Math.min(...shared.map((other) => other.width));
    const slice = Math.min(
      admitted.length - 1,
      Math.floor((band.distance / Math.max(width, 1)) * admitted.length)
    );
    const winner = admitted[admitted.length - 1 - slice];

    return landed(winner.check, 'y');
  }

  for (const candidate of [...(anchor ? [anchor] : []), ...containers]) {
    const axis = axisOf(editor, candidate.node, candidate.host);
    const check = checkEdge({
      edge: edgeOf(editor, candidate, axis, input, pointOf),
      key: candidate.key,
    });
    const target = landed(check, axis);

    if (target) return target;
    if (
      !check.admitted &&
      (check.reason === 'no-op' || check.reason === 'inside-source')
    ) {
      return null;
    }
  }

  return null;
};

export const indicateDOMDropTarget = (
  editor: AnyEditor,
  target: DOMDropTarget | null
) => {
  if (!target || 'point' in target) {
    publishDropIndicator(editor, null);

    return;
  }

  const dom = asDOM(editor);
  const host = dom.resolveDOMNode(target.key);

  if (!host) {
    publishDropIndicator(editor, null);

    return;
  }

  let line = lineOf(host, target.axis, target.edge);

  // Stabilize the indicator for adjacent vertical edges: compute the gap
  // center between this block and its neighbor so that "P1 after" and
  // "P2 before" produce the same line.
  if (target.axis === 'y') {
    const node = dom.resolveNode(host);
    const path =
      node && ElementApi.isElement(node) ? editor.read.nodes.path(node) : null;

    if (path) {
      const neighborPath =
        target.edge === 'after'
          ? PathApi.next(path)
          : PathApi.hasPrevious(path)
            ? PathApi.previous(path)
            : null;
      const neighborNode = neighborPath
        ? editor.read.nodes.get(neighborPath)?.[0]
        : null;
      const neighborHost =
        neighborNode && ElementApi.isElement(neighborNode)
          ? dom.resolveDOMNode(neighborNode)
          : null;
      const neighborRect = rectOf(neighborHost);
      const hostRect = rectOf(host);

      if (neighborRect && hostRect) {
        const prevBottom =
          target.edge === 'after' ? hostRect.bottom : neighborRect.bottom;
        const nextTop =
          target.edge === 'after' ? neighborRect.top : hostRect.top;
        const y = (prevBottom + nextTop) / 2;
        const wider =
          hostRect.width >= neighborRect.width ? hostRect : neighborRect;

        line = Object.freeze({
          height: 0,
          width: wider.width,
          x: wider.left,
          y,
        });
      }
    }
  }

  publishDropIndicator(editor, { ...target, line });
};

const previewOf = (host: HTMLElement) => {
  const preview = host.cloneNode(true) as HTMLElement;

  for (const element of [preview, ...preview.querySelectorAll('*')]) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith('data-editor')) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  preview.inert = true;
  preview.setAttribute('aria-hidden', 'true');
  preview.contentEditable = 'false';

  return preview;
};

export const startDOMDrag = (
  editor: AnyEditor,
  event: Pick<DragEvent, 'clientX' | 'clientY' | 'dataTransfer'>,
  { node }: { node: EditorElement }
): DOMDragStart | null => {
  const { dataTransfer } = event;
  const dom = asDOM(editor);

  if (!dataTransfer) return null;

  const entries = transferEntries(editor, node).map(([entry]) => entry);
  const keys = entries.flatMap((entry) => editor.key(entry) ?? []);
  const hosts = entries.flatMap((entry) => dom.resolveDOMNode(entry) ?? []);

  if (keys.length === 0 || hosts.length === 0) return null;

  const copyOnly = editor.read.view.isReadOnly();

  if (!copyOnly) {
    editor.update.selection.setNodes(entries);
    writeDOMSelectionData(editor as never, dataTransfer);
  }

  const previews = hosts.map(previewOf);
  const first = hosts[0].getBoundingClientRect();
  const session = beginDragSession({
    copyOnly,
    dataTransfer,
    document: dom.getWindow().document,
    draggedBlock: true,
    hosts,
    source: { keys, kind: 'nodes' },
    sourceEditor: editor,
  });

  if (!session) return null;

  // WebKit focuses the editing host under a pressed handle; a focused view
  // would paint its caret through the drag.
  if (dom.isFocused()) dom.blur();
  dataTransfer.effectAllowed = copyOnly ? 'copy' : 'copyMove';

  return {
    origin: { x: event.clientX - first.left, y: event.clientY - first.top },
    previews,
  };
};
