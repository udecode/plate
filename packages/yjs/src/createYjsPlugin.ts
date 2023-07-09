import { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import { WithCursorsOptions } from '@slate-yjs/core';
// eslint-disable-next-line import/no-unresolved
import { WithYjsOptions } from '@slate-yjs/core/dist/plugins/withYjs';
import {
  UnknownObject,
  Value,
  createPluginFactory,
} from '@udecode/plate-common';

import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';
import { PlateYjsEditor, withPlateYjs } from './withPlateYjs';

export type YjsPlugin<TCursorData extends UnknownObject = UnknownObject> = {
  /**
   * withCursors options
   */
  cursorOptions?: WithCursorsOptions<TCursorData>;

  /**
   * HocuspocusProvider configuration
   * @required
   */
  hocuspocusProviderOptions?: HocuspocusProviderConfiguration;

  /**
   * withYjs options
   */
  yjsOptions?: WithYjsOptions;

  disableCursors?: boolean;
};

export const KEY_YJS = 'yjs';

export const createYjsPlugin = createPluginFactory<
  YjsPlugin,
  Value,
  PlateYjsEditor
>({
  key: KEY_YJS,
  withOverrides: withPlateYjs,
  renderAboveEditable: RenderAboveEditableYjs,
});
