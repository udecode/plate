import {
  type Descendant,
  type Editor,
  type EditorStateView,
  NodeApi,
  type Path,
  PathApi,
  type Range,
  type RootKey,
  type Value,
} from '../..';
import type { NodeList } from '../../core/change/document-index';
import { getSetSite } from '../../core/public-state';
import { countCoreWork } from '../../core/work';
import { EDITOR_TO_ROOT_VIEW_EDITORS } from '../../dom/internal';
import { matchesPresentationOf } from '../../editor-runtime-view';
import type { AnyEditor, EditorRootOwner } from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY, readRootChildren } from '../root-key';
import {
  createPliteViewBoundaryGraph,
  getPliteDescendantAtPath,
  getPliteBoundaryPoint,
  getPliteViewBoundaryOwnerKey,
  rootPlitePoint,
  type PliteViewBoundaryOwner,
  type PliteViewBoundaryPoint,
  type PliteViewBoundaryGraphNodeInput,
} from '../view-boundary-graph';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  hasEditorRuntime,
  toInternalRoot,
} from './runtime-editor-api';

export type { PliteViewBoundaryOwner };

const VIEW_EDITOR_TO_CONTENT_ROOT_OWNER = new WeakMap<
  object,
  PliteViewBoundaryOwner
>();

export const setViewEditorContentRootOwner = (
  editor: object,
  owner: PliteViewBoundaryOwner
) => {
  VIEW_EDITOR_TO_CONTENT_ROOT_OWNER.set(editor, owner);
};

export const deleteViewEditorContentRootOwner = (
  editor: object,
  owner?: PliteViewBoundaryOwner
) => {
  if (!owner || VIEW_EDITOR_TO_CONTENT_ROOT_OWNER.get(editor) === owner) {
    VIEW_EDITOR_TO_CONTENT_ROOT_OWNER.delete(editor);
  }
};

export const getRegisteredViewEditorContentRootOwner = (
  editor: object
): PliteViewBoundaryOwner | null =>
  VIEW_EDITOR_TO_CONTENT_ROOT_OWNER.get(editor) ?? null;

export type ContentRootNavigationEditor = Pick<
  ReactRuntimeEditor<any>,
  'api' | 'read' | 'update'
>;

type ContentRootViewNode = Pick<
  PliteViewBoundaryGraphNodeInput,
  'owner' | 'path' | 'root' | 'text'
>;

export const readContentRootViewNode = (
  editor: Pick<Editor, 'read'>,
  node: ContentRootViewNode
): Descendant | null => {
  const children = editor.read((state) => readRootChildren(state, node.root));

  return getPliteDescendantAtPath(children, node.path);
};

export const getContentRootViewBoundaryPoint = (
  editor: Pick<Editor, 'read'>,
  node: ContentRootViewNode,
  edge: 'start' | 'end'
): PliteViewBoundaryPoint | null => {
  const content = node.text ? null : readContentRootViewNode(editor, node);
  const point = node.text
    ? { path: node.path, offset: node.text[edge] }
    : content && getPliteBoundaryPoint(content, node.path, edge);
  return point
    ? {
        ...(node.owner ? { owner: node.owner } : {}),
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

export const readRootNodes = (
  editor: object,
  state: Pick<EditorStateView, 'children' | 'root' | 'value' | 'view'>,
  root: RootKey
): NodeList<Descendant> => {
  const runtimeEditor =
    (state.view.root() ?? MAIN_ROOT_KEY) === root
      ? getRuntimeEditor(editor)
      : null;

  return runtimeEditor
    ? getEditorRuntime(runtimeEditor).getChildList()
    : readRootChildren(state, root);
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
  const owner = getEditorRuntimeOwner(editor);
  const viewEditors = EDITOR_TO_ROOT_VIEW_EDITORS.get(owner);

  if (!viewEditors) {
    return null;
  }

  const matchesPresentation = matchesPresentationOf(editor);

  for (const viewEditor of viewEditors) {
    if (
      matchesPresentation(viewEditor) &&
      toInternalRoot(viewEditor.read((state) => state.view.root())) === root
    ) {
      return viewEditor as ReactRuntimeEditor;
    }
  }

  return null;
};

export const findContentRootOwners = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>
): PliteViewBoundaryOwner[] => {
  const runtimeEditor = getRuntimeEditor(editor);

  if (
    !runtimeEditor ||
    !getEditorRuntime(runtimeEditor).schema.hasContentRoots()
  ) {
    return [];
  }
  countCoreWork('contentRootOwnerScans');

  return editor.read((state) => {
    const entries = state.roots();
    const rootRank = new Map(entries.map(({ root }, index) => [root, index]));
    const rankOf = (owner: EditorRootOwner) =>
      rootRank.get(owner.root ?? MAIN_ROOT_KEY) ?? -1;
    const slotRank = (owner: EditorRootOwner) => {
      const element = getPliteDescendantAtPath(
        readRootChildren(state, owner.root ?? MAIN_ROOT_KEY),
        owner.path
      );

      return NodeApi.isElement(element)
        ? Object.keys(state.schema.getElementContentRoots(element)).indexOf(
            owner.slot
          )
        : 0;
    };
    const byOwnerPlace = (
      left: { owner: EditorRootOwner },
      right: { owner: EditorRootOwner }
    ) =>
      rankOf(left.owner) - rankOf(right.owner) ||
      PathApi.compare(left.owner.path, right.owner.path) ||
      left.owner.path.length - right.owner.path.length ||
      slotRank(left.owner) - slotRank(right.owner);

    return entries
      .flatMap(({ owners, root }) => owners.map((owner) => ({ owner, root })))
      .sort(byOwnerPlace)
      .map(({ owner, root }) => ({
        childRoot: root,
        ownerPath: [...owner.path],
        ownerRoot: owner.root ?? MAIN_ROOT_KEY,
      }));
  });
};

/**
 * Drops the owners of set roots. A set root's members are separate texts, so a
 * range across its holder selects over the void holder, and a view mounted in
 * the set root is the top of its graph.
 */
const withoutSetOwners = <T extends readonly PliteViewBoundaryOwner[]>(
  editor: object,
  owners: T
): T => {
  const runtimeEditor = owners.length > 0 ? getRuntimeEditor(editor) : null;

  if (!runtimeEditor) return owners;
  const site = getSetSite(getEditorRuntimeOwner(runtimeEditor));

  if (!site.schema.declaresSetRoots()) return owners;

  return owners.filter(
    (owner) => !site.schema.isSetRoot(owner.childRoot, site)
  ) as unknown as T;
};

export const findCrossingContentRootOwners = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>
) => withoutSetOwners(editor, findContentRootOwners(editor));

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

  return findCrossingContentRootOwners(editor).some(
    (owner) =>
      owner.ownerRoot === anchorRoot &&
      PathApi.compare(owner.ownerPath, start.path) >= 0 &&
      PathApi.compare(owner.ownerPath, end.path) <= 0
  );
};

const isKnownOwnerHop = (
  owners: readonly PliteViewBoundaryOwner[],
  owner: PliteViewBoundaryOwner
) =>
  owners.some(
    (candidate) =>
      candidate.childRoot === owner.childRoot &&
      candidate.ownerRoot === owner.ownerRoot &&
      PathApi.equals(candidate.ownerPath, owner.ownerPath)
  );

export const isKnownContentRootOwner = (
  owners: readonly PliteViewBoundaryOwner[],
  owner: PliteViewBoundaryOwner | null | undefined
): owner is PliteViewBoundaryOwner => {
  if (!owner) return false;

  const seen = new Set<PliteViewBoundaryOwner>();
  let current: PliteViewBoundaryOwner | null | undefined = owner;

  while (current) {
    if (seen.has(current) || !isKnownOwnerHop(owners, current)) {
      return false;
    }
    seen.add(current);
    if (current.parent && current.parent.childRoot !== current.ownerRoot) {
      return false;
    }
    current = current.parent;
  }

  return true;
};

const getSingleHopOwnerKey = (owner: PliteViewBoundaryOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${
    owner.childRoot
  }`;

export const isSameContentRootOwner = (
  left: PliteViewBoundaryOwner | null | undefined,
  right: PliteViewBoundaryOwner | null | undefined
): boolean =>
  (!left && !right) ||
  Boolean(
    left &&
    right &&
    left.childRoot === right.childRoot &&
    left.ownerRoot === right.ownerRoot &&
    PathApi.equals(left.ownerPath, right.ownerPath) &&
    isSameContentRootOwner(left.parent, right.parent)
  );

export const getOwnerForCurrentViewEditor = ({
  editor,
  getContentRootOwnerViewEditor,
  owners,
}: {
  editor: ContentRootNavigationEditor;
  getContentRootOwnerViewEditor?: (
    owner: PliteViewBoundaryOwner
  ) => ReactRuntimeEditor | null;
  owners: readonly PliteViewBoundaryOwner[];
}): PliteViewBoundaryOwner | null => {
  const registered = getRegisteredViewEditorContentRootOwner(editor);

  if (isKnownContentRootOwner(owners, registered)) {
    return registered;
  }

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

const chainFirstOwnerForRoot = (
  owners: readonly PliteViewBoundaryOwner[],
  root: RootKey,
  seen: ReadonlySet<RootKey> = new Set()
): PliteViewBoundaryOwner | null => {
  if (seen.has(root)) return null;

  const owner = owners.find((candidate) => candidate.childRoot === root);

  if (!owner) return null;

  const parent = chainFirstOwnerForRoot(
    owners,
    owner.ownerRoot,
    new Set([...seen, root])
  );

  return parent ? { ...owner, parent } : owner;
};

export const getOwnerForRoot = ({
  currentRoot,
  getActiveContentRootOwner,
  owners,
}: {
  currentRoot: RootKey;
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null;
  owners: readonly PliteViewBoundaryOwner[];
}): PliteViewBoundaryOwner | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);

  return isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : chainFirstOwnerForRoot(owners, currentRoot);
};

const getTopLevelOwner = (
  owners: readonly PliteViewBoundaryOwner[],
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
  owners: readonly PliteViewBoundaryOwner[],
  root: RootKey,
  path: Path
) =>
  owners.some(
    (owner) =>
      owner.ownerRoot === root &&
      owner.ownerPath.length > path.length &&
      PathApi.isAncestor(path, owner.ownerPath)
  );

const getViewDocumentRoot = (
  owners: readonly PliteViewBoundaryOwner[],
  root: RootKey,
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null
) => {
  const tops = new Set<RootKey>();
  const seen = new Set<RootKey>();
  const climb = (child: RootKey) => {
    if (seen.has(child)) return;
    seen.add(child);

    const activeOwner = getActiveContentRootOwner?.(child);
    if (isKnownContentRootOwner(owners, activeOwner)) {
      let top = activeOwner;

      while (top.parent) top = top.parent;
      climb(top.ownerRoot);
      return;
    }

    const hosts = owners.filter((owner) => owner.childRoot === child);

    if (hosts.length === 0) tops.add(child);
    for (const host of hosts) climb(host.ownerRoot);
  };

  climb(root);

  return tops.size === 1 ? [...tops][0] : MAIN_ROOT_KEY;
};

const walkContentRootView = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  allOwners: readonly PliteViewBoundaryOwner[],
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null,
  edge?: 'start' | 'end'
) => {
  const owners = withoutSetOwners(editor, allOwners);

  return editor.read((state) => {
    const nodes: PliteViewBoundaryGraphNodeInput[] = [];
    const graphRoot = getViewDocumentRoot(
      owners,
      state.view.root() ?? MAIN_ROOT_KEY,
      getActiveContentRootOwner
    );
    const forEachInOrder = <T>(
      items: readonly T[],
      visit: (item: T, index: number) => void
    ) => {
      for (let step = 0; step < items.length; step++) {
        if (edge && nodes.length > 0) return;
        const index = edge === 'end' ? items.length - 1 - step : step;

        visit(items[index], index);
      }
    };

    const appendRoot = (
      root: RootKey,
      owner: PliteViewBoundaryOwner | null,
      ownerStack: ReadonlySet<string>
    ) => {
      const appendNode = (node: Descendant, path: Path, blockKey?: string) => {
        const childOwner = getTopLevelOwner(owners, root, path);

        if (childOwner) {
          const edgeKey = getSingleHopOwnerKey(childOwner);

          if (!ownerStack.has(edgeKey)) {
            const chainedOwner: PliteViewBoundaryOwner = owner
              ? { ...childOwner, parent: owner }
              : childOwner;

            appendRoot(
              childOwner.childRoot,
              chainedOwner,
              new Set([...ownerStack, edgeKey])
            );
            return;
          }
        }

        if (NodeApi.isElement(node) && hasNestedOwner(owners, root, path)) {
          if (state.schema.isVoid(node)) {
            nodes.push({ blockKey, owner, path, root });
            return;
          }
          const childBlockKey = state.schema.isInline(node)
            ? blockKey
            : JSON.stringify([
                root,
                owner ? getPliteViewBoundaryOwnerKey(owner) : null,
                null,
                path,
              ]);
          forEachInOrder(node.children, (child, index) => {
            appendNode(child, path.concat(index), childBlockKey);
          });
          return;
        }

        nodes.push({
          ...(owner ? { owner } : {}),
          path,
          root,
        });
      };

      forEachInOrder(readRootChildren(state, root), (child, index) => {
        appendNode(child, [index]);
      });
    };

    appendRoot(graphRoot, null, new Set());

    return nodes;
  });
};

export const createContentRootViewBoundaryGraph = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly PliteViewBoundaryOwner[],
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null
) =>
  createPliteViewBoundaryGraph(
    walkContentRootView(editor, owners, getActiveContentRootOwner)
  );

export const getContentRootViewEdgeNode = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly PliteViewBoundaryOwner[],
  edge: 'start' | 'end',
  getActiveContentRootOwner?: (root: RootKey) => PliteViewBoundaryOwner | null
): ContentRootViewNode | null =>
  walkContentRootView(editor, owners, getActiveContentRootOwner, edge)[0] ??
  null;
