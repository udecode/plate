import React from 'react';

import { RangeApi } from '../../core';
import {
  type Editor,
  type PliteDecoration,
  type PliteDecorationSource,
  useIsomorphicLayoutEffect,
  usePliteDecorationSource,
} from '../../react/core';
import { PLATE_PLUGIN_DECORATION_SOURCE } from '../../react/internal/PlatePluginDecorationSources';
import type { YjsAwarenessAdapter } from '../core/awareness-adapter';
import { getYjsCursorCache } from './cursor-widget-store';
import type { YjsRemoteCursorDecorationData } from './useYjs';

const KEYED_PROJECTION_DELTA = Symbol.for(
  'plitejs/react/keyed-projection-delta/v1'
);
export const YJS_DECORATION_SOURCE_ID = 'plate-plugin-decorate:yjs';

type YjsDecorationData = {
  readonly [PLATE_PLUGIN_DECORATION_SOURCE]: 'yjs';
  readonly yjsRemoteCursor: YjsRemoteCursorDecorationData;
};

export const createYjsDecorationProjectionList = (
  cache: YjsAwarenessAdapter
) => {
  const indexByClientId = new Map<number, number>();
  let delta: Readonly<{
    changedKeys: readonly string[] | null;
    revision: number;
  }> = Object.freeze({ changedKeys: null, revision: 0 });
  const projections: Array<PliteDecoration<YjsDecorationData>> = [];

  Object.defineProperty(projections, KEYED_PROJECTION_DELTA, {
    get: () => delta,
  });

  const keyFor = (clientId: number) =>
    `${YJS_DECORATION_SOURCE_ID}:${clientId}`;
  const project = (clientId: number): PliteDecoration<YjsDecorationData> => {
    const cursor = cache.remoteCursor(clientId);

    if (!cursor) {
      throw new Error(
        'Expected a remote cursor for every published client ID.'
      );
    }

    const selection =
      cursor.selection && !RangeApi.isCollapsed(cursor.selection)
        ? cursor.selection
        : null;

    return {
      data: {
        [PLATE_PLUGIN_DECORATION_SOURCE]: 'yjs',
        yjsRemoteCursor: {
          clientId,
          cursor,
          ...(cursor.data === undefined ? {} : { data: cursor.data }),
        },
      },
      key: keyFor(clientId),
      // Null is a private inactive projection. Plite keeps its stable key and
      // emits no slices, so clearing a selection stays a one-item update.
      range: selection as NonNullable<typeof selection>,
    };
  };

  const rebuild = () => {
    projections.length = 0;
    indexByClientId.clear();

    cache.remoteCursorIds().forEach((clientId, index) => {
      indexByClientId.set(clientId, index);
      projections.push(project(clientId));
    });
    delta = Object.freeze({
      changedKeys: null,
      revision: delta.revision + 1,
    });
  };

  rebuild();

  return {
    rebuild,
    read: () => projections,
    update(clientId: number) {
      const index = indexByClientId.get(clientId);

      if (index === undefined || cache.remoteCursor(clientId) === null) {
        return false;
      }

      projections[index] = project(clientId);
      delta = Object.freeze({
        changedKeys: Object.freeze([keyFor(clientId)]),
        revision: delta.revision + 1,
      });

      return true;
    },
  };
};

export const subscribeYjsDecorationProjectionList = (
  cache: YjsAwarenessAdapter,
  projectionList: ReturnType<typeof createYjsDecorationProjectionList>,
  refresh: () => void
) => {
  const cursorCleanups = new Map<number, () => void>();
  const syncMembership = () => {
    projectionList.rebuild();
    const currentIds = new Set(cache.remoteCursorIds());

    cursorCleanups.forEach((cleanup, clientId) => {
      if (currentIds.has(clientId)) return;
      cleanup();
      cursorCleanups.delete(clientId);
    });
    currentIds.forEach((clientId) => {
      if (cursorCleanups.has(clientId)) return;
      cursorCleanups.set(
        clientId,
        cache.subscribeCursor(clientId, () => {
          if (projectionList.update(clientId)) refresh();
        })
      );
    });
    refresh();
  };

  syncMembership();
  const unsubscribeIds = cache.subscribeIds(syncMembership);

  return () => {
    unsubscribeIds();
    cursorCleanups.forEach((cleanup) => cleanup());
  };
};

export const YjsPluginDecorationSource = ({
  children,
  editor,
}: {
  children: (source: PliteDecorationSource<any>) => React.ReactNode;
  editor: Editor;
}) => {
  const cache = getYjsCursorCache(editor);
  const [projectionList] = React.useState(() =>
    createYjsDecorationProjectionList(cache)
  );
  const source = usePliteDecorationSource(editor, {
    dirtiness: 'external',
    id: YJS_DECORATION_SOURCE_ID,
    read: projectionList.read,
  });

  useIsomorphicLayoutEffect(() => {
    const refresh = () =>
      source.refresh({
        reason: 'external',
        requiresDOMSelectionExport: editor.api.react.isFocused(),
      });

    return subscribeYjsDecorationProjectionList(cache, projectionList, refresh);
  }, [cache, editor, projectionList, source]);

  return children(source);
};
