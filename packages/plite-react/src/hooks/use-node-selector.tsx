import { useCallback, useContext } from 'react';
import {
  type EditorCommit,
  type Node,
  type Operation,
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

const includesRuntimeId = (
  runtimeIds: readonly RuntimeId[] | null | undefined,
  runtimeId: RuntimeId
) => Array.isArray(runtimeIds) && runtimeIds.includes(runtimeId);

const shouldSkipPathOnlyTopLevelOrderRender = (
  runtimeId: RuntimeId | null,
  change?: EditorCommit
) => {
  if (
    !runtimeId ||
    !change?.topLevelOrderChanged ||
    change.fullDocumentChanged ||
    !Array.isArray(change.touchedRuntimeIds)
  ) {
    return false;
  }

  return (
    !includesRuntimeId(change.touchedRuntimeIds, runtimeId) &&
    !includesRuntimeId(change.selectionImpactRuntimeIds, runtimeId) &&
    !includesRuntimeId(change.dirtyTextRuntimeIds, runtimeId) &&
    !includesRuntimeId(change.dirtyElementRuntimeIds, runtimeId) &&
    !includesRuntimeId(change.structuralDirtyRuntimeIds, runtimeId)
  );
};

const shouldUpdateRuntimeNode = (
  editor: ReactRuntimeEditor,
  runtimeId: RuntimeId | null,
  operations?: readonly Operation[],
  change?: EditorCommit,
  updatePolicy: PliteRuntimeSelectorUpdatePolicy = 'model-truth',
  includeRootOrderChanges = false
) => {
  if (
    updatePolicy === 'skip-synced-text-render' &&
    shouldSkipSyncedTextRender(editor, runtimeId, operations)
  ) {
    return false;
  }

  if (!runtimeId || !change) {
    return true;
  }

  if (
    updatePolicy === 'skip-synced-text-render' &&
    shouldSkipPathOnlyTopLevelOrderRender(runtimeId, change)
  ) {
    return false;
  }

  if (change.nodeImpactRuntimeIds === null) {
    return true;
  }

  if (includeRootOrderChanges && change.topLevelOrderChanged) {
    return true;
  }

  return change.nodeImpactRuntimeIds.includes(runtimeId);
};

const isTextRenderOperation = (operation: Operation) =>
  operation.type === 'insert_text' ||
  operation.type === 'remove_text' ||
  operation.type === 'set_selection';

const isTextOperation = (
  operation: Operation
): operation is Extract<Operation, { type: 'insert_text' | 'remove_text' }> =>
  operation.type === 'insert_text' || operation.type === 'remove_text';

const isAncestorOrSelfPath = (
  ancestor: readonly number[],
  path: readonly number[]
) =>
  ancestor.length <= path.length &&
  ancestor.every((part, index) => part === path[index]);

const shouldSkipSyncedTextRender = (
  editor: ReactRuntimeEditor,
  runtimeId: RuntimeId | null,
  operations?: readonly Operation[]
) => {
  if (
    !operations ||
    operations.length === 0 ||
    !operations.every(isTextRenderOperation)
  ) {
    return false;
  }

  const textOperations = operations.filter(isTextOperation);

  if (textOperations.length === 0) {
    return true;
  }

  if (!runtimeId) {
    return false;
  }

  const { path } = readRuntimeNodeById(editor, runtimeId);

  if (!path) {
    return false;
  }

  const relevantTextOperations = textOperations.filter((operation) =>
    isAncestorOrSelfPath(path, operation.path)
  );

  return (
    relevantTextOperations.length === 0 ||
    relevantTextOperations.every((operation) =>
      didSyncTextPathToDOM(editor, operation.path)
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
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdateRuntimeNode(
        editor,
        runtimeId,
        operations,
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
