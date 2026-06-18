import {
  type Descendant,
  type Path,
  PathApi,
  type Point,
  type RootKey,
} from '@platejs/slate';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  getSlateBoundaryPoint,
  getSlateDescendantAtPath,
  getSlateRootBoundaryPoint,
} from '../view-boundary-graph';
import type { ContentRootNavigationDirection } from './content-root-navigation-actions';
import {
  type ContentRootNavigationEditor,
  type ContentRootOwner,
  isKnownContentRootOwner,
} from './content-root-owners';

export type ContentRootAdjacentBoundary = {
  path: Path;
  point: Point;
};

type ContentRootBoundaryNavigationTarget = {
  owner?: ContentRootOwner;
  point: Point;
  root: RootKey;
};

const getSiblingBoundary = ({
  children,
  ownerPath,
  side,
}: {
  children: readonly Descendant[];
  ownerPath: Path;
  side: 'after' | 'before';
}): ContentRootAdjacentBoundary | null => {
  if (ownerPath.length === 0) {
    return null;
  }

  const siblingPath =
    side === 'before'
      ? PathApi.hasPrevious(ownerPath)
        ? PathApi.previous(ownerPath)
        : null
      : PathApi.next(ownerPath);

  if (!siblingPath) {
    return null;
  }

  const sibling = getSlateDescendantAtPath(children, siblingPath);

  if (!sibling) {
    return null;
  }

  const point = getSlateBoundaryPoint(
    sibling,
    siblingPath,
    side === 'before' ? 'end' : 'start'
  );

  return point
    ? {
        path: siblingPath,
        point,
      }
    : null;
};

const getSiblingBoundaryPoint = ({
  children,
  ownerPath,
  side,
}: {
  children: readonly Descendant[];
  ownerPath: Path;
  side: 'after' | 'before';
}): Point | null =>
  getSiblingBoundary({
    children,
    ownerPath,
    side,
  })?.point ?? null;

export const getOwnerBoundaryPoint = (
  editor: ContentRootNavigationEditor,
  owner: ContentRootOwner,
  direction: ContentRootNavigationDirection
): Point | null =>
  editor.read((state) => {
    const children = state.value.root(
      owner.ownerRoot === MAIN_ROOT_KEY ? undefined : owner.ownerRoot
    );
    const ownerNode =
      children && getSlateDescendantAtPath(children, owner.ownerPath);

    if (!children || !ownerNode) {
      return null;
    }

    const siblingPoint = getSiblingBoundaryPoint({
      children,
      ownerPath: owner.ownerPath,
      side: direction === 'forward' ? 'before' : 'after',
    });

    if (siblingPoint) {
      return siblingPoint;
    }

    return getSlateBoundaryPoint(
      ownerNode,
      owner.ownerPath,
      direction === 'forward' ? 'start' : 'end'
    );
  });

export const getOwnerAdjacentBoundary = (
  editor: ContentRootNavigationEditor,
  owner: ContentRootOwner,
  direction: ContentRootNavigationDirection
): ContentRootAdjacentBoundary | null =>
  editor.read((state) => {
    const children = state.value.root(
      owner.ownerRoot === MAIN_ROOT_KEY ? undefined : owner.ownerRoot
    );

    return children
      ? getSiblingBoundary({
          children,
          ownerPath: owner.ownerPath,
          side: direction === 'forward' ? 'before' : 'after',
        })
      : null;
  });

export const getOwnerSelfBoundaryPoint = (
  editor: ContentRootNavigationEditor,
  owner: ContentRootOwner,
  edge: 'end' | 'start'
): Point | null =>
  editor.read((state) => {
    const children = state.value.root(
      owner.ownerRoot === MAIN_ROOT_KEY ? undefined : owner.ownerRoot
    );
    const ownerNode =
      children && getSlateDescendantAtPath(children, owner.ownerPath);

    return ownerNode
      ? getSlateBoundaryPoint(ownerNode, owner.ownerPath, edge)
      : null;
  });

export const getExitBoundaryPoint = (
  editor: ContentRootNavigationEditor,
  owner: ContentRootOwner,
  direction: ContentRootNavigationDirection
): Point | null =>
  editor.read((state) => {
    const children = state.value.root(
      owner.ownerRoot === MAIN_ROOT_KEY ? undefined : owner.ownerRoot
    );
    const ownerNode =
      children && getSlateDescendantAtPath(children, owner.ownerPath);

    if (!children || !ownerNode) {
      return null;
    }

    const siblingPoint = getSiblingBoundaryPoint({
      children,
      ownerPath: owner.ownerPath,
      side: direction === 'forward' ? 'after' : 'before',
    });

    if (siblingPoint) {
      return siblingPoint;
    }

    return getSlateBoundaryPoint(
      ownerNode,
      owner.ownerPath,
      direction === 'forward' ? 'end' : 'start'
    );
  });

export const getRootBoundaryNavigationTarget = ({
  direction,
  editor,
  owner,
}: {
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  owner: ContentRootOwner;
}): ContentRootBoundaryNavigationTarget | null => {
  const point = editor.read((state) =>
    getSlateRootBoundaryPoint(
      state.value.root(owner.childRoot),
      direction === 'forward' ? 'start' : 'end'
    )
  );

  return point
    ? {
        owner,
        point,
        root: owner.childRoot,
      }
    : null;
};

export const getDocumentBoundaryNavigationTarget = ({
  currentRoot,
  direction,
  editor,
  getActiveContentRootOwner,
  owners,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  editor: ContentRootNavigationEditor;
  getActiveContentRootOwner?: (root: RootKey) => ContentRootOwner | null;
  owners: ContentRootOwner[];
}): ContentRootBoundaryNavigationTarget | null => {
  const activeOwner = getActiveContentRootOwner?.(currentRoot);
  const ownerForCurrentRoot = isKnownContentRootOwner(owners, activeOwner)
    ? activeOwner
    : owners.find((owner) => owner.childRoot === currentRoot);
  const targetRoot = ownerForCurrentRoot?.ownerRoot ?? currentRoot;
  const point = editor.read((state) =>
    getSlateRootBoundaryPoint(
      state.value.root(targetRoot === MAIN_ROOT_KEY ? undefined : targetRoot),
      direction === 'forward' ? 'end' : 'start'
    )
  );

  return point ? { point, root: targetRoot } : null;
};
