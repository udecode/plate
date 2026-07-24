import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';

mock.module('platejs/static', () => ({
  PliteElement: ({ children }: React.ComponentProps<'div'>) => (
    <div>{children}</div>
  ),
}));

describe('ImageElementStatic', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders the caption once as a direct figure child', async () => {
    const { ImageElementStatic } = await import(
      `./media-image-node-static?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <ImageElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: 'Caption' }],
            type: 'img',
            url: '/image.png',
          } as never
        }
        slots={{} as never}
      >
        <span data-testid="caption-content">Caption</span>
      </ImageElementStatic>
    );

    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(view.getByTestId('caption-content').closest('figure')).toBeTruthy();
    expect(
      view.getByTestId('caption-content').closest('figure > figcaption')
    ).toBeTruthy();
  });
});
