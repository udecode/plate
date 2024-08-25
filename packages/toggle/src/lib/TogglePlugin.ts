import { createTSlatePlugin } from '@udecode/plate-common';

export type TToggleElement = {
  type: typeof TogglePlugin.key;
};

export const TogglePlugin = createTSlatePlugin({
  node: { isElement: true },
  key: 'toggle',
});
