import { getRtfImageHex } from './getRtfImageHex';

describe('getRtfImageHex', () => {
  it('extracts hex payloads written directly after bliptag', () => {
    expect(getRtfImageHex('1025 pngblip bliptag 68 65 6c 6c 6f}')).toBe(
      '68656c6c6f'
    );
  });

  it('extracts the post-bracket payload when blipuid metadata is present', () => {
    expect(
      getRtfImageHex('2049 pngblip bliptag blipuid abc} ff d8 ff }ignored')
    ).toBe('ffd8ff');
  });

  it('returns null when the payload never reaches a closing bracket', () => {
    expect(getRtfImageHex('1025 pngblip bliptag 68656c6c6f')).toBeNull();
  });
});
