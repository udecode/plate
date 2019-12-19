import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps } from 'slate-react';
import { VideoElement } from './components/VideoElement';

export const renderElementVideo = () => (props: RenderElementProps) => {
  if (props.element.type === ElementType.VIDEO) {
    return <VideoElement {...props} />;
  }
};
