import { HocuspocusProviderConfiguration } from '@hocuspocus/provider';
import { WithCursorsOptions } from '@slate-yjs/core';
import { WithYjsOptions } from '@slate-yjs/core/dist/plugins/withYjs';
import { createPluginFactory, UnknownObject, Value } from '@udecode/plate-core';
import { useHooksYjs } from './useHooksYjs';
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
  useHooks: useHooksYjs,
});
