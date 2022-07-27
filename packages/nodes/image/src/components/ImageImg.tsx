import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useCaptionString } from '@udecode/plate-media';
import { useImageElement } from '../hooks/index';

export const useImageImg = (props?: HTMLPropsAs<'img'>): HTMLPropsAs<'img'> => {
  const { url } = useImageElement();

  const captionString = useCaptionString();

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
