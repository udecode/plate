import { createPlugin } from '@udecode/plate-common/server';

import type { CloudAttachmentPluginOptions } from './types';

import { withCloudAttachment } from './withCloudAttachment';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const CloudAttachmentPlugin = createPlugin<CloudAttachmentPluginOptions>(
  {
    isElement: true,
    isVoid: true,
    key: ELEMENT_CLOUD_ATTACHMENT,
    withOverrides: withCloudAttachment,
  }
);
