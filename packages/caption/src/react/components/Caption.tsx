import type React from 'react';

import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';
import { useReadOnly, useSelected } from 'slate-react';

import { CaptionPlugin } from '../CaptionPlugin';
import { useCaptionString } from '../hooks/useCaptionString';

export interface CaptionOptions {
  readOnly?: boolean;
}

export interface CaptionProps
  extends React.ComponentPropsWithoutRef<'figcaption'> {
  options?: CaptionOptions;
}

export const useCaptionState = (options: CaptionOptions = {}) => {
  const editor = useEditorRef();
  const element = useElement();
  const captionString = useCaptionString();

  const showCaption = editor.useStore(
    CaptionPlugin,
    (state) => state.showCaptionId === element.id
  );

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
