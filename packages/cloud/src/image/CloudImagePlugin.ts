import { createPlugin } from '@udecode/plate-common/server';

import type { CloudImagePluginOptions } from './types';

import { withCloudImage } from './withCloudImage';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const CloudImagePlugin = createPlugin<
  'cloud_image',
  CloudImagePluginOptions
>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_CLOUD_IMAGE,
  withOverrides: withCloudImage,
});
