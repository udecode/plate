import type { Editor as EditorType, Value } from '@platejs/plite';
import { useEffect, useMemo, useRef, useState } from 'react';

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
export type UsePliteDecorationSourceOptions<
  T = unknown,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = PliteDecorationSourceOptions<T, V, TExtensions> & {
  /** Explicit invalidation token for mutable data read by option callbacks. */
  revision?: unknown;
};

/** Hook options for range-backed decoration sources. */
export type UsePliteRangeDecorationSourceOptions<
  T = unknown,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = PliteRangeDecorationSourceOptions<T, V, TExtensions> & {
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

const createCommittedValue = <T>(initialValue: T) => {
  let value = initialValue;

  return {
    commit(nextValue: T) {
      value = nextValue;
    },
    read() {
      return value;
    },
  };
};

const useStableDirtiness = (dirtiness: PliteSourceDirtiness | undefined) => {
  const dirtinessIdentity = getDirtinessIdentity(dirtiness);

  // Preserve source identity for structurally equal inline class lists.
  return useMemo(
    () => getDirtinessFromIdentity(dirtinessIdentity),
    [dirtinessIdentity]
  );
};

const isReactEditorFocused = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: EditorType<V, TExtensions>
) => ReactEditor.isFocused(editor as unknown as ReactRuntimeEditor);

const createDecorationSourceLifecycle = <T>() => {
  let currentSource: PliteDecorationSource<T> | null = null;
  let effectVersion = 0;

  return {
    mount(source: PliteDecorationSource<T>) {
      currentSource = source;
      effectVersion += 1;
      const mountedVersion = effectVersion;

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

const useDecorationSourceCommit = <
  T,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: EditorType<V, TExtensions>,
  source: PliteDecorationSource<T>,
  revision: unknown
) => {
  const commitRef = useRef<{
    revision: unknown;
    source: PliteDecorationSource<T> | null;
  }>({
    revision: Symbol('uninitialized'),
    source: null,
  });

  useIsomorphicLayoutEffect(() => {
    const commit = commitRef.current;
    const shouldRefresh =
      commit.source !== source || !Object.is(commit.revision, revision);

    commit.revision = revision;
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
export const usePliteDecorationSource = <
  V extends Value,
  TExtensions extends readonly unknown[],
  T = unknown,
>(
  editor: EditorType<V, TExtensions>,
  options: UsePliteDecorationSourceOptions<T, V, TExtensions>
): PliteDecorationSource<T> => {
  const [optionsCell] = useState(() => createCommittedValue(options));
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const hasRuntimeScope = options.runtimeScope !== undefined;

  const source = useMemo(
    () =>
      createDecorationSource<V, TExtensions, T>(editor, {
        dirtiness,
        id: optionsId,
        onError: (error) => optionsCell.read().onError?.(error),
        read: (context) => optionsCell.read().read(context),
        runtimeScope: hasRuntimeScope
          ? (context) => {
              const { runtimeScope } = optionsCell.read();

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
  useIsomorphicLayoutEffect(() => {
    optionsCell.commit(options);
  });
  useDecorationSourceCommit(editor, source, options.revision);

  return source;
};

/**
 * Creates and owns a decoration source from Plite ranges, converting them into
 * keyed decorations for the projection store.
 */
export const usePliteRangeDecorationSource = <
  V extends Value,
  TExtensions extends readonly unknown[],
  T = unknown,
>(
  editor: EditorType<V, TExtensions>,
  options: UsePliteRangeDecorationSourceOptions<T, V, TExtensions>
): PliteDecorationSource<T> => {
  const [optionsCell] = useState(() => createCommittedValue(options));
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const hasRuntimeScope = options.runtimeScope !== undefined;

  const source = useMemo(
    () =>
      createDecorationSource<V, TExtensions, T>(editor, {
        dirtiness,
        id: optionsId,
        onError: (error) => optionsCell.read().onError?.(error),
        read: (context) =>
          toPliteRangeDecorations(optionsCell.read().read(context), {
            data: optionsCell.read().data,
            id: optionsId,
          }),
        runtimeScope: hasRuntimeScope
          ? (context) => {
              const { runtimeScope } = optionsCell.read();

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
  useIsomorphicLayoutEffect(() => {
    optionsCell.commit(options);
  });
  useDecorationSourceCommit(editor, source, options.revision);

  return source;
};
