import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { Plugin, RenderElementProps } from 'slate-react';

export const renderElementList = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ElementType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ElementType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ElementType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    default:
      break;
  }
};

export const ListPlugin = (): Plugin => ({
  renderElement: renderElementList,
});
