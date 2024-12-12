import type {
  HocuspocusProviderConfiguration,
  onDisconnectParameters,
  onSyncedParameters,
} from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  type PluginConfig,
  type UnknownObject,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { WithYjsOptions } from './withTYjs';

import { withPlateYjs } from './withPlateYjs';

export type YjsPluginOptions<
  TCursorData extends UnknownObject = UnknownObject,
> = {
  isConnected: boolean;

  isSynced: boolean;

  /** WithCursors options */
  cursorOptions?: WithCursorsOptions<TCursorData>;

  disableCursors?: boolean;

  /**
   * HocuspocusProvider configuration
   *
   * @required
   */
  hocuspocusProviderOptions?: HocuspocusProviderConfiguration;
  provider?: HocuspocusProvider;

  /** WithYjs options */
  yjsOptions?: WithYjsOptions;
};

export type YjsConfig = PluginConfig<'yjs', YjsPluginOptions>;

export const BaseYjsPlugin = createTSlatePlugin<YjsConfig>({
  key: 'yjs',
  extendEditor: withPlateYjs,
  options: {
    isConnected: false,
    isSynced: false,
  },
}).extend(({ getOptions, setOption }) => {
  const { hocuspocusProviderOptions, provider } = getOptions();

  if (provider) {
    provider.setConfiguration({
      onAwarenessChange() {},
      onConnect() {
        setOption('isConnected', true);
        provider.onConnect();
      },
      onDisconnect(data: onDisconnectParameters) {
        setOption('isConnected', false);
        setOption('isSynced', false);
        provider.onDisconnect(data);
      },
      onSynced(data: onSyncedParameters) {
        setOption('isSynced', true);
        provider.onSynced(data);
      },
    });

    return {
      options: { provider },
    };
  }
  if (!hocuspocusProviderOptions) {
    throw new Error('HocuspocusProvider configuration is required');
  }

  /**
   * Create a new websocket-provider instance. As long as this provider, or the
   * connected ydoc, is not destroyed, the changes will be synced to other
   * clients via the connected server.
   */
  const defaultProvider = new HocuspocusProvider({
    ...hocuspocusProviderOptions,
    onAwarenessChange() {},
    onConnect() {
      setOption('isConnected', true);
      hocuspocusProviderOptions.onConnect?.();
    },
    onDisconnect(data) {
      setOption('isConnected', false);
      setOption('isSynced', false);
      hocuspocusProviderOptions.onDisconnect?.(data);
    },
    onSynced(data) {
      setOption('isSynced', true);
      hocuspocusProviderOptions.onSynced?.(data);
    },
  });

  return {
    options: { provider: defaultProvider },
  };
});
