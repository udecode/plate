import { getElementComponent, getRenderElements } from '../../element/utils';
import { OlElement, UlElement } from './components';
import { ListRenderElementOptions, ListType } from './types';

export const renderElementList = ({
  UL = getElementComponent(UlElement),
  OL = getElementComponent(OlElement),
  LI = getElementComponent('li'),
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
}: ListRenderElementOptions = {}) =>
  getRenderElements([
    { type: typeUl, component: UL },
    { type: typeOl, component: OL },
    { type: typeLi, component: LI },
  ]);
