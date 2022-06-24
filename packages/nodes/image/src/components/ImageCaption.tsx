import React from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useSelected } from 'slate-react';
import { useImageCaptionString } from '../hooks/useImageCaptionString';
import { useImageStore } from './Image';

export interface ImageCaptionProps extends HTMLPropsAs<'figcaption'> {}

export const useImageCaption = (
  props?: ImageCaptionProps
): HTMLPropsAs<'figcaption'> => {
  const width = useImageStore().get.width();

  return {
    style: { width },
    ...props,
  };
};

export const useImageCaptionState = () => {
  const captionString = useImageCaptionString();

  const selected = useSelected();

  return {
    captionString,
    selected,
  };
};

export const ImageCaption = createComponentAs<ImageCaptionProps>((props) => {
  const htmlProps = useImageCaption(props);
  const { captionString, selected } = useImageCaptionState();

  if (!captionString.length && !selected) {
    return null;
  }

  return createElementAs('figcaption', htmlProps);
});
