import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps } from 'slate-react';

export const renderElementLink = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === ElementType.LINK) {
    return (
      <a {...attributes} href={element.url}>
        {children}
      </a>
    );
  }
};
