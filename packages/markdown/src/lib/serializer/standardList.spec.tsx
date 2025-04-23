/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

jsxt;
const editor = createTestEditor();

describe('serializeMd list', () => {
  it('should serialize unordered lists', () => {
    const input = (
      <fragment>
        <hul>
          <hli>
            <hlic>List item 1</hlic>
          </hli>
          <hli>
            <hlic>List item 2</hlic>
          </hli>
        </hul>
      </fragment>
    );

    const expected = '* List item 1\n* List item 2\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('should serialize ordered lists', () => {
    const input = (
      <fragment>
        <hol>
          <hli>
            <hlic>List item 1</hlic>
          </hli>
          <hli>
            <hlic>List item 2</hlic>
          </hli>
        </hol>
      </fragment>
    );

    const expected = '1. List item 1\n2. List item 2\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('should serialize mixed nested lists', () => {
    const input = (
      <fragment>
        <hul>
          <hli>
            <hlic>List item 1</hlic>
            <hol>
              <hli>
                <hlic>List item 1.1</hlic>
              </hli>
            </hol>
          </hli>
        </hul>
      </fragment>
    );

    const expected = '* List item 1\n  1. List item 1.1\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('should serialize lists with formatted text', () => {
    const input = (
      <fragment>
        <hul>
          <hli>
            <hlic>
              Normal text and <htext bold>bold text</htext>
            </hlic>
          </hli>
          <hli>
            <hlic>
              <htext italic>Italic text</htext> and normal text
            </hlic>
          </hli>
        </hul>
      </fragment>
    );

    const expected =
      '* Normal text and **bold text**\n* _Italic text_ and normal text\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('should serialize lists with links', () => {
    const input = (
      <fragment>
        <hul>
          <hli>
            <hlic>
              Text with <ha url="https://example.com">a link</ha>
            </hlic>
          </hli>
        </hul>
      </fragment>
    );

    const expected = '* Text with [a link](https://example.com)\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });
});
