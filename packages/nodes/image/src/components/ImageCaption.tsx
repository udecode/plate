import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useReadOnly, useSelected } from 'slate-react';
import { useImageCaptionString } from '../hooks/useImageCaptionString';
import { useImageStore } from './Image';

export interface ImageCaptionProps extends HTMLPropsAs<'figcaption'> {
  readOnly?: boolean;
}

export const useImageCaption = ({
  readOnly,
  ...props
}: ImageCaptionProps = {}): HTMLPropsAs<'figcaption'> => {
  const width = useImageStore().get.width();

  return {
    style: { width },
    ...props,
  };
};

export const useImageCaptionState = (props: ImageCaptionProps) => {
  const captionString = useImageCaptionString();

  const selected = useSelected();
  const _readOnly = useReadOnly();
  const readOnly = props.readOnly || _readOnly;

  return {
    captionString,
    selected,
    readOnly,
  };
};

export const ImageCaption = createComponentAs<ImageCaptionProps>((props) => {
  const htmlProps = useImageCaption(props);
  const { captionString, selected, readOnly } = useImageCaptionState(props);

  if (!captionString.length && (readOnly || !selected)) {
    return null;
  }

  return createElementAs('figcaption', htmlProps);
});
