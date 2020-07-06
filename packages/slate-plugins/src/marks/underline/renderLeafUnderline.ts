import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { MARK_UNDERLINE, UnderlineRenderLeafOptions } from './types';

export const renderLeafUnderline = ({
  typeUnderline = MARK_UNDERLINE,
}: UnderlineRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeUnderline, component: 'u' });
