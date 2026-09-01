import { RangeApi, TextApi } from '../../core';
import { type Editor, toPlatePlugin } from '../../react/core';
import { setPlatePluginDecorationSourceComponent } from '../../react/internal/PlatePluginDecorationSources';
import { BaseYjsPlugin } from '../BaseYjsPlugin';
import { getYjsRemoteCursorsAtPath } from '../core/awareness-adapter';
import { getYjsCursorCache } from './cursor-widget-store';
import { YjsPluginDecorationSource } from './yjs-decoration-source.internal';

const decorateYjsRemoteCursor = setPlatePluginDecorationSourceComponent(
  ({
    editor,
    entry: [node, path],
  }: {
    editor: Editor;
    entry: readonly [unknown, readonly number[]];
  }) => {
    if (!TextApi.isText(node)) return [];

    return getYjsRemoteCursorsAtPath(getYjsCursorCache(editor), path).flatMap(
      (cursor) => {
        const { selection } = cursor;

        if (!selection || RangeApi.isCollapsed(selection)) {
          return [];
        }

        return [
          {
            ...selection,
            yjsRemoteCursor: {
              clientId: cursor.clientId,
              cursor,
              ...(cursor.data === undefined ? {} : { data: cursor.data }),
            },
          },
        ];
      }
    );
  },
  YjsPluginDecorationSource
);

/** Installs Yjs collaboration in a React Plate editor. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin).extend({
  decorate: decorateYjsRemoteCursor,
});
