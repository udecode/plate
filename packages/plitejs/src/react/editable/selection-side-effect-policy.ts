import { isPliteInactiveSelectionVisible } from '../inactive-selection';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

const getLastCommit = (editor: ReactRuntimeEditor) =>
  editor.read((state) => state.lastCommit());

export const shouldSkipSelectionScroll = (editor: ReactRuntimeEditor) => {
  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-scroll-into-view'));
};

export const shouldSkipDOMSelection = (
  editor: ReactRuntimeEditor,
  { force = false }: { force?: boolean } = {}
) => {
  if (isPliteInactiveSelectionVisible(editor)) return true;
  if (force) return false;

  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-dom-selection'));
};

export const shouldSkipSelectionFocus = (editor: ReactRuntimeEditor) => {
  if (isPliteInactiveSelectionVisible(editor)) return true;

  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-selection-focus'));
};
