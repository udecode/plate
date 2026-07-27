import { downloadImage } from './download';

describe('downloadImage', () => {
  it('renders the image to a canvas and clicks a download link', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const originalImage = globalThis.Image;
    const anchor = originalCreateElement('a');
    const canvas = originalCreateElement('canvas');
    const click = spyOn(anchor, 'click').mockImplementation(() => {});
    const drawImage = mock();
    const toDataURL = spyOn(canvas, 'toDataURL').mockReturnValue(
      'data:image/png;base64,downloaded'
    );

    spyOn(canvas, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);

    class MockImage {
      height = 240;
      onload: null | (() => void) = null;
      width = 320;

      set src(_value: string) {
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

      return originalCreateElement(tagName);
    });

    globalThis.Image = MockImage as unknown as typeof Image;

    downloadImage('data:image/png;base64,source', 'diagram.png');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(toDataURL).toHaveBeenCalledWith('image/png');
    expect(anchor.download).toBe('diagram.png');
    expect(anchor.href).toBe('data:image/png;base64,downloaded');
    expect(click).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
    globalThis.Image = originalImage;
  });
});
