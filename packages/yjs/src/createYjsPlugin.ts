import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import type { WithCursorsOptions } from '@slate-yjs/core';

import {
  type PlateEditor,
  type UnknownObject,
  type Value,
  createPluginFactory,
} from '@udecode/plate-common/server';

import type { WithYjsOptions } from './withTYjs';

import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';
import { type PlateYjsEditorProps, withPlateYjs } from './withPlateYjs';

export type YjsPlugin<TCursorData extends UnknownObject = UnknownObject> = {
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

export const createYjsPlugin = createPluginFactory<
  YjsPlugin,
  Value,
  PlateEditor & PlateYjsEditorProps
>({
  key: KEY_YJS,
  renderAboveEditable: RenderAboveEditableYjs,
  withOverrides: withPlateYjs,
});
