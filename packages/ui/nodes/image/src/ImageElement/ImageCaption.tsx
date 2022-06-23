import { useMemo } from 'react';
import { getNodeString } from '@udecode/plate-core';
import { useSelected } from 'slate-react';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import {
  imageElementAtom,
  imageWidthAtom,
  useImageAtomValue,
} from './imageAtoms';
import { ImageElementPropsCaption } from './ImageElement.types';

export const useImageCaption = (
  props?: HTMLPropsAs<'figcaption'>
): HTMLPropsAs<'figcaption'> => {
  const width = useImageAtomValue(imageWidthAtom);

  return {
    style: { width },
    ...props,
  };
};

export const useImageCaptionState = () => {
  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }],
  } = useImageAtomValue(imageElementAtom)!;

  const captionString = useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);

  return {
    captionString,
  };
};

export interface ImageCaptionProps extends HTMLPropsAs<'figcaption'> {
  caption: ImageElementPropsCaption;
}

export const ImageCaption = createComponentAs<ImageCaptionProps>(
  ({ caption, ...props }) => {
    const htmlProps = useImageCaption(props);
    const { captionString } = useImageCaptionState();

    const selected = useSelected();

    if (caption.disabled || (!captionString.length && !selected)) {
      return null;
    }

    return createElementAs('figcaption', htmlProps);
  }
);
