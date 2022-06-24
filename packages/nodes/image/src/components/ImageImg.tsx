import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useImageElement } from '../hooks/index';
import { useImageCaptionString } from '../hooks/useImageCaptionString';

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
