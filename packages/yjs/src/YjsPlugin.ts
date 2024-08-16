import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  type PluginConfig,
  type UnknownObject,
  createTPlugin,
} from '@udecode/plate-common';

import type { WithYjsOptions } from './withTYjs';

import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';
import { withPlateYjs } from './withPlateYjs';
import { yjsActions } from './yjsStore';

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

  provider: HocuspocusProvider;

  /** WithYjs options */
  yjsOptions?: WithYjsOptions;
};

export type YjsConfig = PluginConfig<'yjs', YjsPluginOptions>;

export const YjsPlugin = createTPlugin<YjsConfig>({
  key: 'yjs',
  renderAboveEditable: RenderAboveEditableYjs,
  withOverrides: withPlateYjs,
}).extend(({ options: { hocuspocusProviderOptions } }) => {
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
      yjsActions.isConnected(true);
      hocuspocusProviderOptions.onConnect?.();
    },
    onDisconnect(data) {
      yjsActions.isConnected(false);
      yjsActions.isSynced(false);
      hocuspocusProviderOptions.onDisconnect?.(data);
    },
    onSynced(data) {
      yjsActions.isSynced(true);
      hocuspocusProviderOptions.onSynced?.(data);
    },
  });

  return {
    options: { provider },
  };
});
