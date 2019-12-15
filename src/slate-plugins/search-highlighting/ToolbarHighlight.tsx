import React from 'react';
import { Search } from '@material-ui/icons';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
`;

const Icon = styled(Search)`
  position: absolute;
  top: 0.5em;
  left: 0.5em;
  color: #ccc;
`;

const Input = styled.input`
  padding-left: 2em;
  width: 100%;
`;

export const ToolbarHighlight = ({ setSearch }: any) => (
  <StyledToolbar>
    <Wrapper>
      <Icon style={{ fontSize: '18px' }} />
      <Input
        type="search"
        placeholder="Search the text..."
        onChange={e => setSearch(e.target.value)}
      />
    </Wrapper>
  </StyledToolbar>
);
