import { TElement } from '@udecode/plate-core';

/**
 * Specifies just the `options` part of the CloudPlugin
 */
export type CloudAttachmentPlugin = {};

export interface TCloudAttachmentElement extends TElement {
  url: string;
  filename: string;
  bytes: number;
}
