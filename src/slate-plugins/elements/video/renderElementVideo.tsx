import React from 'react';
import { RenderElementProps } from 'slate-react';
import { VideoElement } from './components/VideoElement';
import { VIDEO } from './types';

export const renderElementVideo = () => (props: RenderElementProps) => {
  if (props.element.type === VIDEO) {
    return <VideoElement {...props} />;
  }
};
