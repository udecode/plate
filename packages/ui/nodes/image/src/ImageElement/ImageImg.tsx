import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import { imageElementAtom, useImageAtomValue } from './imageAtoms';
import { useImageCaptionState } from './ImageCaption';

export const useImageImg = (props?: HTMLPropsAs<'img'>): HTMLPropsAs<'img'> => {
  const { url } = useImageAtomValue(imageElementAtom)!;

  console.log(url);

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
