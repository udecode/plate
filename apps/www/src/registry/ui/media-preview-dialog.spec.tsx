import * as React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

let previewUrl: string | undefined;

mock.module('@platejs/media/react', () => ({
  PreviewImage: () => null,
  useImagePreviewValue: (key: string) => {
    if (key === 'currentPreview') return { url: previewUrl };
    if (key === 'isOpen') return true;
    if (key === 'scale') return 1;

    return false;
  },
  useImagePreview: () => ({
    closeProps: {},
    maskLayerProps: {},
    nextProps: {},
    prevProps: {},
    scaleTextProps: {},
    zommOutProps: {},
    zoomInProps: {},
  }),
  useScaleInput: () => ({ props: {}, ref: null }),
}));
mock.module('platejs/react', () => ({
  useEditorRef: () => ({ id: 'preview' }),
}));
mock.module('@/lib/utils', () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
}));

const { MediaPreviewDialog } = await import('./media-preview-dialog');

afterEach(() => {
  cleanup();
  mock.restore();
});
afterAll(() => mock.restore());

describe('image preview downloads', () => {
  it.each([
    'https://example.com/image.png',
    'http://example.com/image.png',
    '/images/preview.png',
    './preview.png',
    'blob:https://example.com/preview',
    'data:image/png;base64,aW1hZ2U=',
  ])('preserves supported image destinations: %s', (url) => {
    previewUrl = url;
    const destinations: Array<string | null> = [];
    spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      destinations.push(this.getAttribute('href'));
    });

    const view = render(<MediaPreviewDialog />);
    const button = view.getByRole('button', { name: 'Download image' });
    expect((button as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(button);
    expect(destinations).toEqual([url]);
  });

  it.each([
    undefined,
    '',
    'mailto:reader@example.com',
    'example:preview',
    'data:text/plain,image',
  ])('disables non-image destinations: %s', (url) => {
    previewUrl = url;
    const click = spyOn(
      HTMLAnchorElement.prototype,
      'click'
    ).mockImplementation(() => {});
    const view = render(<MediaPreviewDialog />);
    const button = view.getByRole('button', { name: 'Download image' });

    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });
});
