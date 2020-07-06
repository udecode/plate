import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { BoldRenderLeafOptions, MARK_BOLD } from './types';

export const renderLeafBold = ({
  typeBold = MARK_BOLD,
}: BoldRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeBold, component: 'strong' });
