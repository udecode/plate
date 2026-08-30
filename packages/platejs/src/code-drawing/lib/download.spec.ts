import { downloadImage } from './download';

describe('downloadImage', () => {
  it('renders the image to a canvas and clicks a download link', async () => {
    const originalImage = globalThis.Image;
    const anchor = document.createElement('a');
    const canvas = document.createElement('canvas');
    const click = spyOn(anchor, 'click').mockImplementation(() => {});
    const drawImage = mock();
    const toDataURL = spyOn(canvas, 'toDataURL').mockReturnValue(
      'data:image/png;base64,downloaded'
    );

    spyOn(canvas, 'getContext').mockReturnValue({
      drawImage,
    });

    class MockImage {
      height = 240;
      onload: null | (() => void) = null;
      width = 320;
      #src = '';

      get src() {
        return this.#src;
      }

      set src(value: string) {
        this.#src = value;
        queueMicrotask(() => {
          this.onload?.();
        });
      }
    }

    const createElementSpy = spyOn(
      document,
      'createElement'
    ).mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return canvas;
      }
      if (tagName === 'a') {
        return anchor;
      }

      throw new Error(`Unexpected element: ${tagName}`);
    });

    globalThis.Image = MockImage as unknown as typeof Image;

    downloadImage('data:image/png;base64,source', 'diagram.png');
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(toDataURL).toHaveBeenCalledWith('image/png');
    expect(anchor.download).toBe('diagram.png');
    expect(anchor.href).toBe('data:image/png;base64,downloaded');
    expect(click).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
    globalThis.Image = originalImage;
  });
});
