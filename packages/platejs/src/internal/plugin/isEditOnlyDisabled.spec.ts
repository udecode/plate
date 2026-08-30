import { isEditOnly } from './isEditOnlyDisabled';

describe('isEditOnly', () => {
  it('uses feature defaults when editOnly is true', () => {
    expect(isEditOnly(true, { editOnly: true }, 'on')).toBe(true);
    expect(isEditOnly(true, { editOnly: true }, 'prepareDocument')).toBe(false);
  });

  it('uses object overrides when editOnly is an object', () => {
    expect(
      isEditOnly(true, { editOnly: { on: false, prepareDocument: true } }, 'on')
    ).toBe(false);
    expect(
      isEditOnly(
        true,
        { editOnly: { on: false, prepareDocument: true } },
        'prepareDocument'
      )
    ).toBe(true);
  });
});
