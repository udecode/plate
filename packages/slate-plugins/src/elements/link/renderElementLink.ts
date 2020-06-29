import { getRenderElement } from '../../common/utils/getRenderElement';
import { LinkElement } from './components';
import { LINK, LinkRenderElementOptions } from './types';

export const renderElementLink = ({
  typeLink = LINK,
  component = LinkElement,
}: LinkRenderElementOptions = {}) =>
  getRenderElement({
    type: typeLink,
    component,
  });
