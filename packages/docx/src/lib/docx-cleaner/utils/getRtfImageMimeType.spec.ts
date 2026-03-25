import { getRtfImageMimeType } from './getRtfImageMimeType';

describe('getRtfImageMimeType', () => {
  it('detects png images from the blip metadata', () => {
    expect(getRtfImageMimeType('1025 pngblip bliptag 68656c6c6f}')).toBe(
      'image/png'
    );
  });

  it('detects jpeg images from the blip metadata', () => {
    expect(getRtfImageMimeType('2049 jpegblip bliptag ffd8ff}')).toBe(
      'image/jpeg'
    );
  });

  it('returns null for unsupported image metadata', () => {
    expect(getRtfImageMimeType('3000 emfblip bliptag 00}')).toBeNull();
  });
});
