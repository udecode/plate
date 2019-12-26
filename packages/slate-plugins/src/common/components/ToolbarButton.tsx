import styled from 'styled-components';

interface Props {
  [key: string]: any;
  active?: boolean;
  reversed?: boolean;
}

export const ToolbarButton = styled.span<Props>`
  cursor: pointer;
  color: ${({ active, reversed }) =>
    reversed ? (active ? 'white' : '#aaa') : active ? 'black' : '#ccc'};
`;
