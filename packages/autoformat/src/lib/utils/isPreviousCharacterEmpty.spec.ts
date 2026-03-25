import { isPreviousCharacterEmpty } from './isPreviousCharacterEmpty';

describe('isPreviousCharacterEmpty', () => {
  it('returns true when there is no previous range', () => {
    const editor = {
      api: {
        range: mock(() => {}),
        string: mock(),
      },
    } as any;

    expect(isPreviousCharacterEmpty(editor, { path: [0, 0], offset: 1 })).toBe(
      true
    );
  });

  it('returns true when the previous text is only whitespace', () => {
    const editor = {
      api: {
        range: mock(() => ({ anchor: {}, focus: {} })),
        string: mock(() => '   '),
      },
    } as any;

    expect(isPreviousCharacterEmpty(editor, { path: [0, 0], offset: 1 })).toBe(
      true
    );
  });

  it('returns false when the previous text has visible characters', () => {
    const editor = {
      api: {
        range: mock(() => ({ anchor: {}, focus: {} })),
        string: mock(() => 'x'),
      },
    } as any;

    expect(isPreviousCharacterEmpty(editor, { path: [0, 0], offset: 1 })).toBe(
      false
    );
  });

  it('returns true when the previous range resolves to an empty string', () => {
    const editor = {
      api: {
        range: mock(() => ({ anchor: {}, focus: {} })),
        string: mock(() => ''),
      },
    } as any;

    expect(isPreviousCharacterEmpty(editor, { path: [0, 0], offset: 1 })).toBe(
      true
    );
  });
});
