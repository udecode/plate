import { parseDOMClipboardHtml } from '../../src/dom';

describe('clipboard HTML', () => {
  const setTrustedTypes = (value: unknown) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'trustedTypes'
    );

    Object.defineProperty(globalThis, 'trustedTypes', {
      configurable: true,
      value,
    });

    return () => {
      if (descriptor) {
        Object.defineProperty(globalThis, 'trustedTypes', descriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'trustedTypes');
      }
    };
  };

  it('creates one host policy and passes every parse through it', () => {
    const parsed: string[] = [];
    let policies = 0;

    const restore = setTrustedTypes({
      createPolicy: (name: string) => {
        policies += 1;
        expect(name).toBe('plite-dom');

        return {
          createHTML: (html: string) => {
            parsed.push(html);

            return html;
          },
        };
      },
    });

    try {
      expect(parseDOMClipboardHtml('<p>one</p>').body.textContent).toBe('one');
      expect(parseDOMClipboardHtml('<p>two</p>').body.textContent).toBe('two');
      expect(policies).toBe(1);
      expect(parsed).toEqual(['<p>one</p>', '<p>two</p>']);
    } finally {
      restore();
    }
  });

  it('uses the application default policy and propagates rejection', () => {
    const parsed: string[] = [];
    let reject = false;
    const restore = setTrustedTypes({
      createPolicy: () => {
        throw new Error('must not create a library policy');
      },
      defaultPolicy: {
        createHTML: (html: string) => {
          parsed.push(html);

          return reject ? null : html;
        },
      },
    });

    try {
      expect(parseDOMClipboardHtml('<p>safe</p>').body.textContent).toBe(
        'safe'
      );
      reject = true;
      expect(() => parseDOMClipboardHtml('<p>rejected</p>')).toThrow(
        'Trusted Types policy rejected clipboard HTML.'
      );
      expect(parsed).toEqual(['<p>safe</p>', '<p>rejected</p>']);
    } finally {
      restore();
    }
  });

  it('restores Safari converted-space wrappers without changing semantic nbsp', () => {
    const document = parseDOMClipboardHtml(
      '<p>one<span class="Apple-converted-space">&nbsp;</span>two&nbsp;three</p>'
    );
    const paragraph = document.querySelector('p');

    expect(paragraph?.textContent).toBe('one two\u00A0three');
    expect(document.querySelector('.Apple-converted-space')).toBeNull();
  });
});
