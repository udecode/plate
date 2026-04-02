import { isEditOnly } from './isEditOnlyDisabled';

describe('isEditOnly', () => {
  it('uses feature defaults when editOnly is true', () => {
    expect(isEditOnly(true, { editOnly: true }, 'handlers')).toBe(true);
    expect(isEditOnly(true, { editOnly: true }, 'transformInitialValue')).toBe(
      false
    );
  });

  it('uses object overrides when editOnly is an object', () => {
    expect(
      isEditOnly(
        true,
        { editOnly: { handlers: false, transformInitialValue: true } },
        'handlers'
      )
    ).toBe(false);
    expect(
      isEditOnly(
        true,
        { editOnly: { handlers: false, transformInitialValue: true } },
        'transformInitialValue'
      )
    ).toBe(true);
  });

  it('supports legacy normalizeInitialValue editOnly config', () => {
    expect(
      isEditOnly(
        true,
        { editOnly: { normalizeInitialValue: true } },
        'transformInitialValue'
      )
    ).toBe(true);
  });
});
