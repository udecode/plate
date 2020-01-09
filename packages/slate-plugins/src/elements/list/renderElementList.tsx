import React from 'react';
import { getElement } from 'elements/utils';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { ListType, RenderElementListOptions } from './types';

const UlElement = styled.ul`
  padding-inline-start: 24px;
  margin-block-start: 0;
  margin-block-end: 0;
`;

const OlElement = styled.ol`
  padding-inline-start: 24px;
  margin-block-start: 0;
  margin-block-end: 0;
`;

export const renderElementList = ({
  UL = UlElement,
  OL = OlElement,
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
