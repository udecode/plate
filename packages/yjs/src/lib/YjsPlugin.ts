import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
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
  /** WithCursors options */
  cursorOptions?: WithCursorsOptions<TCursorData>;

  disableCursors?: boolean;

  /**
   * HocuspocusProvider configuration
   *
   * @required
   */
  hocuspocusProviderOptions?: HocuspocusProviderConfiguration;

  isConnected: boolean;

  isSynced: boolean;
  provider: HocuspocusProvider;

  /** WithYjs options */
  yjsOptions?: WithYjsOptions;
};

export type YjsConfig = PluginConfig<'yjs', YjsPluginOptions>;

export const YjsPlugin = createTSlatePlugin<YjsConfig>({
  extendEditor: withPlateYjs,
  key: 'yjs',
  options: {
    isConnected: false,
    isSynced: false,
    provider: {} as any,
  },
}).extend(({ getOptions, setOption }) => {
  const { hocuspocusProviderOptions } = getOptions();

  if (!hocuspocusProviderOptions) {
    throw new Error('HocuspocusProvider configuration is required');
  }

  /**
   * Create a new websocket-provider instance. As long as this provider, or the
   * connected ydoc, is not destroyed, the changes will be synced to other
   * clients via the connected server.
   */
  const provider = new HocuspocusProvider({
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
    options: { provider },
  };
});
