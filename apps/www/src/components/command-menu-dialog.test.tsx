import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const pushMock = mock(() => {});
const setDocsSearchMock = mock(() => {});
let docsSearchMockState: {
  data:
    | 'empty'
    | {
        content: string;
        id: string;
        type: string;
        url: string;
      }[];
  isLoading: boolean;
  search: string;
} = {
  data: 'empty',
  isLoading: false,
  search: '',
};

mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

mock.module('next-themes', () => ({
  useTheme: () => ({
    setTheme: mock(() => {}),
  }),
}));

mock.module('@/hooks/useLocale', () => ({
  useLocale: () => 'en',
}));

mock.module('@/hooks/use-mutation-observer', () => ({
  useMutationObserver: () => {},
}));

mock.module('fumadocs-core/search/client', () => ({
  useDocsSearch: () => ({
    query: {
      data: docsSearchMockState.data,
      isLoading: docsSearchMockState.isLoading,
    },
    search: docsSearchMockState.search,
    setSearch: setDocsSearchMock,
  }),
}));

describe('CommandMenuDialog search ordering', () => {
  afterAll(() => {
    mock.restore();
  });

  beforeEach(() => {
    docsSearchMockState = {
      data: 'empty',
      isLoading: false,
      search: '',
    };
    pushMock.mockClear();
    setDocsSearchMock.mockClear();
  });

  it('renders static command results before dynamic API reference results', async () => {
    const { CommandMenuDialog } = await import('./command-menu-dialog');
    docsSearchMockState = {
      data: [
        {
          content: 'Static API Reference Result',
          id: 'editor-api',
          type: 'heading',
          url: '/docs/api/plite/editor-transforms#insertnode',
        },
      ],
      isLoading: false,
      search: 'static',
    };

    const view = render(
      <CommandMenuDialog
        navItems={[
          {
            href: '/docs/static',
            title: 'Static Rendering',
          },
        ]}
        open
        sidebarNav={[]}
        onOpenChange={mock(() => {})}
      />
    );

    const staticResult = view.getByText('Static Rendering');

    await waitFor(() => {
      expect(view.getByText('API Reference')).toBeTruthy();
    });

    const dynamicApiGroup = view.getByText('API Reference');

    expect(
      staticResult.compareDocumentPosition(dynamicApiGroup) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('keeps the first static match selected when docs search results appear', async () => {
    const { CommandMenuDialog } = await import('./command-menu-dialog');

    const view = render(
      <CommandMenuDialog
        navItems={[
          {
            href: '/docs/list',
            title: 'List',
          },
        ]}
        open
        sidebarNav={[
          {
            items: [
              {
                href: '/docs/components/list-classic',
                title: 'List Classic',
              },
            ],
            title: 'Components',
          },
        ]}
        onOpenChange={mock(() => {})}
      />
    );

    const list = document.querySelector<HTMLElement>('[cmdk-list]');

    expect(list).toBeTruthy();

    if (list) {
      list.scrollTop = 160;
    }

    docsSearchMockState = {
      data: [
        {
          content: 'A Path is a list of indexes.',
          id: 'path-list',
          type: 'text',
          url: '/docs/api/plite/path',
        },
        {
          content: 'Static API Reference Result',
          id: 'editor-api',
          type: 'heading',
          url: '/docs/api/plite/editor-transforms#insertnode',
        },
      ],
      isLoading: false,
      search: 'list',
    };

    view.rerender(
      <CommandMenuDialog
        navItems={[
          {
            href: '/docs/list',
            title: 'List',
          },
        ]}
        open
        sidebarNav={[
          {
            items: [
              {
                href: '/docs/components/list-classic',
                title: 'List Classic',
              },
            ],
            title: 'Components',
          },
        ]}
        onOpenChange={mock(() => {})}
      />
    );

    await waitFor(() => {
      expect(view.getByText('A Path is a list of indexes.')).toBeTruthy();
    });

    await waitFor(() => {
      const selectedItem = document.querySelector(
        '[cmdk-item][aria-selected="true"]'
      );

      expect(selectedItem?.textContent).toContain('List');
      expect(list?.scrollTop).toBe(0);
    });
  });
});
