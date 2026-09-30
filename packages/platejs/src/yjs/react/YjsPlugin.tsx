import { yjs, type YjsRemoteCursor } from 'plitejs/yjs/react';

import {
  PathApi,
  RangeApi,
  TextApi,
  type DecorationRefresh,
  type NodeEntry,
  type NodeKey,
} from '../../core';
import {
  isDocumentView,
  type RuntimePluginFactoryTypeLambda,
  type RuntimePluginFactoryTypeProviderOf,
} from '../../facade';
import type { InternalBasePluginRuntimeExtension } from '../../lib/plugin/BasePlugin';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import { definePlugin, toReactPlugin } from '../../react/core';
import { createPluginFactory } from '../../react/plugin/pluginFactory.internal';
import type { InternalReactPluginAdapterResult } from '../../react/plugin/toReactPlugin';

type RemoteCursorDecorationApi = Readonly<{
  remoteCursors: () => readonly YjsRemoteCursor[];
  subscribeRemoteCursors: (listener: () => void) => () => void;
}>;

type RemoteCursorDecorationContext = Readonly<{
  api: object;
  editor: Readonly<{
    key: (path: readonly number[]) => NodeKey | null;
    read: Readonly<{ view: Readonly<{ root: () => string | undefined }> }>;
  }>;
}>;

// Awareness selections are canonical: one without a root is in the primary
// root. A cursor paints only through a reader of its own root, where its paths
// are that reader's paths.
const getReaderSelection = (
  editor: RemoteCursorDecorationContext['editor'],
  cursor: YjsRemoteCursor
) => {
  const { selection } = cursor;
  const root = editor.read.view.root();

  return selection &&
    selection.anchor.root === root &&
    selection.focus.root === root
    ? selection
    : null;
};

const hasRemoteCursorDecorationApi = (
  api: object
): api is RemoteCursorDecorationApi =>
  'remoteCursors' in api &&
  typeof api.remoteCursors === 'function' &&
  'subscribeRemoteCursors' in api &&
  typeof api.subscribeRemoteCursors === 'function';

const remoteCursorDecoration = {
  decorate: {
    observe: ({
      api,
      editor,
      refresh,
    }: RemoteCursorDecorationContext & {
      refresh: (input: DecorationRefresh) => void;
    }) => {
      if (!hasRemoteCursorDecorationApi(api)) return () => {};

      const nodeKeyOf = (cursor: YjsRemoteCursor) => {
        const selection = getReaderSelection(editor, cursor);

        return selection ? editor.key(selection.anchor.path) : null;
      };
      let previous = new Map(
        api
          .remoteCursors()
          .map((cursor) => [
            cursor.clientId,
            { cursor, nodeKey: nodeKeyOf(cursor) },
          ])
      );

      return api.subscribeRemoteCursors(() => {
        const next = new Map(
          api
            .remoteCursors()
            .map((cursor) => [
              cursor.clientId,
              { cursor, nodeKey: nodeKeyOf(cursor) },
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
    // Remote cursors are positions in the live session's document, so a view
    // rendering another document shows none.
    read: ({
      api,
      editor,
      entry: [node, path],
    }: RemoteCursorDecorationContext & {
      entry: NodeEntry;
    }) => {
      if (
        !TextApi.isText(node) ||
        !hasRemoteCursorDecorationApi(api) ||
        isDocumentView(editor)
      ) {
        return [];
      }

      return api.remoteCursors().flatMap((cursor) => {
        const selection = getReaderSelection(editor, cursor);

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
} as const;

type ApplyRuntimePluginFactory<
  TType extends RuntimePluginFactoryTypeLambda,
  TInput extends TType['input'],
> = (TType & Readonly<{ input: TInput }>)['output'];

const BaseYjsBridge = definePlugin('yjs', {});

type NativeYjsFactoryType = RuntimePluginFactoryTypeProviderOf<typeof yjs>;
type BaseYjsBridgeDefinition = InternalPluginDefinitionOf<typeof BaseYjsBridge>;
type PlateYjsPlugin<TInput extends NativeYjsFactoryType['input']> =
  InternalReactPluginAdapterResult<
    InternalBasePluginRuntimeExtension<
      typeof BaseYjsBridge,
      BaseYjsBridgeDefinition,
      ApplyRuntimePluginFactory<NativeYjsFactoryType, TInput>
    >,
    typeof remoteCursorDecoration
  >;

interface YjsPluginFactoryType {
  readonly input: NativeYjsFactoryType['input'];
  readonly output: PlateYjsPlugin<this['input']>;
}

/** Creates complete Plate Yjs descriptors from app-owned resources. */
export const YjsPlugin = createPluginFactory<YjsPluginFactoryType>((options) =>
  toReactPlugin(BaseYjsBridge.extend(yjs(options)), remoteCursorDecoration)
);
