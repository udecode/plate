import styled from 'styled-components';
import { getRenderLeaf } from '../../common/utils/getRenderLeaf';
import { CodeRenderLeafOptions, MARK_CODE } from './types';

const Code = styled.code`
  font-family: monospace;
  background-color: #eee;
  font-size: 12px;
  padding: 3px;
`;

export const renderLeafCode = ({
  typeCode = MARK_CODE,
}: CodeRenderLeafOptions = {}) =>
  getRenderLeaf({ type: typeCode, component: Code });
