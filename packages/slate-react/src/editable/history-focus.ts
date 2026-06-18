import type { Path, RootKey } from '@platejs/slate';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';

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
  const focusRoot =
    historyRoot && isOwnerForRoot(currentOwner, currentRoot)
      ? historyRoot
      : (selectionRoot ?? historyRoot ?? currentRoot ?? fallbackRoot);

  return getMountedViewEditor?.(focusRoot) ?? editor;
};
