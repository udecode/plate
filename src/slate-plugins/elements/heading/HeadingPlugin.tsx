import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { Plugin, RenderElementProps } from 'slate-react';

export const renderElementHeading = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case ElementType.HEADING_1:
      return <h1 {...attributes}>{children}</h1>;
    case ElementType.HEADING_2:
      return <h2 {...attributes}>{children}</h2>;
    case ElementType.HEADING_3:
      return <h3 {...attributes}>{children}</h3>;
    case ElementType.HEADING_4:
      return <h4 {...attributes}>{children}</h4>;
    case ElementType.HEADING_5:
      return <h5 {...attributes}>{children}</h5>;
    case ElementType.HEADING_6:
      return <h6 {...attributes}>{children}</h6>;
    default:
      break;
  }
};

export const HeadingPlugin = (): Plugin => ({
  renderElement: renderElementHeading,
});
