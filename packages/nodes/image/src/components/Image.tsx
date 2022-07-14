import { CSSProperties } from 'react';
import {
  createAtomStore,
  createPlateElementComponent,
  createStore,
  TPath,
} from '@udecode/plate-core';
import { TImageElement } from '../types';
import { ImageCaption } from './ImageCaption';
import { ImageCaptionTextarea } from './ImageCaptionTextarea';
import { ImageImg } from './ImageImg';
import { ImageResizable } from './ImageResizable';

export const { imageStore, useImageStore } = createAtomStore(
  {
    width: 0 as CSSProperties['width'],
  },
  // NOTE: scope: ELEMENT_IMAGE is undefined (bundle issue)
  { name: 'image' as const, scope: 'img' }
);

export const imageGlobalStore = createStore('image')({
  /**
   * When defined, focus end of caption textarea of the image with the same path.
   */
  focusEndCaptionPath: null as TPath | null,

  /**
   * When defined, focus start of caption textarea of the image with the same path.
   */
  focusStartCaptionPath: null as TPath | null,
});

export const ImageRoot = createPlateElementComponent<TImageElement>();

export const Image = {
  Root: ImageRoot,
  Caption: ImageCaption,
  Img: ImageImg,
  Resizable: ImageResizable,
  CaptionTextarea: ImageCaptionTextarea,
};
