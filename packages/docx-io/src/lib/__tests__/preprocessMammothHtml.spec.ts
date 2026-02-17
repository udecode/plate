import { preprocessMammothHtml } from '../importDocx';

describe('preprocessMammothHtml', () => {
  it('throws when DOMParser is unavailable', () => {
    const globalWithDom = globalThis as Omit<typeof globalThis, 'DOMParser'> & {
      DOMParser?: typeof DOMParser;
    };
    const originalDOMParser = globalWithDom.DOMParser;

    try {
      globalWithDom.DOMParser = undefined;

      expect(() => preprocessMammothHtml('<p>Test</p>')).toThrow(
        'preprocessMammothHtml requires DOMParser (browser-like environment).'
      );
    } finally {
      globalWithDom.DOMParser = originalDOMParser;
    }
  });
});
