import { createPluginFactory } from '@udecode/plate-core';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const createCloudAttachmentPlugin = createPluginFactory({
  key: ELEMENT_CLOUD_ATTACHMENT,
  isElement: true,
  isVoid: true,
});
