import { type Path, PathApi, type Point, type RootKey } from '@platejs/slate';

import { MAIN_ROOT_KEY } from './root-key';

export type SlateProjectionOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type SlateProjectionGraphNodeInput = Readonly<{
  key?: string;
  owner?: SlateProjectionOwner | null;
  path: Path;
  root: RootKey;
}>;

export type SlateProjectionGraphNode = Readonly<{
  index: number;
  key: string;
  owner: SlateProjectionOwner | null;
  ownerKey: string | null;
  path: Path;
  root: RootKey;
}>;

export type SlateProjectedPoint = Readonly<{
  owner?: SlateProjectionOwner | null;
  point: Point;
}>;

export type SlateProjectionGraphRangeEndpoint =
  | Readonly<{
      edge: 'end' | 'start';
      kind: 'boundary';
      node: SlateProjectionGraphNode;
    }>
  | Readonly<{
      kind: 'point';
      point: Point;
    }>;

export type SlateProjectionGraphRangeSegment = Readonly<{
  end: SlateProjectionGraphRangeEndpoint;
  nodes: readonly SlateProjectionGraphNode[];
  owner: SlateProjectionOwner | null;
  ownerKey: string | null;
  root: RootKey;
  start: SlateProjectionGraphRangeEndpoint;
}>;

export type SlateProjectionGraphRangeSegments = Readonly<{
  backward: boolean;
  parts: readonly SlateProjectionGraphRangeSegment[];
}>;

export type SlateProjectionGraphModel = Readonly<{
  nodeByKey: ReadonlyMap<string, SlateProjectionGraphNode>;
  nodes: readonly SlateProjectionGraphNode[];
}>;

type SlateProjectionGraphNodeGroup = {
  nodes: SlateProjectionGraphNode[];
  owner: SlateProjectionOwner | null;
  ownerKey: string | null;
  root: RootKey;
};

const pathKey = (path: Path) => path.join('.');

const clonePath = (path: Path): Path => [...path] as Path;

const cloneOwner = (
  owner: SlateProjectionOwner | null | undefined
): SlateProjectionOwner | null =>
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

export const getSlateProjectionOwnerKey = (owner: SlateProjectionOwner) =>
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
  input: SlateProjectionGraphNodeInput,
  index: number
): SlateProjectionGraphNode => {
  const owner = cloneOwner(input.owner);
  const ownerKey = owner ? getSlateProjectionOwnerKey(owner) : null;
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

export const createSlateProjectionGraph = (
  nodeInputs: readonly SlateProjectionGraphNodeInput[]
): SlateProjectionGraphModel => {
  const nodeByKey = new Map<string, SlateProjectionGraphNode>();
  const nodes = nodeInputs.map((nodeInput, index) => {
    const node = createNode(nodeInput, index);

    if (nodeByKey.has(node.key)) {
      throw new Error(`Duplicate Slate projection graph node key: ${node.key}`);
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
  graph: SlateProjectionGraphModel,
  nodeOrKey: SlateProjectionGraphNode | string
) =>
  typeof nodeOrKey === 'string'
    ? (graph.nodeByKey.get(nodeOrKey) ?? null)
    : (graph.nodeByKey.get(nodeOrKey.key) ?? null);

const getPointRoot = (point: Point): RootKey =>
  (point.root ?? MAIN_ROOT_KEY) as RootKey;

const isPointInsideNode = (point: Point, node: SlateProjectionGraphNode) =>
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

const getProjectedPointOwnerKey = (projectedPoint: SlateProjectedPoint) =>
  projectedPoint.owner
    ? getSlateProjectionOwnerKey(projectedPoint.owner)
    : null;

const resolvePointNode = (
  graph: SlateProjectionGraphModel,
  projectedPoint: SlateProjectedPoint
): SlateProjectionGraphNode | null => {
  const root = getPointRoot(projectedPoint.point);
  const ownerKey = getProjectedPointOwnerKey(projectedPoint);
  let bestNode: SlateProjectionGraphNode | null = null;

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
  graph: SlateProjectionGraphModel,
  projectedPoint: SlateProjectedPoint
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
  node: SlateProjectionGraphNode,
  edge: 'end' | 'start'
): SlateProjectionGraphRangeEndpoint =>
  Object.freeze({
    edge,
    kind: 'boundary',
    node,
  });

const createPointEndpoint = (point: Point): SlateProjectionGraphRangeEndpoint =>
  Object.freeze({
    kind: 'point',
    point: clonePoint(point),
  });

const pushNodeGroup = (
  groups: SlateProjectionGraphNodeGroup[],
  node: SlateProjectionGraphNode
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
  endPoint: SlateProjectedPoint;
  groups: readonly SlateProjectionGraphNodeGroup[];
  startPoint: SlateProjectedPoint;
}): readonly SlateProjectionGraphRangeSegment[] =>
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
  graph: SlateProjectionGraphModel,
  range: Readonly<{
    anchor: SlateProjectedPoint;
    focus: SlateProjectedPoint;
  }>
): SlateProjectionGraphRangeSegments => {
  const comparison = SlateProjectionGraph.comparePoints(
    graph,
    range.anchor,
    range.focus
  );
  const backward = comparison > 0;
  const startPoint = backward ? range.focus : range.anchor;
  const endPoint = backward ? range.anchor : range.focus;
  const startNode = requirePointNode(graph, startPoint);
  const endNode = requirePointNode(graph, endPoint);
  const groups: SlateProjectionGraphNodeGroup[] = [];

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

export const SlateProjectionGraph = Object.freeze({
  comparePoints(
    graph: SlateProjectionGraphModel,
    left: SlateProjectedPoint,
    right: SlateProjectedPoint
  ) {
    const leftNode = requirePointNode(graph, left);
    const rightNode = requirePointNode(graph, right);

    if (leftNode.index !== rightNode.index) {
      return leftNode.index < rightNode.index ? -1 : 1;
    }

    return compareRootLocalPoints(left.point, right.point);
  },
  nextNode(
    graph: SlateProjectionGraphModel,
    nodeOrKey: SlateProjectionGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index + 1] ?? null) : null;
  },
  previousNode(
    graph: SlateProjectionGraphModel,
    nodeOrKey: SlateProjectionGraphNode | string
  ) {
    const node = getNode(graph, nodeOrKey);

    return node ? (graph.nodes[node.index - 1] ?? null) : null;
  },
  resolvePointNode,
  segmentRange,
});
