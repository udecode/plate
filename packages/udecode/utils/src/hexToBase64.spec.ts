import { hexToBase64 } from './hexToBase64';

describe('hexToBase64', () => {
  it('encodes hex strings as base64', () => {
    expect(hexToBase64('48656c6c6f')).toBe('SGVsbG8=');
  });

  it('returns an empty string for empty input', () => {
    expect(hexToBase64('')).toBe('');
  });
});
