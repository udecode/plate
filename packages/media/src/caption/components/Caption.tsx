import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';
import { useResizableStore } from '../../resizable/resizableStore';
import { useCaptionString } from '../hooks/useCaptionString';
import { CaptionTextarea } from './CaptionTextarea';

export interface CaptionProps extends HTMLPropsAs<'figcaption'> {
  readOnly?: boolean;
}

export const useCaption = ({
  readOnly,
  ...props
}: CaptionProps = {}): HTMLPropsAs<'figcaption'> => {
  const width = useResizableStore().get.width();

  return {
    style: { width },
    ...props,
  };
};

export const useCaptionState = (props: CaptionProps) => {
  const captionString = useCaptionString();

  const selected = useSelected();
  const _readOnly = useReadOnly();
  const readOnly = props.readOnly || _readOnly;

  return {
    captionString,
    selected,
    readOnly,
  };
};

export const CaptionRoot = createComponentAs<CaptionProps>((props) => {
  const htmlProps = useCaption(props);
  const { captionString, selected, readOnly } = useCaptionState(props);

  if (!captionString.length && (readOnly || !selected)) {
    return null;
  }

  return createElementAs('figcaption', htmlProps);
});

export const Caption = {
  Root: CaptionRoot,
  Textarea: CaptionTextarea,
};
