import { CSSProperties } from 'react';
import {
  createAtomStore,
  createComponentAs,
  createElementAs,
  createStore,
  HTMLPropsAs,
  PlateRenderElementProps,
  TPath,
  useComposedRef,
  Value,
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

export type ImageProps = PlateRenderElementProps<Value, TImageElement> &
  HTMLPropsAs<'div'>;

export const useElementProps = ({
  attributes,
  nodeProps,
  element,
  editor,
  ...props
}: ImageProps): HTMLPropsAs<'div'> => {
  return {
    ...attributes,
    ...props,
    ...nodeProps,
    ref: useComposedRef(props.ref, attributes.ref),
  };
};

export const ImageRoot = createComponentAs<ImageProps>((props) => {
  const htmlProps = useElementProps(props as any);

  return createElementAs('div', htmlProps);
});

export const Image = {
  Root: ImageRoot,
  Caption: ImageCaption,
  Img: ImageImg,
  Resizable: ImageResizable,
  CaptionTextarea: ImageCaptionTextarea,
};
