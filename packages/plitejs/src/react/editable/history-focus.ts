import type { EditorCommit, Path, RootKey } from '../..';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';
import type { EditableRepairRequest } from './mutation-controller';
import { shouldForceRenderAfterModelOwnedHistory } from './mutation-history';
import {
  getEditorRuntimeOwner,
  getEditorSelectionRoot,
  getInternalDocumentChangeRootKeys,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

export type HistoryContentRootOwner = {
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
};

export type HistoryFocusOwnerApi = {
  getActiveContentRootOwner?: (root: RootKey) => HistoryContentRootOwner | null;
  getContentRootOwnerViewEditor?: (
    owner: HistoryContentRootOwner
  ) => ReactRuntimeEditor | null;
  getMountedViewEditor?: (root: RootKey) => ReactRuntimeEditor | null;
};

export const resolveHistoryFocusEditor = ({
  currentRoot,
  editor,
  fallbackRoot = MAIN_ROOT_KEY,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  historyRoot,
  selectionRoot,
}: HistoryFocusOwnerApi & {
  currentRoot?: RootKey | null;
  editor: ReactRuntimeEditor;
  fallbackRoot?: RootKey;
  historyRoot?: RootKey | null;
  selectionRoot?: RootKey | null;
}) => {
  const ownerOf = (root: RootKey) => {
    const owner = getActiveContentRootOwner?.(root);

    return owner?.childRoot === root ? owner : null;
  };
  const viewOf = (root: RootKey, owner: HistoryContentRootOwner | null) =>
    (owner ? getContentRootOwnerViewEditor?.(owner) : null) ??
    getMountedViewEditor?.(root) ??
    editor;

  if (selectionRoot) return viewOf(selectionRoot, ownerOf(selectionRoot));
  if (!historyRoot) return viewOf(currentRoot ?? fallbackRoot, null);

  const historyOwner = ownerOf(historyRoot);

  if (historyOwner) return viewOf(historyRoot, historyOwner);

  const currentOwner = currentRoot ? ownerOf(currentRoot) : null;

  return viewOf(
    historyRoot,
    currentOwner?.ownerRoot === historyRoot ? currentOwner : null
  );
};

const getChangedRoot = (changes: EditorCommit['changes']): RootKey | null => {
  const createdOrDeleted = new Set<RootKey>([
    ...changes.createRoots,
    ...changes.deleteRoots,
  ]);
  const changed = getInternalDocumentChangeRootKeys(changes);
  const surviving = changed.filter((root) => !createdOrDeleted.has(root));
  const onlyRoot = (roots: Iterable<RootKey>) => {
    const unique = new Set(roots);

    return unique.size === 1 ? (unique.values().next().value ?? null) : null;
  };

  if (surviving.length > 0) return onlyRoot(surviving);

  return onlyRoot([...changed, ...createdOrDeleted]);
};

export const getModelOwnedHistoryFocusRepair = ({
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
  replayChanges,
}: {
  editor: ReactRuntimeEditor;
  replayChanges: EditorCommit['changes'] | null;
} & HistoryFocusOwnerApi): {
  focusEditor?: ReactRuntimeEditor;
  repair?: EditableRepairRequest;
} => {
  const shouldForceRender = shouldForceRenderAfterModelOwnedHistory(editor);
  const selectionRoot = readRuntimeSelection(getEditorRuntimeOwner(editor))
    ? getEditorSelectionRoot(editor)
    : null;
  const currentRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const focusEditor = resolveHistoryFocusEditor({
    currentRoot,
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    historyRoot: replayChanges ? getChangedRoot(replayChanges) : null,
    selectionRoot,
  });

  if (focusEditor !== editor) {
    return {
      focusEditor,
      repair: { forceRender: true, kind: 'force-render' },
    };
  }

  const viewSelection = readPliteViewSelection(editor);

  if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
    return shouldForceRender
      ? { repair: { forceRender: true, kind: 'force-render' } }
      : {};
  }

  return {
    repair: {
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    },
  };
};
