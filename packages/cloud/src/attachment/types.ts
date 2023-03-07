import { TElement } from '@udecode/plate-common';

/**
 * Specifies just the `options` part of the CloudPlugin
 */
export type CloudAttachmentPlugin = {};

export interface TCloudAttachmentElement extends TElement {
  url: string;
  filename: string;
  bytes: number;
}
