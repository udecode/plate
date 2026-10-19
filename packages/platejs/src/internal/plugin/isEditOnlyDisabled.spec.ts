import { isEditOnly } from './isEditOnlyDisabled';

describe('isEditOnly', () => {
  it('uses feature defaults when editOnly is true', () => {
    expect(isEditOnly(true, { editOnly: true }, 'on')).toBe(true);
    expect(isEditOnly(true, { editOnly: true }, 'render')).toBe(true);
  });

  it('uses object overrides when editOnly is an object', () => {
    expect(
      isEditOnly(true, { editOnly: { on: false, render: true } }, 'on')
    ).toBe(false);
    expect(
      isEditOnly(true, { editOnly: { on: false, render: true } }, 'render')
    ).toBe(true);
  });
});
