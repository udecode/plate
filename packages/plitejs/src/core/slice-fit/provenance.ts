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

/** Caller paths of the node at `path`; empty for a node the fit created. */
export type FitInputPaths = (path: Path) => readonly Path[];

export type RootFitPathProvenance = Readonly<{
  createContextChange: (
    source: DocumentIndex,
    raw: DocumentIndex,
    root: RootKey
  ) => DocumentChange;
  /** Caller paths of a path in the latest grammar output. */
  inputPaths: FitInputPaths;
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
  /** Starts one grammar stage over the latest grammar output. */
  stage: (source: readonly Descendant[]) => Readonly<{
    /** Moves this provenance onto the stage's output. */
    advance: (fitted: readonly Descendant[]) => void;
    /** Caller paths of a node the stage reads or emits. */
    inputsOf: (node: Descendant) => readonly Path[];
    origins: ClosedFitOriginTracker;
  }>;
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

const createClosedFitOriginTracker = (): ClosedFitOriginTracker => {
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
 * Tracks only caller paths retained by closed fitting. Wrappers/defaults have
 * no caller path, while cloned fitted nodes explicitly retain their origin.
 * This is selection and repair-report provenance, not another document diff.
 */
export const createRootFitPathProvenance = (
  source: readonly Descendant[]
): RootFitPathProvenance => {
  let changed = false;
  let mappedPaths = new Map<string, Path>();

  visitDescendantPaths(source, (_node, path) => {
    mappedPaths.set(pathKey(path), path);
  });

  const invert = (paths: ReadonlyMap<string, Path>) => {
    const inverse = new Map<string, Path>();

    visitDescendantPaths(source, (_node, sourcePath) => {
      const mapped = paths.get(pathKey(sourcePath));

      if (mapped) inverse.set(pathKey(mapped), sourcePath);
    });

    return inverse;
  };
  const inputPathsOf = (paths: ReadonlyMap<string, Path>): FitInputPaths => {
    let inverse: ReadonlyMap<string, Path> | undefined;

    return (path) => {
      inverse ??= invert(paths);
      const sourcePath = inverse.get(pathKey(path));

      return sourcePath ? [sourcePath] : [];
    };
  };
  let latestInputPaths = inputPathsOf(mappedPaths);

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
    inputPaths: (path) => latestInputPaths(path),
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
    stage(stageSource) {
      const origins = createClosedFitOriginTracker();
      const stageInputPaths = inputPathsOf(mappedPaths);
      let stagePaths: WeakMap<object, Path> | undefined;
      const stagePathOf = (node: Descendant) => {
        if (!stagePaths) {
          const paths = new WeakMap<object, Path>();

          visitDescendantPaths(stageSource, (stageNode, path) => {
            paths.set(stageNode, path);
          });
          stagePaths = paths;
        }

        return stagePaths.get(node);
      };

      return {
        advance(fitted) {
          const fittedPaths = new Map<string, Path>();

          visitDescendantPaths(fitted, (node, path) => {
            const origin = origins.originOf(node);
            const sourcePath = origin ? stagePathOf(origin) : undefined;

            if (sourcePath) fittedPaths.set(pathKey(sourcePath), path);
          });

          const nextPaths = new Map<string, Path>();

          for (const [original, currentPath] of mappedPaths) {
            const nextPath = fittedPaths.get(pathKey(currentPath));

            if (nextPath) nextPaths.set(original, nextPath);
          }

          mappedPaths = nextPaths;
          latestInputPaths = inputPathsOf(mappedPaths);
          changed = true;
        },
        inputsOf(node) {
          const path = stagePathOf(origins.originOf(node) ?? node);

          return path ? stageInputPaths(path) : [];
        },
        origins,
      };
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
