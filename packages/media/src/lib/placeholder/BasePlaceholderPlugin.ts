import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import type { MediaPlaceholder } from './types';

export type PlaceholderConfig = PluginConfig<'placeholder', MediaPlaceholder>;

export const BasePlaceholderPlugin = createTSlatePlugin<PlaceholderConfig>({
  key: 'placeholder',
  node: { isElement: true, isVoid: true },
});
