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

  it('does not apply legacy normalizeInitialValue config to unrelated features', () => {
    const plugin = { editOnly: { normalizeInitialValue: false } };

    expect(isEditOnly(true, plugin, 'handlers')).toBe(true);
    expect(isEditOnly(true, plugin, 'inject')).toBe(true);
    expect(isEditOnly(true, plugin, 'render')).toBe(true);
    expect(isEditOnly(true, plugin, 'transformInitialValue')).toBe(false);
  });
});
