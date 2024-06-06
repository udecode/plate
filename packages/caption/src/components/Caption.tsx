import type React from 'react';

import { createPrimitiveComponent } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';

import { useCaptionString } from '../hooks/useCaptionString';
import { useCaptionStore } from '../useResizableStore';

export interface CaptionOptions {
  readOnly?: boolean;
}

export interface CaptionProps
  extends React.ComponentPropsWithoutRef<'figcaption'> {
  options?: CaptionOptions;
}

export const useCaptionState = (options: CaptionOptions = {}) => {
  const captionString = useCaptionString();
  const showCaption = useCaptionStore().get.showCaption();

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
