import { type Value, createPluginFactory } from '@udecode/plate-common/server';

import type { CloudImagePlugin, PlateCloudImageEditor } from './types';

import { withCloudImage } from './withCloudImage';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const createCloudImagePlugin = createPluginFactory<
  CloudImagePlugin,
  Value,
  PlateCloudImageEditor
>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_CLOUD_IMAGE,
  withOverrides: withCloudImage,
});
