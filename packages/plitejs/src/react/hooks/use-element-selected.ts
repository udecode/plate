import { useCallback, useContext, useSyncExternalStore } from 'react';

import {
  type EditorCommit,
  type NodeKey,
  type Path,
  PathApi,
  RangeApi,
  SelectionApi,
} from '../..';
import { readAuthoredFragmentView } from '../../core/authored-runtime';
import { ElementContext, PliteContentRootOwnerContext } from '../context';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
} from '../editable/runtime-editor-api';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  getPliteViewBoundaryOwnerKey,
  resolvePliteViewBoundarySegmentEndpoint,
} from '../view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from '../view-selection';
import { useEditorContext } from './use-editor-context';
import { useEditorSelector } from './use-editor-selector';

/** Selection match mode for `useElementSelected`. */
export type UseElementSelectedMode = 'collapsed' | 'intersects' | 'node';

/** Options for selecting the context element or an explicit element path. */
export type UseElementSelectedOptions = {
  at?: NodeKey | Path | null;
  mode?: UseElementSelectedMode;
};

/**
 * Subscribe to whether an element path matches the current view's selection,
 * including retained content in a mounted markup view.
 */
export const useElementSelected = ({
  at,
  mode = 'intersects',
}: UseElementSelectedOptions = {}): boolean => {
  const editor = useEditorContext();
  const owner = useContext(PliteContentRootOwnerContext);
  const context = useContext(ElementContext);
  const element = context?.element ?? null;
  const contextNodeKey = context?.nodeKey ?? null;
  const explicitNodeKey = typeof at === 'string' ? at : null;
  const explicitPath = Array.isArray(at) ? at : null;
  const watchedNodeKey =
    explicitNodeKey ?? (explicitPath ? null : contextNodeKey);

  const resolvePath = useCallback(
    (current: ReactRuntimeEditor) => {
      const path =
        explicitPath ??
        (watchedNodeKey
          ? editorGetPathByNodeKey(current, watchedNodeKey)
          : null) ??
        (element ? ReactEditor.resolvePath(current, element) : null);
      return path && editorHasPath(current, path) ? path : null;
    },
    [element, explicitPath, watchedNodeKey]
  );
  const selector = useCallback(
    (current: ReactRuntimeEditor) => {
      const selectedPath = resolvePath(current);
      if (!selectedPath) return false;
      const selection = readRuntimeSelection(current);
      if (!selection) return false;
      if (mode === 'node') {
        return (
          SelectionApi.isNode(selection) &&
          selection.paths.some((candidatePath) =>
            PathApi.equals(candidatePath, selectedPath)
          )
        );
      }
      if (mode === 'collapsed' && !current.read.selection.isCollapsed()) {
        return false;
      }

      return current.read.selection.intersects(selectedPath);
    },
    [mode, resolvePath]
  );

  const readProjectedSelection = useCallback(() => {
    const selection = readPliteViewSelection(editor);
    if (!selection) return null;
    const selectedPath = resolvePath(editor);
    if (
      !selectedPath ||
      mode === 'node' ||
      (mode === 'collapsed' && !isPliteViewSelectionCollapsed(selection))
    ) {
      return false;
    }
    const root = editor.read.view.root() ?? 'main';
    const fragmentId = readAuthoredFragmentView(editor)?.fragment.id ?? null;
    const ownerKey = owner ? getPliteViewBoundaryOwnerKey(owner) : null;
    const roots = { [root]: editor.read.children() };
    return selection.segments.parts.some((segment) => {
      if (
        segment.root !== root ||
        segment.ownerKey !== ownerKey ||
        (segment.fragment?.id ?? null) !== fragmentId
      ) {
        return false;
      }
      const anchor = resolvePliteViewBoundarySegmentEndpoint(
        roots,
        segment,
        segment.start
      );
      const focus = resolvePliteViewBoundarySegmentEndpoint(
        roots,
        segment,
        segment.end
      );
      return (
        !!anchor &&
        !!focus &&
        RangeApi.includes({ anchor, focus }, selectedPath)
      );
    });
  }, [editor, mode, owner, resolvePath]);
  const projected = useSyncExternalStore(
    useCallback(
      (notify) => subscribePliteViewSelection(editor, notify),
      [editor]
    ),
    readProjectedSelection,
    readProjectedSelection
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (explicitPath) {
        return (
          !change ||
          change.selectionChanged ||
          change.changed.hasAny('structure') ||
          change.changed.hasAny('root-order')
        );
      }

      if (!watchedNodeKey || !change) {
        return true;
      }

      return (
        change.changed.hasNodeKey(watchedNodeKey, 'selection') ||
        change.changed.hasNodeKey(watchedNodeKey, 'path')
      );
    },
    [explicitPath, watchedNodeKey]
  );

  const selected = useEditorSelector(selector, {
    deferred: true,
    nodeKey: explicitPath ? null : watchedNodeKey,
    profileId: 'element-selected',
    runtimeEventSource: 'selection',
    shouldUpdate,
  });
  return projected ?? selected;
};
