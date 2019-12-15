import { Box } from '@primer/components';
import styled from 'styled-components';

export const Menu = styled(Box)`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;
