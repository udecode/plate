import styled from 'styled-components';

interface Props {
  [key: string]: any;
  active?: boolean;
  reversed?: boolean;
}

export const Button = styled.span<Props>`
  cursor: pointer;
  color: ${({ active, reversed }) =>
    reversed ? (active ? 'white' : '#aaa') : active ? 'black' : '#ccc'};
`;
