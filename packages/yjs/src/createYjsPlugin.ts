import { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import { WithCursorsOptions } from '@slate-yjs/core';
import {
  createPluginFactory,
  PlateEditor,
  UnknownObject,
  Value,
} from '@udecode/plate-common';

import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';
import { PlateYjsEditorProps, withPlateYjs } from './withPlateYjs';
import { WithYjsOptions } from './withTYjs';

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
  PlateEditor & PlateYjsEditorProps
>({
  key: KEY_YJS,
  withOverrides: withPlateYjs,
  renderAboveEditable: RenderAboveEditableYjs,
});
