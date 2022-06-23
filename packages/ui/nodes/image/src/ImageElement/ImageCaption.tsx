import { useMemo } from 'react';
import { getNodeString } from '@udecode/plate-core';
import { TImageElement } from '@udecode/plate-image';
import { useSelected } from 'slate-react';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import { useElement } from '../utils/useElement';
import { imageWidthAtom, useImageAtomValue } from './imageAtoms';
import { ImageElementPropsCaption } from './ImageElement.types';

export interface ImageCaptionProps extends HTMLPropsAs<'figcaption'> {
  caption: ImageElementPropsCaption;
}

export const useImageCaption = (
  props?: Omit<ImageCaptionProps, 'caption'>
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
  } = useElement<TImageElement>();

  const captionString = useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);

  return {
    captionString,
  };
};

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
