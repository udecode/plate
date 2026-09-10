import {
  ElementApi,
  type EditorCommit,
  type Node,
  type Path,
} from '../../../core';
import { useEditor, useEditorRuntimeState } from '../../core';
import { SuggestionPlugin } from './SuggestionPlugin';

const shouldRefreshSuggestionReviews = (change?: EditorCommit) => {
  if (!change) return true;
  if (
    change.changed.hasAny('properties') ||
    change.changed.hasAny('structure') ||
    change.changed.hasAny('replace') ||
    change.changed.hasAny('root-order')
  ) {
    return true;
  }
  if (!change.changed.hasAny('text')) return false;

  const getSnapshotNode = (path: Path) => {
    let children: readonly Node[] = change.after.children;
    let node: Node | undefined;

    for (const index of path) {
      node = children[index];
      if (!node) return undefined;
      children = ElementApi.isElement(node) ? node.children : [];
    }

    return node;
  };

  return change.changed.paths().some((path) => {
    for (let depth = path.length; depth > 0; depth--) {
      const node = getSnapshotNode(path.slice(0, depth));

      if (!node) continue;
      if (Object.keys(node).some((key) => key.startsWith('suggestion_'))) {
        return true;
      }
      if (ElementApi.isElement(node) && typeof node.suggestion === 'object') {
        return true;
      }
    }

    return false;
  });
};

/** Current suggestion groups, refreshed by relevant document changes. */
export function useSuggestionReviews() {
  const editor = useEditor();
  return useEditorRuntimeState(
    editor,
    () => editor.plugin(SuggestionPlugin).read.reviews(),
    { shouldUpdate: shouldRefreshSuggestionReviews }
  );
}
