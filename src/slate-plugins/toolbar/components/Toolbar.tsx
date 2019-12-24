import { Box } from '@primer/components';
import styled from 'styled-components';

export const Toolbar = styled(Box)`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;
