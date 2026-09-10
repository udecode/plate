import { type Path, PathApi, type Point, type RootKey } from '..';
import { failInvariant } from './editable/runtime-editor-api';
import { MAIN_ROOT_KEY } from './root-key';

export type PliteViewBoundaryOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type PliteViewBoundaryGraphNodeInput = Readonly<{
  key?: string;
  owner?: PliteViewBoundaryOwner | null;
  path: Path;
  root: RootKey;
}>;

export type PliteViewBoundaryGraphNode = Readonly<{
  index: number;
  key: string;
  owner: PliteViewBoundaryOwner | null;
  ownerKey: string | null;
  path: Path;
  root: RootKey;
}>;

export type PliteViewBoundaryPoint = Readonly<{
  owner?: PliteViewBoundaryOwner | null;
  point: Point;
}>;

export type PliteViewBoundaryRangeEndpoint =
  | Readonly<{
      edge: 'end' | 'start';
      kind: 'boundary';
      node: PliteViewBoundaryGraphNode;
    }>
  | Readonly<{
      kind: 'point';
      point: Point;
    }>;

export type PliteViewBoundaryRangeSegment = Readonly<{
  end: PliteViewBoundaryRangeEndpoint;
  nodes: readonly PliteViewBoundaryGraphNode[];
  owner: PliteViewBoundaryOwner | null;
  ownerKey: string | null;
  root: RootKey;
  start: PliteViewBoundaryRangeEndpoint;
}>;

export type PliteViewBoundaryRangeSegments = Readonly<{
  backward: boolean;
  parts: readonly PliteViewBoundaryRangeSegment[];
}>;

export type PliteViewBoundaryGraphModel = Readonly<{
  nodeByKey: ReadonlyMap<string, PliteViewBoundaryGraphNode>;
  nodes: readonly PliteViewBoundaryGraphNode[];
}>;

type PliteViewBoundaryGraphNodeGroup = {
  nodes: PliteViewBoundaryGraphNode[];
  owner: PliteViewBoundaryOwner | null;
  ownerKey: string | null;
  root: RootKey;
};

const pathKey = (path: Path) => path.join('.');

const clonePath = (path: Path): Path => [...path] as Path;

const cloneOwner = (
  owner: PliteViewBoundaryOwner | null | undefined
): PliteViewBoundaryOwner | null =>
  owner
    ? Object.freeze({
        childRoot: owner.childRoot,
        ownerPath: Object.freeze(clonePath(owner.ownerPath)),
        ownerRoot: owner.ownerRoot,
      })
    : null;

const clonePoint = (point: Point): Point =>
  Object.freeze({
    ...(point.root ? { root: point.root } : {}),
    path: Object.freeze(clonePath(point.path)),
    offset: point.offset,
  });

export const getPliteViewBoundaryOwnerKey = (owner: PliteViewBoundaryOwner) =>
  `${owner.ownerRoot}\u0000${pathKey(owner.ownerPath)}\u0000${owner.childRoot}`;

const getGraphNodeKey = ({
  ownerKey,
  path,
  root,
  userKey,
}: {
  ownerKey: string | null;
  path: Path;
  root: RootKey;
  userKey?: string;
}) => userKey ?? `${ownerKey ? `${ownerKey}:` : ''}${root}:${pathKey(path)}`;

const createNode = (
  input: PliteViewBoundaryGraphNodeInput,
  index: number
): PliteViewBoundaryGraphNode => {
  const owner = cloneOwner(input.owner);
  const ownerKey = owner ? getPliteViewBoundaryOwnerKey(owner) : null;
  const path = Object.freeze(clonePath(input.path));

  return Object.freeze({
    index,
    key: getGraphNodeKey({
      ownerKey,
      path,
      root: input.root,
      userKey: input.key,
    }),
    owner,
    ownerKey,
    path,
    root: input.root,
  });
};

export const createPliteViewBoundaryGraph = (
  nodeInputs: readonly PliteViewBoundaryGraphNodeInput[]
): PliteViewBoundaryGraphModel => {
  const nodeByKey = new Map<string, PliteViewBoundaryGraphNode>();
  const nodes = nodeInputs.map((nodeInput, index) => {
    const node = createNode(nodeInput, index);

    if (nodeByKey.has(node.key)) {
      throw new Error(`Duplicate Plite view-boundary node key: ${node.key}`);
    }

    nodeByKey.set(node.key, node);

    return node;
  });

  return Object.freeze({
    nodeByKey,
    nodes: Object.freeze(nodes),
  });
};

const getNode = (
  graph: PliteViewBoundaryGraphModel,
  nodeOrKey: PliteViewBoundaryGraphNode | string
) =>
  typeof nodeOrKey === 'string'
    ? (graph.nodeByKey.get(nodeOrKey) ?? null)
    : (graph.nodeByKey.get(nodeOrKey.key) ?? null);

const getPointRoot = (point: Point): RootKey => point.root ?? MAIN_ROOT_KEY;

const isPointInsideNode = (point: Point, node: PliteViewBoundaryGraphNode) =>
  PathApi.equals(point.path, node.path) ||
  PathApi.isAncestor(node.path, point.path);

const compareRootLocalPoints = (left: Point, right: Point) => {
  const pathComparison = PathApi.compare(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const getViewBoundaryPointOwnerKey = (boundaryPoint: PliteViewBoundaryPoint) =>
  boundaryPoint.owner
    ? getPliteViewBoundaryOwnerKey(boundaryPoint.owner)
    : null;

const resolvePointNode = (
  graph: PliteViewBoundaryGraphModel,
  boundaryPoint: PliteViewBoundaryPoint
): PliteViewBoundaryGraphNode | null => {
  const root = getPointRoot(boundaryPoint.point);
  const ownerKey = getViewBoundaryPointOwnerKey(boundaryPoint);
  let bestNode: PliteViewBoundaryGraphNode | null = null;

  for (const node of graph.nodes) {
    if (
      node.root !== root ||
      node.ownerKey !== ownerKey ||
      !isPointInsideNode(boundaryPoint.point, node)
    ) {
      continue;
    }

    if (!bestNode || node.path.length > bestNode.path.length) {
      bestNode = node;
    }
  }

  return bestNode;
};

const requirePointNode = (
  graph: PliteViewBoundaryGraphModel,
  boundaryPoint: PliteViewBoundaryPoint
) => {
  const node = resolvePointNode(graph, boundaryPoint);

  if (!node) {
    const root = getPointRoot(boundaryPoint.point);
    const ownerKey = getViewBoundaryPointOwnerKey(boundaryPoint);

    throw new Error(
      `Cannot resolve view-boundary point in root "${root}" with owner "${ownerKey ?? 'none'}" at path ${pathKey(boundaryPoint.point.path)}.`
    );
  }

  return node;
};

const createBoundaryEndpoint = (
  node: PliteViewBoundaryGraphNode,
  edge: 'end' | 'start'
): PliteViewBoundaryRangeEndpoint =>
  Object.freeze({
    edge,
    kind: 'boundary',
    node,
  });

const createPointEndpoint = (point: Point): PliteViewBoundaryRangeEndpoint =>
  Object.freeze({
    kind: 'point',
    point: clonePoint(point),
  });

const pushNodeGroup = (
  groups: PliteViewBoundaryGraphNodeGroup[],
  node: PliteViewBoundaryGraphNode
) => {
  const lastGroup = groups.at(-1);

  if (
    lastGroup &&
    lastGroup.root === node.root &&
    lastGroup.ownerKey === node.ownerKey
  ) {
    lastGroup.nodes.push(node);
    return;
  }

  groups.push({
    nodes: [node],
    owner: node.owner,
    ownerKey: node.ownerKey,
    root: node.root,
  });
};

const createSegments = ({
  endPoint,
  groups,
  startPoint,
}: {
  endPoint: PliteViewBoundaryPoint;
  groups: readonly PliteViewBoundaryGraphNodeGroup[];
  startPoint: PliteViewBoundaryPoint;
}): readonly PliteViewBoundaryRangeSegment[] =>
  Object.freeze(
    groups.map((group, index) => {
      const firstNode = group.nodes[0];
      const lastNode =
        group.nodes.at(-1) ?? failInvariant('Expected value to be defined');
      const isFirst = index === 0;
      const isLast = index === groups.length - 1;

      return Object.freeze({
        end: isLast
          ? createPointEndpoint(endPoint.point)
          : createBoundaryEndpoint(lastNode, 'end'),
        nodes: Object.freeze([...group.nodes]),
        owner: group.owner,
        ownerKey: group.ownerKey,
        root: group.root,
        start: isFirst
          ? createPointEndpoint(startPoint.point)
          : createBoundaryEndpoint(firstNode, 'start'),
      });
    })
  );

const segmentRange = (
  graph: PliteViewBoundaryGraphModel,
  range: Readonly<{
    anchor: PliteViewBoundaryPoint;
    focus: PliteViewBoundaryPoint;
  }>
): PliteViewBoundaryRangeSegments => {
  const comparison = PliteViewBoundaryGraph.comparePoints(
    graph,
    range.anchor,
    range.focus
  );
  const backward = comparison > 0;
  const startPoint = backward ? range.focus : range.anchor;
  const endPoint = backward ? range.anchor : range.focus;
  const startNode = requirePointNode(graph, startPoint);
  const endNode = requirePointNode(graph, endPoint);
  const groups: PliteViewBoundaryGraphNodeGroup[] = [];

  graph.nodes.slice(startNode.index, endNode.index + 1).forEach((node) => {
    pushNodeGroup(groups, node);
  });

  return Object.freeze({
    backward,
    parts: createSegments({
      endPoint,
      groups,
      startPoint,
    }),
  });
};

export const PliteViewBoundaryGraph = Object.freeze({
  comparePoints(
    graph: PliteViewBoundaryGraphModel,
    left: PliteViewBoundaryPoint,
    right: PliteViewBoundaryPoint
  ) {
    const leftNode = requirePointNode(graph, left);
    const rightNode = requirePointNode(graph, right);

    if (leftNode.index !== rightNode.index) {
      return leftNode.index < rightNode.index ? -1 : 1;
    }

    return compareRootLocalPoints(left.point, right.point);
  },
  nextNode(
    graph: PliteViewBoundaryGraphModel,
    nodeOrKey: PliteViewBoundaryGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index + 1] ?? null) : null;
  },
  previousNode(
    graph: PliteViewBoundaryGraphModel,
    nodeOrKey: PliteViewBoundaryGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index - 1] ?? null) : null;
  },
  resolvePointNode,
  segmentRange,
});
