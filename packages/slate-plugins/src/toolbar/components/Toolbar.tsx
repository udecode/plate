import styled from 'styled-components';

export interface ToolbarProps {
  height?: string;
  [key: string]: any;
}

export const Toolbar = styled.div<ToolbarProps>`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }

  box-sizing: content-box;
  user-select: none;

  height: ${props => props.height || '18px'};

  > span,
  svg {
    width: ${props => props.height || '18px'};
    height: ${props => props.height || '18px'};
  }
`;
