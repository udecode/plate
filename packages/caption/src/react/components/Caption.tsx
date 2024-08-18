import type React from 'react';

import {
  createPrimitiveComponent,
  useElement,
} from '@udecode/plate-common/react';
import { useReadOnly, useSelected } from 'slate-react';

import { useCaptionSelectors } from '../../lib';
import { useCaptionString } from '../hooks/useCaptionString';

export interface CaptionOptions {
  readOnly?: boolean;
}

export interface CaptionProps
  extends React.ComponentPropsWithoutRef<'figcaption'> {
  options?: CaptionOptions;
}

export const useCaptionState = (options: CaptionOptions = {}) => {
  const element = useElement();
  const captionString = useCaptionString();
  const showCaption = useCaptionSelectors().isShow(element.id as string);

  const selected = useSelected();
  const _readOnly = useReadOnly();
  const readOnly = options.readOnly || _readOnly;

  const hidden = !showCaption && captionString.length === 0;

  return {
    captionString,
    hidden,
    readOnly,
    selected,
  };
};

export const useCaption = (state: ReturnType<typeof useCaptionState>) => {
  return {
    hidden: state.hidden,
  };
};

export const Caption = createPrimitiveComponent<'figcaption', CaptionProps>(
  'figcaption'
)({
  propsHook: useCaption,
  stateHook: useCaptionState,
});
