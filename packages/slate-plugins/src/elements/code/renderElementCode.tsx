import { getRenderElement } from 'element';
import { CodeElement } from './components';
import { CODE, CodeRenderElementOptions } from './types';

export const renderElementCode = ({
  typeCode = CODE,
  component = CodeElement,
}: CodeRenderElementOptions = {}) =>
  getRenderElement({
    type: typeCode,
    component,
  });
