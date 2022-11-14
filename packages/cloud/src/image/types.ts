import { TElement } from '@udecode/plate-core';

export type CloudImagePlugin = {
  maxInitialWidth?: number;
  maxInitialHeight?: number;
};

export interface TCloudImageElement extends TElement {
  url: string;
  bytes: number;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}
