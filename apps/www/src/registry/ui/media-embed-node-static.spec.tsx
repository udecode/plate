import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';

mock.module('platejs/static', () => ({
  PliteElement: ({ children }: React.ComponentProps<'div'>) => (
    <div>{children}</div>
  ),
}));

describe('MediaEmbedElementStatic', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders canonical caption children', async () => {
    const { MediaEmbedElementStatic } = await import(
      `./media-embed-node-static?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MediaEmbedElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: 'Caption' }],
            type: 'media_embed',
            url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
          } as never
        }
        slots={{} as never}
      >
        <span data-testid="caption-content">Caption</span>
      </MediaEmbedElementStatic>
    );

    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(
      view.getByTestId('caption-content').closest('figcaption')
    ).toBeTruthy();
    expect(view.container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/M7lc1UVf-VE'
    );
  });

  it('omits unsafe and unsupported persisted embed urls', async () => {
    const { MediaEmbedElementStatic } = await import(
      `./media-embed-node-static?unsafe=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MediaEmbedElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            provider: 'youtube',
            type: 'media_embed',
            url: 'javascript:alert(1)',
          } as never
        }
        slots={{} as never}
      >
        <span data-testid="caption-content" />
      </MediaEmbedElementStatic>
    );

    expect(view.container.querySelector('iframe')).toBeNull();
    expect(view.container.querySelector('a')).toBeNull();
    expect(view.queryByTestId('caption-content')).toBeNull();
    expect(view.container.querySelector('figcaption')).toBeNull();
  });
});
