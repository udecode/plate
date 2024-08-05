import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import { type UnknownObject, createPlugin } from '@udecode/plate-common/server';

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

  /** WithYjs options */
  yjsOptions?: WithYjsOptions;
};

export const KEY_YJS = 'yjs';

export const YjsPlugin = createPlugin<'yjs', YjsPluginOptions>({
  key: KEY_YJS,
  renderAboveEditable: RenderAboveEditableYjs,
  withOverrides: withPlateYjs,
});
