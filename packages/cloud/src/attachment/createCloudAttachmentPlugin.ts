import { createPluginFactory, Value } from '@udecode/plate-core';
import { CloudEditor, CloudPlugin } from '../cloud/types';
import { withOverrides } from './withOverrides';

export const ELEMENT_CLOUD_ATTACHMENT = 'cloud_attachment';

export const createCloudAttachmentPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  CloudEditor<Value>
>({
  key: ELEMENT_CLOUD_ATTACHMENT,
  isElement: true,
  isVoid: true,
  withOverrides,
});
