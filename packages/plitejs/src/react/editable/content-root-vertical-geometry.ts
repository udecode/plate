import {
  type Descendant,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
  type Node as PliteNode,
} from '../..';
import { createDOMGeometryKernel, ELEMENT_TO_NODE } from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  PliteViewBoundaryGraph,
  type PliteViewBoundaryGraphModel,
  type PliteViewBoundaryPoint,
  rootPlitePoint,
} from '../view-boundary-graph';
import {
  getPointAtCoordinates,
  hasUsableRect,
  resolveUsableRangeRect,
} from './content-root-coordinate-navigation';
import type { ContentRootNavigationDirection } from './content-root-navigation-actions';
import type { ContentRootOwner } from './content-root-owners';
import {
  resolveProjectedDOMSelectionEndpoint,
  resolveViewBoundaryDOMPoint,
} from './selection-projected-dom';

const VISUAL_LINE_TOLERANCE = 2;

export const resolveViewBoundaryVisualMovement = ({
  axis,
  direction,
  editor,
  graph,
  owners,
  point,
  preferredX,
}: {
  axis: 'line' | 'vertical';
  direction: ContentRootNavigationDirection;
  editor: ReactRuntimeEditor;
  graph: PliteViewBoundaryGraphModel;
  owners: readonly ContentRootOwner[];
  point: PliteViewBoundaryPoint;
  preferredX?: number;
}): PliteViewBoundaryPoint | null => {
  const root = editor.api.dom.root();
  const source = resolveViewBoundaryDOMPoint(editor, point);
  if (!root || !source) return null;
  const geometry = createDOMGeometryKernel({ root });
  const blockHost = (domPoint: typeof source) => {
    let element =
      domPoint[0].nodeType === 1
        ? (domPoint[0] as HTMLElement)
        : domPoint[0].parentElement;
    while (element && element !== root && root.contains(element)) {
      const node = ELEMENT_TO_NODE.get(element);
      if (
        NodeApi.isElement(node) &&
        !editor.read((state) => state.schema.isInline(node))
      ) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  };
  let host = blockHost(source);
  const rect = geometry.pointRect(source, { association: point.affinity });
  if (!host || !rect) return null;
  const lines = geometry.visualLines(host);
  const index = lines.findIndex(
    (line) =>
      Math.min(line.bottom, rect.bottom) - Math.max(line.top, rect.top) >
      VISUAL_LINE_TOLERANCE
  );
  if (index === -1) return null;
  const forward = direction === 'forward';
  let line = lines[index];
  let edge = axis === 'line';
  if (axis === 'vertical') {
    const adjacentLine = lines[index + (forward ? 1 : -1)];
    if (adjacentLine) {
      line = adjacentLine;
    } else {
      const node = PliteViewBoundaryGraph.resolvePointNode(graph, point);
      const run = node && graph.textRunsByNode.get(node.key)?.run;
      const terminal = forward ? run?.nodes.at(-1) : run?.nodes[0];
      const adjacent = terminal
        ? forward
          ? PliteViewBoundaryGraph.nextNode(graph, terminal)
          : PliteViewBoundaryGraph.previousNode(graph, terminal)
        : null;
      if (!adjacent?.text) {
        edge = true;
      } else {
        const next = resolveViewBoundaryDOMPoint(editor, {
          ...(adjacent.fragment ? { fragmentId: adjacent.fragment.id } : {}),
          owner: adjacent.owner,
          point: rootPlitePoint(
            {
              path: adjacent.path,
              offset: forward ? adjacent.text.start : adjacent.text.end,
            },
            adjacent.root
          ),
        });
        host = next && blockHost(next);
        if (!host) return null;
        const nextLines = geometry.visualLines(host);
        const nextLine = forward ? nextLines[0] : nextLines.at(-1);
        if (!nextLine) return null;
        line = nextLine;
      }
    }
  }
  const target = edge
    ? geometry.pointAtVisualLineEdge({
        edge: forward ? 'end' : 'start',
        host,
        line,
      })
    : geometry.pointInVisualLine({
        host,
        line,
        x: preferredX ?? geometry.verticalNavigationX(source) ?? rect.left,
      });
  const resolved =
    target &&
    resolveProjectedDOMSelectionEndpoint({
      node: target[0],
      offset: target[1],
      owners,
    });
  return resolved && PliteViewBoundaryGraph.resolvePointNode(graph, resolved)
    ? resolved
    : null;
};

const rootedRange = (point: Point, root: RootKey): Range => {
  const rooted = rootPlitePoint(point, root);

  return {
    anchor: rooted,
    focus: rooted,
  };
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getPathElement = (
  editor: ReactRuntimeEditor,
  path: Path
): HTMLElement | null => {
  const node = editor.read(
    (state) => state.nodes.get(path)?.[0] as Descendant | undefined
  );

  return node ? editor.api.dom.resolveDOMNode(node as PliteNode) : null;
};

export const isPointOnVisualBoundaryLine = ({
  container,
  direction,
  editor,
  point,
  root,
}: {
  container: HTMLElement;
  direction: ContentRootNavigationDirection;
  editor: ReactRuntimeEditor;
  point: Point;
  root: RootKey;
}): boolean => {
  const sourceRect = resolveUsableRangeRect(editor, rootedRange(point, root));

  if (!hasUsableRect(sourceRect)) {
    return false;
  }

  const geometryRoot =
    editor.api.dom.root() ?? editor.api.dom.resolveDOMNode(editor);
  const lineRects = geometryRoot
    ? createDOMGeometryKernel({
        root: geometryRoot,
        target: container,
      }).visualLines(container)
    : [];

  if (lineRects.length === 0) {
    return false;
  }

  if (direction === 'forward') {
    const lastLineTop = Math.max(...lineRects.map((rect) => rect.top));

    return sourceRect.top >= lastLineTop - VISUAL_LINE_TOLERANCE;
  }

  const firstLineBottom = Math.min(...lineRects.map((rect) => rect.bottom));

  return sourceRect.bottom <= firstLineBottom + VISUAL_LINE_TOLERANCE;
};

export const resolveVerticalNavigationPoint = ({
  currentRoot,
  direction,
  fallbackPoint,
  point,
  preferredX,
  sourceEditor,
  targetEditor,
  targetRoot,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  fallbackPoint: Point;
  point: Point;
  preferredX?: number;
  sourceEditor: ReactRuntimeEditor;
  targetEditor: ReactRuntimeEditor;
  targetRoot: RootKey;
}): Point | null => {
  const sourceRect = resolveUsableRangeRect(
    sourceEditor,
    rootedRange(point, currentRoot)
  );
  const fallbackRect = resolveUsableRangeRect(
    targetEditor,
    rootedRange(fallbackPoint, targetRoot)
  );
  const targetElement = targetEditor.api.dom.resolveDOMNode(targetEditor);

  if (!hasUsableRect(sourceRect) || !targetElement) {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();
  const x = clamp(
    preferredX ?? sourceRect.left,
    targetRect.left + 1,
    targetRect.right - 1
  );
  const yRect = hasUsableRect(fallbackRect) ? fallbackRect : targetRect;
  const y =
    direction === 'forward'
      ? yRect.top + Math.min(Math.max(yRect.height / 2, 1), 4)
      : yRect.bottom - Math.min(Math.max(yRect.height / 2, 1), 4);
  const targetPoint = getPointAtCoordinates(targetEditor, x, y, {
    root: targetElement,
  });

  if (!targetPoint) {
    const emptyFallback = targetEditor.read((state) => {
      const node = state.nodes.get(fallbackPoint.path)?.[0];

      return !!node && NodeApi.isText(node) && node.text.length === 0;
    });

    return emptyFallback ? fallbackPoint : null;
  }

  if ((targetPoint.root ?? targetRoot) !== targetRoot) {
    return null;
  }

  return targetPoint;
};
