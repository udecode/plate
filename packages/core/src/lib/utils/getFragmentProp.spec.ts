import { getFragmentProp } from './getFragmentProp';

describe('getFragmentProp', () => {
  it('returns default value for empty nodes', () => {
    expect(
      getFragmentProp([], {
        defaultValue: 'left',
        key: 'textAlign',
      })
    ).toBe('left');
  });

  it('returns default value when a block prop is missing', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [{ text: 'one' }],
            type: 'p',
          },
        ],
        {
          defaultValue: 'left',
          key: 'textAlign',
        }
      )
    ).toBe('left');
  });

  it('returns the shared block prop', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [{ text: 'one' }],
            textAlign: 'center',
            type: 'p',
          },
          {
            children: [{ text: 'two' }],
            textAlign: 'center',
            type: 'p',
          },
        ],
        {
          key: 'textAlign',
        }
      )
    ).toBe('center');
  });

  it('returns undefined when block prop values differ', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [{ text: 'one' }],
            textAlign: 'left',
            type: 'p',
          },
          {
            children: [{ text: 'two' }],
            textAlign: 'right',
            type: 'p',
          },
        ],
        {
          defaultValue: 'center',
          key: 'textAlign',
        }
      )
    ).toBeUndefined();
  });

  it('reads text props in text mode', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [
              { bold: true, text: 'one' },
              { bold: true, text: 'two' },
            ],
            type: 'p',
          },
        ],
        {
          defaultValue: false,
          getProp: (node) =>
            'bold' in node ? (node.bold as boolean | undefined) : undefined,
          mode: 'text',
        }
      )
    ).toBe(true);
  });

  it('returns default value when a text prop is missing in text mode', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [{ bold: true, text: 'one' }, { text: 'two' }],
            type: 'p',
          },
        ],
        {
          defaultValue: false,
          getProp: (node) =>
            'bold' in node ? (node.bold as boolean | undefined) : undefined,
          mode: 'text',
        }
      )
    ).toBe(false);
  });

  it('returns undefined for mixed custom props in all mode', () => {
    expect(
      getFragmentProp(
        [
          {
            children: [{ color: 'red', text: 'one' }],
            color: 'red',
            type: 'p',
          },
          {
            children: [{ color: 'blue', text: 'two' }],
            color: 'blue',
            type: 'p',
          },
        ],
        {
          getProp: (node) =>
            'color' in node ? (node.color as string | undefined) : undefined,
          mode: 'all',
        }
      )
    ).toBeUndefined();
  });
});
