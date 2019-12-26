import styled from 'styled-components';

export const Toolbar = styled.div`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;
