import { decideUrl, isStoredUrl, type UrlRole } from './urlPolicy';

const decide = (
  role: UrlRole,
  url: string,
  allowedSchemes?: readonly string[]
) => {
  const decision = decideUrl(role, url, { allowedSchemes });

  return decision.ok ? decision.url : decision.reason;
};

describe('decideUrl', () => {
  it('admits navigation above the script floor', () => {
    expect(decide('navigation', 'https://platejs.org/docs')).toBe(
      'https://platejs.org/docs'
    );
    expect(decide('navigation', 'mailto:team@platejs.org')).toBe(
      'mailto:team@platejs.org'
    );
    expect(decide('navigation', '/docs?page=1#top')).toBe('/docs?page=1#top');
    expect(decide('navigation', '#top')).toBe('#top');
    expect(decide('navigation', 'docs/page')).toBe('docs/page');
    expect(decide('navigation', '  https://platejs.org  ')).toBe(
      'https://platejs.org'
    );
    expect(decide('navigation', 'vscode://file/a.ts')).toBe(
      'vscode://file/a.ts'
    );

    for (const url of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'vbscript:msgbox(1)',
      'data:text/html,<script>alert(1)</script>',
      'blob:https://platejs.org/0b1c',
    ]) {
      expect(decide('navigation', url)).toBe('scheme');
    }
  });

  it('rejects obfuscated and malformed destinations', () => {
    for (const url of [
      'java\tscript:alert(1)',
      'java\nscript:alert(1)',
      'https://platejs.org/\u0085',
      '//evil.example',
      '\\\\evil.example',
      'https:\\\\evil.example',
      '1ab:c',
      'https://',
      '\uD800',
    ]) {
      expect(decide('navigation', url)).toBe('malformed');
    }
    expect(decide('navigation', 'https://platejs.org/😀')).toBe(
      'https://platejs.org/😀'
    );
  });

  it('lets allowed schemes narrow or widen navigation but not the floor', () => {
    expect(decide('navigation', 'mailto:a@b.c', ['http', 'https'])).toBe(
      'scheme'
    );
    expect(decide('navigation', 'vscode://file/a.ts', ['vscode'])).toBe(
      'vscode://file/a.ts'
    );
    expect(decide('navigation', 'javascript:alert(1)', ['javascript'])).toBe(
      'scheme'
    );
    expect(decide('navigation', '/relative', ['https'])).toBe('/relative');
  });

  it('admits each resource role its own sources', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    const blob = 'blob:https://platejs.org/0b1c';

    expect(decide('image', png)).toBe(png);
    expect(decide('image', blob)).toBe(blob);
    expect(decide('image', 'images/a.png')).toBe('images/a.png');
    expect(decide('image', 'data:image/svg+xml;base64,PHN2Zy8+')).toBe(
      'scheme'
    );
    expect(decide('image', 'data:image/png,raw')).toBe('scheme');
    expect(decide('image', 'mailto:a@b.c')).toBe('scheme');

    expect(decide('media', blob)).toBe(blob);
    expect(decide('media', 'data:video/mp4;base64,AAAA')).toBe('scheme');
    expect(decide('file', '/files/a.pdf')).toBe('/files/a.pdf');
    expect(decide('file', 'tel:+123')).toBe('scheme');

    expect(decide('embed', 'https://www.youtube.com/embed/x')).toBe(
      'https://www.youtube.com/embed/x'
    );
    expect(decide('embed', '/embed/x')).toBe('scheme');
    expect(decide('embed', blob)).toBe('scheme');
  });

  it('treats the empty URL as unresolved, never as a destination', () => {
    expect(decide('navigation', '')).toBe('empty');
    expect(decide('image', '   ')).toBe('empty');
  });
});

describe('isStoredUrl', () => {
  it('keeps the empty URL inert and rejects unsafe values', () => {
    const navigation = isStoredUrl('navigation');

    expect(navigation('')).toBe(true);
    expect(navigation('https://platejs.org')).toBe(true);
    expect(navigation('javascript:alert(1)')).toBe(false);
    expect(navigation(1)).toBe(false);
    expect(isStoredUrl('embed')('/relative')).toBe(false);
  });
});
