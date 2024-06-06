import type React from 'react';

import { createPrimitiveComponent, useElement } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import type { TCaptionElement } from '../TCaptionElement';

import { useCaptionString } from '../hooks/useCaptionString';

export interface CaptionOptions {
  readOnly?: boolean;
}

export interface CaptionProps
  extends React.ComponentPropsWithoutRef<'figcaption'> {
  options?: CaptionOptions;
}

export const useCaptionState = (options: CaptionOptions = {}) => {
  const captionString = useCaptionString();
  const { showCaption } = useElement<TCaptionElement>();

  const selected = useSelected();
  const _readOnly = useReadOnly();
  const readOnly = options.readOnly || _readOnly;

  const hidden =
    !showCaption || (captionString.length === 0 && (readOnly || !selected));

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
