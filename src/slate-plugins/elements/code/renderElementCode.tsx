import { getRenderElement } from '../utils';
import { CodeElement } from './components';
import { CODE } from './types';

export const renderElementCode = getRenderElement({
  type: CODE,
  component: CodeElement,
});
