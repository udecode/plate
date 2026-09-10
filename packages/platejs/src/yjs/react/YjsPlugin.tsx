import { PathApi, RangeApi, TextApi } from '../../core';
import { toPlatePlugin } from '../../react/core';
import { BaseYjsPlugin } from '../BaseYjsPlugin';

/** Installs Yjs collaboration and unstyled remote-selection decorations. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin).extend({
  decorate: {
    observe: ({ editor, read, refresh }) => {
      let previous = new Map(
        read.remoteCursors().map((cursor) => [
          cursor.clientId,
          {
            cursor,
            nodeKey: cursor.selection
              ? editor.key(cursor.selection.anchor.path)
              : null,
          },
        ])
      );

      return read.subscribeRemoteCursors(() => {
        const next = new Map(
          read.remoteCursors().map((cursor) => [
            cursor.clientId,
            {
              cursor,
              nodeKey: cursor.selection
                ? editor.key(cursor.selection.anchor.path)
                : null,
            },
          ])
        );
        const nodeKeys = new Set(
          [...previous.keys(), ...next.keys()].flatMap((clientId) => {
            const before = previous.get(clientId);
            const after = next.get(clientId);

            if (before?.cursor === after?.cursor) return [];

            return [before?.nodeKey, after?.nodeKey].filter(
              (nodeKey): nodeKey is NonNullable<typeof nodeKey> =>
                nodeKey != null
            );
          })
        );

        previous = next;
        if (nodeKeys.size > 0) refresh({ nodeKeys: [...nodeKeys] });
      });
    },
    read: ({ read, entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];

      return read.remoteCursors().flatMap((cursor) => {
        const { selection } = cursor;

        if (
          !selection ||
          RangeApi.isCollapsed(selection) ||
          !PathApi.equals(selection.anchor.path, path)
        ) {
          return [];
        }

        return [
          {
            attributes: {
              'data-client-id': cursor.clientId,
              'data-remote-selection': '',
            },
            key: String(cursor.clientId),
            range: selection,
          },
        ];
      });
    },
  },
});
