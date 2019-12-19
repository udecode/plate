import React from 'react';
import { RenderElementProps } from 'slate-react';
import { ListType } from './types';

export const renderElementList = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ListType.UL_LIST:
      return <ul {...attributes}>{children}</ul>;
    case ListType.OL_LIST:
      return <ol {...attributes}>{children}</ol>;
    case ListType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    default:
      break;
  }
};
