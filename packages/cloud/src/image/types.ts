import type { TElement } from '@udecode/plate-common';

export interface TCloudImageElement extends TElement {
  bytes: number;
  height: number;
  maxHeight: number;
  maxWidth: number;
  url: string;
  width: number;
}
