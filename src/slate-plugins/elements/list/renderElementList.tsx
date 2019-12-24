import React from 'react';
import { RenderElementProps } from 'slate-react';
import { getElement } from '../utils';
import { ListType, RenderElementListOptions } from './types';

export const renderElementList = ({
  UL = getElement('ul'),
  OL = getElement('ol'),
  LI = getElement('li'),
}: RenderElementListOptions = {}) => (props: RenderElementProps) => {
  switch (props.element.type) {
    case ListType.UL_LIST:
      return <UL {...props} />;
    case ListType.OL_LIST:
      return <OL {...props} />;
    case ListType.LIST_ITEM:
      return <LI {...props} />;
    default:
      break;
  }
};
