import type { Descendant, Range, RootKey } from '@platejs/slate';

import { MAIN_ROOT_KEY } from '../root-key';
import type { SlateViewBoundaryOwner } from '../view-boundary-graph';

export type ProjectedRemoteSelectionPaintPolicy =
  | 'active-projection'
  | 'all-projections'
  | 'none';

export type RootKeyedCollabTarget = Readonly<{
  root: RootKey;
}>;

export type RootQualifiedRemoteSelection = Readonly<{
  range: Range;
  root: RootKey;
}>;

export type ProjectedRemoteSelectionPaintTarget = Readonly<{
  owner: SlateViewBoundaryOwner | null;
  range: Range;
  root: RootKey;
}>;

const cloneRange = (range: Range): Range => ({
  anchor: {
    ...(range.anchor.root ? { root: range.anchor.root } : {}),
    offset: range.anchor.offset,
    path: [...range.anchor.path],
  },
  focus: {
    ...(range.focus.root ? { root: range.focus.root } : {}),
    offset: range.focus.offset,
    path: [...range.focus.path],
  },
});

export const getRootKeyedCollabTargets = (value: {
  children: readonly Descendant[];
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}): readonly RootKeyedCollabTarget[] =>
  [MAIN_ROOT_KEY, ...Object.keys(value.roots ?? {}).sort()].map(
    (root) => Object.freeze({ root }) as RootKeyedCollabTarget
  );

export const getProjectedRemoteSelectionPaintTargets = ({
  activeOwner,
  owners,
  policy,
  selection,
}: {
  activeOwner?: SlateViewBoundaryOwner | null;
  owners: readonly SlateViewBoundaryOwner[];
  policy: ProjectedRemoteSelectionPaintPolicy;
  selection: RootQualifiedRemoteSelection;
}): readonly ProjectedRemoteSelectionPaintTarget[] => {
  if (policy === 'none') {
    return [];
  }

  if (selection.root === MAIN_ROOT_KEY) {
    return [
      Object.freeze({
        owner: null,
        range: cloneRange(selection.range),
        root: selection.root,
      }),
    ];
  }

  const targetOwners =
    policy === 'active-projection'
      ? activeOwner && activeOwner.childRoot === selection.root
        ? [activeOwner]
        : []
      : owners.filter((owner) => owner.childRoot === selection.root);

  return targetOwners.map((owner) =>
    Object.freeze({
      owner,
      range: cloneRange(selection.range),
      root: selection.root,
    })
  );
};
