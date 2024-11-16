import type { Icons } from '@/components/icons';

export interface NavItem {
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: keyof typeof Icons;
  keywords?: string[];
  label?: string[] | string;
  title?: string;
}

export interface NavItemWithChildren extends NavItem {
  headings?: string[];
  items?: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}
