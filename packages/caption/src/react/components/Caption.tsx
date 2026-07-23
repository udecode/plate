import type React from 'react';

import { useElement, usePluginOption } from '@platejs/core/react';
import { useEditorReadOnly, useElementSelected } from '@platejs/plite-react';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { BaseCaptionPlugin } from '../../lib';
import { useCaptionString } from '../hooks/useCaptionString';

export type CaptionOptions = {
  readOnly?: boolean;
};

export interface CaptionProps
  extends React.ComponentPropsWithoutRef<'figcaption'> {
  options?: CaptionOptions;
}

export const useCaptionState = (options: CaptionOptions = {}) => {
  const element = useElement();
  const captionString = useCaptionString();

  const showCaption = usePluginOption(
    BaseCaptionPlugin,
    'isVisible',
    typeof element.id === 'string' ? element.id : undefined
  );

  const selected = useElementSelected();
  const _readOnly = useEditorReadOnly();
  const readOnly = options.readOnly || _readOnly;

  const hidden = !showCaption && captionString.length === 0;

  return {
    captionString,
    hidden,
    readOnly,
    selected,
  };
};

export const useCaption = (state: ReturnType<typeof useCaptionState>) => ({
  hidden: state.hidden,
});

export const Caption = createPrimitiveComponent<'figcaption', CaptionProps>(
  'figcaption'
)({
  propsHook: useCaption,
  stateHook: useCaptionState,
});
