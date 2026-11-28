import * as React from 'react';

import {
  createEditorView,
  type NamedRootKey,
  type NodeKey,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
} from '../../../core';
import { subscribeSharedEditorViewState } from '../../../facade';
import {
  type Editor,
  useEditor,
  useEditorRootAreas,
  useEditorSelector,
} from '../../core';
import { CommentsPlugin } from './CommentsPlugin';

type AreaOwner = Readonly<{ path: Path; root?: NamedRootKey | undefined }>;

type AreaPlaces = Readonly<{
  owners: ReadonlyMap<string, readonly AreaOwner[]>;
  root: NamedRootKey | undefined;
  standaloneRoots: ReadonlySet<NamedRootKey>;
}>;

const buildAreaPlaces = (
  editor: Editor,
  standaloneRoots: readonly NamedRootKey[]
): AreaPlaces => ({
  owners: new Map(
    editor.read.roots().map(({ owners, root }) => [root, owners])
  ),
  root: editor.read.view.root(),
  standaloneRoots: new Set(standaloneRoots),
});

const areaIndicesOf = (
  { owners, root: areaRoot, standaloneRoots }: AreaPlaces,
  point: Point
): readonly number[] => {
  if (point.root === areaRoot) return [point.path[0] ?? 0];
  if (point.root === undefined || standaloneRoots.has(point.root)) return [];

  const indices = new Set<number>();
  const visited = new Set<string>([point.root]);
  const stack: NamedRootKey[] = [point.root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const owner of owners.get(current) ?? []) {
      if (owner.root === areaRoot) {
        const blockIndex = owner.path[0];
        if (blockIndex !== undefined) indices.add(blockIndex);
      } else if (
        owner.root !== undefined &&
        !standaloneRoots.has(owner.root) &&
        !visited.has(owner.root)
      ) {
        visited.add(owner.root);
        stack.push(owner.root);
      }
    }
  }

  return [...indices].sort((left, right) => left - right);
};

const areaBlockKeys = (
  editor: Editor,
  places: AreaPlaces,
  range: Range
): readonly NodeKey[] => {
  const [start, end] = RangeApi.edges(range);

  if (start.root === places.root && end.root === places.root) {
    const first = start.path[0] ?? 0;
    const last = end.path[0] ?? 0;

    return Array.from({ length: last - first + 1 }).flatMap(
      (_, offset) => editor.key([first + offset]) ?? []
    );
  }

  return areaIndicesOf(places, start).flatMap(
    (index) => editor.key([index]) ?? []
  );
};

/** Presentation- and area-scoped index of unresolved comment threads for one mounted editor area. */
export type CommentThreadIndex = Readonly<{
  /** Top-level block index in this area that contains `point`, or `undefined` when outside or owned by a standalone root. */
  areaBlockIndexOf: (point: Point) => number | undefined;
  /** Unresolved range-attached thread IDs grouped by top-level block key in this area. */
  blockThreads: ReadonlyMap<NodeKey, readonly string[]>;
  /** Unresolved change-attached thread IDs grouped by authored change ID. */
  changeThreads: ReadonlyMap<string, readonly string[]>;
  /** Top-level block keys in this area where each unresolved range thread appears. */
  threadBlocks: ReadonlyMap<string, readonly NodeKey[]>;
}>;

const sameStringList = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const sameStringMap = <K extends string>(
  left: ReadonlyMap<K, readonly string[]>,
  right: ReadonlyMap<K, readonly string[]>
) => {
  if (left.size !== right.size) return false;
  for (const [key, values] of left) {
    const other = right.get(key);
    if (!other || !sameStringList(values, other)) return false;
  }
  return true;
};

const sameOwners = (
  left: ReadonlyMap<string, readonly AreaOwner[]>,
  right: ReadonlyMap<string, readonly AreaOwner[]>
) => {
  if (left.size !== right.size) return false;
  for (const [root, owners] of left) {
    const other = right.get(root);
    if (
      !other ||
      owners.length !== other.length ||
      !owners.every(
        (owner, index) =>
          owner.root === other[index]?.root &&
          PathApi.equals(owner.path, other[index].path)
      )
    ) {
      return false;
    }
  }
  return true;
};

const sameStandaloneRoots = (
  left: ReadonlySet<NamedRootKey>,
  right: ReadonlySet<NamedRootKey>
) => {
  if (left.size !== right.size) return false;
  for (const root of left) {
    if (!right.has(root)) return false;
  }
  return true;
};

const EMPTY_PLACES: AreaPlaces = Object.freeze({
  owners: new Map<string, readonly AreaOwner[]>(),
  root: undefined,
  standaloneRoots: new Set<NamedRootKey>(),
});

const sameThreadIndex = (
  left: Readonly<{ index: CommentThreadIndex; places: AreaPlaces }>,
  right: Readonly<{ index: CommentThreadIndex; places: AreaPlaces }>
) =>
  left.places.root === right.places.root &&
  sameStandaloneRoots(
    left.places.standaloneRoots,
    right.places.standaloneRoots
  ) &&
  sameOwners(left.places.owners, right.places.owners) &&
  sameStringMap(left.index.blockThreads, right.index.blockThreads) &&
  sameStringMap(left.index.threadBlocks, right.index.threadBlocks) &&
  sameStringMap(left.index.changeThreads, right.index.changeThreads);

const EMPTY_INDEX: CommentThreadIndex = Object.freeze({
  areaBlockIndexOf: () => undefined,
  blockThreads: new Map<NodeKey, readonly string[]>(),
  changeThreads: new Map<string, readonly string[]>(),
  threadBlocks: new Map<string, readonly NodeKey[]>(),
});

/**
 * Index unresolved comment threads for the mounted editor area, scoped to the
 * view's `(presentation, areaRoot, standaloneRoots)`. Nested content roots
 * without standalone editing areas roll up onto their owning block in this
 * area; standalone roots stay isolated to their own area.
 */
export const useCommentThreadIndex = (): CommentThreadIndex => {
  const editor = useEditor();
  const { standaloneRoots } = useEditorRootAreas(editor);
  const viewRoot = useEditorSelector((current) => current.read.view.root(), {
    dependsOn: 'readOnly',
  });
  const presentationView = React.useMemo(
    () =>
      viewRoot === undefined
        ? editor
        : createEditorView(editor, { readOnly: true }),
    [editor, viewRoot]
  );
  const portal = presentationView.plugin(CommentsPlugin);
  const comments = portal.installed ? portal.api : null;

  const compute = React.useCallback((): Readonly<{
    index: CommentThreadIndex;
    places: AreaPlaces;
  }> => {
    if (!comments) return { index: EMPTY_INDEX, places: EMPTY_PLACES };

    const places = buildAreaPlaces(editor, standaloneRoots);
    const visible = new Set(comments.getSnapshot().visibleThreadIds);
    const blockThreads = new Map<NodeKey, string[]>();
    const threadBlocks = new Map<string, readonly NodeKey[]>();
    const changeThreads = new Map<string, string[]>();

    for (const thread of comments.getThreads()) {
      if (thread.resolution) continue;

      if (thread.target.type === 'change') {
        const list = changeThreads.get(thread.target.id) ?? [];

        list.push(thread.id);
        changeThreads.set(thread.target.id, list);
        continue;
      }

      if (!visible.has(thread.id)) continue;

      const attachment = comments.attachment(thread.id);

      if (attachment?.type !== 'range' || attachment.status !== 'attached') {
        continue;
      }

      const keys = areaBlockKeys(editor, places, attachment.range);

      if (keys.length === 0) continue;

      threadBlocks.set(thread.id, keys);
      for (const blockKey of keys) {
        const list = blockThreads.get(blockKey);

        if (list) list.push(thread.id);
        else blockThreads.set(blockKey, [thread.id]);
      }
    }

    return {
      index: Object.freeze({
        areaBlockIndexOf: (point: Point) => areaIndicesOf(places, point)[0],
        blockThreads,
        changeThreads,
        threadBlocks,
      }),
      places,
    };
  }, [comments, editor, standaloneRoots]);

  const cacheRef = React.useRef<{
    compute: () => Readonly<{ index: CommentThreadIndex; places: AreaPlaces }>;
    entry: Readonly<{ index: CommentThreadIndex; places: AreaPlaces }>;
    version: number;
  } | null>(null);
  const versionRef = React.useRef(0);

  const subscribe = React.useCallback(
    (wake: () => void) => {
      if (!comments) return () => {};

      const refresh = () => {
        versionRef.current += 1;
        wake();
      };
      const unsubscribeAttachments = comments.subscribeAttachments(refresh);
      const unsubscribeThreads = comments.subscribeThreads(refresh);
      const unsubscribeSnapshot = comments.subscribeSnapshot(refresh);
      const unsubscribeAuthored = subscribeSharedEditorViewState(
        editor,
        'authored',
        refresh
      );
      const unsubscribeCommits = editor.subscribeCommit((commit) => {
        if (
          !commit ||
          commit.changed.hasAny('structure') ||
          commit.changed.hasAny('properties') ||
          commit.changed.hasAny('replace')
        ) {
          refresh();
        }
      });

      // Revalidate once on subscription attach so writes occurring between
      // initial render and passive effect attachment are observed.
      versionRef.current += 1;

      return () => {
        unsubscribeAttachments();
        unsubscribeThreads();
        unsubscribeSnapshot();
        unsubscribeAuthored();
        unsubscribeCommits();
      };
    },
    [comments, editor]
  );

  const getSnapshot = () => {
    const cached = cacheRef.current;

    if (
      cached &&
      cached.compute === compute &&
      cached.version === versionRef.current
    ) {
      return cached.entry.index;
    }

    const next = compute();
    const entry =
      cached && sameThreadIndex(cached.entry, next) ? cached.entry : next;

    cacheRef.current = { compute, entry, version: versionRef.current };

    return entry.index;
  };

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
