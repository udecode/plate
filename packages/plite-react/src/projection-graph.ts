import { type Path, PathApi, type Point, type RootKey } from '@platejs/plite';

import { MAIN_ROOT_KEY } from './root-key';

export type PliteProjectionOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type PliteProjectionGraphNodeInput = Readonly<{
  key?: string;
  owner?: PliteProjectionOwner | null;
  path: Path;
  root: RootKey;
}>;

export type PliteProjectionGraphNode = Readonly<{
  index: number;
  key: string;
  owner: PliteProjectionOwner | null;
  ownerKey: string | null;
  path: Path;
  root: RootKey;
}>;

export type PliteProjectedPoint = Readonly<{
  owner?: PliteProjectionOwner | null;
  point: Point;
}>;

export type PliteProjectionGraphRangeEndpoint =
  | Readonly<{
      edge: 'end' | 'start';
      kind: 'boundary';
      node: PliteProjectionGraphNode;
    }>
  | Readonly<{
      kind: 'point';
      point: Point;
    }>;

export type PliteProjectionGraphRangeSegment = Readonly<{
  end: PliteProjectionGraphRangeEndpoint;
  nodes: readonly PliteProjectionGraphNode[];
  owner: PliteProjectionOwner | null;
  ownerKey: string | null;
  root: RootKey;
  start: PliteProjectionGraphRangeEndpoint;
}>;

export type PliteProjectionGraphRangeSegments = Readonly<{
  backward: boolean;
  parts: readonly PliteProjectionGraphRangeSegment[];
}>;

export type PliteProjectionGraphModel = Readonly<{
  nodeByKey: ReadonlyMap<string, PliteProjectionGraphNode>;
  nodes: readonly PliteProjectionGraphNode[];
}>;

type PliteProjectionGraphNodeGroup = {
  nodes: PliteProjectionGraphNode[];
  owner: PliteProjectionOwner | null;
  ownerKey: string | null;
  root: RootKey;
};

const pathKey = (path: Path) => path.join('.');

const clonePath = (path: Path): Path => [...path] as Path;

const cloneOwner = (
  owner: PliteProjectionOwner | null | undefined
): PliteProjectionOwner | null =>
  owner
    ? Object.freeze({
        childRoot: owner.childRoot,
        ownerPath: Object.freeze(clonePath(owner.ownerPath)) as Path,
        ownerRoot: owner.ownerRoot,
      })
    : null;

const clonePoint = (point: Point): Point =>
  Object.freeze({
    ...(point.root ? { root: point.root } : {}),
    path: Object.freeze(clonePath(point.path)) as Path,
    offset: point.offset,
  }) as Point;

export const getPliteProjectionOwnerKey = (owner: PliteProjectionOwner) =>
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
  input: PliteProjectionGraphNodeInput,
  index: number
): PliteProjectionGraphNode => {
  const owner = cloneOwner(input.owner);
  const ownerKey = owner ? getPliteProjectionOwnerKey(owner) : null;
  const path = Object.freeze(clonePath(input.path)) as Path;

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

export const createPliteProjectionGraph = (
  nodeInputs: readonly PliteProjectionGraphNodeInput[]
): PliteProjectionGraphModel => {
  const nodeByKey = new Map<string, PliteProjectionGraphNode>();
  const nodes = nodeInputs.map((nodeInput, index) => {
    const node = createNode(nodeInput, index);

    if (nodeByKey.has(node.key)) {
      throw new Error(`Duplicate Plite projection graph node key: ${node.key}`);
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
  graph: PliteProjectionGraphModel,
  nodeOrKey: PliteProjectionGraphNode | string
) =>
  typeof nodeOrKey === 'string'
    ? (graph.nodeByKey.get(nodeOrKey) ?? null)
    : (graph.nodeByKey.get(nodeOrKey.key) ?? null);

const getPointRoot = (point: Point): RootKey =>
  (point.root ?? MAIN_ROOT_KEY) as RootKey;

const isPointInsideNode = (point: Point, node: PliteProjectionGraphNode) =>
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

const getProjectedPointOwnerKey = (projectedPoint: PliteProjectedPoint) =>
  projectedPoint.owner
    ? getPliteProjectionOwnerKey(projectedPoint.owner)
    : null;

const resolvePointNode = (
  graph: PliteProjectionGraphModel,
  projectedPoint: PliteProjectedPoint
): PliteProjectionGraphNode | null => {
  const root = getPointRoot(projectedPoint.point);
  const ownerKey = getProjectedPointOwnerKey(projectedPoint);
  let bestNode: PliteProjectionGraphNode | null = null;

  for (const node of graph.nodes) {
    if (
      node.root !== root ||
      node.ownerKey !== ownerKey ||
      !isPointInsideNode(projectedPoint.point, node)
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
  graph: PliteProjectionGraphModel,
  projectedPoint: PliteProjectedPoint
) => {
  const node = resolvePointNode(graph, projectedPoint);

  if (!node) {
    const root = getPointRoot(projectedPoint.point);
    const ownerKey = getProjectedPointOwnerKey(projectedPoint);

    throw new Error(
      `Cannot resolve projected point in root "${root}" with owner "${ownerKey ?? 'none'}" at path ${pathKey(projectedPoint.point.path)}.`
    );
  }

  return node;
};

const createBoundaryEndpoint = (
  node: PliteProjectionGraphNode,
  edge: 'end' | 'start'
): PliteProjectionGraphRangeEndpoint =>
  Object.freeze({
    edge,
    kind: 'boundary',
    node,
  });

const createPointEndpoint = (point: Point): PliteProjectionGraphRangeEndpoint =>
  Object.freeze({
    kind: 'point',
    point: clonePoint(point),
  });

const pushNodeGroup = (
  groups: PliteProjectionGraphNodeGroup[],
  node: PliteProjectionGraphNode
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
  endPoint: PliteProjectedPoint;
  groups: readonly PliteProjectionGraphNodeGroup[];
  startPoint: PliteProjectedPoint;
}): readonly PliteProjectionGraphRangeSegment[] =>
  Object.freeze(
    groups.map((group, index) => {
      const firstNode = group.nodes[0]!;
      const lastNode = group.nodes.at(-1)!;
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
  graph: PliteProjectionGraphModel,
  range: Readonly<{
    anchor: PliteProjectedPoint;
    focus: PliteProjectedPoint;
  }>
): PliteProjectionGraphRangeSegments => {
  const comparison = PliteProjectionGraph.comparePoints(
    graph,
    range.anchor,
    range.focus
  );
  const backward = comparison > 0;
  const startPoint = backward ? range.focus : range.anchor;
  const endPoint = backward ? range.anchor : range.focus;
  const startNode = requirePointNode(graph, startPoint);
  const endNode = requirePointNode(graph, endPoint);
  const groups: PliteProjectionGraphNodeGroup[] = [];

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

export const PliteProjectionGraph = Object.freeze({
  comparePoints(
    graph: PliteProjectionGraphModel,
    left: PliteProjectedPoint,
    right: PliteProjectedPoint
  ) {
    const leftNode = requirePointNode(graph, left);
    const rightNode = requirePointNode(graph, right);

    if (leftNode.index !== rightNode.index) {
      return leftNode.index < rightNode.index ? -1 : 1;
    }

    return compareRootLocalPoints(left.point, right.point);
  },
  nextNode(
    graph: PliteProjectionGraphModel,
    nodeOrKey: PliteProjectionGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index + 1] ?? null) : null;
  },
  previousNode(
    graph: PliteProjectionGraphModel,
    nodeOrKey: PliteProjectionGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index - 1] ?? null) : null;
  },
  resolvePointNode,
  segmentRange,
});
