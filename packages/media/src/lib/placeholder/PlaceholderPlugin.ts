import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import type { MediaPlaceholder } from './types';

export type PlaceholderConfig = PluginConfig<'placeholder', MediaPlaceholder>;

export const PlaceholderPlugin = createTSlatePlugin<PlaceholderConfig>({
  isElement: true,
  isVoid: true,
  key: 'placeholder',
});
