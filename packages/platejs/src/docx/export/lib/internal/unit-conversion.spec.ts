import {
  cmRegex,
  cmToTWIP,
  inchRegex,
  inchToTWIP,
  percentageRegex,
  pointToHIP,
  TWIPToEMU,
} from './unit-conversion';

describe('unit conversion', () => {
  describe('regex patterns', () => {
    it('cmRegex matches centimeter values', () => {
      expect(cmRegex.test('2.54cm')).toBe(true);
      expect(cmRegex.test('10cm')).toBe(true);
      expect(cmRegex.test('10px')).toBe(false);
    });

    it('inchRegex matches inch values', () => {
      expect(inchRegex.test('1in')).toBe(true);
      expect(inchRegex.test('0.5in')).toBe(true);
      expect(inchRegex.test('1px')).toBe(false);
    });

    it('percentageRegex matches percentage values', () => {
      expect(percentageRegex.test('50%')).toBe(true);
      expect(percentageRegex.test('100%')).toBe(true);
      expect(percentageRegex.test('50px')).toBe(false);
    });
  });

  describe('point conversions', () => {
    it('pointToHIP converts points to half points', () => {
      // 1 point = 2 half points
      expect(pointToHIP(1)).toBe(2);
      expect(pointToHIP(11)).toBe(22);
    });
  });

  describe('centimeter conversions', () => {
    it('cmToTWIP converts centimeters to TWIP', () => {
      // 1 cm = 566.929 TWIP (approximately)
      const result = cmToTWIP(2.54);
      // 2.54 cm = 1 inch = 1440 TWIP
      expect(Math.round(result)).toBe(1440);
    });
  });

  describe('inch conversions', () => {
    it('inchToTWIP converts inches to TWIP', () => {
      // 1 inch = 1440 TWIP
      expect(inchToTWIP(1)).toBe(1440);
      expect(inchToTWIP(0.5)).toBe(720);
      expect(inchToTWIP(2)).toBe(2880);
    });
  });

  describe('TWIP conversions', () => {
    it('TWIPToEMU converts TWIP to EMU', () => {
      // 1 TWIP = 635 EMU
      expect(TWIPToEMU(1)).toBe(635);
      // 1 inch in EMU
      expect(TWIPToEMU(1440)).toBe(914_400);
    });
  });
});
