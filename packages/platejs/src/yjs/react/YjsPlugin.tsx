import { yjs, type YjsRemoteCursor } from 'plitejs/yjs/react';

import {
  PathApi,
  RangeApi,
  TextApi,
  type DecorationRefresh,
  type NodeEntry,
  type NodeKey,
} from '../../core';
import type {
  RuntimePluginFactoryTypeLambda,
  RuntimePluginFactoryTypeProviderOf,
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
  }>;
}>;

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

      let previous = new Map(
        api.remoteCursors().map((cursor) => [
          cursor.clientId,
          {
            cursor,
            nodeKey: cursor.selection
              ? editor.key(cursor.selection.anchor.path)
              : null,
          },
        ])
      );

      return api.subscribeRemoteCursors(() => {
        const next = new Map(
          api.remoteCursors().map((cursor) => [
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
    read: ({
      api,
      entry: [node, path],
    }: RemoteCursorDecorationContext & {
      entry: NodeEntry;
    }) => {
      if (!TextApi.isText(node) || !hasRemoteCursorDecorationApi(api)) {
        return [];
      }

      return api.remoteCursors().flatMap((cursor) => {
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
