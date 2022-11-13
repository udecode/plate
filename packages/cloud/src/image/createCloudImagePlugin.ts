import { createPluginFactory, Value } from '@udecode/plate-core';
import { PlateCloudEditor } from '../cloud/types';
import { CloudImagePlugin } from './types';
import { withCloudImage } from './withCloudImage';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const createCloudImagePlugin = createPluginFactory<
  CloudImagePlugin,
  Value,
  PlateCloudEditor
>({
  key: ELEMENT_CLOUD_IMAGE,
  isElement: true,
  isVoid: true,
  withOverrides: withCloudImage,
});
