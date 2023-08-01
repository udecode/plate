import { createPluginFactory, Value } from '@udecode/plate-common';

import { PlateCloudEditor } from '../cloud/types';
import { CloudAttachmentPlugin } from './types';
import { withCloudAttachment } from './withCloudAttachment';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const createCloudAttachmentPlugin = createPluginFactory<
  CloudAttachmentPlugin,
  Value,
  PlateCloudEditor
>({
  key: ELEMENT_CLOUD_ATTACHMENT,
  isElement: true,
  isVoid: true,
  withOverrides: withCloudAttachment,
});
