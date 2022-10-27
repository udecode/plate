import { createPluginFactory } from '@udecode/plate-core';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const createCloudImagePlugin = createPluginFactory({
  key: ELEMENT_CLOUD_IMAGE,
  isElement: true,
  isVoid: true,
});
