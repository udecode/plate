import styled from 'styled-components';
import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { HighlightRenderLeafOptions, MARK_HIGHLIGHT } from './types';

const HighlightText = styled.mark<{ bg: string }>`
  background-color: ${(props) => props.bg};
`;

export const renderLeafHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
  bg = '#ffeeba',
}: HighlightRenderLeafOptions = {}) =>
  getRenderLeaf({
    type: typeHighlight,
    component: HighlightText,
    bg,
  });
