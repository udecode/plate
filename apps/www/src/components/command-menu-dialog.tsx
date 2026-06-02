"use client";

import * as React from "react";

import type {
  MainNavItem,
  NavItemWithChildren,
  SidebarNavItem,
} from "@/types/nav";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useDocsSearch as useFumadocsSearch } from "fumadocs-core/search/client";
import {
  ArrowRight,
  Circle,
  CornerDownLeft,
  Laptop,
  Moon,
  SunMedium,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { copyToClipboardWithMeta } from "@/components/copy-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import { useLocale } from "@/hooks/useLocale";
import { getCommandMenuSearchState } from "@/lib/command-menu-search";
import {
  getRegistryClipboardInstallCommand,
  getRegistryInstallCommand,
} from "@/lib/registry-install";
import {
  getSearchResultGroup,
  getSearchResultKey,
  searchResultGroupOrder,
} from "@/lib/search-result-groups";
import { cn } from "@/lib/utils";
import { hrefWithLocale } from "@/lib/withLocale";

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;
const CN_DOCS_PREFIX_REGEX = /^\/cn(?=\/docs)/;
const WHITESPACE_REGEX = /\s+/;
const DOC_SEARCH_DEBOUNCE_MS = 300;
const MIN_DOC_SEARCH_LENGTH = 2;
const commandMenuCopyableRegistryNames = new Set(
  `
  ai-kit align-kit autoformat-classic-kit autoformat-kit basic-blocks-kit
  basic-marks-kit basic-nodes-kit block-menu-kit block-placeholder-kit
  block-selection-kit callout-kit code-block-kit code-drawing-kit column-kit
  comment-kit copilot-kit cursor-overlay-kit date-kit discussion-kit dnd-kit
  docx-kit docx-export-kit editor-base-kit editor-kit emoji-kit exit-break-kit
  fixed-toolbar-classic-kit fixed-toolbar-kit floating-toolbar-kit
  floating-toolbar-classic-kit footnote-kit font-kit indent-kit
  line-height-kit link-kit list-classic-kit list-kit markdown-kit math-kit
  media-kit media-uploadthing-kit mention-kit slash-kit suggestion-kit
  tabbable-kit table-kit toc-kit toggle-kit
  ai-demo align-demo autoformat-demo basic-blocks-demo basic-marks-demo
  basic-nodes-demo block-menu-demo block-selection-demo callout-demo
  code-block-demo code-drawing-demo collaboration-demo column-demo
  controlled-demo copilot-demo cursor-overlay-demo date-demo discussion-demo
  dnd-demo editable-voids-demo emoji-demo equation-demo excalidraw-demo
  exit-break-demo find-replace-demo floating-toolbar-demo font-demo
  footnote-demo huge-document-demo hundreds-editors-demo html-demo
  indent-demo link-demo line-height-demo list-classic-demo list-demo
  markdown-demo media-demo mention-demo plugin-rules-demo preview-markdown-demo
  select-editor-demo single-block-demo slash-command-demo tabbable-demo
  table-demo toc-demo toggle-demo version-history-demo
  ai-node ai-toolbar-button blockquote-node callout-node caption code-block-node
  code-drawing-node code-node column-node comment-node date-node editor
  equation-node excalidraw-node fixed-toolbar floating-toolbar font-size-toolbar-button
  heading-node highlight-node hr-node kbd-node link-node list-classic-node
  media-image-node media-toolbar mention-node paragraph-node slash-node
  suggestion-node table-node toc-node toggle-node toolbar
  `
    .trim()
    .split(/\s+/)
);
const commandMenuRegistryNameAliases: Record<string, string> = {
  "collaboration-example": "collaboration-demo",
  "horizontal-rule": "hr-node",
  "preview-markdown": "preview-markdown-demo",
  "text-align": "align-kit",
  "slash-command": "slash-kit",
};
const selectedMutationObserverOptions: MutationObserverInit = {
  attributeFilter: ["aria-selected"],
  attributes: true,
};

type Query = Awaited<ReturnType<typeof useFumadocsSearch>>["query"];
type HighlightCommand = (
  label: string,
  copyPayload?: string,
  copyLabel?: string
) => void;
type Push = ReturnType<typeof useRouter>["push"];

const i18n = {
  cn: {
    apiReference: "API 参考",
    dark: "深色",
    docsApiSections: "文档 API 区块",
    documentation: "文档",
    light: "浅色",
    links: "链接",
    pages: "页面",
    goToPage: "打开页面",
    noResults: "没有结果。",
    runCommand: "运行命令",
    search: "搜索",
    searchDescription: "搜索文档。",
    searchDocumentation: "搜索文档...",
    searchResults: "搜索结果",
    searchShort: "搜索...",
    searching: "搜索中...",
    system: "系统",
    theme: "主题",
  },
  en: {
    apiReference: "API Reference",
    dark: "Dark",
    docsApiSections: "Docs API Sections",
    documentation: "Documentation",
    light: "Light",
    links: "Links",
    pages: "Pages",
    goToPage: "Go to Page",
    noResults: "No results found.",
    runCommand: "Run Command",
    search: "Search",
    searchDescription: "Search documentation.",
    searchDocumentation: "Search documentation...",
    searchResults: "Search Results",
    searchShort: "Search...",
    searching: "Searching...",
    system: "System",
    theme: "Theme",
  },
};

function getNavTitle(item: NavItemWithChildren, locale: string) {
  return locale === "cn" ? item.titleCn || item.title : item.title;
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}

function getItemKeywords(item: NavItemWithChildren, parentTitle = "") {
  return [
    ...(item.keywords ?? []),
    ...(Array.isArray(item.label)
      ? item.label
      : item.label
      ? [item.label]
      : []),
    parentTitle,
    item.titleCn,
  ].filter(isString);
}

function navigateToHref(push: Push, href: string) {
  if (ABSOLUTE_HREF_REGEX.test(href)) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  push(href);
}

function getCommandMenuRegistryName(href: string) {
  const normalizedPath = href
    .split("#")[0]
    .split("?")[0]
    .replace(CN_DOCS_PREFIX_REGEX, "");
  const slug = normalizedPath.split("/").filter(Boolean).at(-1);

  if (!slug) return;

  const candidates = [
    commandMenuRegistryNameAliases[slug],
    `${slug}-kit`,
    `${slug}-demo`,
    `${slug}-node`,
    slug,
  ].filter(isString);

  return candidates.find((name) => commandMenuCopyableRegistryNames.has(name));
}

function getCommandMenuCopyCommand(href: string | undefined) {
  if (!href) return;

  const registryName = getCommandMenuRegistryName(href);

  return registryName
    ? {
        label: getRegistryInstallCommand(registryName),
        payload: getRegistryClipboardInstallCommand(registryName),
      }
    : undefined;
}

function CommandItems({
  content,
  item,
  locale,
  onHighlight,
  parentTitle = "",
  runCommand,
}: {
  content: (typeof i18n)["en"];
  item: NavItemWithChildren;
  locale: string;
  onHighlight: HighlightCommand;
  runCommand: (command: () => unknown) => void;
  parentTitle?: string;
}) {
  const { push } = useRouter();
  const title = getNavTitle(item, locale);
  const keywords = getItemKeywords(item, parentTitle);
  const copyCommand = item.href
    ? getCommandMenuCopyCommand(item.href)
    : undefined;

  return (
    <>
      {item.href && (
        <CommandMenuItem
          key={item.href}
          onHighlight={() =>
            onHighlight(
              content.goToPage,
              copyCommand?.payload,
              copyCommand?.label
            )
          }
          onSelect={() => {
            runCommand(() =>
              navigateToHref(push, hrefWithLocale(item.href!, locale))
            );
          }}
          keywords={keywords}
          value={`${parentTitle} ${title ?? ""} ${item.titleCn ?? ""} ${
            item.href
          }`}
        >
          <div className="flex items-center justify-center">
            <Circle />
          </div>
          {title}
        </CommandMenuItem>
      )}
      {item.items?.map((child) => (
        <CommandItems
          key={child.href ?? `${item.title}:${child.title}`}
          content={content}
          item={child}
          locale={locale}
          onHighlight={onHighlight}
          parentTitle={title ?? parentTitle}
          runCommand={runCommand}
        />
      ))}
    </>
  );
}

function CommandMenuGroup({
  content,
  locale,
  onHighlight,
  runCommand,
  ...group
}: {
  content: (typeof i18n)["en"];
  locale: string;
  onHighlight: HighlightCommand;
  runCommand: (command: () => unknown) => void;
} & SidebarNavItem) {
  if (!group.items?.length) return null;

  const title = getNavTitle(group, locale);

  return (
    <CommandGroup heading={title} className={commandMenuGroupClassName}>
      {group.items.map((navItem) => (
        <CommandItems
          key={navItem.href ?? `${group.title}:${navItem.title}`}
          content={content}
          item={navItem}
          locale={locale}
          onHighlight={onHighlight}
          parentTitle={title}
          runCommand={runCommand}
        />
      ))}
    </CommandGroup>
  );
}

function SearchResults({
  content,
  locale,
  query,
  search,
  showResults,
  onHighlight,
  setOpen,
}: {
  content: (typeof i18n)["en"];
  locale: string;
  query: Query;
  search: string;
  showResults: boolean;
  onHighlight: HighlightCommand;
  setOpen: (open: boolean) => void;
}) {
  const { push } = useRouter();

  const uniqueResults = React.useMemo(() => {
    if (!query.data || !Array.isArray(query.data)) {
      return [];
    }

    const seen = new Set<string>();

    return query.data.filter((item) => {
      if (
        item.type === "text" &&
        item.content.trim().split(WHITESPACE_REGEX).length <= 1
      ) {
        return false;
      }

      const key = getSearchResultKey(item);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }, [query.data]);

  const resultGroups = React.useMemo(
    () =>
      searchResultGroupOrder
        .map((group) => ({
          group,
          items: uniqueResults.filter(
            (item) => getSearchResultGroup(item) === group
          ),
        }))
        .filter(({ items }) => items.length > 0),
    [uniqueResults]
  );

  if (!showResults || !search.trim() || !query.data || query.data === "empty") {
    return null;
  }

  if (uniqueResults.length === 0) {
    return null;
  }

  return (
    <>
      {resultGroups.map(({ group, items }) => (
        <CommandGroup
          key={group}
          heading={content[group]}
          className={commandMenuGroupClassName}
        >
          {items.map((item) => {
            const copyCommand = getCommandMenuCopyCommand(item.url);

            return (
              <CommandMenuItem
                key={getSearchResultKey(item)}
                data-search-group={group}
                data-type={item.type}
                onHighlight={() =>
                  onHighlight(
                    content.goToPage,
                    copyCommand?.payload,
                    copyCommand?.label
                  )
                }
                onSelect={() => {
                  push(hrefWithLocale(item.url, locale));
                  setOpen(false);
                }}
                keywords={[item.content, ...(item.breadcrumbs ?? []), search]}
                value={`${item.content} ${item.type} ${content[group]} ${search}`}
              >
                <div className="line-clamp-1 text-sm">{item.content}</div>
              </CommandMenuItem>
            );
          })}
        </CommandGroup>
      ))}
    </>
  );
}

const commandMenuGroupClassName =
  "p-0! **:[[cmdk-group-heading]]:scroll-mt-16 **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!";

function CommandMenuItem({
  children,
  className,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const handleSelectedMutation = React.useCallback(
    (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "aria-selected" &&
          ref.current?.getAttribute("aria-selected") === "true"
        ) {
          onHighlight?.();
          return;
        }
      }
    },
    [onHighlight]
  );

  useMutationObserver(
    ref,
    handleSelectedMutation,
    selectedMutationObserverOptions
  );

  return (
    <CommandItem
      ref={ref}
      className={cn(
        "h-9 rounded-md border border-transparent px-3! font-medium data-[selected=true]:border-input data-[selected=true]:bg-input/50",
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "pointer-events-none flex h-5 select-none items-center justify-center gap-1 rounded border bg-background px-1 font-medium font-sans text-[0.7rem] text-muted-foreground [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  );
}

export function CommandMenuDialog({
  navItems,
  onOpenChange,
  onReady,
  open,
  sidebarNav,
}: {
  navItems: MainNavItem[];
  onOpenChange: NonNullable<DialogProps["onOpenChange"]>;
  onReady?: () => void;
  open: boolean;
  sidebarNav: SidebarNavItem[];
}) {
  const { push } = useRouter();
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const [renderDelayedGroups, setRenderDelayedGroups] = React.useState(false);
  const [copyLabel, setCopyLabel] = React.useState("");
  const [copyPayload, setCopyPayload] = React.useState("");
  const [commandSearch, setCommandSearch] = React.useState("");
  const [selectedCommandValue, setSelectedCommandValue] = React.useState("");
  const [selectedAction, setSelectedAction] = React.useState(content.goToPage);
  const commandListRef = React.useRef<HTMLDivElement>(null);
  const docsSearchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const { setTheme } = useTheme();
  const {
    query,
    search: docsSearch,
    setSearch: setDocsSearch,
  } = useFumadocsSearch({
    delayMs: 0,
    locale,
    type: "fetch",
  });
  const docsSearchState = getCommandMenuSearchState({
    docsSearch,
    inputSearch: commandSearch,
    isQueryLoading: query.isLoading,
    minSearchLength: MIN_DOC_SEARCH_LENGTH,
  });

  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  const updateOpen = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);

      if (nextOpen) {
        setSelectedCommandValue("");
        setSelectedAction(content.goToPage);
        setCopyLabel("");
        setCopyPayload("");
      } else {
        setRenderDelayedGroups(false);
        setCommandSearch("");
        setSelectedCommandValue("");
        setDocsSearch("");
        setCopyLabel("");
        setCopyPayload("");

        if (docsSearchTimeoutRef.current) {
          clearTimeout(docsSearchTimeoutRef.current);
          docsSearchTimeoutRef.current = undefined;
        }
      }
    },
    [content.goToPage, onOpenChange, setDocsSearch]
  );

  React.useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const list = commandListRef.current;
      const firstValue = list
        ?.querySelector<HTMLElement>('[cmdk-item]:not([aria-disabled="true"])')
        ?.getAttribute("data-value");

      if (firstValue) {
        setSelectedCommandValue(firstValue);
      }

      if (list) {
        list.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [
    commandSearch,
    docsSearchState.shouldShowSearchResults,
    open,
    query.data,
    renderDelayedGroups,
  ]);

  const setHighlightedCommand = React.useCallback<HighlightCommand>(
    (label, payload = "", display = payload) => {
      setSelectedAction(label);
      setCopyLabel(display);
      setCopyPayload(payload);
    },
    []
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setRenderDelayedGroups(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      updateOpen(false);
      command();
    },
    [updateOpen]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "c" && (e.metaKey || e.ctrlKey) && copyPayload) {
        e.preventDefault();
        runCommand(() => {
          void copyToClipboardWithMeta(copyPayload, {
            name: "copy_npm_command",
            properties: {
              command: copyPayload,
            },
          });
        });
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, [copyPayload, runCommand]);

  React.useEffect(
    () => () => {
      if (docsSearchTimeoutRef.current) {
        clearTimeout(docsSearchTimeoutRef.current);
      }
    },
    []
  );

  const commandFilter = React.useCallback(
    (value: string, searchValue: string, keywords?: string[]) => {
      const searchableValue = `${value} ${keywords?.join(" ") ?? ""}`;

      return searchableValue.toLowerCase().includes(searchValue.toLowerCase())
        ? 1
        : 0;
    },
    []
  );

  const handleSearchChange = React.useCallback(
    (value: string) => {
      const nextDocsSearch =
        value.trim().length >= MIN_DOC_SEARCH_LENGTH ? value : "";

      setCommandSearch(value);
      setSelectedCommandValue("");
      setSelectedAction(content.goToPage);
      setCopyLabel("");
      setCopyPayload("");

      if (docsSearchTimeoutRef.current) {
        clearTimeout(docsSearchTimeoutRef.current);
      }

      if (!nextDocsSearch) {
        docsSearchTimeoutRef.current = undefined;

        React.startTransition(() => {
          setDocsSearch("");
        });
        return;
      }

      docsSearchTimeoutRef.current = setTimeout(() => {
        React.startTransition(() => {
          setDocsSearch(nextDocsSearch);
        });
      }, DOC_SEARCH_DEBOUNCE_MS);
    },
    [content.goToPage, setDocsSearch]
  );

  return (
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogContent
        className="top-[15%]! max-w-[calc(100%-2rem)] !duration-0 translate-y-0! overflow-hidden rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 data-[state=closed]:!animate-none data-[state=open]:!animate-none sm:max-w-lg dark:bg-neutral-900 dark:ring-neutral-800 [&>button]:hidden"
        overlayClassName="data-[state=closed]:!animate-none data-[state=open]:!animate-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{content.search}</DialogTitle>
          <DialogDescription>{content.searchDescription}</DialogDescription>
        </DialogHeader>
        <Command
          className="rounded-none bg-transparent **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border **:data-[slot=command-input-wrapper]:border-input **:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input]:py-0 [&_[cmdk-item]_svg]:size-5"
          filter={commandFilter}
          value={selectedCommandValue}
          onValueChange={setSelectedCommandValue}
        >
          <div className="relative">
            <CommandInput
              onValueChange={handleSearchChange}
              placeholder={content.searchDocumentation}
            />
            {docsSearchState.isPending && (
              <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
          <CommandEmpty className="py-12 text-center text-muted-foreground text-sm">
            {docsSearchState.isPending ? content.searching : content.noResults}
          </CommandEmpty>
          <CommandList
            ref={commandListRef}
            className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5"
          >
            <CommandGroup
              heading={content.pages}
              className={commandMenuGroupClassName}
            >
              {navItems
                .filter((navItem) => navItem.href)
                .map((navItem) => {
                  const title = getNavTitle(navItem, locale);

                  return (
                    <CommandMenuItem
                      key={navItem.href}
                      onHighlight={() =>
                        setHighlightedCommand(content.goToPage)
                      }
                      onSelect={() => {
                        runCommand(() =>
                          navigateToHref(
                            push,
                            hrefWithLocale(navItem.href!, locale)
                          )
                        );
                      }}
                      keywords={[
                        "nav",
                        "navigation",
                        title ?? "",
                        navItem.titleCn ?? "",
                      ]}
                      value={`Page ${title ?? ""} ${navItem.titleCn ?? ""} ${
                        navItem.href ?? ""
                      }`}
                    >
                      <ArrowRight />
                      {title}
                    </CommandMenuItem>
                  );
                })}
            </CommandGroup>

            {renderDelayedGroups ? (
              <>
                {sidebarNav.map((group) =>
                  group.title === "API" ? null : (
                    <CommandMenuGroup
                      key={`${group.title}:sidebar`}
                      content={content}
                      locale={locale}
                      onHighlight={setHighlightedCommand}
                      runCommand={runCommand}
                      {...group}
                    />
                  )
                )}

                <CommandGroup
                  heading={content.theme}
                  className={commandMenuGroupClassName}
                >
                  <CommandMenuItem
                    onHighlight={() =>
                      setHighlightedCommand(content.runCommand)
                    }
                    onSelect={() => runCommand(() => setTheme("light"))}
                  >
                    <SunMedium />
                    {content.light}
                  </CommandMenuItem>
                  <CommandMenuItem
                    onHighlight={() =>
                      setHighlightedCommand(content.runCommand)
                    }
                    onSelect={() => runCommand(() => setTheme("dark"))}
                  >
                    <Moon />
                    {content.dark}
                  </CommandMenuItem>
                  <CommandMenuItem
                    onHighlight={() =>
                      setHighlightedCommand(content.runCommand)
                    }
                    onSelect={() => runCommand(() => setTheme("system"))}
                  >
                    <Laptop />
                    {content.system}
                  </CommandMenuItem>
                </CommandGroup>

                {sidebarNav.map((group) =>
                  group.title !== "API" ? null : (
                    <CommandMenuGroup
                      key={group.title}
                      content={content}
                      locale={locale}
                      onHighlight={setHighlightedCommand}
                      runCommand={runCommand}
                      {...group}
                    />
                  )
                )}
              </>
            ) : null}

            <SearchResults
              content={content}
              locale={locale}
              query={query}
              search={docsSearch}
              showResults={docsSearchState.shouldShowSearchResults}
              onHighlight={setHighlightedCommand}
              setOpen={updateOpen}
            />
          </CommandList>
        </Command>
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 font-medium text-muted-foreground text-xs dark:border-t-neutral-700 dark:bg-neutral-800">
          <CommandMenuKbd>
            <CornerDownLeft />
          </CommandMenuKbd>
          {selectedAction}
          {copyPayload ? (
            <>
              <div className="h-4 w-px bg-border" />
              <CommandMenuKbd>⌘</CommandMenuKbd>
              <CommandMenuKbd>C</CommandMenuKbd>
              <span className="truncate font-mono">{copyLabel}</span>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
