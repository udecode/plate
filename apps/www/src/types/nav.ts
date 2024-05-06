import type { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: keyof typeof Icons;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  headings?: string[];
  items?: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}
