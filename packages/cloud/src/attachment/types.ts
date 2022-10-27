import { TElement } from '@udecode/plate-core';

export interface TCloudAttachmentElement extends TElement {
  url: string;
  filename: string;
  bytes: number;
}
