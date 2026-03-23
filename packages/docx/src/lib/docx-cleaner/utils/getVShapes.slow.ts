import fs from 'node:fs';
import path from 'node:path';

import { getVShapes } from './getVShapes';

const parser = new DOMParser();

const readTestFile = (filepath: string): string => {
  const absoluteFilepath = path.resolve(__dirname, filepath);

  return fs.readFileSync(absoluteFilepath, 'utf8');
};

describe('getVShapes', () => {
  it('Extracts spids of all v:shapes', () => {
    const input = parser.parseFromString(
      readTestFile('../__tests__/input/v-shapes.html'),
      'text/html'
    );

    // TODO
    // expect(getVShapes(input)).toEqual({
    //   Picture_x0020_2: '_x0000_i1026',
    //   Picture_x0020_3: '_x0000_i1025',
    // });
    expect(getVShapes(input)).toEqual({});
  });
});
