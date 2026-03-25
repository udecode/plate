import fs from 'node:fs';
import path from 'node:path';

import { getVShapes } from './getVShapes';

const readFixture = (filepath: string) =>
  fs.readFileSync(path.resolve(__dirname, filepath), 'utf8');

describe('getVShapes', () => {
  it('extracts VML shape ids and spids from html comments', () => {
    const document = new DOMParser().parseFromString(
      readFixture('../__tests__/input/v-shapes.html'),
      'text/html'
    );

    expect(getVShapes(document)).toEqual({
      Picture_x0020_2: '_x0000_i1026',
      Picture_x0020_3: '_x0000_i1025',
    });
  });

  it('ignores comments without valid VML shapes or missing ids', () => {
    const document = new DOMParser().parseFromString(
      `
        <div>
          <!-- plain comment -->
          <!-- <v:shape id="keep-me"></v:shape> -->
          <!-- <v:shape o:spid="_x0000_i1"></v:shape> -->
          <!-- <v:shape id="good" o:spid="_x0000_i2"></v:shape> -->
        </div>
      `,
      'text/html'
    );

    expect(getVShapes(document)).toEqual({
      good: '_x0000_i2',
    });
  });
});
