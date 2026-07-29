import {
  resizeLengthClamp,
  resizeLengthClampStatic,
  resizeLengthToRelative,
  resizeLengthToStatic,
} from './resizeLength';

describe('resize lengths', () => {
  it('converts static and relative lengths', () => {
    expect(resizeLengthToRelative('50%', 20)).toBe('50%');
    expect(resizeLengthToRelative(5, 20)).toBe('25%');
    expect(resizeLengthToStatic(5, 20)).toBe(5);
    expect(resizeLengthToStatic('50%', 20)).toBe(10);
  });

  it('keeps an unconstrained static length', () => {
    expect(resizeLengthClampStatic(5, {})).toBe(5);
  });

  it('clamps a static minimum', () => {
    expect(resizeLengthClampStatic(5, { min: 4 })).toBe(5);
    expect(resizeLengthClampStatic(5, { min: 6 })).toBe(6);
  });

  it('clamps a static maximum', () => {
    expect(resizeLengthClampStatic(5, { max: 6 })).toBe(5);
    expect(resizeLengthClampStatic(5, { max: 4 })).toBe(4);
  });

  it('clamps static lengths with static bounds', () => {
    expect(resizeLengthClamp(3, 20, { max: 6, min: 4 })).toBe(4);
    expect(resizeLengthClamp(5, 20, { max: 6, min: 4 })).toBe(5);
    expect(resizeLengthClamp(7, 20, { max: 6, min: 4 })).toBe(6);
  });

  it('clamps static lengths with relative bounds', () => {
    expect(resizeLengthClamp(30, 100, { max: '60%', min: '40%' })).toBe(40);
    expect(resizeLengthClamp(50, 100, { max: '60%', min: '40%' })).toBe(50);
    expect(resizeLengthClamp(70, 100, { max: '60%', min: '40%' })).toBe(60);
  });

  it('clamps relative lengths with static bounds', () => {
    expect(resizeLengthClamp('30%', 100, { max: 60, min: 40 })).toBe('40%');
    expect(resizeLengthClamp('50%', 100, { max: 60, min: 40 })).toBe('50%');
    expect(resizeLengthClamp('70%', 100, { max: 60, min: 40 })).toBe('60%');
  });

  it('clamps relative lengths with relative bounds', () => {
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
