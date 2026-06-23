import type { Editor, RuntimeId, SnapshotIndex } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { getOrCreateRuntimeId } from '../utils/runtime-ids';

export type LiveRuntimeIndex = {
  idToPath: Map<RuntimeId, Path>;
  pathToId: Map<string, RuntimeId>;
};

export type RuntimeIndexLike = SnapshotIndex | LiveRuntimeIndex;

export const EMPTY_RUNTIME_INDEX = Object.freeze({
  idToPath: Object.freeze({}),
  pathToId: Object.freeze({}),
}) as unknown as SnapshotIndex;

export const pathKey = (path: Path) => {
  switch (path.length) {
    case 0:
      return '';
    case 1:
      return String(path[0]);
    case 2:
      return `${path[0]}.${path[1]}`;
    default:
      return path.join('.');
  }
};

export const buildLiveRuntimeIndex = (
  editor: Editor,
  children: readonly Descendant[]
): LiveRuntimeIndex => {
  const idToPath = new Map<RuntimeId, Path>();
  const pathToId = new Map<string, RuntimeId>();

  const visit = (nodes: readonly Descendant[], pathPrefix: Path) => {
    nodes.forEach((node, index) => {
      const path = Object.freeze([...pathPrefix, index]) as Path;
      const runtimeId = getOrCreateRuntimeId(node, editor);

      idToPath.set(runtimeId, path);
      pathToId.set(pathKey(path), runtimeId);

      if ('children' in node && Array.isArray(node.children)) {
        visit(node.children, path);
      }
    });
  };

  visit(children, []);

  return { idToPath, pathToId };
};

export const buildSnapshotIndex = (
  editor: Editor,
  children: readonly Descendant[],
  parentPath: Path = []
): SnapshotIndex => {
  const idToPath = {} as Record<RuntimeId, Path>;
  const pathToId = {} as Record<string, RuntimeId>;

  const visit = (nodes: readonly Descendant[], pathPrefix: Path) => {
    nodes.forEach((node, index) => {
      const path = Object.freeze([...pathPrefix, index]) as Path;
      const id = getOrCreateRuntimeId(node, editor);

      idToPath[id] = path;
      pathToId[pathKey(path)] = id;

      if ('children' in node && Array.isArray(node.children)) {
        visit(node.children, path);
      }
    });
  };

  visit(children, parentPath);

  return Object.freeze({
    idToPath: Object.freeze(idToPath),
    pathToId: Object.freeze(pathToId),
  });
};

export const buildSnapshotIndexWithLiveRuntimeIndex = (
  editor: Editor,
  children: readonly Descendant[]
): {
  liveIndex: LiveRuntimeIndex;
  snapshotIndex: SnapshotIndex;
} => {
  const liveIdToPath = new Map<RuntimeId, Path>();
  const livePathToId = new Map<string, RuntimeId>();
  const snapshotIdToPath = {} as Record<RuntimeId, Path>;
  const snapshotPathToId = {} as Record<string, RuntimeId>;

  const visit = (nodes: readonly Descendant[], pathPrefix: Path) => {
    nodes.forEach((node, index) => {
      const path = Object.freeze([...pathPrefix, index]) as Path;
      const id = getOrCreateRuntimeId(node, editor);
      const key = pathKey(path);

      liveIdToPath.set(id, path);
      livePathToId.set(key, id);
      snapshotIdToPath[id] = path;
      snapshotPathToId[key] = id;

      if ('children' in node && Array.isArray(node.children)) {
        visit(node.children, path);
      }
    });
  };

  visit(children, []);

  return {
    liveIndex: {
      idToPath: liveIdToPath,
      pathToId: livePathToId,
    },
    snapshotIndex: Object.freeze({
      idToPath: Object.freeze(snapshotIdToPath),
      pathToId: Object.freeze(snapshotPathToId),
    }),
  };
};

export const buildLiveRuntimeIndexFromSnapshotIndex = (
  snapshotIndex: SnapshotIndex
): LiveRuntimeIndex => {
  const idToPath = new Map<RuntimeId, Path>();
  const pathToId = new Map<string, RuntimeId>();

  for (const [id, path] of Object.entries(snapshotIndex.idToPath)) {
    idToPath.set(id as RuntimeId, path);
  }

  for (const [key, id] of Object.entries(snapshotIndex.pathToId)) {
    pathToId.set(key, id as RuntimeId);
  }

  return { idToPath, pathToId };
};
