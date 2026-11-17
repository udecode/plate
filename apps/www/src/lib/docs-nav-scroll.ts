export const DOCS_NAV_SCROLL_KEY = 'docs-nav-scroll';

type DocsNavScrollState = {
  pathname: string;
  scrollTops: number[];
};

export function saveDocsNavScroll() {
  const scrollers = document.querySelectorAll<HTMLElement>(
    '[data-docs-nav] [data-docs-nav-scroll]'
  );
  const state: DocsNavScrollState = {
    pathname: location.pathname,
    scrollTops: [...scrollers].map((scroller) => scroller.scrollTop),
  };

  try {
    sessionStorage.setItem(DOCS_NAV_SCROLL_KEY, JSON.stringify(state));

    return true;
  } catch {
    return false;
  }
}

export function restoreDocsNavScroll(key: string) {
  const readStoredState = (): DocsNavScrollState | null => {
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? 'null');
    } catch {
      return null;
    }
  };

  const findLongestActiveLink = (nav: HTMLElement) =>
    [...nav.querySelectorAll<HTMLElement>('a[data-active="true"]')].sort(
      (a, b) =>
        (b.getAttribute('href') ?? '').length -
        (a.getAttribute('href') ?? '').length
    )[0];

  const nav = document.querySelector<HTMLElement>('[data-docs-nav]');
  const scrollers = nav
    ? [...nav.querySelectorAll<HTMLElement>('[data-docs-nav-scroll]')]
    : [];

  if (!nav || !scrollers[0]?.clientHeight) return;

  const stored = readStoredState();

  if (
    stored?.pathname === location.pathname &&
    stored.scrollTops.length === scrollers.length
  ) {
    for (const [index, scroller] of scrollers.entries()) {
      scroller.scrollTop = stored.scrollTops[index];
    }

    return;
  }

  const active =
    nav.querySelector<HTMLElement>('[aria-current="page"]') ??
    findLongestActiveLink(nav);

  if (!active) return;

  for (const scroller of scrollers.toReversed()) {
    if (!scroller.contains(active)) continue;

    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (
      activeRect.top < scrollerRect.top ||
      activeRect.bottom > scrollerRect.bottom
    ) {
      scroller.scrollTop +=
        activeRect.top -
        scrollerRect.top -
        (scroller.clientHeight - activeRect.height) / 2;
    }
  }
}

export const DOCS_NAV_SCROLL_RESTORE_SCRIPT = `(function () {
  if (!/^\\/(cn\\/)?docs(\\/|$)/.test(location.pathname)) return;
  var restore = function () {
    (${restoreDocsNavScroll.toString()})(${JSON.stringify(DOCS_NAV_SCROLL_KEY)});
  };
  var observer = new MutationObserver(restore);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  restore();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      restore();
      observer.disconnect();
    }, { once: true });
  } else {
    observer.disconnect();
  }
})()`;
