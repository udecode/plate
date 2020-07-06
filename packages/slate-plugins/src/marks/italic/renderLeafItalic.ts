import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { ItalicRenderLeafOptions, MARK_ITALIC } from './types';

export const renderLeafItalic = ({
  typeItalic = MARK_ITALIC,
}: ItalicRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeItalic, component: 'em' });
