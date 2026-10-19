import { type ReactNode, useCallback } from 'react';

import type { EditorCommit, NodeKey, Path } from '../..';
import { NodeApi, SelectionApi } from '../..';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorSelector } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { toPublicRootOption } from '../root-key';
import { toInternalRoot } from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

const isSelectionChangeForRoot = (root: string, change: EditorCommit) =>
  change.selectionChanged &&
  ((change.selectionBefore !== null &&
    toInternalRoot(change.selectionBeforeRoot) === root) ||
    (change.selectionAfter !== null &&
      toInternalRoot(change.selectionAfterRoot) === root));

const getSelectionPathKey = (
  selection: EditorCommit['selectionAfter'],
  root: string | undefined
) =>
  selection
    ? `${toInternalRoot(root)}:${
        SelectionApi.isNode(selection)
          ? selection.paths.map((path) => path.join('.')).join(';')
          : `${selection.anchor.path.join('.')}:${selection.focus.path.join(
              '.'
            )}`
      }`
    : 'null';

const isSelectionPathChangeForRoot = (root: string, change: EditorCommit) =>
  isSelectionChangeForRoot(root, change) &&
  getSelectionPathKey(change.selectionBefore, change.selectionBeforeRoot) !==
    getSelectionPathKey(change.selectionAfter, change.selectionAfterRoot);

const topLevelRangesIncludeIndex = (
  ranges: ReadonlyArray<readonly [number, number]>,
  index: number
) => ranges.some(([start, end]) => start <= index && end >= index);

const shouldUpdateRootNodeKeys = (root: string, change?: EditorCommit) =>
  !change || change.changed.has('root-order', toPublicRootOption(root));

const shouldUpdateSelectedTopLevelIndex = (
  root: string,
  change?: EditorCommit
) =>
  !change ||
  isSelectionPathChangeForRoot(root, change) ||
  change.changed.has('root-order', toPublicRootOption(root));

const shouldUpdatePlaceholderValue = (root: string, change?: EditorCommit) => {
  const publicRoot = toPublicRootOption(root);
  const firstTopLevelChanged = change
    ? topLevelRangesIncludeIndex(change.changed.topLevelRanges(publicRoot), 0)
    : false;

  return (
    !change ||
    change.changed.has('root-order', publicRoot) ||
    (change.changed.has('document', publicRoot) && firstTopLevelChanged)
  );
};

const shouldUpdateEditableRootCommit = (root: string, change?: EditorCommit) =>
  !change ||
  change.changed.has('structure', toPublicRootOption(root)) ||
  change.changed.hasAny('state');

const sameNodeKeys = (left: readonly NodeKey[], right: readonly NodeKey[]) =>
  left.length === right.length &&
  left.every((nodeKey, index) => nodeKey === right[index]);

const selectRootNodeKeys = (editor: ReactRuntimeEditor) =>
  editor.read(
    (state) =>
      state.nodes
        .children()
        .map((_node: unknown, index: number) => {
          const path = [index] as Path;

          return state.key(path);
        })
        .filter(Boolean) as NodeKey[]
  );

export const useRootNodeKeys = () => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor: ReactRuntimeEditor) => selectRootNodeKeys(innerEditor),
    []
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateRootNodeKeys(root, change),
    [root]
  );

  return useEditorSelector(selector, {
    equalityFn: (left, right) => left != null && sameNodeKeys(left, right),
    profileId: 'root-node-keys',
    shouldUpdate,
  });
};

export const useTopLevelSelectionIndex = (enabled: boolean) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor3: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = readRuntimeSelection(innerEditor3);
      const indices = selection
        ? SelectionApi.isNode(selection)
          ? selection.paths.map((path) => path[0])
          : [selection.anchor.path[0], selection.focus.path[0]]
        : [];

      if (
        !indices.every((index): index is number => typeof index === 'number')
      ) {
        return null;
      }

      return indices.length > 0 ? Math.min(...indices) : null;
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
    [enabled, root]
  );

  return useEditorSelector(selector, {
    equalityFn: Object.is,
    profileId: 'top-level-selection-index',
    shouldUpdate,
  });
};

const sameSelectionPaths = (
  left: readonly Path[] | null,
  right: readonly Path[] | null
) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every(
      (leftPath, pathIndex) =>
        leftPath.length === right[pathIndex].length &&
        leftPath.every(
          (segment, segmentIndex) => segment === right[pathIndex][segmentIndex]
        )
    ));

export const useSelectionPaths = (enabled: boolean) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor4: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = readRuntimeSelection(innerEditor4);

      if (!selection) {
        return null;
      }

      return SelectionApi.isNode(selection)
        ? selection.paths
        : ([selection.anchor.path, selection.focus.path] as const);
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
    [enabled, root]
  );

  return useEditorSelector(selector, {
    equalityFn: sameSelectionPaths,
    profileId: 'selection-paths',
    shouldUpdate,
  });
};

export const usePlaceholderValue = (placeholder?: ReactNode) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor5: ReactRuntimeEditor) =>
      innerEditor5.read(
        (state) =>
          placeholder &&
          state.nodes.children().length === 1 &&
          Array.from(NodeApi.texts(innerEditor5)).length === 1 &&
          NodeApi.string(innerEditor5) === ''
      )
        ? placeholder
        : undefined,
    [placeholder]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdatePlaceholderValue(root, change),
    [root]
  );

  return useEditorSelector(selector, {
    equalityFn: Object.is,
    profileId: 'placeholder',
    shouldUpdate,
  });
};

export const useEditableRootCommitWakeup = () => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateEditableRootCommit(root, change),
    [root]
  );

  useEditorSelector(
    (innerEditor6) =>
      innerEditor6.read((state) => state.lastCommit()?.version ?? 0),
    {
      equalityFn: Object.is,
      profileId: 'editable-root-commit',
      shouldUpdate,
    }
  );
};
