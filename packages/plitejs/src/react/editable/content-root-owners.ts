import {
  type Descendant,
  type Editor,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  type Range,
  type RootKey,
  type Value,
} from '../..';
import { readAuthoredFragmentRoots } from '../../core/authored-fragment-view';
import {
  readAuthoredViewFragments,
  readAuthoredViewFragmentSlots,
  readAuthoredView,
  readAuthoredViewFragmentVersion,
  readAuthoredViewRenderSegments,
  type NativeAuthoredFragment,
  type NativeAuthoredFragmentSlot,
  type NativeAuthoredRenderSegment,
} from '../../core/authored-runtime';
import { getEditorProjectionSnapshotIndex } from '../../core/public-state';
import { EDITOR_TO_ROOT_VIEW_EDITORS } from '../../dom/internal';
import type { AnyEditor, NodeKey } from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY, readRootChildren } from '../root-key';
import {
  createPliteViewBoundaryGraph,
  createPliteViewBoundaryRootMap,
  PliteViewBoundaryGraph,
  getPliteDescendantAtPath,
  getPliteBoundaryPoint,
  rootPlitePoint,
  type PliteViewBoundaryPoint,
  type PliteViewBoundaryGraphNodeInput,
  type PliteViewBoundaryGraphModel,
} from '../view-boundary-graph';
import type { PliteViewBoundaryGraphNode } from '../view-boundary-graph-core';
import {
  getEditorRuntimeElementEntries,
  getEditorRuntime,
  getEditorRuntimeOwner,
  hasEditorRuntime,
  toInternalRoot,
} from './runtime-editor-api';

export type ContentRootOwner = {
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
};

export type ContentRootNavigationEditor = Pick<
  ReactRuntimeEditor<any>,
  'api' | 'read' | 'update'
>;

export const readContentRootViewNode = (
  editor: Editor,
  node: PliteViewBoundaryGraphNode
): Descendant | null => {
  const fragment =
    node.fragment &&
    readAuthoredViewFragments(editor, node.fragment.changeId).find(
      (current) => current.id === node.fragment?.id
    );
  const children = node.fragment
    ? fragment && fragment.kind !== 'properties'
      ? fragment.slice.content
      : null
    : editor.read((state) => readRootChildren(state, node.root));
  return children ? getPliteDescendantAtPath(children, node.path) : null;
};

export const getContentRootViewBoundaryPoint = (
  editor: Editor,
  node: PliteViewBoundaryGraphNode,
  edge: 'start' | 'end'
): PliteViewBoundaryPoint | null => {
  const content = node.text ? null : readContentRootViewNode(editor, node);
  const point = node.text
    ? { path: node.path, offset: node.text[edge] }
    : content && getPliteBoundaryPoint(content, node.path, edge);
  return point
    ? {
        ...(node.owner ? { owner: node.owner } : {}),
        ...(node.fragment ? { fragmentId: node.fragment.id } : {}),
        affinity: node.text
          ? edge === 'start'
            ? 'forward'
            : 'backward'
          : edge === 'start'
            ? 'backward'
            : 'forward',
        point: rootPlitePoint(point, node.root),
      }
    : null;
};

const getRuntimeEditor = (editor: object): Editor | null => {
  let runtimeEditor: object | null = editor;

  while (runtimeEditor) {
    if (hasEditorRuntime(runtimeEditor)) {
      return runtimeEditor;
    }

    runtimeEditor = Object.getPrototypeOf(runtimeEditor) as object | null;
  }

  return null;
};

const hasCompiledContentRoots = (editor: ContentRootNavigationEditor) => {
  const runtimeEditor = getRuntimeEditor(editor);

  return Boolean(
    runtimeEditor && getEditorRuntime(runtimeEditor).schema.hasContentRoots()
  );
};

export const getRegisteredRootViewEditor = (
  editor: ReactRuntimeEditor,
  root: RootKey
): ReactRuntimeEditor | null => {
  const viewEditors = EDITOR_TO_ROOT_VIEW_EDITORS.get(editor);

  if (!viewEditors) {
    return null;
  }

  for (const viewEditor of viewEditors) {
    if (
      toInternalRoot(viewEditor.read((state) => state.view.root())) === root
    ) {
      return viewEditor as ReactRuntimeEditor;
    }
  }

  return null;
};

export const findContentRootOwners = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>
): ContentRootOwner[] => {
  const runtimeEditor = getRuntimeEditor(editor);

  if (
    !runtimeEditor ||
    !getEditorRuntime(runtimeEditor).schema.hasContentRoots()
  ) {
    return [];
  }
  const runtimeOwner = getEditorRuntimeOwner(runtimeEditor);

  return editor.read((state) => {
    const owners: ContentRootOwner[] = [];
    const roots = createPliteViewBoundaryRootMap(state.value());
    const ownerTypes = state.schema
      .getVocabulary()
      .elementTypes.filter(
        (type) =>
          Object.keys(state.schema.element(type)?.contentRoots ?? {}).length > 0
      );

    for (const [ownerRoot, children] of Object.entries(roots)) {
      for (const { path } of getEditorRuntimeElementEntries(
        runtimeOwner,
        ownerTypes,
        ownerRoot
      )) {
        const node = getPliteDescendantAtPath(children, path);

        if (!node || !NodeApi.isElement(node)) continue;
        for (const childRoot of Object.values(
          state.schema.getElementContentRoots(node)
        )) {
          owners.push({
            childRoot,
            ownerPath: [...path],
            ownerRoot,
          });
        }
      }
    }

    return owners;
  });
};

export const hasContentRootOwner = (editor: ContentRootNavigationEditor) =>
  hasCompiledContentRoots(editor);

const comparePoints = (left: Range['anchor'], right: Range['anchor']) => {
  const pathComparison = PathApi.compare(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

export const isRangeAcrossContentRootOwners = (
  editor: ContentRootNavigationEditor,
  range: Range | null
) => {
  if (!range) {
    return false;
  }

  const fallbackRoot = toInternalRoot(
    editor.read((state) => state.view.root())
  );
  const anchorRoot = range.anchor.root ?? fallbackRoot;
  const focusRoot = range.focus.root ?? fallbackRoot;

  if (anchorRoot !== focusRoot) {
    return false;
  }

  const [start, end] =
    comparePoints(range.anchor, range.focus) <= 0
      ? [range.anchor, range.focus]
      : [range.focus, range.anchor];

  return findContentRootOwners(editor).some(
    (owner) =>
      owner.ownerRoot === anchorRoot &&
      PathApi.compare(owner.ownerPath, start.path) >= 0 &&
      PathApi.compare(owner.ownerPath, end.path) <= 0
  );
};

export const isKnownContentRootOwner = (
  owners: readonly ContentRootOwner[],
  owner: ContentRootOwner | null | undefined
): owner is ContentRootOwner =>
  !!owner &&
  owners.some(
    (candidate) =>
      candidate.childRoot === owner.childRoot &&
      candidate.ownerRoot === owner.ownerRoot &&
      PathApi.equals(candidate.ownerPath, owner.ownerPath)
  );

const getContentRootOwnerKey = (owner: ContentRootOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${
    owner.childRoot
  }`;

export const isSameContentRootOwner = (
  left: ContentRootOwner | null | undefined,
  right: ContentRootOwner | null | undefined
) =>
  (!left && !right) ||
  Boolean(
    left &&
    right &&
    left.childRoot === right.childRoot &&
    left.ownerRoot === right.ownerRoot &&
    PathApi.equals(left.ownerPath, right.ownerPath)
  );

export const getOwnerForCurrentViewEditor = ({
  editor,
  getContentRootOwnerViewEditor,
  owners,
}: {
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: ContentRootOwner
  ) => ReactRuntimeEditor | null;
  owners: readonly ContentRootOwner[];
}): ContentRootOwner | null => {
  if (!getContentRootOwnerViewEditor) {
    return null;
  }

  const viewEditor = editor as ReactRuntimeEditor;

  return (
    owners.find(
      (owner) => getContentRootOwnerViewEditor(owner) === viewEditor
    ) ?? null
  );
};

export const getOwnerForRoot = ({
  currentRoot,
  getActiveContentRootOwner,
  owners,
}: {
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  owners: readonly ContentRootOwner[];
}): ContentRootOwner | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);

  return isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : (owners.find((owner) => owner.childRoot === currentRoot) ?? null);
};

const getTopLevelOwner = (
  owners: readonly ContentRootOwner[],
  root: RootKey,
  path: Path
) =>
  owners.find(
    (owner) =>
      owner.ownerRoot === root &&
      owner.ownerPath.length === path.length &&
      PathApi.equals(owner.ownerPath, path)
  ) ?? null;

const hasNestedOwner = (
  owners: readonly ContentRootOwner[],
  root: RootKey,
  path: Path
) =>
  owners.some(
    (owner) =>
      owner.ownerRoot === root &&
      owner.ownerPath.length > path.length &&
      PathApi.isAncestor(path, owner.ownerPath)
  );

const VIEW_BOUNDARY_GRAPHS = new WeakMap<
  object,
  {
    graphs: Map<
      string,
      {
        children: readonly Descendant[];
        graph: PliteViewBoundaryGraphModel;
        roots: unknown;
      }
    >;
    version: object | null;
  }
>();

/**
 * Whether a collapsed caret may touch struck text: a text slot docks on its
 * text node, or it sits on a node edge where a neighbour's slot may dock.
 */
export const caretMayTouchRetained = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  point: Point
) => {
  const runtimeEditor = getRuntimeEditor(editor);
  if (!runtimeEditor || !readAuthoredViewFragmentVersion(runtimeEditor)) {
    return false;
  }
  return editor.read((state) => {
    const node = state.nodes.get(point.path)?.[0];
    if (!node || !NodeApi.isText(node)) return true;
    if (point.offset === 0 || point.offset === node.text.length) return true;
    const root = point.root ?? state.view.root() ?? MAIN_ROOT_KEY;
    const nodeKey = getEditorProjectionSnapshotIndex(
      runtimeEditor,
      readRootChildren(state, root)
    ).keyAt(point.path);
    return readAuthoredViewFragmentSlots(
      runtimeEditor,
      nodeKey ?? undefined,
      root
    ).some((slot) => slot.side === 'text');
  });
};

export const readRetainedFragmentIdsAt = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  point: Point
) => {
  const runtimeEditor = getRuntimeEditor(editor);
  if (!runtimeEditor) return '';
  return editor.read((state) => {
    const root = point.root ?? state.view.root() ?? MAIN_ROOT_KEY;
    const nodeKey = getEditorProjectionSnapshotIndex(
      runtimeEditor,
      readRootChildren(state, root)
    ).keyAt(point.path);
    return readAuthoredViewFragmentSlots(
      runtimeEditor,
      nodeKey ?? undefined,
      root
    )
      .map((slot) => slot.id)
      .join(' ');
  });
};

export const readCaretBlock = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly ContentRootOwner[],
  caret: Readonly<{
    fragment?: Pick<NativeAuthoredFragment, 'changeId' | 'id'> | null;
    point: Point;
  }>
) => {
  const root = editor.read.view.root() ?? MAIN_ROOT_KEY;
  if (owners.some((owner) => owner.childRoot === root)) return null;
  const runtimeEditor = getRuntimeEditor(editor);
  const placement = caret.fragment
    ? runtimeEditor &&
      readAuthoredViewFragments(runtimeEditor, caret.fragment.changeId).find(
        (entry) => entry.id === caret.fragment?.id
      )?.placement
    : { kind: 'text' as const, point: caret.point };
  if (
    placement?.kind !== 'text' ||
    (placement.point.root ?? MAIN_ROOT_KEY) !== root
  ) {
    return null;
  }
  return placement.point.path[0] ?? null;
};

/**
 * The graph of a collapsed caret's block when a character or word step in
 * `direction` cannot leave it (a word step stops at the block edge), so the
 * step reads no other block's retained fragments. Null otherwise.
 */
export const createCaretBlockGraph = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly ContentRootOwner[],
  caret: Readonly<{
    collapsed: boolean;
    direction: 'backward' | 'forward';
    fragment?: Pick<NativeAuthoredFragment, 'changeId' | 'id'> | null;
    point?: Point | null;
  }>
) => {
  const { direction, fragment, point } = caret;
  if (!caret.collapsed || !point) return null;
  const block = readCaretBlock(editor, owners, { fragment, point });
  if (block === null) return null;
  const graph = createContentRootViewBoundaryGraph(editor, owners, block);
  const node = PliteViewBoundaryGraph.resolvePointNode(graph, {
    affinity: direction,
    ...(fragment ? { fragmentId: fragment.id } : {}),
    point,
  });
  if (!node) return null;
  if (
    node.text &&
    (direction === 'backward'
      ? point.offset > node.text.start
      : point.offset < node.text.end)
  ) {
    return graph;
  }
  // The step stays in the block only when non-empty live text of the same
  // block lies past any struck text and empty boundaries in its direction.
  let current: PliteViewBoundaryGraphNode | null = node;
  while (current) {
    current =
      direction === 'backward'
        ? PliteViewBoundaryGraph.previousNode(graph, current)
        : PliteViewBoundaryGraph.nextNode(graph, current);
    if (!current || current.blockKey !== node.blockKey) return null;
    if (!current.fragment && current.text?.end !== current.text?.start) {
      return graph;
    }
  }
  return null;
};

/**
 * Unless the root itself carries retained slots, `block` limits the graph to
 * one top-level block, so a local question reads only that block's retained
 * fragments; the result then has no neighbours past that block.
 */
export const createContentRootViewBoundaryGraph = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly ContentRootOwner[],
  block?: number
) =>
  editor.read((state) => {
    const nodes: PliteViewBoundaryGraphNodeInput[] = [];
    const runtimeEditor = getRuntimeEditor(editor);
    const markup =
      runtimeEditor && readAuthoredView(runtimeEditor)?.projection === 'markup';
    const version = markup
      ? readAuthoredViewFragmentVersion(runtimeEditor)
      : null;
    const currentRoot = state.view.root() ?? MAIN_ROOT_KEY;
    const graphRoot = owners.some((owner) => owner.childRoot === currentRoot)
      ? MAIN_ROOT_KEY
      : currentRoot;
    const graphChildren = readRootChildren(state, graphRoot);
    const currentRoots = state.value().roots;
    const source = markup ? getEditorRuntimeOwner(runtimeEditor) : null;
    const cacheKey = JSON.stringify([
      graphRoot,
      owners.map(getContentRootOwnerKey),
      block ?? null,
    ]);
    let cache = source ? VIEW_BOUNDARY_GRAPHS.get(source) : null;
    if (source && cache?.version !== version) {
      cache = { version, graphs: new Map() };
      VIEW_BOUNDARY_GRAPHS.set(source, cache);
    }
    const previous = cache?.graphs.get(cacheKey);
    if (
      previous &&
      previous.children === graphChildren &&
      previous.roots === currentRoots
    ) {
      return previous.graph;
    }

    const appendRoot = (
      root: RootKey,
      owner: ContentRootOwner | null,
      ownerStack: ReadonlySet<string>
    ) => {
      const children = readRootChildren(state, root);
      const nodeIndex =
        runtimeEditor && markup
          ? getEditorProjectionSnapshotIndex(runtimeEditor, children)
          : null;
      const slotsAt = (path?: Path) =>
        runtimeEditor && nodeIndex
          ? readAuthoredViewFragmentSlots(
              runtimeEditor,
              path ? (nodeIndex.keyAt(path) ?? undefined) : undefined,
              root
            )
          : [];
      const appendFragment = (
        slot: NativeAuthoredFragmentSlot,
        blockKey?: string
      ) => {
        if (!runtimeEditor) return;
        const fragment = readAuthoredViewFragments(
          runtimeEditor,
          slot.changeId
        ).find((entry) => entry.id === slot.id);
        if (!fragment) return;
        const append = (
          node: Descendant,
          path: Path,
          currentBlockKey = blockKey
        ) => {
          if (NodeApi.isElement(node)) {
            if (state.schema.isVoid(node)) {
              nodes.push({
                blockKey: currentBlockKey,
                fragment,
                owner,
                path,
                root,
              });
              return;
            }
            const childBlockKey = state.schema.isInline(node)
              ? currentBlockKey
              : JSON.stringify([root, owner, fragment.id, path]);
            node.children.forEach((child, index) =>
              append(child, path.concat(index), childBlockKey)
            );
          } else {
            nodes.push({
              blockKey: currentBlockKey,
              fragment,
              owner,
              path,
              root,
              text: { start: 0, end: node.text.length, value: node.text },
            });
          }
        };
        for (const [node, path] of readAuthoredFragmentRoots(fragment)) {
          append(node, path);
        }
      };

      const appendRenderSegment = (
        segment: NativeAuthoredRenderSegment,
        blockKey?: string
      ) => {
        if (segment.kind === 'element') {
          if (state.schema.isVoid(segment.node)) {
            nodes.push({
              blockKey,
              ...(segment.fragment ? { fragment: segment.fragment } : {}),
              key: JSON.stringify([root, owner, segment.key]),
              owner,
              path: segment.path,
              root,
            });
            return;
          }
          const childOwner =
            !segment.fragment && getTopLevelOwner(owners, root, segment.path);
          if (childOwner) {
            const ownerKey = getContentRootOwnerKey(childOwner);
            if (!ownerStack.has(ownerKey)) {
              appendRoot(
                childOwner.childRoot,
                childOwner,
                new Set([...ownerStack, ownerKey])
              );
              return;
            }
          }
          const childBlockKey = state.schema.isInline(segment.node)
            ? blockKey
            : JSON.stringify([root, owner, segment.key]);
          segment.children.forEach((child) =>
            appendRenderSegment(child, childBlockKey)
          );
        } else if (NodeApi.isText(segment.node)) {
          nodes.push({
            blockKey,
            ...(segment.fragment ? { fragment: segment.fragment } : {}),
            key: JSON.stringify([root, owner, segment.key]),
            owner,
            path: segment.path,
            root,
            text: {
              start: segment.start,
              end: segment.end,
              value: segment.node.text,
            },
          });
        }
      };

      const appendNode = (node: Descendant, path: Path, blockKey?: string) => {
        const slots = slotsAt(path);
        if (runtimeEditor && slots.some((slot) => slot.side === 'structure')) {
          const segments = readAuthoredViewRenderSegments(
            runtimeEditor,
            children,
            root,
            path
          );
          segments.forEach((segment) => appendRenderSegment(segment, blockKey));
          return;
        }
        slots
          .filter((slot) => slot.side === 'before')
          .forEach((slot) => appendFragment(slot, blockKey));
        const appendContent = () => {
          const childOwner = getTopLevelOwner(owners, root, path);

          if (childOwner) {
            const ownerKey = getContentRootOwnerKey(childOwner);

            if (!ownerStack.has(ownerKey)) {
              appendRoot(
                childOwner.childRoot,
                childOwner,
                new Set([...ownerStack, ownerKey])
              );
              return;
            }
          }

          if (
            NodeApi.isElement(node) &&
            (markup || hasNestedOwner(owners, root, path))
          ) {
            if (state.schema.isVoid(node)) {
              nodes.push({ blockKey, owner, path, root });
              return;
            }
            const childBlockKey = state.schema.isInline(node)
              ? blockKey
              : JSON.stringify([root, owner, null, path]);
            node.children.forEach((child, index) => {
              appendNode(child, path.concat(index), childBlockKey);
            });
            return;
          }

          if (NodeApi.isText(node) && markup && runtimeEditor) {
            let start = 0;
            let hasFragment = false;
            for (const slot of slots.filter((entry) => entry.side === 'text')) {
              const fragment = readAuthoredViewFragments(
                runtimeEditor,
                slot.changeId
              ).find((entry) => entry.id === slot.id);
              if (!fragment || fragment.placement?.kind !== 'text') continue;
              const roots = readAuthoredFragmentRoots(fragment);
              if (
                !roots.length ||
                roots.some(
                  ([entry]) =>
                    NodeApi.isElement(entry) && !state.schema.isInline(entry)
                )
              ) {
                continue;
              }
              const end = fragment.placement.point.offset;
              if (end > start || !hasFragment) {
                nodes.push({
                  blockKey,
                  owner,
                  path,
                  root,
                  text: { start, end, value: node.text },
                });
              }
              appendFragment(slot, blockKey);
              hasFragment = true;
              start = end;
            }
            nodes.push({
              blockKey,
              owner,
              path,
              root,
              text: { start, end: node.text.length, value: node.text },
            });
            return;
          }

          nodes.push({
            ...(owner ? { owner } : {}),
            path,
            root,
          });
        };
        appendContent();
        slots
          .filter((slot) => slot.side === 'after')
          .forEach((slot) => appendFragment(slot, blockKey));
      };

      if (
        runtimeEditor &&
        slotsAt().some((slot) => slot.side === 'structure')
      ) {
        const segments = readAuthoredViewRenderSegments(
          runtimeEditor,
          children,
          root,
          []
        );
        segments.forEach((segment) => appendRenderSegment(segment));
        return;
      }
      const rootSlots = slotsAt().filter((slot) => slot.side === 'children');
      const scoped =
        block !== undefined &&
        root === graphRoot &&
        !ownerStack.size &&
        !rootSlots.length &&
        children[block];
      if (scoped) {
        appendNode(scoped, [block]);
        return;
      }
      rootSlots.forEach((slot) => appendFragment(slot));
      children.forEach((child, index) => {
        appendNode(child, [index]);
      });
    };

    appendRoot(graphRoot, null, new Set());
    const graph = createPliteViewBoundaryGraph(nodes);
    cache?.graphs.set(cacheKey, {
      children: graphChildren,
      graph,
      roots: currentRoots,
    });
    return graph;
  });

export const readContentRootRenderSegments = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  nodeKey?: NodeKey
) => {
  const runtimeEditor = getRuntimeEditor(editor);
  if (!runtimeEditor) return null;
  return editor.read((state) => {
    const root = state.view.root() ?? MAIN_ROOT_KEY;
    if (
      !readAuthoredViewFragmentSlots(runtimeEditor, nodeKey, root).some(
        (slot) => slot.side === 'structure'
      )
    ) {
      return null;
    }
    const path = nodeKey ? state.nodes.path(nodeKey) : [];
    return path
      ? readAuthoredViewRenderSegments(
          runtimeEditor,
          state.children(),
          root,
          path
        )
      : null;
  });
};
