import { StringCharMapping } from './string-char-mapping';

describe('StringCharMapping', () => {
  it('treats nodes as equivalent regardless of key order', () => {
    const map = new StringCharMapping();
    const c1 = map.nodeToChar({ children: [], type: 'a' });
    const c2 = map.nodeToChar({ children: [], type: 'a' });
    expect(c1).toBe(c2);
  });
});
