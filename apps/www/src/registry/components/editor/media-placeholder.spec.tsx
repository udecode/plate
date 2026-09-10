import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@uploadthing/react', () => ({
  generateReactHelpers: () => ({ uploadFiles: mock() }),
}));

mock.module('use-file-picker', () => ({
  useFilePicker: () => ({ openFilePicker: () => {} }),
}));

describe('ImageProgress', () => {
  const createObjectURL = mock(() => '');
  const revokeObjectURL = mock();
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let previewIndex = 0;

  beforeAll(() => {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  beforeEach(() => {
    previewIndex = 0;
    createObjectURL.mockReset();
    createObjectURL.mockImplementation(
      () => `blob:image-preview-${(previewIndex += 1)}`
    );
    revokeObjectURL.mockReset();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    mock.restore();
  });

  it('renders a local preview and releases its object URL on unmount', async () => {
    const { ImageProgress } = await import(
      `./media-placeholder?test=${Math.random().toString(36).slice(2)}`
    );
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const view = render(<ImageProgress file={file} progress={25} />);
    const image = await waitFor(() => {
      const element = view.container.querySelector('img');
      if (!element) throw new Error('Expected image preview');
      return element;
    });
    expect(image.getAttribute('src')).toBe('blob:image-preview-1');
    expect(image.getAttribute('alt')).toBe('image.png');
    expect(view.getByText('25%')).toBeTruthy();
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image-preview-1');
  });

  it('replaces the preview for a different file with colliding metadata', async () => {
    const { ImageProgress } = await import(
      `./media-placeholder?test=${Math.random().toString(36).slice(2)}`
    );
    const fileOptions = { lastModified: 1, type: 'image/png' };
    const firstFile = new File(['same'], 'image.png', fileOptions);
    const secondFile = new File(['same'], 'image.png', fileOptions);
    const view = render(<ImageProgress file={firstFile} />);
    await waitFor(() =>
      expect(view.container.querySelector('img')?.getAttribute('src')).toBe(
        'blob:image-preview-1'
      )
    );
    view.rerender(<ImageProgress file={secondFile} />);
    await waitFor(() =>
      expect(view.container.querySelector('img')?.getAttribute('src')).toBe(
        'blob:image-preview-2'
      )
    );
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image-preview-1');
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image-preview-2');
  });
});
