import { getElementComponent, getRenderElements } from 'elements/utils';
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
  LI = getElementComponent('li'),
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
}: RenderElementListOptions = {}) =>
  getRenderElements([
    { type: typeUl, component: UL },
    { type: typeOl, component: OL },
    { type: typeLi, component: LI },
  ]);
