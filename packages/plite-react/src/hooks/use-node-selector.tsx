import {
  type EditorCommit,
  type Node,
  type Path,
  type NodeKey,
  type Text,
  TextApi,
} from '@platejs/plite';
import { useCallback, useContext } from 'react';

import { NodeKeyContext } from '../context';
import { readNodeByKey } from '../editable/runtime-live-state';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditor } from './use-editor';
import { useEditorSelector } from './use-editor-selector';
import { didSyncTextPathToDOM } from './use-plite-node-ref';

const refEquality = (a: unknown, b: unknown) => a === b;

/** Runtime/node payload passed to node selectors. */
export type EditorNodeSelectorContext = {
  editor: ReactRuntimeEditor;
  node: Node | null;
  path: Path | null;
  nodeKey: NodeKey | null;
};

/** Node selector payload narrowed with the text node when available. */
export type EditorTextSelectorContext = EditorNodeSelectorContext & {
  text: Text | null;
};

/** Update-scoping options for selectors tied to a rendered node key. */
export type EditorRuntimeSelectorOptions = {
  deferred?: boolean;
  includeRootOrderChanges?: boolean;
  nodeKey?: NodeKey | null;
};

type PliteRuntimeSelectorUpdatePolicy =
  | 'model-truth'
  | 'skip-synced-text-render';

type InternalEditorRuntimeSelectorOptions = EditorRuntimeSelectorOptions & {
  updatePolicy?: PliteRuntimeSelectorUpdatePolicy;
};

const shouldUpdateRuntimeNode = (
  editor: ReactRuntimeEditor,
  nodeKey: NodeKey | null,
  change?: EditorCommit,
  updatePolicy: PliteRuntimeSelectorUpdatePolicy = 'model-truth',
  includeRootOrderChanges = false
) => {
  if (
    updatePolicy === 'skip-synced-text-render' &&
    shouldSkipSyncedTextRender(editor, nodeKey, change)
  ) {
    return false;
  }

  if (!nodeKey || !change) {
    return true;
  }

  if (includeRootOrderChanges && change.changed.hasAny('root-order')) {
    return true;
  }

  return (
    change.changed.hasNodeKey(nodeKey, 'node') ||
    change.changed.hasNodeKey(nodeKey, 'path')
  );
};

const isAncestorOrSelfPath = (
  ancestor: readonly number[],
  path: readonly number[]
) =>
  ancestor.length <= path.length &&
  ancestor.every((part, index) => part === path[index]);

const shouldSkipSyncedTextRender = (
  editor: ReactRuntimeEditor,
  nodeKey: NodeKey | null,
  change?: EditorCommit
) => {
  if (
    !change?.changed.hasAny('text') ||
    change.tags.includes('historic') ||
    change.changed.hasAny('structure') ||
    change.changed.hasAny('properties')
  ) {
    return false;
  }

  if (!nodeKey) {
    return false;
  }

  const { path } = readNodeByKey(editor, nodeKey);

  if (!path) {
    return false;
  }

  const relevantTextPaths = change.changed
    .nodeKeys('text')
    .flatMap((textNodeKey) => {
      const textPath = readNodeByKey(editor, textNodeKey).path;

      return textPath && isAncestorOrSelfPath(path, textPath) ? [textPath] : [];
    });

  return relevantTextPaths.every((textPath) =>
    didSyncTextPathToDOM(editor, textPath)
  );
};

function useRuntimeNodeSelector<T>(
  selector: (context: EditorNodeSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  {
    deferred = false,
    includeRootOrderChanges = false,
    nodeKey: nodeKeyProp,
    updatePolicy = 'model-truth',
  }: InternalEditorRuntimeSelectorOptions = {}
): T {
  const editor = useEditor();
  const contextNodeKey = useContext(NodeKeyContext);
  const nodeKey = nodeKeyProp ?? contextNodeKey;
  const nodeSelector = useCallback(
    (editor: ReactRuntimeEditor) => {
      const { node, path } = readNodeByKey(editor, nodeKey);

      return selector({
        editor,
        node,
        path,
        nodeKey,
      });
    },
    [nodeKey, selector]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      shouldUpdateRuntimeNode(
        editor,
        nodeKey,
        change,
        updatePolicy,
        includeRootOrderChanges
      ),
    [editor, includeRootOrderChanges, nodeKey, updatePolicy]
  );

  return useEditorSelector(nodeSelector, {
    deferred,
    equalityFn,
    includeRootOrderChanges,
    profileId: nodeKey ? 'runtime-node' : 'runtime-node-missing-id',
    runtimeEventSource:
      updatePolicy === 'skip-synced-text-render' ? 'render' : 'node',
    nodeKey,
    shouldUpdate,
  });
}

/**
 * Subscribe to the Plite node rendered by the current runtime.
 *
 * Use this from element, leaf, or custom shell renderers that need node, path,
 * runtime, or root metadata without forcing unrelated runtimes to re-render.
 */
export function useNodeSelector<T>(
  selector: (context: EditorNodeSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  options: EditorRuntimeSelectorOptions = {}
): T {
  return useRuntimeNodeSelector(selector, equalityFn, options);
}

export function useMountedNodeRenderSelector<T>(
  selector: (context: EditorNodeSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  options: EditorRuntimeSelectorOptions = {}
): T {
  return useRuntimeNodeSelector(selector, equalityFn, {
    ...options,
    updatePolicy: 'skip-synced-text-render',
  });
}

/**
 * Subscribe to the text node rendered by the current runtime.
 *
 * The selector receives `text` when the runtime owns a Plite text node, or
 * `null` for element runtimes.
 */
export function useTextSelector<T>(
  selector: (context: EditorTextSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  options: EditorRuntimeSelectorOptions = {}
): T {
  const textSelector = useCallback(
    (context: EditorNodeSelectorContext) =>
      selector({
        ...context,
        text:
          context.node && TextApi.isText(context.node) ? context.node : null,
      }),
    [selector]
  );

  return useNodeSelector(textSelector, equalityFn, options);
}

export function useMountedTextRenderSelector<T>(
  selector: (context: EditorTextSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  options: EditorRuntimeSelectorOptions = {}
): T {
  const textSelector = useCallback(
    (context: EditorNodeSelectorContext) =>
      selector({
        ...context,
        text:
          context.node && TextApi.isText(context.node) ? context.node : null,
      }),
    [selector]
  );

  return useMountedNodeRenderSelector(textSelector, equalityFn, options);
}
