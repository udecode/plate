import type { DocIcons } from '@/config/docs-icons';

export interface MainNavItem extends NavItem {}

export interface NavItem {
  description?: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: keyof typeof DocIcons;
  keywords?: string[];
  label?: string[] | string;
  title?: string;
  titleCn?: string;
  value?: string;
}

export interface NavItemWithChildren extends NavItem {
  headings?: string[];
  items?: NavItemWithChildren[];
}

export interface SidebarNavItem extends NavItemWithChildren {}
