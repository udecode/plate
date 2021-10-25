import React from 'react';
import { Menu, MenuButton, MenuItem } from '@udecode/plate-ui-menu';

export const TableMenu = () => (
  <Menu menuButton={<MenuButton>Table options</MenuButton>}>
    <MenuItem type="checkbox">Border column</MenuItem>
    <MenuItem type="checkbox">Border row</MenuItem>
  </Menu>
);
