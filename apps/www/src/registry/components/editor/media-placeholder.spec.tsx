import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { fireEvent, render, waitFor } from '@testing-library/react';
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
      () => `blob:image-preview-${++previewIndex}`
    );
    revokeObjectURL.mockReset();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    mock.restore();
  });

  it('reports natural geometry before releasing the local preview', async () => {
    const { ImageProgress } = await import(
      `./media-placeholder?test=${Math.random().toString(36).slice(2)}`
    );
    const onNaturalSize = mock();
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const view = render(
      <ImageProgress file={file} onNaturalSize={onNaturalSize} />
    );
    const image = await waitFor(() => {
      const element = view.container.querySelector('img');

      if (!element) throw new Error('Expected image preview');

      return element;
    });

    Object.defineProperties(image, {
      naturalHeight: { value: 360 },
      naturalWidth: { value: 640 },
    });
    fireEvent.load(image);

    expect(onNaturalSize).toHaveBeenCalledWith(file, {
      naturalHeight: 360,
      naturalWidth: 640,
    });

    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:image-preview-1');
  });

  it('never attributes a stale preview to a colliding replacement file', async () => {
    const { ImageProgress } = await import(
      `./media-placeholder?test=${Math.random().toString(36).slice(2)}`
    );
    const onNaturalSize = mock();
    const fileOptions = { lastModified: 1, type: 'image/png' };
    const firstFile = new File(['same'], 'image.png', fileOptions);
    const secondFile = new File(['same'], 'image.png', fileOptions);
    const view = render(
      <ImageProgress file={firstFile} onNaturalSize={onNaturalSize} />
    );
    const firstImage = await waitFor(() => {
      const element = view.container.querySelector('img');

      if (element?.getAttribute('src') !== 'blob:image-preview-1') {
        throw new Error('Expected first image preview');
      }

      return element;
    });

    view.rerender(
      <ImageProgress file={secondFile} onNaturalSize={onNaturalSize} />
    );
    const secondImage = await waitFor(() => {
      const element = view.container.querySelector('img');

      if (element?.getAttribute('src') !== 'blob:image-preview-2') {
        throw new Error('Expected replacement image preview');
      }

      return element;
    });

    Object.defineProperties(firstImage, {
      naturalHeight: { value: 180 },
      naturalWidth: { value: 320 },
    });
    fireEvent.load(firstImage);
    expect(onNaturalSize).not.toHaveBeenCalled();

    Object.defineProperties(secondImage, {
      naturalHeight: { value: 360 },
      naturalWidth: { value: 640 },
    });
    fireEvent.load(secondImage);
    expect(onNaturalSize).toHaveBeenCalledWith(secondFile, {
      naturalHeight: 360,
      naturalWidth: 640,
    });
  });
});
