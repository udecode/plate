import { useCallback, useContext } from 'react';
import {
  type EditorCommit,
  type Node,
  type Path,
  type RuntimeId,
  type Text,
  TextApi,
} from '@platejs/plite';
import { NodeRuntimeIdContext } from '../context';
import { readRuntimeNodeById } from '../editable/runtime-live-state';
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
  runtimeId: RuntimeId | null;
};

/** Node selector payload narrowed with the text node when available. */
export type EditorTextSelectorContext = EditorNodeSelectorContext & {
  text: Text | null;
};

/** Update-scoping options for selectors tied to a rendered runtime id. */
export type EditorRuntimeSelectorOptions = {
  deferred?: boolean;
  includeRootOrderChanges?: boolean;
  runtimeId?: RuntimeId | null;
};

type PliteRuntimeSelectorUpdatePolicy =
  | 'model-truth'
  | 'skip-synced-text-render';

type InternalEditorRuntimeSelectorOptions = EditorRuntimeSelectorOptions & {
  updatePolicy?: PliteRuntimeSelectorUpdatePolicy;
};

const shouldUpdateRuntimeNode = (
  editor: ReactRuntimeEditor,
  runtimeId: RuntimeId | null,
  change?: EditorCommit,
  updatePolicy: PliteRuntimeSelectorUpdatePolicy = 'model-truth',
  includeRootOrderChanges = false
) => {
  if (
    updatePolicy === 'skip-synced-text-render' &&
    shouldSkipSyncedTextRender(editor, runtimeId, change)
  ) {
    return false;
  }

  if (!runtimeId || !change) {
    return true;
  }

  if (includeRootOrderChanges && change.changed.hasAny('root-order')) {
    return true;
  }

  return (
    change.changed.hasRuntime(runtimeId, 'node') ||
    change.changed.hasRuntime(runtimeId, 'path')
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
  runtimeId: RuntimeId | null,
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

  if (!runtimeId) {
    return false;
  }

  const { path } = readRuntimeNodeById(editor, runtimeId);

  if (!path) {
    return false;
  }

  const relevantTextPaths = change.changed
    .runtimeIds('text')
    .flatMap((textRuntimeId) => {
      const textPath = readRuntimeNodeById(editor, textRuntimeId).path;

      return textPath && isAncestorOrSelfPath(path, textPath) ? [textPath] : [];
    });

  return (
    relevantTextPaths.length === 0 ||
    relevantTextPaths.every((textPath) =>
      didSyncTextPathToDOM(editor, textPath)
    )
  );
};

function useRuntimeNodeSelector<T>(
  selector: (context: EditorNodeSelectorContext) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  {
    deferred = false,
    includeRootOrderChanges = false,
    runtimeId: runtimeIdProp,
    updatePolicy = 'model-truth',
  }: InternalEditorRuntimeSelectorOptions = {}
): T {
  const editor = useEditor<ReactRuntimeEditor>();
  const contextRuntimeId = useContext(NodeRuntimeIdContext);
  const runtimeId = runtimeIdProp ?? contextRuntimeId;
  const nodeSelector = useCallback(
    (editor: ReactRuntimeEditor) => {
      const { node, path } = readRuntimeNodeById(editor, runtimeId);

      return selector({
        editor,
        node,
        path,
        runtimeId,
      });
    },
    [runtimeId, selector]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      shouldUpdateRuntimeNode(
        editor,
        runtimeId,
        change,
        updatePolicy,
        includeRootOrderChanges
      ),
    [editor, includeRootOrderChanges, runtimeId, updatePolicy]
  );

  return useEditorSelector(nodeSelector, equalityFn, {
    deferred,
    includeRootOrderChanges,
    profileId: runtimeId ? 'runtime-node' : 'runtime-node-missing-id',
    runtimeEventSource:
      updatePolicy === 'skip-synced-text-render' ? 'render' : 'node',
    runtimeId,
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
