import { useEffect, useMemo, useRef } from 'react';
import type { Editor as PliteEditor } from '@platejs/plite';

import {
  createDecorationSource,
  type PliteDecorationSource,
  type PliteDecorationSourceOptions,
  type PliteRangeDecorationSourceOptions,
  toPliteRangeDecorations,
} from '../decoration-source';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { PliteSourceDirtiness } from '../projection-store';

/** Hook options for computed decoration sources. */
export type UsePliteDecorationSourceOptions<T = unknown> =
  PliteDecorationSourceOptions<T> & {
    /**
     * Controls when the hook refreshes the source for inline option closures.
     */
    deps?: readonly unknown[];
  };

/** Hook options for range-backed decoration sources. */
export type UsePliteRangeDecorationSourceOptions<T = unknown> =
  PliteRangeDecorationSourceOptions<T> & {
    /**
     * Controls when the hook refreshes the source for inline option closures.
     */
    deps?: readonly unknown[];
  };

const getDirtinessIdentity = (dirtiness: PliteSourceDirtiness | undefined) => {
  if (!Array.isArray(dirtiness)) {
    return dirtiness;
  }

  return `list:${[...new Set(dirtiness)].sort().join('|')}`;
};

const useStableDirtiness = (dirtiness: PliteSourceDirtiness | undefined) => {
  const dirtinessIdentity = getDirtinessIdentity(dirtiness);

  // Structural dirtiness owns source identity for inline class lists.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => dirtiness, [dirtinessIdentity]);
};

const isReactEditorFocused = (editor: PliteEditor) =>
  ReactEditor.isFocused(editor as unknown as ReactRuntimeEditor);

const useDecorationSourceLifecycle = <T>(source: PliteDecorationSource<T>) => {
  const sourceRef = useRef(source);
  const effectVersionRef = useRef(0);

  sourceRef.current = source;

  useEffect(() => {
    const effectVersion = ++effectVersionRef.current;

    return () => {
      queueMicrotask(() => {
        if (
          sourceRef.current !== source ||
          effectVersionRef.current === effectVersion
        ) {
          source.destroy();
        }
      });
    };
  }, [source]);
};

/**
 * Creates and owns a decoration source for computed editor decorations.
 *
 * Pass `deps` when the source options close over changing values.
 */
export const usePliteDecorationSource = <T = unknown>(
  editor: PliteEditor,
  options: UsePliteDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const optionsCell = useRef(options);
  optionsCell.current = options;
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const refreshDeps = options.deps ?? [options];
  const runtimeScope = options.runtimeScope;

  const source = useMemo(
    () =>
      createDecorationSource<T>(editor, {
        dirtiness,
        id: optionsId,
        read: (context) => optionsCell.current.read(context),
        runtimeScope: runtimeScope
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
    [dirtiness, editor, optionsCell, optionsId, runtimeScope]
  );

  useDecorationSourceLifecycle(source);
  useEffect(() => {
    source.refresh({
      forceInvalidate: true,
      reason: 'external',
      requiresDOMSelectionExport: isReactEditorFocused(editor),
    });
    // `deps` intentionally owns inline option closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refreshDeps);

  return source;
};

/**
 * Creates and owns a decoration source from Plite ranges, converting them into
 * keyed decorations for the projection store.
 */
export const usePliteRangeDecorationSource = <T = unknown>(
  editor: PliteEditor,
  options: UsePliteRangeDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const optionsCell = useRef(options);
  optionsCell.current = options;
  const optionsId = options.id;
  const dirtiness = useStableDirtiness(options.dirtiness);
  const refreshDeps = options.deps ?? [options];
  const runtimeScope = options.runtimeScope;

  const source = useMemo(
    () =>
      createDecorationSource<T>(editor, {
        dirtiness,
        id: optionsId,
        read: (context) =>
          toPliteRangeDecorations(optionsCell.current.read(context), {
            data: optionsCell.current.data,
            id: optionsId,
          }),
        runtimeScope: runtimeScope
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
    [dirtiness, editor, optionsCell, optionsId, runtimeScope]
  );

  useDecorationSourceLifecycle(source);
  useEffect(() => {
    source.refresh({
      forceInvalidate: true,
      reason: 'external',
      requiresDOMSelectionExport: isReactEditorFocused(editor),
    });
    // `deps` intentionally owns inline option closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refreshDeps);

  return source;
};
