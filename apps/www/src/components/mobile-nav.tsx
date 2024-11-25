'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { docsConfig } from '@/config/docs';
import { useMetaColor } from '@/hooks/use-meta-color';
import { Button } from '@/registry/default/plate-ui/button';

import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';

export function MobileNav() {
  const pathname = usePathname();
  const isUI = pathname?.startsWith('/docs/components');
  const navItems = isUI ? docsConfig.componentsNav : docsConfig.sidebarNav;

  const [open, setOpen] = React.useState(false);
  const { metaColor, setMetaColor } = useMetaColor();
  const onOpenChange = React.useCallback(
    (open: boolean) => {
      setOpen(open);
      setMetaColor(open ? '#09090b' : metaColor);
    },
    [setMetaColor, metaColor]
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="-ml-2 mr-2 size-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg
            className="!size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.75 9h16.5m-16.5 6.75h16.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[60svh] p-0">
        <div className="overflow-auto p-6">
          <div className="flex flex-col space-y-3">
            {docsConfig.mainNav?.map((item) => {
              return (
                item.href && (
                  <MobileLink
                    key={item.href}
                    onOpenChange={setOpen}
                    href={item.href}
                  >
                    {item.title}
                    {item.label && (
                      <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                        {item.label}
                      </span>
                    )}
                  </MobileLink>
                )
              );
            })}
          </div>
          <div className="flex flex-col space-y-2">
            {navItems.map((item, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-6">
                <h4 className="font-medium">{item.title}</h4>
                {item?.items?.length &&
                  item.items.map((_item) => (
                    <React.Fragment key={_item.href}>
                      {!_item.disabled &&
                        (_item.href ? (
                          <MobileLink
                            className="text-muted-foreground"
                            onOpenChange={setOpen}
                            href={_item.href}
                          >
                            {_item.title}
                            {item.label && (
                              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                                {item.label}
                              </span>
                            )}
                          </MobileLink>
                        ) : (
                          _item.title
                        ))}
                    </React.Fragment>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
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
      className={cn('text-base', className)}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
