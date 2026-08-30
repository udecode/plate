import type { Descendant, Path, Point, RootKey } from '../../interfaces';
import { ElementApi, NodeApi } from '../../interfaces';
import {
  createInternalDocumentChange,
  DocumentChange,
} from '../change/document-change';
import type { DocumentIndex } from '../change/document-index';
import { RootChange } from '../change/root-change';

export type ClosedFitOriginTracker = Readonly<{
  originOf: (node: Descendant) => Descendant | null;
  record: (output: Descendant, source: Descendant) => void;
}>;

export type RootFitPathProvenance = Readonly<{
  advance: (
    source: readonly Descendant[],
    fitted: readonly Descendant[],
    origins: ClosedFitOriginTracker
  ) => void;
  createContextChange: (
    source: DocumentIndex,
    raw: DocumentIndex,
    root: RootKey
  ) => DocumentChange;
  mapPath: (
    path: Path,
    source: DocumentIndex,
    association: -1 | 1,
    deletion?: 'drop' | 'nearest'
  ) => Path | null;
  mapPoint: (
    point: Point,
    source: DocumentIndex,
    raw: DocumentIndex,
    association: -1 | 1,
    deletion?: 'drop' | 'nearest'
  ) => Point | null;
}>;

const pathKey = (path: readonly number[]) => path.join('/');

export const visitDescendantPaths = (
  children: readonly Descendant[],
  visit: (node: Descendant, path: Path) => void,
  parentPath: Path = []
) => {
  children.forEach((node, index) => {
    const path = [...parentPath, index];

    visit(node, path);
    if (ElementApi.isElement(node)) {
      visitDescendantPaths(node.children, visit, path);
    }
  });
};

export const createClosedFitOriginTracker = (): ClosedFitOriginTracker => {
  const origins = new WeakMap<object, Descendant>();
  const originOf = (node: Descendant) => origins.get(node) ?? null;

  return {
    originOf,
    record(output, source) {
      origins.set(output, originOf(source) ?? source);
    },
  };
};

/**
 * Tracks only source paths retained by closed fitting. Wrappers/defaults have
 * no source path, while cloned fitted nodes explicitly retain their origin.
 * This is selection provenance, not another document diff.
 */
export const createRootFitPathProvenance = (
  source: readonly Descendant[]
): RootFitPathProvenance => {
  let changed = false;
  let mappedPaths = new Map<string, Path>();

  visitDescendantPaths(source, (_node, path) => {
    mappedPaths.set(pathKey(path), path);
  });

  const nearestMappedPath = (
    path: Path,
    document: DocumentIndex,
    association: -1 | 1
  ): Path | null => {
    const target = document.nodeRange(path).from;
    const nearest: {
      next: Readonly<{ path: Path; position: number }> | null;
      previous: Readonly<{ path: Path; position: number }> | null;
    } = { next: null, previous: null };

    visitDescendantPaths(source, (_node, sourcePath) => {
      const mapped = mappedPaths.get(pathKey(sourcePath));

      if (!mapped) return;
      const range = document.nodeRange(sourcePath);

      if (
        range.to <= target &&
        (!nearest.previous || range.to > nearest.previous.position)
      ) {
        nearest.previous = { path: mapped, position: range.to };
      }
      if (
        range.from >= target &&
        (!nearest.next || range.from < nearest.next.position)
      ) {
        nearest.next = { path: mapped, position: range.from };
      }
    });

    return association === -1
      ? (nearest.previous?.path ?? nearest.next?.path ?? null)
      : (nearest.next?.path ?? nearest.previous?.path ?? null);
  };

  return {
    advance(current, fitted, origins) {
      const currentPaths = new WeakMap<object, Path>();
      const stagePaths = new Map<string, Path>();

      visitDescendantPaths(current, (node, path) => {
        currentPaths.set(node, path);
      });
      visitDescendantPaths(fitted, (node, path) => {
        const origin = origins.originOf(node);
        const sourcePath = origin ? currentPaths.get(origin) : undefined;

        if (sourcePath) stagePaths.set(pathKey(sourcePath), path);
      });

      const nextPaths = new Map<string, Path>();

      for (const [original, currentPath] of mappedPaths) {
        const nextPath = stagePaths.get(pathKey(currentPath));

        if (nextPath) nextPaths.set(original, nextPath);
      }

      mappedPaths = nextPaths;
      changed = true;
    },
    createContextChange(sourceDocument, rawDocument, root) {
      if (!changed) return DocumentChange.empty;
      const change = RootChange.create(sourceDocument, {
        from: 0,
        insert: rawDocument.slice(0),
        to: sourceDocument.length,
      });

      return createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      );
    },
    mapPath(path, sourceDocument, association, deletion) {
      const mapped = mappedPaths.get(pathKey(path));

      if (mapped) return [...mapped];
      if (deletion === 'drop') return null;

      return nearestMappedPath(path, sourceDocument, association);
    },
    mapPoint(point, sourceDocument, rawDocument, association, deletion) {
      const mapped = mappedPaths.get(pathKey(point.path));

      if (mapped) {
        const node = rawDocument.node(mapped);

        return NodeApi.isText(node)
          ? { offset: Math.min(point.offset, node.text.length), path: mapped }
          : null;
      }
      if (deletion === 'drop') return null;

      const sourcePosition = sourceDocument.positionAt(point);
      const candidates: {
        next: Readonly<{ path: Path; position: number }> | null;
        previous: Readonly<{ path: Path; position: number }> | null;
      } = { next: null, previous: null };

      visitDescendantPaths(source, (node, sourcePath) => {
        if (!NodeApi.isText(node)) return;
        const rawPath = mappedPaths.get(pathKey(sourcePath));

        if (!rawPath) return;
        const start = sourceDocument.positionAt({
          offset: 0,
          path: sourcePath,
        });
        const end = sourceDocument.positionAt({
          offset: node.text.length,
          path: sourcePath,
        });

        if (
          end <= sourcePosition &&
          (!candidates.previous || end > candidates.previous.position)
        ) {
          candidates.previous = { path: rawPath, position: end };
        }
        if (
          start >= sourcePosition &&
          (!candidates.next || start < candidates.next.position)
        ) {
          candidates.next = { path: rawPath, position: start };
        }
      });

      const nearest =
        association === -1
          ? (candidates.previous ?? candidates.next)
          : (candidates.next ?? candidates.previous);

      if (!nearest) return null;
      const node = rawDocument.node(nearest.path);

      return NodeApi.isText(node)
        ? {
            offset: nearest === candidates.previous ? node.text.length : 0,
            path: [...nearest.path],
          }
        : null;
    },
  };
};

export const getTextEdge = (
  node: Descendant,
  path: Path,
  edge: 'end' | 'start'
): Point | null => {
  if (NodeApi.isText(node)) {
    return {
      offset: edge === 'start' ? 0 : node.text.length,
      path,
    };
  }

  const index = edge === 'start' ? 0 : node.children.length - 1;
  const child = node.children[index];

  return child ? getTextEdge(child, [...path, index], edge) : null;
};

export const pointsEqual = (left: Point, right: Point) =>
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((part, index) => part === right.path[index]);

export const isEmptyDescendant = (node: Descendant): boolean =>
  NodeApi.isText(node)
    ? node.text.length === 0
    : node.children.every(isEmptyDescendant);
