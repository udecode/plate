import { createPluginFactory, Value } from '@udecode/plate-core';
import { PlateCloudEditor } from '../cloud/types';
import { CloudAttachmentPlugin } from './types';
import { withCloudAttachmentOverrides } from './withCloudAttachmentOverrides';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const createCloudAttachmentPlugin = createPluginFactory<
  CloudAttachmentPlugin,
  Value,
  PlateCloudEditor<Value>
>({
  key: ELEMENT_CLOUD_ATTACHMENT,
  isElement: true,
  isVoid: true,
  withOverrides: withCloudAttachmentOverrides,
});
