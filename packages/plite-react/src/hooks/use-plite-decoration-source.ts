import { useEffect, useMemo, useState } from 'react';
import type { Editor as EditorType } from '@platejs/plite';

import {
  createDecorationSource,
  type PliteDecorationSource,
  type PliteDecorationSourceOptions,
  type PliteRangeDecorationSourceOptions,
  toPliteRangeDecorations,
} from '../decoration-source';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type {
  PliteSourceDirtiness,
  PliteSourceDirtinessClass,
} from '../projection-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Hook options for computed decoration sources. */
export type UsePliteDecorationSourceOptions<T = unknown> =
  PliteDecorationSourceOptions<T> & {
    /** Explicit invalidation token for mutable data read by option callbacks. */
    revision?: unknown;
  };

/** Hook options for range-backed decoration sources. */
export type UsePliteRangeDecorationSourceOptions<T = unknown> =
  PliteRangeDecorationSourceOptions<T> & {
    /** Explicit invalidation token for mutable data read by option callbacks. */
    revision?: unknown;
  };

const DIRTINESS_CLASSES = [
  'always',
  'selection',
  'text',
  'mark',
  'node',
  'annotation',
  'external',
] as const satisfies readonly PliteSourceDirtinessClass[];

const getDirtinessIdentity = (dirtiness: PliteSourceDirtiness | undefined) => {
  if (!Array.isArray(dirtiness)) {
    return dirtiness;
  }

  return DIRTINESS_CLASSES.reduce(
    (identity, dirtinessClass, index) =>
      dirtiness.includes(dirtinessClass) ? identity | (1 << index) : identity,
    0
  );
};

const getDirtinessFromIdentity = (
  identity: ReturnType<typeof getDirtinessIdentity>
): PliteSourceDirtiness | undefined => {
  if (typeof identity !== 'number') {
    return identity;
  }

  return DIRTINESS_CLASSES.filter(
    (_dirtinessClass, index) => (identity & (1 << index)) !== 0
  );
};

const useStableDirtiness = (dirtiness: PliteSourceDirtiness | undefined) => {
  const dirtinessIdentity = getDirtinessIdentity(dirtiness);

  // Preserve source identity for structurally equal inline class lists.
  return useMemo(
    () => getDirtinessFromIdentity(dirtinessIdentity),
    [dirtinessIdentity]
  );
};

const isReactEditorFocused = (editor: EditorType) =>
  ReactEditor.isFocused(editor as unknown as ReactRuntimeEditor);

const createDecorationSourceLifecycle = <T>() => {
  let currentSource: PliteDecorationSource<T> | null = null;
  let effectVersion = 0;

  return {
    mount(source: PliteDecorationSource<T>) {
      currentSource = source;
      const mountedVersion = ++effectVersion;

      return () => {
        queueMicrotask(() => {
          if (currentSource !== source || effectVersion === mountedVersion) {
            source.destroy();
          }
        });
      };
    },
  };
};

const useDecorationSourceLifecycle = <T>(source: PliteDecorationSource<T>) => {
  const [lifecycle] = useState(createDecorationSourceLifecycle<T>);

  useEffect(() => lifecycle.mount(source), [lifecycle, source]);
};

const useDecorationSourceCommit = <T>(
  editor: EditorType,
  source: PliteDecorationSource<T>,
  options:
    | UsePliteDecorationSourceOptions<T>
    | UsePliteRangeDecorationSourceOptions<T>,
  optionsCell: {
    current:
      | UsePliteDecorationSourceOptions<T>
      | UsePliteRangeDecorationSourceOptions<T>;
  }
) => {
  const [commit] = useState<{
    revision: unknown;
    source: PliteDecorationSource<T> | null;
  }>(() => ({
    revision: Symbol('uninitialized'),
    source: null,
  }));

  useIsomorphicLayoutEffect(() => {
    optionsCell.current = options;
    const shouldRefresh =
      commit.source !== source || !Object.is(commit.revision, options.revision);

    commit.revision = options.revision;
    commit.source = source;

    if (shouldRefresh) {
      source.refresh({
        forceInvalidate: true,
        reason: 'external',
        requiresDOMSelectionExport: isReactEditorFocused(editor),
      });
    }
  });
};

/**
 * Creates and owns a decoration source for computed editor decorations.
 *
 * Pass `revision` when callbacks read a mutable external source.
 */
export const usePliteDecorationSource = <T = unknown>(
  editor: EditorType,
  options: UsePliteDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const [optionsCell] = useState(() => ({ current: options }));
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const hasRuntimeScope = options.runtimeScope !== undefined;

  const source = useMemo(
    () =>
      createDecorationSource<T>(editor, {
        dirtiness,
        id: optionsId,
        onError: (error) => optionsCell.current.onError?.(error),
        read: (context) => optionsCell.current.read(context),
        runtimeScope: hasRuntimeScope
          ? (context) => {
              const runtimeScope = optionsCell.current.runtimeScope;

              if (!runtimeScope) {
                return null;
              }

              return typeof runtimeScope === 'function'
                ? runtimeScope(context)
                : runtimeScope;
            }
          : undefined,
      }),
    [dirtiness, editor, hasRuntimeScope, optionsCell, optionsId]
  );

  useDecorationSourceLifecycle(source);
  useDecorationSourceCommit(editor, source, options, optionsCell);

  return source;
};

/**
 * Creates and owns a decoration source from Plite ranges, converting them into
 * keyed decorations for the projection store.
 */
export const usePliteRangeDecorationSource = <T = unknown>(
  editor: EditorType,
  options: UsePliteRangeDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const [optionsCell] = useState(() => ({ current: options }));
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const hasRuntimeScope = options.runtimeScope !== undefined;

  const source = useMemo(
    () =>
      createDecorationSource<T>(editor, {
        dirtiness,
        id: optionsId,
        onError: (error) => optionsCell.current.onError?.(error),
        read: (context) =>
          toPliteRangeDecorations(optionsCell.current.read(context), {
            data: optionsCell.current.data,
            id: optionsId,
          }),
        runtimeScope: hasRuntimeScope
          ? (context) => {
              const runtimeScope = optionsCell.current.runtimeScope;

              if (!runtimeScope) {
                return null;
              }

              return typeof runtimeScope === 'function'
                ? runtimeScope(context)
                : runtimeScope;
            }
          : undefined,
      }),
    [dirtiness, editor, hasRuntimeScope, optionsCell, optionsId]
  );

  useDecorationSourceLifecycle(source);
  useDecorationSourceCommit(editor, source, options, optionsCell);

  return source;
};
