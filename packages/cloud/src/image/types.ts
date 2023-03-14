import { PlateEditor, TElement, Value } from '@udecode/plate-common';

export type CloudImagePlugin = {
  maxInitialWidth?: number;
  maxInitialHeight?: number;
  minResizeWidth?: number;
  maxResizeWidth?: number;
};

export type CloudImageEditorProps = {
  cloudImage: {
    maxInitialWidth: number;
    maxInitialHeight: number;
    minResizeWidth: number;
    maxResizeWidth: number;
  };
};

export type PlateCloudImageEditor<V extends Value = Value> = PlateEditor<V> &
  CloudImageEditorProps;

export interface TCloudImageElement extends TElement {
  url: string;
  bytes: number;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}
