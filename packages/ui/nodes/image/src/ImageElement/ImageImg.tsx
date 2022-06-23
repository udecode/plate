import { TImageElement } from '@udecode/plate-image';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import { useElement } from '../utils/useElement';
import { useImageCaptionState } from './ImageCaption';

export const useImageImg = (props?: HTMLPropsAs<'img'>): HTMLPropsAs<'img'> => {
  const { url } = useElement<TImageElement>();

  const { captionString } = useImageCaptionState();

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
