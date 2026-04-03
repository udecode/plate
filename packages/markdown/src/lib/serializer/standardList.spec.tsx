/** @jsx jsxt */

import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TaskListPlugin,
} from '@platejs/list-classic/react';
import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

jsxt;
const editor = createTestEditor([
  ListItemPlugin,
  ListItemContentPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
  ListItemPlugin,
]);

describe('serializeMd list', () => {
  it('serialize unordered lists', () => {
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

  it('serialize ordered lists', () => {
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

  it('serialize mixed nested lists', () => {
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

  it('serialize nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ] as any;

    const expected = '* parent\n  * child\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize nested ordered indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
    ] as any;

    const expected = '1. parent\n   1. child\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize deeply nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'grandchild' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ] as any;

    const expected = '* parent\n  * child\n    * grandchild\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize sibling nested indented lists when style changes at same indent', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'ordered child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'bullet child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ] as any;

    const expected = '* parent\n  1. ordered child\n  * bullet child\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize nested indented list followed by sibling item without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'sibling' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ] as any;

    const expected = '* parent\n  * child\n* sibling\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize lists with formatted text', () => {
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

  it('serialize restarted ordered lists separated by a paragraph', () => {
    const input = [
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'Break between lists.' }],
        type: 'p',
      },
      {
        children: [{ text: 'Second list item' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'p',
      },
    ] as any;

    const expected =
      '1. First list item\n\nBreak between lists.\n\n2. Second list item\n3. Third list item\n';

    expect(serializeMd(editor, { value: input })).toBe(expected);
  });

  it('serialize lists with links', () => {
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
