import { type Path, PathApi, type Point, type RootKey } from '..';
import type { NativeAuthoredFragment } from '../core/authored-runtime';
import { failInvariant } from './editable/runtime-editor-api';
import { MAIN_ROOT_KEY } from './root-key';

export type PliteViewBoundaryOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type PliteViewBoundaryGraphNodeInput = Readonly<{
  blockKey?: string;
  fragment?: Pick<NativeAuthoredFragment, 'changeId' | 'id'>;
  key?: string;
  owner?: PliteViewBoundaryOwner | null;
  path: Path;
  root: RootKey;
  text?: Readonly<{ end: number; start: number; value?: string }>;
}>;

export type PliteViewBoundaryGraphNode = Readonly<{
  fragment: Pick<NativeAuthoredFragment, 'changeId' | 'id'> | null;
  index: number;
  key: string;
  owner: PliteViewBoundaryOwner | null;
  ownerKey: string | null;
  path: Path;
  root: RootKey;
  text?: Readonly<{ end: number; start: number }>;
}>;

export type PliteViewBoundaryPoint = Readonly<{
  affinity?: 'backward' | 'forward';
  fragmentId?: string;
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
  fragment: Pick<NativeAuthoredFragment, 'changeId' | 'id'> | null;
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
  nodesByAddress: ReadonlyMap<string, readonly PliteViewBoundaryGraphNode[]>;
  nodes: readonly PliteViewBoundaryGraphNode[];
  textRunsByNode: ReadonlyMap<
    string,
    Readonly<{
      offset: number;
      run: Readonly<{
        nodes: readonly PliteViewBoundaryGraphNode[];
        value: string;
      }>;
    }>
  >;
}>;

type PliteViewBoundaryGraphNodeGroup = {
  fragment: Pick<NativeAuthoredFragment, 'changeId' | 'id'> | null;
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
    fragment: input.fragment
      ? Object.freeze({
          id: input.fragment.id,
          changeId: input.fragment.changeId,
        })
      : null,
    index,
    key: getGraphNodeKey({
      ownerKey,
      path,
      root: input.root,
      userKey:
        input.key ??
        (input.fragment || input.text
          ? JSON.stringify([
              ownerKey,
              input.root,
              input.fragment?.id ?? null,
              path,
              input.text ? [input.text.start, input.text.end] : null,
              input.text ? index : null,
            ])
          : undefined),
    }),
    owner,
    ownerKey,
    path,
    root: input.root,
    ...(input.text
      ? {
          text: Object.freeze({ start: input.text.start, end: input.text.end }),
        }
      : {}),
  });
};

export const createPliteViewBoundaryGraph = (
  nodeInputs: readonly PliteViewBoundaryGraphNodeInput[]
): PliteViewBoundaryGraphModel => {
  const nodeByKey = new Map<string, PliteViewBoundaryGraphNode>();
  const nodesByAddress = new Map<string, PliteViewBoundaryGraphNode[]>();
  const nodes = nodeInputs.map((nodeInput, index) => {
    const node = createNode(nodeInput, index);

    if (nodeByKey.has(node.key)) {
      throw new Error(`Duplicate Plite view-boundary node key: ${node.key}`);
    }

    nodeByKey.set(node.key, node);
    const address = pointAddress(
      node.root,
      node.ownerKey,
      node.fragment?.id ?? null,
      node.path
    );
    const entries = nodesByAddress.get(address) ?? [];
    entries.push(node);
    nodesByAddress.set(address, entries);

    return node;
  });

  const textRunsByNode = new Map<
    string,
    {
      offset: number;
      run: Readonly<{
        nodes: readonly PliteViewBoundaryGraphNode[];
        value: string;
      }>;
    }
  >();
  for (let index = 0; index < nodes.length;) {
    const first = nodeInputs[index];
    if (first.text?.value === undefined) {
      index += 1;
      continue;
    }
    const members = [];
    const values = [];
    do {
      const input = nodeInputs[index];
      if (input.text?.value === undefined) break;
      members.push(nodes[index]);
      values.push(input.text.value.slice(input.text.start, input.text.end));
      index += 1;
    } while (
      index < nodes.length &&
      first.blockKey !== undefined &&
      nodeInputs[index].blockKey === first.blockKey
    );
    const run = Object.freeze({
      nodes: Object.freeze(members),
      value: values.join(''),
    });
    let offset = 0;
    for (const node of members) {
      textRunsByNode.set(node.key, Object.freeze({ offset, run }));
      if (node.text) offset += node.text.end - node.text.start;
    }
  }

  return Object.freeze({
    nodeByKey,
    nodesByAddress: new Map(
      [...nodesByAddress].map(([key, entries]) => [key, Object.freeze(entries)])
    ),
    nodes: Object.freeze(nodes),
    textRunsByNode,
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

const pointAddress = (
  root: RootKey,
  ownerKey: string | null,
  fragmentId: string | null,
  path: Path
) => JSON.stringify([root, ownerKey, fragmentId, path]);

const isPointInsideNode = (point: Point, node: PliteViewBoundaryGraphNode) =>
  (PathApi.equals(point.path, node.path) ||
    PathApi.isAncestor(node.path, point.path)) &&
  (!node.text ||
    (point.offset >= node.text.start && point.offset <= node.text.end));

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
  for (let { length } = boundaryPoint.point.path; length >= 0; length--) {
    const nodes = graph.nodesByAddress.get(
      pointAddress(
        root,
        ownerKey,
        boundaryPoint.fragmentId ?? null,
        boundaryPoint.point.path.slice(0, length)
      )
    );
    if (!nodes) continue;
    let bestNode: PliteViewBoundaryGraphNode | null = null;
    for (const node of nodes) {
      if (
        isPointInsideNode(boundaryPoint.point, node) &&
        (!bestNode || (node.text && boundaryPoint.affinity !== 'backward'))
      ) {
        bestNode = node;
      }
    }
    if (bestNode) return bestNode;
  }
  return null;
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
      `Cannot resolve view-boundary point in root "${root}" with owner "${
        ownerKey ?? 'none'
      }" at path ${pathKey(boundaryPoint.point.path)}.`
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
    lastGroup.fragment?.id === node.fragment?.id &&
    lastGroup.ownerKey === node.ownerKey
  ) {
    lastGroup.nodes.push(node);
    return;
  }

  groups.push({
    fragment: node.fragment,
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
        fragment: group.fragment,
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

    const comparison = compareRootLocalPoints(left.point, right.point);
    if (
      !comparison &&
      !leftNode.text &&
      (left.affinity ?? 'backward') !== (right.affinity ?? 'backward')
    ) {
      return (left.affinity ?? 'backward') === 'backward' ? -1 : 1;
    }
    return comparison;
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
