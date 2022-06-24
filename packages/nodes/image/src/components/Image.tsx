import { CSSProperties } from 'react';
import {
  createComponentAs,
  createElementAs,
  elementStore,
  HTMLPropsAs,
  PlateRenderElementProps,
  useComposedRef,
  Value,
} from '@udecode/plate-core';
import { TImageElement } from '../types';
import { ImageCaption } from './ImageCaption';
import { ImageCaptionTextarea } from './ImageCaptionTextarea';
import { ImageImg } from './ImageImg';
import { ImageResizable } from './ImageResizable';

export const { imageStore, useImageStore } = elementStore.extend(
  {
    width: 0 as CSSProperties['width'],
  },
  { name: 'image' as const }
);

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
