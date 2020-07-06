import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { MARK_SUPERSCRIPT, SuperscriptRenderLeafOptions } from './types';

export const renderLeafSuperscript = ({
  typeSuperscript = MARK_SUPERSCRIPT,
}: SuperscriptRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeSuperscript, component: 'sup' });
