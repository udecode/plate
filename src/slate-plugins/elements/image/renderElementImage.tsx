import React from 'react';
import { RenderElementProps } from 'slate-react';
import { ImageElement } from './components/ImageElement';
import { IMAGE } from './types';

export const renderElementImage = () => (props: RenderElementProps) => {
  if (props.element.type === IMAGE) {
    return <ImageElement {...props} />;
  }
};
