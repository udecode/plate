import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { MARK_SUBSCRIPT, SubscriptRenderLeafOptions } from './types';

export const renderLeafSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
}: SubscriptRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeSubscript, component: 'sub' });
