'use client';

import React from 'react';

import type { DocsConfig } from '@/config/docs';
import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icons } from './icons';

export interface DocsSidebarNavProps {
  config: DocsConfig;
}

export function DocsSidebarNav({ config }: DocsSidebarNavProps) {
  const { componentsNav: componentItems, sidebarNav: coreItems } = config;

  const pathname = usePathname();
  const items = pathname?.includes('/docs/components')
    ? componentItems
    : coreItems;

  return items.length > 0 ? (
    <div className="w-full">
      {items.map((item, index) => (
        <div key={index} className={cn('pb-4')}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {item.title}
          </h4>
          {item?.items?.length && (
            <DocsSidebarNavItems items={item.items} pathname={pathname} />
          )}
        </div>
      ))}
    </div>
  ) : null;
}

interface DocsSidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
}

export function DocsSidebarNavItems({
  items,
  pathname,
}: DocsSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <React.Fragment key={index}>
            <Link
              className={cn(
                'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline',
                item.disabled && 'cursor-not-allowed opacity-60',
                pathname === item.href
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
              href={item.href}
              rel={item.external ? 'noreferrer' : ''}
              target={item.external ? '_blank' : ''}
            >
              <span className="whitespace-nowrap">{item.title}</span>
              {item.isExternalLink && (
                <Icons.externalLink className=" ml-1 size-4" />
              )}
              {item.label && (
                <span
                  className={cn(
                    'ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none text-foreground no-underline group-hover:no-underline',
                    item.label === 'New' && 'bg-[#adfa1d] dark:text-background',
                    item.label === 'Plus' &&
                      'bg-primary text-primary-foreground'
                  )}
                >
                  {item.label}
                </span>
              )}
              {item.new && (
                <span
                  className={cn(
                    'ml-2 rounded-md px-1.5 py-0.5 text-xs leading-none text-foreground no-underline group-hover:no-underline',
                    'bg-[#adfa1d] dark:text-background'
                  )}
                >
                  New
                </span>
              )}
            </Link>
            {item.items?.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                className={cn(
                  'group flex w-full items-center rounded-md border border-transparent px-6 py-1 hover:underline',
                  subItem.disabled && 'cursor-not-allowed opacity-60',
                  pathname === subItem.href
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
                href={subItem.href!}
                rel={subItem.external ? 'noreferrer' : ''}
                target={subItem.external ? '_blank' : ''}
              >
                <span className="whitespace-nowrap">{subItem.title}</span>
                {subItem.label && (
                  <span
                    className={cn(
                      'ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none text-foreground no-underline group-hover:no-underline',
                      subItem.label === 'New' &&
                        'bg-[#adfa1d] dark:text-background'
                    )}
                  >
                    {subItem.label}
                  </span>
                )}
              </Link>
            ))}
          </React.Fragment>
        ) : (
          <span
            key={index}
            className={cn(
              'flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <span className="whitespace-nowrap">{item.title}</span>
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
