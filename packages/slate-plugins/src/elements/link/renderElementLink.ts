import { getRenderElement, RenderElementOptions } from 'element';
import { LinkElement } from './components';
import { LINK } from './types';

export const renderElementLink = ({
  typeLink = LINK,
  component = LinkElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeLink,
    component,
  });
