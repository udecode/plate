import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
import { CodeElement } from './components';
import { CODE } from './types';

export const renderElementCode = ({
  typeCode = CODE,
  component = CodeElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeCode,
    component,
  });
