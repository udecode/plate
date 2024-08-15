import type {
  HocuspocusProvider,
  HocuspocusProviderConfiguration,
} from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import { type UnknownObject, createPlugin } from '@udecode/plate-common';

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

export const YjsPlugin = createPlugin<'yjs', YjsPluginOptions>({
  key: 'yjs',
  renderAboveEditable: RenderAboveEditableYjs,
  withOverrides: withPlateYjs,
});
