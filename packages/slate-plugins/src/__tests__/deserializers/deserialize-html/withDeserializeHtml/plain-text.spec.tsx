/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHtml } from 'deserializers/deserialize-html';
import { BoldPlugin } from 'marks/bold';
import { Editor } from 'slate';
import { withReact } from 'slate-react';

const input = ((
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any) as Editor;

const data = {
  getData: (format: string) => (format === 'text/html' ? '' : 'inserted'),
};

const output = (
  <editor>
    <p>
      testinserted
      <cursor />
    </p>
  </editor>
) as any;

it('should do nothing', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>inserted</fragment>);

  const editor = withDeserializeHtml([BoldPlugin()])(withReact(input));

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
