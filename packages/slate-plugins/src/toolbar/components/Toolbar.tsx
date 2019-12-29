import styled from 'styled-components';

export const Toolbar = styled.div<{ height?: string }>`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }

  height: ${props => props.height || '18px'};

  svg {
    width: ${props => props.height || '18px'};
    height: ${props => props.height || '18px'};
  }
`;
