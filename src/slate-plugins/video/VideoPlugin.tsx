import React from 'react';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { Plugin, RenderElementProps } from 'slate-react';
import { VideoElement } from './VideoElement';

export const withVideo = (editor: Editor) => {
  const { isVoid } = editor;
  editor.isVoid = element =>
    element.type === ElementType.VIDEO ? true : isVoid(element);
  return editor;
};

export const renderElementVideo = (props: RenderElementProps) => {
  const { element } = props;
  switch (element.type) {
    case ElementType.VIDEO:
      return <VideoElement {...props} />;
    default:
      break;
  }
};

export const VideoPlugin = (): Plugin => ({
  editor: withVideo,
  renderElement: renderElementVideo,
});
