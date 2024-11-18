import type { DocIcons } from '@/config/docs-icons';

export interface NavItem {
  description?: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: keyof typeof DocIcons;
  keywords?: string[];
  label?: string[] | string;
  title?: string;
  value?: string;
}

export interface NavItemWithChildren extends NavItem {
  headings?: string[];
  items?: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}
