import { TDescendant, TElement } from '@udecode/plate-core';

export interface TImageElement extends TElement {
  url: string;
  width?: number;
  caption?: TDescendant[];
}

export interface ImagePlugin {
  /**
   * An optional method that will upload the image to a server.
   * The method receives the base64 dataUrl of the uploaded image, and should return the URL of the uploaded image.
   */
  uploadImage?: (
    dataUrl: string | ArrayBuffer
  ) => Promise<string | ArrayBuffer> | string | ArrayBuffer;
}
