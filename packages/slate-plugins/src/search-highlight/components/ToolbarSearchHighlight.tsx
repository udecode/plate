import React from 'react';
import styled from 'styled-components';
import { HeadingToolbar } from 'toolbar';

const Wrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  padding-left: 2em;
  width: 100%;
`;

interface Props {
  icon: any;
  setSearch: any;
}

export const ToolbarSearchHighlight = ({ icon: Icon, setSearch }: Props) => (
  <HeadingToolbar>
    <Wrapper>
      <Icon
        style={{
          position: 'absolute',
          top: '0.5em',
          left: '0.5em',
          color: '#ccc',
          fontSize: '18px',
        }}
      />
      <Input
        type="search"
        placeholder="Search the text..."
        onChange={e => setSearch(e.target.value)}
      />
    </Wrapper>
  </HeadingToolbar>
);
