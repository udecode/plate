import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useImageCaptionString } from '../hooks/useImageCaptionString';
import { useImageElement } from '../hooks/useImageElement';

export const useImageImg = (props?: HTMLPropsAs<'img'>): HTMLPropsAs<'img'> => {
  const { url } = useImageElement();

  const captionString = useImageCaptionString();

  return {
    src: url,
    alt: captionString,
    draggable: true,
    ...props,
  };
};

export const ImageImg = createComponentAs((props) => {
  const htmlProps = useImageImg(props);

  return createElementAs('img', htmlProps);
});
