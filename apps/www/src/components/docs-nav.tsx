'use client';

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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

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
  const normalizedPathname = normalizeDocsHref(pathname ?? '');

  return sidebarNav.length > 0 ? (
    <Sidebar
      aria-label={locale === 'cn' ? '文档导航' : 'Docs navigation'}
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex"
      collapsible="none"
    >
      <div className="h-9" />
      <div className="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
      <div className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent via-border to-transparent lg:flex" />
      <SidebarContent className="no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5">
        {sidebarNav.map((section, index) => (
          <DocsNavGroup
            key={section.href ?? section.title ?? index}
            index={index}
            pathname={normalizedPathname}
            section={section}
          />
        ))}
        <div className="-bottom-1 sticky z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
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
    <SidebarGroup className={index === 0 ? 'pt-6' : undefined}>
      <SidebarGroupLabel className="font-medium text-muted-foreground">
        {getSectionTitle(section, index, locale)}
      </SidebarGroupLabel>

      {section.items?.length ? (
        <SidebarGroupContent>
          <DocsNavItems
            dense={index > 0}
            items={section.items}
            pathname={pathname}
          />
        </SidebarGroupContent>
      ) : null}
    </SidebarGroup>
  );
}

function DocsNavItems({
  dense,
  depth = 0,
  items,
  pathname,
}: {
  dense?: boolean;
  items: SidebarNavItem[];
  pathname: string;
  depth?: number;
}) {
  return items.length ? (
    <SidebarMenu className={cn(dense && 'gap-0.5', depth > 0 && 'pt-1')}>
      {items.map((item, index) => {
        const active = isNavItemActive(item, pathname);
        const key = item.href ?? `${item.title}:${index}`;

        return (
          <SidebarMenuItem key={key} className={cn(depth > 0 && 'pl-3')}>
            <DocsNavItem active={active} item={item} pathname={pathname} />

            {item.items?.length ? (
              <DocsNavItems
                dense={dense}
                depth={depth + 1}
                items={item.items}
                pathname={pathname}
              />
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
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
  const buttonClassName =
    'relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48';

  if (item.disabled || !item.href) {
    return (
      <SidebarMenuButton className={buttonClassName} disabled>
        <DocsNavItemContent
          label={item.label}
          statusLabel={statusLabel}
          textLabels={textLabels}
          title={title}
        />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton asChild className={buttonClassName} isActive={active}>
      <Link
        aria-current={current ? 'page' : undefined}
        href={hrefWithLocale(item.href, locale)}
        rel={item.external ? 'noreferrer' : undefined}
        target={item.external ? '_blank' : undefined}
      >
        <DocsNavItemContent
          label={item.label}
          statusLabel={statusLabel}
          textLabels={textLabels}
          title={title}
        />
      </Link>
    </SidebarMenuButton>
  );
}

function DocsNavItemContent({
  label,
  statusLabel,
  textLabels,
  title,
}: {
  title?: string;
  label?: SidebarNavItem['label'];
  statusLabel?: string;
  textLabels: string[];
}) {
  return (
    <>
      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
      {title}

      {hasNewStatus(label) ? (
        <span
          className="flex size-2 rounded-full bg-blue-500"
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
    </>
  );
}
