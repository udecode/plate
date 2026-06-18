import {
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  PathApi,
  type Range,
  type RootKey,
} from '@platejs/slate';
import { EDITOR_TO_ROOT_VIEW_EDITORS } from '@platejs/slate-dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  createSlateViewBoundaryGraph,
  createSlateViewBoundaryRootMap,
  type SlateViewBoundaryGraphNodeInput,
} from '../view-boundary-graph';
import { getEditorExtensionRegistry } from './runtime-editor-api';

export type ContentRootOwner = {
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
};

export type ContentRootNavigationEditor = Pick<
  ReactRuntimeEditor,
  'api' | 'read' | 'update'
>;

const isRootKey = (value: unknown): value is RootKey =>
  typeof value === 'string' && value.length > 0;

const getChildRoot = (element: Element, slot: string): RootKey | null => {
  const childRoots = (element as { childRoots?: unknown }).childRoots;

  if (
    typeof childRoots !== 'object' ||
    childRoots === null ||
    !Object.hasOwn(childRoots, slot)
  ) {
    return null;
  }

  const childRoot = (childRoots as Record<string, unknown>)[slot];

  return isRootKey(childRoot) ? childRoot : null;
};

export const hasContentRootElementSpec = (
  editor: ContentRootNavigationEditor
) => {
  const registry = getEditorExtensionRegistry(editor as ReactRuntimeEditor);

  for (const registration of registry.elementSpecs.values()) {
    if (registration.spec.contentRoot?.slot) {
      return true;
    }
  }

  return false;
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
    if (viewEditor.read((state) => state.view.root()) === root) {
      return viewEditor as ReactRuntimeEditor;
    }
  }

  return null;
};

export const findContentRootOwners = (
  editor: ContentRootNavigationEditor
): ContentRootOwner[] => {
  if (!hasContentRootElementSpec(editor)) {
    return [];
  }

  return editor.read((state) => {
    const owners: ContentRootOwner[] = [];
    const roots = createSlateViewBoundaryRootMap(state.value.get());

    const visit = (node: Descendant, ownerRoot: RootKey, ownerPath: Path) => {
      if (!NodeApi.isElement(node)) {
        return;
      }

      const slot = state.schema.getElementSpec(node.type)?.contentRoot?.slot;
      const childRoot = slot ? getChildRoot(node, slot) : null;

      if (childRoot) {
        owners.push({
          childRoot,
          ownerPath: [...ownerPath],
          ownerRoot,
        });
      }

      node.children.forEach((child, index) => {
        visit(child, ownerRoot, ownerPath.concat(index));
      });
    };

    for (const [ownerRoot, children] of Object.entries(roots)) {
      children.forEach((child, index) => {
        visit(child, ownerRoot, [index]);
      });
    }

    return owners;
  });
};

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

  const fallbackRoot = editor.read((state) => state.view.root());
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
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${owner.childRoot}`;

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

export const createContentRootProjectionGraph = (
  editor: ContentRootNavigationEditor,
  owners: readonly ContentRootOwner[]
) =>
  editor.read((state) => {
    const nodes: SlateViewBoundaryGraphNodeInput[] = [];
    const roots = createSlateViewBoundaryRootMap(state.value.get());

    const appendRoot = (
      root: RootKey,
      owner: ContentRootOwner | null,
      ownerStack: ReadonlySet<string>
    ) => {
      const children = roots[root] ?? [];

      const appendNode = (node: Descendant, path: Path) => {
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
          node.children.forEach((child, index) => {
            appendNode(child, path.concat(index));
          });
          return;
        }

        nodes.push({
          ...(owner ? { owner } : {}),
          path,
          root,
        });
      };

      children.forEach((child, index) => {
        appendNode(child, [index]);
      });
    };

    appendRoot(MAIN_ROOT_KEY, null, new Set());

    return createSlateViewBoundaryGraph(nodes);
  });
