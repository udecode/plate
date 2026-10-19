import {
  type Descendant,
  type Editor,
  NodeApi,
  type Path,
  PathApi,
  type Range,
  type RootKey,
  type Value,
} from '../..';
import { EDITOR_TO_ROOT_VIEW_EDITORS } from '../../dom/internal';
import type { AnyEditor } from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY, readRootChildren } from '../root-key';
import {
  createPliteViewBoundaryGraph,
  createPliteViewBoundaryRootMap,
  getPliteDescendantAtPath,
  getPliteBoundaryPoint,
  rootPlitePoint,
  type PliteViewBoundaryPoint,
  type PliteViewBoundaryGraphNodeInput,
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
  const children = editor.read((state) => readRootChildren(state, node.root));

  return getPliteDescendantAtPath(children, node.path);
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

export const createContentRootViewBoundaryGraph = <V extends Value>(
  editor: Pick<AnyEditor<V>, 'read'>,
  owners: readonly ContentRootOwner[]
) =>
  editor.read((state) => {
    const nodes: PliteViewBoundaryGraphNodeInput[] = [];
    const currentRoot = state.view.root() ?? MAIN_ROOT_KEY;
    const graphRoot = owners.some((owner) => owner.childRoot === currentRoot)
      ? MAIN_ROOT_KEY
      : currentRoot;

    const appendRoot = (
      root: RootKey,
      owner: ContentRootOwner | null,
      ownerStack: ReadonlySet<string>
    ) => {
      const appendNode = (node: Descendant, path: Path, blockKey?: string) => {
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

        if (NodeApi.isElement(node) && hasNestedOwner(owners, root, path)) {
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

        nodes.push({
          ...(owner ? { owner } : {}),
          path,
          root,
        });
      };

      readRootChildren(state, root).forEach((child, index) => {
        appendNode(child, [index]);
      });
    };

    appendRoot(graphRoot, null, new Set());

    return createPliteViewBoundaryGraph(nodes);
  });
