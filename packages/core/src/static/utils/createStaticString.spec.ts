import { createStaticString } from './createStaticString';

describe('createStaticString', () => {
  it('creates a slate string span with the provided text', () => {
    const element = createStaticString({ text: 'hello' });

    expect(element.type).toBe('span');
    expect(element.props['data-slate-string']).toBe(true);
    expect(element.props.children).toBe('hello');
  });

  it('uses a zero-width no-break space for empty strings', () => {
    const element = createStaticString({ text: '' });

    expect(element.props.children).toBe('\uFEFF');
  });
});
