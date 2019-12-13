import React from 'react';
import { css } from 'emotion';
import { Icon, Toolbar } from 'components/components';

export const ToolbarHighlight = ({ setSearch }: any) => (
  <Toolbar>
    <div
      className={css`
        position: relative;
      `}
    >
      <Icon
        className={css`
          position: absolute;
          top: 0.5em;
          left: 0.5em;
          color: #ccc;
        `}
      >
        search
      </Icon>
      <input
        type="search"
        placeholder="Search the text..."
        onChange={e => setSearch(e.target.value)}
        className={css`
          padding-left: 2em;
          width: 100%;
        `}
      />
    </div>
  </Toolbar>
);
