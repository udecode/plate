import * as vShapesModule from './getVShapes';
import { getVShapeSpid } from './getVShapeSpid';

describe('getVShapeSpid', () => {
  it('returns the mapped spid for image elements', () => {
    const getVShapesSpy = spyOn(vShapesModule, 'getVShapes').mockReturnValue({
      shape1: '_x0000_s2049',
    });
    const document = new DOMParser().parseFromString(
      '<img v:shapes="shape1" />',
      'text/html'
    );
    const element = document.querySelector('img')!;

    expect(getVShapeSpid(document, element)).toBe('s2049');

    getVShapesSpy.mockRestore();
  });

  it('returns null for images without a v:shapes attribute', () => {
    const document = new DOMParser().parseFromString('<img />', 'text/html');
    const element = document.querySelector('img')!;

    expect(getVShapeSpid(document, element)).toBeNull();
  });

  it('returns null for equation images without a resolved shape mapping', () => {
    const getVShapesSpy = spyOn(vShapesModule, 'getVShapes').mockReturnValue(
      {}
    );
    const document = new DOMParser().parseFromString(
      '<div><span><img v:shapes="_x0000_s3000" /></span>msEquation</div>',
      'text/html'
    );
    const element = document.querySelector('img')!;

    expect(getVShapeSpid(document, element)).toBeNull();

    getVShapesSpy.mockRestore();
  });

  it('normalizes the parent o:spid for non-image elements', () => {
    const document = new DOMParser().parseFromString(
      '<div o:spid="_x0000_s4097"><span>Text</span></div>',
      'text/html'
    );
    const element = document.querySelector('span')!;

    expect(getVShapeSpid(document, element)).toBe('s4097');
  });
});
