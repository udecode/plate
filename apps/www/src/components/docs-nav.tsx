"use client";

import type { SidebarNavItem } from "@/types/nav";

import castArray from "lodash/castArray.js";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { SlateExamplesSidebarNav } from "@/app/(app)/examples/slate/slate-examples-shell";
import { useLocale } from "@/hooks/useLocale";
import {
  getLocalizedNavTitle,
  normalizeDocsHref,
} from "@/lib/docs-nav-metadata";
import {
  getDocsRootFromPathname,
  getSidebarNavForDocsRoot,
} from "@/lib/docs-root-nav";
import { cn } from "@/lib/utils";
import { hrefWithLocale } from "@/lib/withLocale";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function getLabelValues(label: SidebarNavItem["label"]) {
  return castArray(label).filter(Boolean);
}

function getStatusLabel(label: SidebarNavItem["label"]) {
  return getLabelValues(label).find(
    (value) => value === "New" || value === "Updated"
  );
}

function getTextLabels(label: SidebarNavItem["label"]) {
  return getLabelValues(label).filter(
    (value) => value !== "New" && value !== "Updated"
  );
}

function isNavItemActive(item: SidebarNavItem, pathname: string): boolean {
  if (item.href) {
    const href = normalizeDocsHref(item.href);

    if (href === pathname) return true;
    if (
      href !== "/docs" &&
      href !== "/docs/slate" &&
      pathname.startsWith(`${href}/`)
    ) {
      return true;
    }
  }

  return item.items?.some((child) => isNavItemActive(child, pathname)) ?? false;
}

function getSectionTitle(
  section: SidebarNavItem,
  index: number,
  locale: string
) {
  if (index === 0 && section.title === "Get Started") {
    return locale === "cn" ? "概览" : "Overview";
  }

  return getLocalizedNavTitle(section, locale);
}

const docsNavItemButtonClassName =
  "relative h-[30px] w-fit max-w-full overflow-hidden border border-transparent text-[0.8rem] font-medium whitespace-nowrap data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48";

function getNavItemKey(item: SidebarNavItem, index: number, depth: number) {
  return item.href ?? `${depth}:${index}:${String(item.title)}`;
}

function cloneNavItem(item: SidebarNavItem): SidebarNavItem {
  return {
    ...item,
    items: item.items?.map(cloneNavItem),
  };
}

function findNavItemByTitle(
  items: SidebarNavItem[] | undefined,
  section: SidebarNavItem
): SidebarNavItem | undefined {
  if (!section.title) return;

  for (const item of items ?? []) {
    if (item.href && item.title === section.title) return item;

    const child = findNavItemByTitle(item.items, section);

    if (child) return child;
  }
}

function foldMatchingSectionsIntoItems(sections: SidebarNavItem[]) {
  const foldedSections: SidebarNavItem[] = [];

  for (const section of sections) {
    const sectionItems = section.items?.map(cloneNavItem);
    const targetItem = findNavItemByTitle(
      foldedSections.flatMap((item) => item.items ?? []),
      section
    );

    if (targetItem && sectionItems?.length) {
      targetItem.items = [...(targetItem.items ?? []), ...sectionItems];
      continue;
    }

    foldedSections.push({
      ...section,
      items: sectionItems,
    });
  }

  return foldedSections;
}

function getSectionKey(section: SidebarNavItem, index: number) {
  return section.href ?? section.title ?? String(index);
}

function getNavItemCount(items: SidebarNavItem[] | undefined): number {
  return (
    items?.reduce(
      (count, item) => count + 1 + getNavItemCount(item.items),
      0
    ) ?? 0
  );
}

function getActiveSectionKey(sections: SidebarNavItem[], pathname: string) {
  if (sections.length === 0) return;

  const activeIndex = sections.findIndex((section) =>
    isNavItemActive(section, pathname)
  );

  if (activeIndex === -1) return getSectionKey(sections[0], 0);

  return getSectionKey(sections[activeIndex], activeIndex);
}

export function DocsNav({ sidebarNav }: { sidebarNav: SidebarNavItem[] }) {
  const locale = useLocale();
  const pathname = usePathname();
  const normalizedPathname = normalizeDocsHref(pathname ?? "");
  const docsRoot = getDocsRootFromPathname(normalizedPathname);
  const isSlateExamplesIndex = normalizedPathname === "/docs/slate/examples";
  const rootSidebarNav = React.useMemo(
    () => getSidebarNavForDocsRoot(sidebarNav, docsRoot),
    [docsRoot, sidebarNav]
  );
  const navSections = React.useMemo(
    () => foldMatchingSectionsIntoItems(rootSidebarNav),
    [rootSidebarNav]
  );
  const activeSectionKey = React.useMemo(
    () => getActiveSectionKey(navSections, normalizedPathname),
    [navSections, normalizedPathname]
  );
  const [openSection, setOpenSection] = React.useState<{
    key?: string;
    pathname: string;
  }>(() => ({
    key: activeSectionKey,
    pathname: normalizedPathname,
  }));
  const openSectionKey =
    openSection.pathname === normalizedPathname
      ? openSection.key
      : activeSectionKey;

  return navSections.length > 0 ? (
    <Sidebar
      aria-label={locale === "cn" ? "文档导航" : "Docs navigation"}
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex"
      collapsible="none"
    >
      <div className="h-9" />
      <SidebarContent className="no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5">
        {isSlateExamplesIndex ? (
          <SlateExamplesSidebarNav
            backHref="/docs/slate"
            backLabel="Back to Slate docs"
            indexActive
            indexHref="/docs/slate/examples"
            showIndex
          />
        ) : (
          <>
            {docsRoot === "slate"
              ? navSections.map((section, index) => (
                  <DocsNavStaticGroup
                    key={getSectionKey(section, index)}
                    index={index}
                    pathname={normalizedPathname}
                    section={section}
                  />
                ))
              : navSections.map((section, index) => {
                  const sectionKey = getSectionKey(section, index);

                  return (
                    <DocsNavGroup
                      key={sectionKey}
                      index={index}
                      open={openSectionKey === sectionKey}
                      pathname={normalizedPathname}
                      section={section}
                      onOpenChange={(open) => {
                        setOpenSection({
                          key: open ? sectionKey : undefined,
                          pathname: normalizedPathname,
                        });
                      }}
                    />
                  );
                })}
          </>
        )}
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  ) : null;
}

function DocsNavStaticGroup({
  index,
  pathname,
  section,
}: {
  index: number;
  pathname: string;
  section: SidebarNavItem;
}) {
  const locale = useLocale();
  const sectionTitle = getSectionTitle(section, index, locale);
  const standalone =
    section.items?.length === 1 && section.items[0]?.title === section.title;

  return section.items?.length ? (
    <SidebarGroup
      className={cn("shrink-0", index === 0 && sectionTitle && "pt-6")}
    >
      {standalone || !sectionTitle ? null : (
        <SidebarGroupLabel className="font-medium text-muted-foreground">
          {sectionTitle}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <DocsNavItems
          dense={!standalone && index > 0}
          items={section.items}
          pathname={pathname}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  ) : null;
}

function DocsNavGroup({
  index,
  onOpenChange,
  open,
  pathname,
  section,
}: {
  index: number;
  open: boolean;
  pathname: string;
  section: SidebarNavItem;
  onOpenChange: (open: boolean) => void;
}) {
  const locale = useLocale();
  const sectionTitle = getSectionTitle(section, index, locale);
  const scrollable = getNavItemCount(section.items) > 24;

  return (
    <SidebarGroup
      className={cn(
        "min-h-0",
        index === 0 && "pt-6",
        open && scrollable ? "flex-1" : "shrink-0"
      )}
    >
      {section.items?.length ? (
        <Collapsible
          open={open}
          className={cn("min-h-0", scrollable && "flex flex-col")}
          onOpenChange={onOpenChange}
        >
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel
              asChild
              className="w-full cursor-pointer justify-between font-medium text-muted-foreground hover:text-foreground"
            >
              <button
                type="button"
                aria-label={
                  open ? `Collapse ${sectionTitle}` : `Expand ${sectionTitle}`
                }
              >
                <span>{sectionTitle}</span>
                <ChevronRightIcon
                  className={cn(
                    "size-3.5 transition-transform",
                    open && "rotate-90"
                  )}
                />
              </button>
            </SidebarGroupLabel>
          </CollapsibleTrigger>

          <CollapsibleContent
            className={cn(
              scrollable &&
                "min-h-0 overflow-hidden data-[state=open]:flex data-[state=open]:flex-1 data-[state=open]:flex-col"
            )}
          >
            <SidebarGroupContent
              className={cn(
                scrollable
                  ? "no-scrollbar min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
                  : "overflow-visible"
              )}
            >
              <DocsNavItems
                dense={index > 0}
                items={section.items}
                pathname={pathname}
              />
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
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
    <SidebarMenu
      className={cn(
        dense && "gap-0.5",
        depth > 0 && "mt-1 ml-3 border-border/70 border-l pl-2"
      )}
    >
      {items.map((item, index) => {
        const active = isNavItemActive(item, pathname);
        const key = getNavItemKey(item, index, depth);

        return (
          <SidebarMenuItem key={key}>
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

  if (item.disabled || !item.href) {
    return (
      <SidebarMenuButton className={docsNavItemButtonClassName} disabled>
        <DocsNavItemContent
          statusLabel={statusLabel}
          textLabels={textLabels}
          title={title}
        />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      asChild
      className={docsNavItemButtonClassName}
      isActive={active}
    >
      <Link
        aria-current={current ? "page" : undefined}
        href={hrefWithLocale(item.href, locale)}
        rel={item.external ? "noreferrer" : undefined}
        target={item.external ? "_blank" : undefined}
      >
        <DocsNavItemContent
          statusLabel={statusLabel}
          textLabels={textLabels}
          title={title}
        />
      </Link>
    </SidebarMenuButton>
  );
}

function DocsNavItemContent({
  statusLabel,
  textLabels,
  title,
}: {
  title?: string;
  statusLabel?: string;
  textLabels: string[];
}) {
  return (
    <>
      <span className="absolute inset-0 flex bg-transparent" />
      <span className="min-w-0 truncate">{title}</span>

      {statusLabel ? (
        <span
          className="flex size-2 shrink-0 rounded-full bg-blue-500"
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
