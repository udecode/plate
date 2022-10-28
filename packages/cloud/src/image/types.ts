import { TElement } from '@udecode/plate-core';

export interface TCloudImageElement extends TElement {
  url: string;
  bytes: number;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}
