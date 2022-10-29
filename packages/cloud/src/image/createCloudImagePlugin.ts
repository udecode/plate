import { createPluginFactory, Value } from '@udecode/plate-core';
import { CloudEditor } from '../cloud/types';
import { CloudImagePlugin } from './types';
import { withCloudImageOverrides } from './withCloudImageOverrides';

export const ELEMENT_CLOUD_IMAGE = 'cloud_image';

export const createCloudImagePlugin = createPluginFactory<
  CloudImagePlugin,
  Value,
  CloudEditor<Value>
>({
  key: ELEMENT_CLOUD_IMAGE,
  isElement: true,
  isVoid: true,
  withOverrides: withCloudImageOverrides,
});
