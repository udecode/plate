import { describe, expect, it } from 'bun:test';

import { getCodeTitleIconLabel } from './code-title-icon';

describe('getCodeTitleIconLabel', () => {
  it('normalizes common language aliases for code title icons', () => {
    expect(getCodeTitleIconLabel('typescript')).toBe('TS');
    expect(getCodeTitleIconLabel('ts')).toBe('TS');
    expect(getCodeTitleIconLabel('tsx')).toBe('TS');
    expect(getCodeTitleIconLabel('javascript')).toBe('JS');
    expect(getCodeTitleIconLabel('js')).toBe('JS');
    expect(getCodeTitleIconLabel('jsx')).toBe('JS');
  });
});
