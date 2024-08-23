import { createTPlatePlugin } from '../plugin';

export const PlateApiPlugin = createTPlatePlugin({
  dependencies: ['debug'],
  key: 'plateApi',
}).extendEditorApi(({ editor }) => ({
  redecorate: () => {
    editor.api.debug.warn(
      `The method editor.api.redecorate() has not been overridden. ` +
        `This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.`,
      'OVERRIDE_MISSING'
    );
  },
}));
