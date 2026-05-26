'use client';

import React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import { castArray } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLocale } from '@/hooks/useLocale';
import {
  getLocalizedNavTitle,
  normalizeDocsHref,
} from '@/lib/docs-nav-metadata';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

function getLabelValues(label: SidebarNavItem['label']) {
  return castArray(label).filter(Boolean);
}

function hasNewStatus(label: SidebarNavItem['label']) {
  return Boolean(getStatusLabel(label));
}

function getStatusLabel(label: SidebarNavItem['label']) {
  return getLabelValues(label).find(
    (value) => value === 'New' || value === 'Updated'
  );
}

function getTextLabels(label: SidebarNavItem['label']) {
  return getLabelValues(label).filter(
    (value) => value !== 'New' && value !== 'Updated'
  );
}

function isNavItemActive(item: SidebarNavItem, pathname: string): boolean {
  if (item.href) {
    const href = normalizeDocsHref(item.href);

    if (href === pathname) return true;
    if (href !== '/docs' && pathname.startsWith(`${href}/`)) return true;
  }

  return item.items?.some((child) => isNavItemActive(child, pathname)) ?? false;
}

function getSectionTitle(
  section: SidebarNavItem,
  index: number,
  locale: string
) {
  if (index === 0 && section.title === 'Get Started') {
    return locale === 'cn' ? '分区' : 'Sections';
  }

  return getLocalizedNavTitle(section, locale);
}

export function DocsNav({ sidebarNav }: { sidebarNav: SidebarNavItem[] }) {
  const locale = useLocale();
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement | null>(null);

  const normalizedPathname = React.useMemo(
    () => normalizeDocsHref(pathname ?? ''),
    [pathname]
  );

  React.useEffect(() => {
    const navElement = navRef.current;

    const frame = requestAnimationFrame(() => {
      const activeElement = navElement?.querySelector<HTMLAnchorElement>(
        'a[aria-current="page"]'
      );

      if (!activeElement) return;

      const scrollArea = activeElement.closest<HTMLElement>(
        '[data-docs-sidebar-scroll]'
      );

      if (!scrollArea) return;

      const areaRect = scrollArea.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();
      const offset =
        itemRect.top -
        areaRect.top -
        scrollArea.clientHeight / 2 +
        itemRect.height / 2;

      scrollArea.scrollTo({
        top: Math.max(0, scrollArea.scrollTop + offset),
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [normalizedPathname]);

  return sidebarNav.length > 0 ? (
    <nav
      aria-label={locale === 'cn' ? '文档导航' : 'Docs navigation'}
      className="relative h-full w-[calc(100%-1rem)] pl-4"
      ref={navRef}
    >
      <div className="absolute top-12 right-0 bottom-0 hidden w-px bg-linear-to-b from-transparent via-border to-transparent md:block" />
      <div className="pointer-events-none sticky top-0 z-10 h-8 bg-linear-to-b from-background via-background/90 to-transparent" />

      <div className="flex flex-col gap-4 pr-4 pb-12">
        {sidebarNav.map((section, index) => (
          <DocsNavGroup
            key={section.href ?? section.title ?? index}
            index={index}
            pathname={normalizedPathname}
            section={section}
          />
        ))}
      </div>

      <div className="pointer-events-none sticky bottom-0 z-10 h-12 bg-linear-to-t from-background via-background/90 to-transparent" />
    </nav>
  ) : null;
}

function DocsNavGroup({
  index,
  pathname,
  section,
}: {
  index: number;
  pathname: string;
  section: SidebarNavItem;
}) {
  const locale = useLocale();

  return (
    <section className="flex flex-col gap-1">
      <div className="px-2 font-medium text-muted-foreground text-xs leading-7">
        {getSectionTitle(section, index, locale)}
      </div>

      {section.items?.length ? (
        <DocsNavItems items={section.items} pathname={pathname} />
      ) : null}
    </section>
  );
}

function DocsNavItems({
  depth = 0,
  items,
  pathname,
}: {
  items: SidebarNavItem[];
  pathname: string;
  depth?: number;
}) {
  return items.length ? (
    <ul className={cn('flex flex-col gap-0.5', depth > 0 && 'pt-0.5')}>
      {items.map((item, index) => {
        const active = isNavItemActive(item, pathname);
        const key = item.href ?? `${item.title}:${index}`;

        return (
          <li key={key} className={cn(depth > 0 && 'pl-3')}>
            <DocsNavItem active={active} item={item} pathname={pathname} />

            {item.items?.length ? (
              <DocsNavItems
                depth={depth + 1}
                items={item.items}
                pathname={pathname}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  ) : null;
}

function DocsNavItem({
  active,
  item,
  pathname,
}: {
  active: boolean;
  item: SidebarNavItem;
  pathname: string;
}) {
  const locale = useLocale();
  const title = getLocalizedNavTitle(item, locale);
  const textLabels = getTextLabels(item.label);
  const statusLabel = getStatusLabel(item.label);
  const current = item.href && normalizeDocsHref(item.href) === pathname;

  if (item.disabled || !item.href) {
    return (
      <span className="flex min-h-7 w-full items-center">
        <DocsNavItemContent
          active={false}
          disabled={item.disabled}
          label={item.label}
          statusLabel={statusLabel}
          textLabels={textLabels}
          title={title}
        />
      </span>
    );
  }

  return (
    <Link
      aria-current={current ? 'page' : undefined}
      className="group flex min-h-7 w-full items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      href={hrefWithLocale(item.href, locale)}
      rel={item.external ? 'noreferrer' : undefined}
      target={item.external ? '_blank' : undefined}
    >
      <DocsNavItemContent
        active={active}
        label={item.label}
        statusLabel={statusLabel}
        textLabels={textLabels}
        title={title}
      />
    </Link>
  );
}

function DocsNavItemContent({
  active,
  disabled,
  label,
  statusLabel,
  textLabels,
  title,
}: {
  active: boolean;
  title?: string;
  disabled?: boolean;
  label?: SidebarNavItem['label'];
  statusLabel?: string;
  textLabels: string[];
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 max-w-full items-center gap-2 rounded-md border border-transparent px-2 font-medium text-[0.8rem] leading-5 transition-colors',
        disabled
          ? 'cursor-not-allowed text-muted-foreground/35'
          : 'text-foreground group-hover:bg-accent/70 group-hover:text-accent-foreground',
        active && 'border-accent bg-accent text-accent-foreground'
      )}
    >
      <span className="truncate">{title}</span>

      {hasNewStatus(label) ? (
        <span
          className="size-2 shrink-0 rounded-full bg-blue-500"
          title={statusLabel}
        />
      ) : null}

      {textLabels.length > 0 ? (
        <span className="flex shrink-0 gap-1">
          {textLabels.map((value) => (
            <span
              key={value}
              className="rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground leading-none"
            >
              {value}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
