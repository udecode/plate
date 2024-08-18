import { createSlatePlugin } from '../../plugin';

export const PlateApiPlugin = createSlatePlugin({
  // dependencies: [DebugPlugin.key],
  key: 'plateApi',
}).extendApi(({ editor }) => ({
  redecorate: () => {
    editor.api.debug.warn(
      `editor.api.redecorate should have been overridden but was not. Please report this issue here: https://github.com/udecode/plate/issues`,
      'OVERRIDE_MISSING'
    );
  },
  setStore: {} as any,
  // TODO
  //   {
  //   [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
  //     value: PlateStoreState<any>[K]
  //   ) => void;
  // },
}));
