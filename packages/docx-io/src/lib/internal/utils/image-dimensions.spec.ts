import { getImageDimensions } from './image-dimensions';

describe('getImageDimensions', () => {
  it('parses png dimensions from the IHDR bytes', () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    png.set([0x00, 0x00, 0x01, 0x40], 16);
    png.set([0x00, 0x00, 0x00, 0xf0], 20);

    expect(getImageDimensions(png)).toEqual({
      height: 240,
      type: 'png',
      width: 320,
    });
  });

  it('falls back for malformed jpeg buffers', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x00]);

    expect(getImageDimensions(jpeg)).toEqual({
      height: 100,
      type: 'jpg',
      width: 100,
    });
  });

  it('parses jpeg dimensions from SOF markers', () => {
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x20, 0x00, 0x30,
    ]);

    expect(getImageDimensions(jpeg)).toEqual({
      height: 32,
      type: 'jpg',
      width: 48,
    });
  });

  it('parses gif, bmp, and webp dimensions', () => {
    const gif = new Uint8Array(10);
    gif.set([0x47, 0x49, 0x46, 0x38], 0);
    gif.set([0x20, 0x00, 0x30, 0x00], 6);

    const bmp = new Uint8Array(26);
    bmp.set([0x42, 0x4d], 0);
    bmp.set([0x10, 0x00, 0x00, 0x00], 18);
    bmp.set([0x18, 0x00, 0x00, 0x00], 22);

    const webp = new Uint8Array(30);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    webp.set([0x56, 0x50, 0x38, 0x20], 12);
    webp.set([0x40, 0x00], 26);
    webp.set([0x24, 0x00], 28);

    expect(getImageDimensions(gif)).toEqual({
      height: 48,
      type: 'gif',
      width: 32,
    });
    expect(getImageDimensions(bmp)).toEqual({
      height: 24,
      type: 'bmp',
      width: 16,
    });
    expect(getImageDimensions(webp)).toEqual({
      height: 36,
      type: 'webp',
      width: 64,
    });
  });

  it('accepts ArrayBuffer input', () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    png.set([0x00, 0x00, 0x00, 0x20], 16);
    png.set([0x00, 0x00, 0x00, 0x10], 20);

    expect(getImageDimensions(png.buffer)).toEqual({
      height: 16,
      type: 'png',
      width: 32,
    });
  });

  it('returns the default unknown dimensions for unsupported formats', () => {
    expect(getImageDimensions(new Uint8Array([0x01, 0x02, 0x03]))).toEqual({
      height: 100,
      type: 'unknown',
      width: 100,
    });
  });
});
