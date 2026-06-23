import {
  PathApi,
  type Point,
  RangeApi,
  type RuntimeId,
  type Editor as PliteEditor,
  type Path as PlitePath,
  type Range as PliteRange,
} from '@platejs/plite';
import { Editor, getSnapshotVersion } from '@platejs/plite/internal';

import {
  type DOMElement,
  type DOMPoint,
  type DOMRange,
  isDOMElement,
} from '../utils/dom';
import { IS_COMPOSING } from '../utils/weak-maps';
import type { DOMEditor as DOMEditorType } from './dom-editor';

export const DOM_COVERAGE_BOUNDARY_ATTRIBUTE =
  'data-plite-dom-coverage-boundary';
export const DOM_COVERAGE_BOUNDARY_EDGE_ATTRIBUTE =
  'data-plite-dom-coverage-edge';

/** Mounted state for a model range represented by a DOM coverage boundary. */
export type DOMCoverageBoundaryState =
  | 'mounted'
  | 'intentionally-hidden'
  | 'pending-mount'
  | 'virtualized'
  | 'atom-boundary';

/** Why a model range is missing from, summarized in, or detached from the DOM. */
export type DOMCoverageReason =
  | 'app-collapse'
  | 'app-hidden'
  | 'rendering-staged'
  | 'viewport-virtualization'
  | 'partial-dom-aggressive'
  | 'runtime-atom';

/** Selection behavior when navigation reaches covered content. */
export type DOMCoverageSelectionPolicy = 'materialize' | 'skip' | 'model';

/** Clipboard behavior when a copied range crosses covered content. */
export type DOMCoverageCopyPolicy =
  | 'model'
  | 'summary'
  | 'exclude'
  | 'materialize';

/** Search ownership for covered content. */
export type DOMCoverageFindPolicy = 'native' | 'custom';

/** Inclusive path range covered by a boundary. */
export interface DOMCoveragePathRange {
  anchor: PlitePath;
  focus: PlitePath;
}

/** Runtime-id range that can be rebased into current paths. */
export interface DOMCoverageRuntimeRange {
  anchor: RuntimeId;
  focus: RuntimeId;
}

/** DOM anchor used for native point/range conversion at a boundary edge. */
export type DOMCoverageBoundaryAnchor =
  | { type: 'owner' }
  | { runtimeId: RuntimeId; type: 'summary-slot' }
  | { runtimeId?: RuntimeId; type: 'placeholder' };

/** Registered coverage boundary for one owner element and its hidden ranges. */
export interface DOMCoverageBoundary {
  boundaryId: string;
  ownerRuntimeId: RuntimeId | null;
  ownerPath: PlitePath;
  coveredPathRanges: readonly DOMCoveragePathRange[];
  coveredRuntimeRanges: readonly DOMCoverageRuntimeRange[];
  state: DOMCoverageBoundaryState;
  reason: DOMCoverageReason;
  anchor: DOMCoverageBoundaryAnchor;
  selectionPolicy: DOMCoverageSelectionPolicy;
  copyPolicy: DOMCoverageCopyPolicy;
  findPolicy: DOMCoverageFindPolicy;
  version: number;
}

/** Plite-to-DOM point conversion result that can stop at a boundary. */
export type DOMCoverageDOMPointResult =
  | { domPoint: DOMPoint; type: 'dom-point' }
  | { boundary: DOMCoverageBoundary; point: Point; type: 'boundary' };

/** Boundary edge used when a DOM point maps back to Plite. */
export type DOMCoverageBoundaryEdge = 'anchor' | 'focus' | 'owner';

/** Plite-to-DOM range conversion result that can stop at covered ranges. */
export type DOMCoverageDOMRangeResult =
  | { domRange: DOMRange; type: 'dom-range' }
  | {
      boundaries: readonly DOMCoverageBoundary[];
      range: PliteRange;
      type: 'boundary-range';
    };

/** DOM-to-Plite point conversion result for native boundary DOM. */
export type DOMCoveragePlitePointResult =
  | { point: Point; type: 'plite-point' }
  | {
      boundary: DOMCoverageBoundary;
      domPoint: DOMPoint;
      edge: DOMCoverageBoundaryEdge;
      type: 'boundary-point';
    };

/** Why covered content should be mounted or revealed. */
export type DOMCoverageMaterializeReason =
  | 'selection'
  | 'copy'
  | 'paste'
  | 'focus'
  | 'programmatic'
  | 'background';

/** Which part of a covered range triggered materialization. */
export type DOMCoverageMaterializeRangeRole = 'anchor' | 'focus' | 'interior';

/** Result from asking the app to materialize a boundary. */
export type DOMCoverageMaterializeResult =
  | {
      boundaryId: string;
      reason: DOMCoverageMaterializeReason;
      status: 'handled';
    }
  | {
      boundaryId: string;
      reason: DOMCoverageMaterializeReason;
      status: 'missing-boundary';
    }
  | {
      boundaryId: string;
      reason: DOMCoverageMaterializeReason;
      status: 'unhandled';
    };

/** Context passed to a materialization handler. */
export type DOMCoverageMaterializeOptions = {
  range?: PliteRange;
  rangeRole?: DOMCoverageMaterializeRangeRole;
};

/** App hook that can reveal or mount covered content on demand. */
export type DOMCoverageMaterializeHandler = (
  boundary: DOMCoverageBoundary,
  reason: DOMCoverageMaterializeReason,
  options: DOMCoverageMaterializeOptions
) => boolean | void;

interface DOMCoverageRegistry {
  boundaries: Map<string, DOMCoverageBoundary>;
  boundaryRootKeys: Map<string, Set<string>>;
  boundariesByRootKey: Map<string, Set<string>>;
  indexedVersion: number;
  materializeHandlers: Map<number, DOMCoverageMaterializeHandler>;
  nextMaterializeHandlerId: number;
}

const EDITOR_TO_DOM_COVERAGE_REGISTRY = new WeakMap<
  PliteEditor,
  DOMCoverageRegistry
>();

const getRegistry = (editor: PliteEditor): DOMCoverageRegistry => {
  let registry = EDITOR_TO_DOM_COVERAGE_REGISTRY.get(editor);

  if (!registry) {
    registry = {
      boundaries: new Map(),
      boundaryRootKeys: new Map(),
      boundariesByRootKey: new Map(),
      indexedVersion: getSnapshotVersion(editor),
      materializeHandlers: new Map(),
      nextMaterializeHandlerId: 1,
    };
    EDITOR_TO_DOM_COVERAGE_REGISTRY.set(editor, registry);
  }

  return registry;
};

const rebasePathFromOwner = (
  path: PlitePath,
  previousOwnerPath: PlitePath,
  nextOwnerPath: PlitePath
) => {
  if (PathApi.equals(path, previousOwnerPath)) {
    return [...nextOwnerPath];
  }

  if (PathApi.isDescendant(path, previousOwnerPath)) {
    return [...nextOwnerPath, ...PathApi.relative(path, previousOwnerPath)];
  }

  return path;
};

const resolveBoundary = (
  editor: PliteEditor,
  boundary: DOMCoverageBoundary
): DOMCoverageBoundary | null => {
  const nextOwnerPath =
    boundary.ownerRuntimeId == null
      ? boundary.ownerPath.length === 0
        ? []
        : null
      : Editor.getPathByRuntimeId(editor, boundary.ownerRuntimeId);

  if (
    !nextOwnerPath ||
    (nextOwnerPath.length > 0 && !Editor.hasPath(editor, nextOwnerPath))
  ) {
    return null;
  }

  const coveredPathRanges = resolveCoveredPathRanges(
    editor,
    boundary,
    nextOwnerPath
  );

  if (!coveredPathRanges) {
    return null;
  }

  return {
    ...boundary,
    coveredPathRanges,
    ownerPath: nextOwnerPath,
    version: PathApi.equals(nextOwnerPath, boundary.ownerPath)
      ? boundary.version
      : boundary.version + 1,
  };
};

const pathIsInsideOwner = (path: PlitePath, ownerPath: PlitePath) => {
  if (ownerPath.length === 0) {
    return true;
  }

  return (
    PathApi.equals(path, ownerPath) || PathApi.isDescendant(path, ownerPath)
  );
};

const resolveRuntimePath = (editor: PliteEditor, runtimeId: RuntimeId) => {
  const path = Editor.getPathByRuntimeId(editor, runtimeId);

  if (!path || !Editor.hasPath(editor, path)) {
    return null;
  }

  return path;
};

const resolveCoveredPathRanges = (
  editor: PliteEditor,
  boundary: DOMCoverageBoundary,
  nextOwnerPath: PlitePath
): readonly DOMCoveragePathRange[] | null => {
  if (boundary.coveredRuntimeRanges.length > 0) {
    const ranges: DOMCoveragePathRange[] = [];

    for (const range of boundary.coveredRuntimeRanges) {
      const anchor = resolveRuntimePath(editor, range.anchor);
      const focus = resolveRuntimePath(editor, range.focus);

      if (!anchor || !focus) {
        return null;
      }

      if (
        !pathIsInsideOwner(anchor, nextOwnerPath) ||
        !pathIsInsideOwner(focus, nextOwnerPath)
      ) {
        return null;
      }

      ranges.push({ anchor, focus });
    }

    return ranges;
  }

  return boundary.coveredPathRanges.map((range) => ({
    anchor: rebasePathFromOwner(
      range.anchor,
      boundary.ownerPath,
      nextOwnerPath
    ),
    focus: rebasePathFromOwner(range.focus, boundary.ownerPath, nextOwnerPath),
  }));
};

const comparePathBounds = (path: PlitePath, another: PlitePath) => {
  const comparison = PathApi.compare(path, another);

  if (comparison !== 0) {
    return comparison;
  }

  if (PathApi.equals(path, another)) {
    return 0;
  }

  return path.length < another.length ? -1 : 1;
};

const getOrderedPathRange = (
  range: DOMCoveragePathRange
): DOMCoveragePathRange => {
  if (comparePathBounds(range.anchor, range.focus) <= 0) {
    return range;
  }

  return {
    anchor: range.focus,
    focus: range.anchor,
  };
};

const ROOT_KEY_PREFIX = 'root:';
const ALL_ROOTS_KEY = 'root:*';
const ROOT_SPAN_INDEX_LIMIT = 128;

const getRootKey = (path: PlitePath) => `${ROOT_KEY_PREFIX}${path[0] ?? ''}`;

const getRootKeysForPathRange = (range: DOMCoveragePathRange) => {
  const orderedRange = getOrderedPathRange(range);
  const start = orderedRange.anchor[0];
  const end = orderedRange.focus[0];

  if (typeof start !== 'number' || typeof end !== 'number') {
    return new Set([ALL_ROOTS_KEY]);
  }

  const min = Math.min(start, end);
  const max = Math.max(start, end);

  if (max - min > ROOT_SPAN_INDEX_LIMIT) {
    return new Set([ALL_ROOTS_KEY]);
  }

  return new Set(
    Array.from(
      { length: max - min + 1 },
      (_, index) => `${ROOT_KEY_PREFIX}${min + index}`
    )
  );
};

const getRootKeysForBoundary = (boundary: DOMCoverageBoundary) => {
  const rootKeys = new Set<string>();

  if (boundary.coveredPathRanges.length === 0) {
    rootKeys.add(getRootKey(boundary.ownerPath));
  }

  for (const range of boundary.coveredPathRanges) {
    for (const rootKey of getRootKeysForPathRange(range)) {
      rootKeys.add(rootKey);
    }
  }

  return rootKeys;
};

const addBoundaryToIndex = (
  registry: DOMCoverageRegistry,
  boundary: DOMCoverageBoundary
) => {
  const rootKeys = getRootKeysForBoundary(boundary);

  registry.boundaryRootKeys.set(boundary.boundaryId, rootKeys);

  for (const rootKey of rootKeys) {
    let boundaryIds = registry.boundariesByRootKey.get(rootKey);

    if (!boundaryIds) {
      boundaryIds = new Set();
      registry.boundariesByRootKey.set(rootKey, boundaryIds);
    }

    boundaryIds.add(boundary.boundaryId);
  }
};

const removeBoundaryFromIndex = (
  registry: DOMCoverageRegistry,
  boundaryId: string
) => {
  const rootKeys = registry.boundaryRootKeys.get(boundaryId);

  if (!rootKeys) {
    return;
  }

  for (const rootKey of rootKeys) {
    const boundaryIds = registry.boundariesByRootKey.get(rootKey);

    boundaryIds?.delete(boundaryId);

    if (boundaryIds?.size === 0) {
      registry.boundariesByRootKey.delete(rootKey);
    }
  }
  registry.boundaryRootKeys.delete(boundaryId);
};

const setRegistryBoundary = (
  registry: DOMCoverageRegistry,
  boundary: DOMCoverageBoundary
) => {
  removeBoundaryFromIndex(registry, boundary.boundaryId);
  registry.boundaries.set(boundary.boundaryId, boundary);
  addBoundaryToIndex(registry, boundary);
};

const getIndexedBoundaries = (
  registry: DOMCoverageRegistry,
  rootKeys: readonly string[]
) => {
  if (rootKeys.includes(ALL_ROOTS_KEY)) {
    return [...registry.boundaries.values()];
  }

  const boundaryIds = new Set<string>();
  const boundaries: DOMCoverageBoundary[] = [];

  for (const rootKey of rootKeys) {
    registry.boundariesByRootKey.get(rootKey)?.forEach((boundaryId) => {
      boundaryIds.add(boundaryId);
    });
  }
  registry.boundariesByRootKey.get(ALL_ROOTS_KEY)?.forEach((boundaryId) => {
    boundaryIds.add(boundaryId);
  });

  boundaryIds.forEach((boundaryId) => {
    const boundary = registry.boundaries.get(boundaryId);

    if (boundary) {
      boundaries.push(boundary);
    }
  });

  return boundaries;
};

const syncRegistryToEditor = (
  editor: PliteEditor,
  registry = getRegistry(editor)
) => {
  const version = getSnapshotVersion(editor);

  if (registry.indexedVersion === version) {
    return registry;
  }

  const currentBoundaries = [...registry.boundaries.values()];

  registry.boundaries.clear();
  registry.boundaryRootKeys.clear();
  registry.boundariesByRootKey.clear();

  currentBoundaries.forEach((boundary) => {
    const resolved = resolveBoundary(editor, boundary);

    if (resolved) {
      setRegistryBoundary(registry, resolved);
    }
  });
  registry.indexedVersion = version;

  return registry;
};

const getResolvedBoundaries = (editor: PliteEditor) => [
  ...syncRegistryToEditor(editor).boundaries.values(),
];

const pathIsCoveredByRange = (path: PlitePath, range: DOMCoveragePathRange) => {
  const orderedRange = getOrderedPathRange(range);
  const afterStart = PathApi.compare(path, orderedRange.anchor) >= 0;
  const beforeEnd = PathApi.compare(path, orderedRange.focus) <= 0;

  return afterStart && beforeEnd;
};

const boundaryContainsPoint = (boundary: DOMCoverageBoundary, point: Point) =>
  boundary.coveredPathRanges.some((range) =>
    pathIsCoveredByRange(point.path, range)
  );

const rangeIntersectsBoundary = (
  range: PliteRange,
  boundary: DOMCoverageBoundary
) => {
  if (
    boundaryContainsPoint(boundary, range.anchor) ||
    boundaryContainsPoint(boundary, range.focus)
  ) {
    return true;
  }

  return boundary.coveredPathRanges.some((coveredRange) => {
    const orderedRange = getOrderedPathRange(coveredRange);

    return (
      RangeApi.includes(range, orderedRange.anchor) ||
      RangeApi.includes(range, orderedRange.focus)
    );
  });
};

const getBoundaryRangeForPoint = (
  boundary: DOMCoverageBoundary,
  point: Point
) =>
  boundary.coveredPathRanges.reduce<{
    index: number;
    range: DOMCoveragePathRange;
  } | null>((match, range, index) => {
    if (match || !pathIsCoveredByRange(point.path, range)) {
      return match;
    }

    return { index, range };
  }, null);

const getBoundaryDepth = (boundary: DOMCoverageBoundary) => {
  const rangeDepths = boundary.coveredPathRanges.flatMap((range) => [
    range.anchor.length,
    range.focus.length,
  ]);

  return Math.min(boundary.ownerPath.length, ...rangeDepths);
};

const compareBoundaries = (
  boundary: DOMCoverageBoundary,
  another: DOMCoverageBoundary
) => {
  const depth = getBoundaryDepth(boundary);
  const anotherDepth = getBoundaryDepth(another);

  if (depth !== anotherDepth) {
    return depth - anotherDepth;
  }

  return boundary.boundaryId.localeCompare(another.boundaryId);
};

/**
 * Tracks model ranges that are intentionally missing or summarized in the DOM.
 *
 * Staged, virtualized, app-hidden, and atom-like content register boundaries so
 * selection, copy, find, and Plite-to-DOM conversion can follow explicit
 * policies instead of assuming every node is mounted.
 */
export const DOMCoverage = {
  boundaryEdgeAttribute: DOM_COVERAGE_BOUNDARY_EDGE_ATTRIBUTE,
  boundaryElementAttribute: DOM_COVERAGE_BOUNDARY_ATTRIBUTE,

  /** Remove all boundary and materialization state for an editor. */
  clear(editor: PliteEditor) {
    EDITOR_TO_DOM_COVERAGE_REGISTRY.delete(editor);
  },

  /** Remove all materialization handlers for an editor. */
  clearMaterializeHandler(editor: PliteEditor) {
    getRegistry(editor).materializeHandlers.clear();
  },

  /** Return all currently valid boundaries after rebasing them to the editor. */
  getBoundaries(editor: PliteEditor): readonly DOMCoverageBoundary[] {
    return getResolvedBoundaries(editor);
  },

  /** Return boundaries whose covered ranges intersect a Plite range. */
  getBoundariesForRange(
    editor: PliteEditor,
    range: PliteRange
  ): readonly DOMCoverageBoundary[] {
    const orderedRange = getOrderedPathRange({
      anchor: range.anchor.path,
      focus: range.focus.path,
    });
    const registry = syncRegistryToEditor(editor);

    return getIndexedBoundaries(registry, [
      ...getRootKeysForPathRange(orderedRange),
    ])
      .filter((boundary) => rangeIntersectsBoundary(range, boundary))
      .sort(compareBoundaries);
  },

  /** Resolve a boundary by id, rebasing or removing it if the owner moved. */
  getBoundary(editor: PliteEditor, boundaryId: string) {
    const registry = syncRegistryToEditor(editor);
    const boundary = registry.boundaries.get(boundaryId);

    if (!boundary) {
      return null;
    }

    const resolved = resolveBoundary(editor, boundary);

    if (!resolved) {
      registry.boundaries.delete(boundaryId);
      removeBoundaryFromIndex(registry, boundaryId);
      return null;
    }

    if (resolved !== boundary) {
      setRegistryBoundary(registry, resolved);
    }

    return resolved;
  },

  /** Return the nearest boundary that owns a Plite point. */
  getBoundaryForPoint(editor: PliteEditor, point: Point) {
    const registry = syncRegistryToEditor(editor);
    const [boundary] = getIndexedBoundaries(registry, [getRootKey(point.path)])
      .filter((candidate) => boundaryContainsPoint(candidate, point))
      .sort(compareBoundaries);

    return boundary ?? null;
  },

  /** Find the next selectable point outside a boundary with the same policy. */
  getPointOutsideBoundary(
    editor: PliteEditor,
    boundary: DOMCoverageBoundary,
    point: Point,
    options: { reverse?: boolean } = {}
  ) {
    let targetBoundary: DOMCoverageBoundary | null = boundary;
    let targetPoint: Point | null = point;
    const selectionPolicy = boundary.selectionPolicy;
    const visited = new Set<string>();

    while (targetBoundary?.selectionPolicy === selectionPolicy && targetPoint) {
      const rangeMatch = getBoundaryRangeForPoint(targetBoundary, targetPoint);

      if (!rangeMatch) {
        return null;
      }

      const visitKey = `${targetBoundary.boundaryId}:${rangeMatch.index}`;

      if (visited.has(visitKey)) {
        return null;
      }
      visited.add(visitKey);

      const orderedRange = getOrderedPathRange(rangeMatch.range);
      const nextPoint = options.reverse
        ? Editor.before(editor, orderedRange.anchor)
        : Editor.after(editor, orderedRange.focus);

      if (!nextPoint) {
        return null;
      }

      targetPoint = nextPoint;
      targetBoundary = DOMCoverage.getBoundaryForPoint(editor, targetPoint);
    }

    return targetPoint;
  },

  /** Ask app code to mount or reveal a boundary for selection, copy, or focus. */
  materializeBoundary(
    editor: PliteEditor,
    boundaryId: string,
    reason: DOMCoverageMaterializeReason,
    options: DOMCoverageMaterializeOptions = {}
  ): DOMCoverageMaterializeResult {
    const boundary = DOMCoverage.getBoundary(editor, boundaryId);

    if (!boundary) {
      return { boundaryId, reason, status: 'missing-boundary' };
    }

    if (IS_COMPOSING.get(editor)) {
      return { boundaryId, reason, status: 'unhandled' };
    }

    let didHandle = false;

    for (const handler of getRegistry(editor).materializeHandlers.values()) {
      if (handler(boundary, reason, options)) {
        didHandle = true;
        break;
      }
    }

    return {
      boundaryId,
      reason,
      status: didHandle ? 'handled' : 'unhandled',
    };
  },

  /** Register or replace one boundary and return an unregister function. */
  registerBoundary(editor: PliteEditor, boundary: DOMCoverageBoundary) {
    const registry = syncRegistryToEditor(editor);

    setRegistryBoundary(registry, boundary);
    registry.indexedVersion = getSnapshotVersion(editor);

    return () => {
      DOMCoverage.unregisterBoundary(editor, boundary.boundaryId);
    };
  },

  /** Replace all materialization handlers with one handler. */
  setMaterializeHandler(
    editor: PliteEditor,
    handler: DOMCoverageMaterializeHandler
  ) {
    const registry = getRegistry(editor);

    registry.materializeHandlers.clear();
    registry.materializeHandlers.set(0, handler);
  },

  /** Register one materialization handler and return an unregister function. */
  registerMaterializeHandler(
    editor: PliteEditor,
    handler: DOMCoverageMaterializeHandler
  ) {
    const registry = getRegistry(editor);
    const handlerId = registry.nextMaterializeHandlerId++;

    registry.materializeHandlers.set(handlerId, handler);

    return () => {
      registry.materializeHandlers.delete(handlerId);
    };
  },

  /** Resolve a Plite point to mounted DOM or to the covering boundary. */
  resolveDOMPointOrBoundary(
    editor: DOMEditorType<any>,
    point: Point
  ): DOMCoverageDOMPointResult {
    const boundary = DOMCoverage.getBoundaryForPoint(editor, point);

    if (boundary) {
      return {
        boundary,
        point,
        type: 'boundary',
      };
    }

    return {
      domPoint: editor.dom.assertDOMPoint(point),
      type: 'dom-point',
    };
  },

  /** Resolve a Plite range to mounted DOM or to covered boundary ranges. */
  resolveDOMRangeOrBoundary(
    editor: DOMEditorType<any>,
    range: PliteRange
  ): DOMCoverageDOMRangeResult {
    const boundaries = DOMCoverage.getBoundariesForRange(editor, range);

    if (boundaries.length > 0) {
      return {
        boundaries,
        range,
        type: 'boundary-range',
      };
    }

    return {
      domRange: editor.dom.assertDOMRange(range),
      type: 'dom-range',
    };
  },

  /** Resolve native boundary DOM back to the Plite point it represents. */
  resolvePlitePointFromBoundary(
    editor: PliteEditor,
    domPoint: DOMPoint
  ): DOMCoveragePlitePointResult | null {
    const element = getDOMCoverageElementFromPoint(domPoint);

    if (!element) {
      return null;
    }

    const boundaryId = element.getAttribute(DOM_COVERAGE_BOUNDARY_ATTRIBUTE);
    const boundary = boundaryId
      ? DOMCoverage.getBoundary(editor, boundaryId)
      : null;

    if (!boundary) {
      return null;
    }

    return {
      boundary,
      domPoint,
      edge: getBoundaryEdge(element),
      type: 'boundary-point',
    };
  },

  /** Remove one registered boundary and its lookup index entries. */
  unregisterBoundary(editor: PliteEditor, boundaryId: string) {
    const registry = getRegistry(editor);

    registry.boundaries.delete(boundaryId);
    removeBoundaryFromIndex(registry, boundaryId);
  },
};

const getBoundaryEdge = (element: DOMElement): DOMCoverageBoundaryEdge => {
  const edge = element.getAttribute(DOM_COVERAGE_BOUNDARY_EDGE_ATTRIBUTE);

  if (edge === 'focus' || edge === 'owner') {
    return edge;
  }

  return 'anchor';
};

const getClosestDOMCoverageElement = (node: Node): DOMElement | null => {
  const element = isDOMElement(node) ? node : node.parentElement;

  return element?.closest(`[${DOM_COVERAGE_BOUNDARY_ATTRIBUTE}]`) ?? null;
};

const getDOMCoverageElementFromPoint = (
  domPoint: DOMPoint
): DOMElement | null => {
  const [node, offset] = domPoint;
  const closest = getClosestDOMCoverageElement(node);

  if (closest) {
    return closest;
  }

  if (!isDOMElement(node)) {
    return null;
  }

  const adjacentNodes = [
    node.childNodes.item(offset),
    node.childNodes.item(offset - 1),
  ];

  for (const adjacentNode of adjacentNodes) {
    if (!adjacentNode) {
      continue;
    }

    const adjacentElement = getClosestDOMCoverageElement(adjacentNode);

    if (adjacentElement) {
      return adjacentElement;
    }
  }

  return null;
};
