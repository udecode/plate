import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps } from 'slate-react';
import { ImageElement } from './components/ImageElement';

export const renderElementImage = () => (props: RenderElementProps) => {
  if (props.element.type === ElementType.IMAGE) {
    return <ImageElement {...props} />;
  }
};
