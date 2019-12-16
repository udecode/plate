import styled from 'styled-components';

interface Props {
  bold?: boolean;
  highlight?: boolean;
}

export const HighlightLeaf = styled.span<Props>`
  font-weight: ${({ bold }) => bold && 'bold'};
  background-color: ${({ highlight }) => highlight && '#ffeeba'};
`;
