/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHTML } from 'deserializers/deserialize-html';
import { Editor } from 'slate';
import { withReact } from 'slate-react';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const data = {
  getData: (format: string) => (format === 'text/html' ? '' : 'inserted'),
};

const output = (
  <editor>
    <hp>
      testinserted
      <cursor />
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>inserted</fragment>);

  const editor = withDeserializeHTML()(withReact(input));

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
