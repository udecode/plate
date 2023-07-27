import { ComponentPropsWithoutRef } from 'react';
import { createPrimitiveComponent } from '@udecode/plate-common';
import { useResizableStore } from '@udecode/plate-resizable';
import { useReadOnly, useSelected } from 'slate-react';

import { useCaptionString } from '../hooks/useCaptionString';

export interface CaptionOptions {
  readOnly?: boolean;
}

export interface CaptionProps extends ComponentPropsWithoutRef<'figcaption'> {
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
  const width = useResizableStore().get.width();

  return {
    props: {
      style: { width },
    },
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
