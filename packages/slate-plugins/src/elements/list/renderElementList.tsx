import React from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { getElement } from '../utils';
import { ListType, RenderElementListOptions } from './types';

const UlElement = styled.ul`
  padding-left: 24px;
`;

export const renderElementList = ({
  UL = UlElement,
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
