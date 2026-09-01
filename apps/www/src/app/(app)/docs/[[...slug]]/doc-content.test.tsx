import { describe, expect, it, spyOn } from 'bun:test';

import { render } from '@testing-library/react';
import * as React from 'react';

describe('DocContent links', () => {
  it('keeps distinct documentation links that share a route', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => {});
    const { DocContent } = await import('./doc-content');

    try {
      const view = render(
        <DocContent
          category="plugin"
          doc={{
            docs: [
              {
                route: '/docs/components/link',
                title: 'Link Element',
              },
              {
                route: '/docs/components/link',
                title: 'Link Floating Toolbar',
              },
            ],
            title: 'Link',
          }}
        >
          <div>Link documentation</div>
        </DocContent>
      );

      expect(view.getByText('Link Element')).toBeTruthy();
      expect(view.getByText('Link Floating Toolbar')).toBeTruthy();

      const duplicateKeyErrors = consoleError.mock.calls.filter((args) =>
        args.some((argument) => String(argument).includes('same key'))
      );

      expect(duplicateKeyErrors).toEqual([]);
    } finally {
      consoleError.mockRestore();
    }
  });
});
