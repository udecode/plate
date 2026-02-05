'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const FLATTEN_SECTIONS = new Set(['Components', 'Node Components']);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'extend-touch-target !p-0 h-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent',
            '-ml-2 mr-2 size-8 px-0 text-base md:hidden',
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
            <span className="sr-only">Toggle Menu</span>
          </div>
          <span className="flex h-8 items-center font-medium text-lg leading-none">
            Menu
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
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="font-medium text-muted-foreground text-sm">
              Menu
            </div>
            <div className="flex flex-col gap-3">
              {items.map(
                (item) =>
                  item.href && (
                    <MobileLink
                      key={item.href}
                      onOpenChange={setOpen}
                      href={item.href}
                    >
                      {item.title}
                      {item.label && (
                        <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[#000000] text-xs leading-none no-underline group-hover:no-underline">
                          {item.label}
                        </span>
                      )}
                    </MobileLink>
                  )
              )}
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {tree.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="font-medium text-muted-foreground text-sm">
                  {item.title}
                </div>
                <div className="flex flex-col gap-3">
                  {item?.items?.length &&
                    item.items.map((_item) => {
                      const shouldFlatten =
                        !_item.title || FLATTEN_SECTIONS.has(_item.title);

                      if (shouldFlatten && _item.items?.length) {
                        return _item.items.map((nestedItem) => (
                          <React.Fragment
                            key={(item.title ?? '') + nestedItem.title}
                          >
                            {!nestedItem.disabled && nestedItem.href && (
                              <MobileLink
                                onOpenChange={setOpen}
                                href={nestedItem.href}
                              >
                                {nestedItem.title}
                                {nestedItem.label && (
                                  <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[#000000] text-xs leading-none no-underline group-hover:no-underline">
                                    {nestedItem.label}
                                  </span>
                                )}
                              </MobileLink>
                            )}
                          </React.Fragment>
                        ));
                      }

                      return (
                        <React.Fragment key={(item.title ?? '') + _item.title}>
                          {!_item.disabled && (
                            <>
                              {_item.href ? (
                                <MobileLink
                                  onOpenChange={setOpen}
                                  href={_item.href}
                                >
                                  {_item.title}
                                  {_item.label && (
                                    <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[#000000] text-xs leading-none no-underline group-hover:no-underline">
                                      {_item.label}
                                    </span>
                                  )}
                                </MobileLink>
                              ) : (
                                <div className="font-medium text-lg">
                                  {_item.title}
                                </div>
                              )}
                              {_item.items?.length && !shouldFlatten && (
                                <div className="ml-4 flex flex-col gap-2">
                                  {_item.items.map((nestedItem) => (
                                    <React.Fragment
                                      key={nestedItem.href || nestedItem.title}
                                    >
                                      {!nestedItem.disabled &&
                                        nestedItem.href && (
                                          <MobileLink
                                            className="font-normal text-lg text-muted-foreground"
                                            onOpenChange={setOpen}
                                            href={nestedItem.href}
                                          >
                                            {nestedItem.title}
                                            {nestedItem.label && (
                                              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[#000000] text-xs leading-none no-underline group-hover:no-underline">
                                                {nestedItem.label}
                                              </span>
                                            )}
                                          </MobileLink>
                                        )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                            </>
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
}

function MobileLink({
  children,
  className,
  href,
  onOpenChange,
  ...props
}: MobileLinkProps) {
  const router = useRouter();

  return (
    <Link
      className={cn('font-medium text-2xl', className)}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
