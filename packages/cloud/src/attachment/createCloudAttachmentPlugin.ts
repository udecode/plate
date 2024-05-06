import { type Value, createPluginFactory } from '@udecode/plate-common/server';

import type { PlateCloudEditor } from '../cloud/types';
import type { CloudAttachmentPlugin } from './types';

import { withCloudAttachment } from './withCloudAttachment';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const createCloudAttachmentPlugin = createPluginFactory<
  CloudAttachmentPlugin,
  Value,
  PlateCloudEditor
>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_CLOUD_ATTACHMENT,
  withOverrides: withCloudAttachment,
});
