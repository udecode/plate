import { describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';

let pathname = '/docs';

mock.module('next/navigation', () => ({
  usePathname: () => pathname,
}));

mock.module('@/hooks/useLocale', () => ({
  useLocale: () => 'en',
}));

describe('DocsNav', () => {
  it('opens the section of the current page inside the Plite docs', async () => {
    const { SidebarProvider } = await import('@/components/ui/sidebar');
    const { getDocsSidebar } = await import('@/lib/docs-page-tree');
    const { DocsNav } = await import('./docs-nav');

    pathname = '/docs/plite/walkthroughs/09-performance';

    const view = render(
      <SidebarProvider>
        <DocsNav sidebar={getDocsSidebar()} />
      </SidebarProvider>
    );
    const openSections = view
      .getAllByRole('button', { name: /^Collapse / })
      .map((button) => button.getAttribute('aria-label'));

    expect(openSections).toEqual(['Collapse Plite']);
    expect(
      view.container
        .querySelector('[aria-current="page"]')
        ?.getAttribute('href')
    ).toBe('/docs/plite/walkthroughs/09-performance');
  });
});
