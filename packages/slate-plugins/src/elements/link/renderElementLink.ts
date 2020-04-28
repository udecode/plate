import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
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
