/** @jsx jsx */

import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { HeadingPlugin } from '../../../../elements/heading/index';
import { withDeserializeHTML } from '../../index';

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html><body><h1>inserted</h1></body></html>',
};

describe('when inserting html', () => {
  describe('when inserting h1 inside p (not empty)', () => {
    it('should just insert h1 text inside p', () => {
      const input = ((
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const expected = (
        <editor>
          <hp>
            testinserted
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = withDeserializeHTML({ plugins: [HeadingPlugin()] })(
        withReact(input)
      );

      editor.insertData(data as any);

      expect(input.children).toEqual(expected.children);
    });
  });

  describe('when inserting h1 inside an empty p', () => {
    it('should set p type to h1 and insert h1 text', () => {
      const input = ((
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const expected = (
        <editor>
          <hh1>
            inserted
            <cursor />
          </hh1>
        </editor>
      ) as any;

      const editor = withDeserializeHTML({ plugins: [HeadingPlugin()] })(
        withReact(input)
      );

      editor.insertData(data as any);

      expect(input.children).toEqual(expected.children);
    });
  });
});
