import type {
  HocuspocusProvider,
  HocuspocusProviderConfiguration,
} from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import {
  type PluginConfig,
  type UnknownObject,
  createTPlugin,
} from '@udecode/plate-common';

import type { WithYjsOptions } from './withTYjs';

import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';
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

  provider: HocuspocusProvider;

  /** WithYjs options */
  yjsOptions?: WithYjsOptions;
};

export type YjsConfig = PluginConfig<'yjs', YjsPluginOptions>;

export const YjsPlugin = createTPlugin<YjsConfig>({
  key: 'yjs',
  renderAboveEditable: RenderAboveEditableYjs,
  withOverrides: withPlateYjs,
});
