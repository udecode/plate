import React from 'react';
import {
  Menu,
  ProSidebar,
  SidebarContent,
  SidebarHeader,
} from 'react-pro-sidebar';
import { capitalCase } from 'change-case';
import { sidebarItems } from '../config/sidebarItems';
import { Footer } from './Footer';
import { Item } from './Item';

export function Sidebar() {
  return (
    <ProSidebar>
      <SidebarHeader>Plate Examples</SidebarHeader>

      <SidebarContent>
        <Menu iconShape="square">
          <Item href="/">Playground</Item>
          {sidebarItems.map((item) => (
            <Item key={item} href={`/${item}`}>
              {capitalCase(item)}
            </Item>
          ))}
        </Menu>
      </SidebarContent>

      <Footer />
    </ProSidebar>
  );
}
