import type { TElement } from '@udecode/plate-common/server';

/** Specifies just the `options` part of the CloudPlugin */
export type CloudAttachmentPlugin = {};

export interface TCloudAttachmentElement extends TElement {
  bytes: number;
  filename: string;
  url: string;
}
