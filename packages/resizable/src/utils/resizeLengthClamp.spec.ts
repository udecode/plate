import {
  resizeLengthClamp,
  resizeLengthClampStatic,
} from './resizeLengthClamp';

describe('resizeLengthClampStatic', () => {
  describe('when neither min nor max are defined', () => {
    it('should return the length as is', () => {
      expect(resizeLengthClampStatic(5, {})).toBe(5);
    });
  });

  describe('when min is defined', () => {
    it('should return the length if it is greater than min', () => {
      expect(resizeLengthClampStatic(5, { min: 4 })).toBe(5);
    });

    it('should return the min if the length is less than min', () => {
      expect(resizeLengthClampStatic(5, { min: 6 })).toBe(6);
    });
  });

  describe('when max is defined', () => {
    it('should return the length if it is less than max', () => {
      expect(resizeLengthClampStatic(5, { max: 6 })).toBe(5);
    });

    it('should return the max if the length is greater than max', () => {
      expect(resizeLengthClampStatic(5, { max: 4 })).toBe(4);
    });
  });
});

describe('resizeLengthClamp', () => {
  describe('when length is a number', () => {
    describe('when min and max are numbers', () => {
      it('should clamp the length', () => {
        expect(resizeLengthClamp(3, 20, { max: 6, min: 4 })).toBe(4);
        expect(resizeLengthClamp(5, 20, { max: 6, min: 4 })).toBe(5);
        expect(resizeLengthClamp(7, 20, { max: 6, min: 4 })).toBe(6);
      });
    });

    describe('when min and max are strings', () => {
      it('should clamp the length', () => {
        expect(resizeLengthClamp(30, 100, { max: '60%', min: '40%' })).toBe(40);
        expect(resizeLengthClamp(50, 100, { max: '60%', min: '40%' })).toBe(50);
        expect(resizeLengthClamp(70, 100, { max: '60%', min: '40%' })).toBe(60);
      });
    });
  });

  describe('when length is a string', () => {
    describe('when min and max are numbers', () => {
      it('should clamp the length', () => {
        expect(resizeLengthClamp('30%', 100, { max: 60, min: 40 })).toBe('40%');
        expect(resizeLengthClamp('50%', 100, { max: 60, min: 40 })).toBe('50%');
        expect(resizeLengthClamp('70%', 100, { max: 60, min: 40 })).toBe('60%');
      });
    });

    describe('when min and max are strings', () => {
      it('should clamp the length', () => {
        expect(resizeLengthClamp('30%', 100, { max: '60%', min: '40%' })).toBe(
          '40%'
        );
        expect(resizeLengthClamp('50%', 100, { max: '60%', min: '40%' })).toBe(
          '50%'
        );
        expect(resizeLengthClamp('70%', 100, { max: '60%', min: '40%' })).toBe(
          '60%'
        );
      });
    });
  });
});
