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
            type: 'paragraph',
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
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            textAlign: 'center',
            type: 'paragraph',
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
            type: 'paragraph',
          },
          {
            children: [{ text: 'two' }],
            textAlign: 'right',
            type: 'paragraph',
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
            type: 'paragraph',
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
            type: 'paragraph',
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
            type: 'paragraph',
          },
          {
            children: [{ color: 'blue', text: 'two' }],
            color: 'blue',
            type: 'paragraph',
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
