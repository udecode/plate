import React from 'react';
import { Search } from '@material-ui/icons';
import { HeadingToolbar } from 'slate-plugins';
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

interface Props {
  setSearch: any;
}

export const ToolbarSearchHighlight = ({ setSearch }: Props) => (
  <HeadingToolbar>
    <Wrapper>
      <Icon style={{ fontSize: '18px' }} />
      <Input
        type="search"
        placeholder="Search the text..."
        onChange={e => setSearch(e.target.value)}
      />
    </Wrapper>
  </HeadingToolbar>
);
