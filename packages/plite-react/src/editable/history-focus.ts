import type { Path, RootKey } from '@platejs/plite';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';
import type { EditableRepairRequest } from './mutation-controller';
import {
  consumeModelOwnedHistoryFocusRoot,
  shouldForceRenderAfterModelOwnedHistory,
} from './mutation-history';
import {
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

const isOwnerForRoot = (
  owner: HistoryContentRootOwner | null | undefined,
  root: RootKey | null | undefined
) => Boolean(owner && root && owner.childRoot === root);

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
  const historyOwner = historyRoot
    ? getActiveContentRootOwner?.(historyRoot)
    : null;

  if (historyOwner && historyRoot && historyOwner.childRoot === historyRoot) {
    return (
      getContentRootOwnerViewEditor?.(historyOwner) ??
      getMountedViewEditor?.(historyRoot) ??
      editor
    );
  }

  const currentOwner = currentRoot
    ? getActiveContentRootOwner?.(currentRoot)
    : null;

  if (
    historyRoot &&
    currentOwner &&
    historyRoot === currentOwner.ownerRoot &&
    isOwnerForRoot(currentOwner, currentRoot)
  ) {
    return (
      getContentRootOwnerViewEditor?.(currentOwner) ??
      getMountedViewEditor?.(historyRoot) ??
      editor
    );
  }

  const focusRoot =
    historyRoot && isOwnerForRoot(currentOwner, currentRoot)
      ? historyRoot
      : (selectionRoot ?? historyRoot ?? currentRoot ?? fallbackRoot);

  return getMountedViewEditor?.(focusRoot) ?? editor;
};

const getLastCommitSingleChangedRoot = (
  editor: ReactRuntimeEditor
): RootKey | null => {
  const commit = editor.read((state) => state.lastCommit());
  const roots = new Set<RootKey>([
    ...(commit ? getInternalDocumentChangeRootKeys(commit.changes) : []),
    ...(commit?.changes.createRoots ?? []),
    ...(commit?.changes.deleteRoots ?? []),
  ]);

  return roots.size === 1 ? (roots.values().next().value ?? null) : null;
};

export const getModelOwnedHistoryFocusRepair = ({
  editor,
  getActiveContentRootOwner,
  getContentRootOwnerViewEditor,
  getMountedViewEditor,
}: {
  editor: ReactRuntimeEditor;
} & HistoryFocusOwnerApi): {
  focusEditor?: ReactRuntimeEditor;
  repair?: EditableRepairRequest;
} => {
  const shouldForceRender = shouldForceRenderAfterModelOwnedHistory(editor);
  const historyFocusRoot = consumeModelOwnedHistoryFocusRoot(editor);
  const selection = readRuntimeSelection(editor);
  const selectionRoot = selection
    ? (selection.anchor.root ?? selection.focus.root ?? MAIN_ROOT_KEY)
    : null;
  const currentRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const focusEditor = resolveHistoryFocusEditor({
    currentRoot,
    editor,
    getActiveContentRootOwner,
    getContentRootOwnerViewEditor,
    getMountedViewEditor,
    historyRoot: historyFocusRoot ?? getLastCommitSingleChangedRoot(editor),
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
