import { downloadImage } from './download';

describe('downloadImage', () => {
  it('renders the image to a canvas and clicks a download link', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const originalImage = globalThis.Image;
    const anchor = {
      click: mock(),
      download: '',
      href: '',
    };
    const drawImage = mock();
    const toDataURL = mock(() => 'data:image/png;base64,downloaded');

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
    ).mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => ({ drawImage }),
          height: 0,
          toDataURL,
          width: 0,
        } as any;
      }
      if (tagName === 'a') {
        return anchor as any;
      }

      return originalCreateElement(tagName);
    }) as any);

    globalThis.Image = MockImage as any;

    downloadImage('data:image/png;base64,source', 'diagram.png');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(toDataURL).toHaveBeenCalledWith('image/png');
    expect(anchor.download).toBe('diagram.png');
    expect(anchor.href).toBe('data:image/png;base64,downloaded');
    expect(anchor.click).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
    globalThis.Image = originalImage;
  });
});
