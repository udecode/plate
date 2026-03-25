import { isEditOnly } from './isEditOnlyDisabled';

describe('isEditOnly', () => {
  it('uses feature defaults when editOnly is true', () => {
    expect(isEditOnly(true, { editOnly: true }, 'handlers')).toBe(true);
    expect(isEditOnly(true, { editOnly: true }, 'normalizeInitialValue')).toBe(
      false
    );
  });

  it('uses object overrides when editOnly is an object', () => {
    expect(
      isEditOnly(
        true,
        { editOnly: { handlers: false, normalizeInitialValue: true } },
        'handlers'
      )
    ).toBe(false);
    expect(
      isEditOnly(
        true,
        { editOnly: { handlers: false, normalizeInitialValue: true } },
        'normalizeInitialValue'
      )
    ).toBe(true);
  });
});
