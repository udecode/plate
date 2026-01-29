import { getTextIndentExportValue } from '../../core/super-converter/helpers.js';

describe('Export helpers', () => {
  it('getTextIndentExportValue returns correct value for every case', () => {
    const pxValue = getTextIndentExportValue('20');
    const inchValue = getTextIndentExportValue('2in');
    const ptValue = getTextIndentExportValue('20pt');

    expect(pxValue).toBe(300);
    expect(inchValue).toBe(2880);
    expect(ptValue).toBe(400);
  });
});
