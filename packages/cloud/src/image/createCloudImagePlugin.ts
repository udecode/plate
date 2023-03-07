import { createPluginFactory, Value } from '@udecode/plate-common';
import { CloudImagePlugin, PlateCloudImageEditor } from './types';
import { withCloudImage } from './withCloudImage';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const createCloudImagePlugin = createPluginFactory<
  CloudImagePlugin,
  Value,
  PlateCloudImageEditor
>({
  key: ELEMENT_CLOUD_IMAGE,
  isElement: true,
  isVoid: true,
  withOverrides: withCloudImage,
});
