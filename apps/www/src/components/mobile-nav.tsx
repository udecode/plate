'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;
const FLATTEN_SECTIONS = new Set(['Components', 'Node Components']);

const i18n = {
  cn: {
    menu: '菜单',
    toggleMenu: '切换菜单',
  },
  en: {
    menu: 'Menu',
    toggleMenu: 'Toggle Menu',
  },
};

function getNavTitle(item: SidebarNavItem, locale: string) {
  return locale === 'cn' ? item.titleCn || item.title : item.title;
}

function getNavHref(item: SidebarNavItem, locale: string) {
  if (!item.href) return;

  return hrefWithLocale(item.href, locale);
}

function isExternalHref(href: string) {
  return ABSOLUTE_HREF_REGEX.test(href);
}

function NavLabel({ label }: { label: SidebarNavItem['label'] }) {
  if (!label) return null;

  return (
    <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[#000000] text-xs leading-none no-underline group-hover:no-underline">
      {Array.isArray(label) ? label[0] : label}
    </span>
  );
}

export function MobileNav({
  className,
  items,
  tree,
}: {
  items: SidebarNavItem[];
  tree: SidebarNavItem[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  const renderNavLink = (
    item: SidebarNavItem,
    key: React.Key,
    className?: string
  ) => {
    const href = getNavHref(item, locale);

    if (item.disabled || !href) return null;

    const external = item.external || isExternalHref(href);

    return (
      <MobileLink
        key={key}
        className={className}
        onOpenChange={setOpen}
        href={href}
        rel={external ? 'noreferrer' : undefined}
        target={external ? '_blank' : undefined}
      >
        {getNavTitle(item, locale)}
        <NavLabel label={item.label} />
      </MobileLink>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'extend-touch-target !p-0 h-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent',
            '-ml-2 mr-2 size-8 px-0 text-base lg:hidden',
            className
          )}
        >
          <div className="relative flex h-8 w-4 items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100',
                  open ? '-rotate-45 top-[0.4rem]' : 'top-1'
                )}
              />
              <span
                className={cn(
                  'absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100',
                  open ? 'top-[0.4rem] rotate-45' : 'top-2.5'
                )}
              />
            </div>
            <span className="sr-only">{content.toggleMenu}</span>
          </div>
          <span className="flex h-8 items-center font-medium text-lg leading-none">
            {content.menu}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100"
        align="start"
        alignOffset={-16}
        side="bottom"
        sideOffset={12}
      >
        <div className="flex flex-col gap-12 overflow-auto p-6">
          <div className="flex flex-col gap-4">
            <div className="font-medium text-muted-foreground text-sm">
              {content.menu}
            </div>
            <div className="flex flex-col gap-3">
              {items.map((item, index) =>
                renderNavLink(item, item.href ?? item.title ?? index)
              )}
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {tree.map((section, sectionIndex) => (
              <div key={sectionIndex} className="flex flex-col gap-4">
                <div className="font-medium text-muted-foreground text-sm">
                  {getNavTitle(section, locale)}
                </div>
                <div className="flex flex-col gap-3">
                  {section.items?.map((item) => {
                    const shouldFlatten =
                      !item.title || FLATTEN_SECTIONS.has(item.title);

                    if (shouldFlatten && item.items?.length) {
                      return item.items.map((nestedItem) =>
                        renderNavLink(
                          nestedItem,
                          `${section.title}:${nestedItem.href ?? nestedItem.title}`
                        )
                      );
                    }

                    return (
                      <React.Fragment
                        key={`${section.title}:${item.href ?? item.title}`}
                      >
                        {item.href ? (
                          renderNavLink(item, item.href)
                        ) : (
                          <div className="font-medium text-lg">
                            {getNavTitle(item, locale)}
                          </div>
                        )}
                        {item.items?.length && !shouldFlatten && (
                          <div className="ml-4 flex flex-col gap-2">
                            {item.items.map((nestedItem) =>
                              renderNavLink(
                                nestedItem,
                                nestedItem.href ?? nestedItem.title ?? 'item',
                                'font-normal text-lg text-muted-foreground'
                              )
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MobileLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  rel?: string;
  target?: string;
}

function MobileLink({
  children,
  className,
  href,
  onOpenChange,
  ...props
}: MobileLinkProps) {
  const { push } = useRouter();
  const hrefString = href.toString();
  const external = isExternalHref(hrefString);

  return (
    <Link
      className={cn('font-medium text-2xl', className)}
      onClick={(event) => {
        onOpenChange?.(false);

        if (external) return;

        event.preventDefault();
        push(hrefString);
      }}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
