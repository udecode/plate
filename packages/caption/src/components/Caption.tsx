import React from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

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

  const selected = useSelected();
  const _readOnly = useReadOnly();
  const readOnly = options.readOnly || _readOnly;

  return {
    captionString,
    selected,
    readOnly,
  };
};

export const useCaption = (state: ReturnType<typeof useCaptionState>) => {
  return {
    hidden:
      state.captionString.length === 0 && (state.readOnly || !state.selected),
  };
};

export const Caption = createPrimitiveComponent<'figcaption', CaptionProps>(
  'figcaption'
)({
  stateHook: useCaptionState,
  propsHook: useCaption,
});
