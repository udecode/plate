import type { ReactRuntimeEditor } from '../plugin/react-editor';

const getLastCommit = (editor: ReactRuntimeEditor) =>
  editor.read((state) => state.lastCommit());

export const shouldSkipSelectionScroll = (editor: ReactRuntimeEditor) => {
  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-scroll-into-view'));
};

export const shouldSkipDOMSelection = (editor: ReactRuntimeEditor) => {
  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-dom-selection'));
};

export const shouldSkipSelectionFocus = (editor: ReactRuntimeEditor) => {
  const commit = getLastCommit(editor);

  return Boolean(commit?.tags.includes('skip-selection-focus'));
};
