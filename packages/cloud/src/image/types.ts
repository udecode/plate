import type { TElement } from '@udecode/plate-common';

export type CloudImageEditorProps = {
  cloudImage: {
    maxInitialHeight: number;
    maxInitialWidth: number;
    maxResizeWidth: number;
    minResizeWidth: number;
  };
};

export interface TCloudImageElement extends TElement {
  bytes: number;
  height: number;
  maxHeight: number;
  maxWidth: number;
  url: string;
  width: number;
}
