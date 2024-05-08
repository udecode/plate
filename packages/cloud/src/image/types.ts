import type { PlateEditor, TElement, Value } from '@udecode/plate-common';

export type CloudImagePlugin = {
  maxInitialHeight?: number;
  maxInitialWidth?: number;
  maxResizeWidth?: number;
  minResizeWidth?: number;
};

export type CloudImageEditorProps = {
  cloudImage: {
    maxInitialHeight: number;
    maxInitialWidth: number;
    maxResizeWidth: number;
    minResizeWidth: number;
  };
};

export type PlateCloudImageEditor<V extends Value = Value> =
  CloudImageEditorProps & PlateEditor<V>;

export interface TCloudImageElement extends TElement {
  bytes: number;
  height: number;
  maxHeight: number;
  maxWidth: number;
  url: string;
  width: number;
}
