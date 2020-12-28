/** @jsx jsx */

import { getAboveByType } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { createEditor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { withList } from './index';

const listNodeWithImage = (
  <hul>
    <hli>
      <hp>
        <htext />
      </hp>
    </hli>
    <hli>
      <hp>
        <htext />
      </hp>
      <himg>
        <htext />
      </himg>
    </hli>
  </hul>
) as any;

describe('withList - list node with image', () => {
  it('should insert a new list item when enter is pressed with an image in the current list item', () => {
    const editor = withList()(createEditor() as ReactEditor);

    editor.insertNode(listNodeWithImage);

    const selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    };
    Transforms.select(editor, selection);

    editor.insertBreak();

    expect((editor.children[0] as { children: any[] }).children.length).toBe(2);
  });

  it('should delete the image without deleting the list item when an image is deleted from alist item', () => {
    const editor = withList()(createEditor() as ReactEditor);

    editor.insertNode(listNodeWithImage);

    const selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    };
    Transforms.select(editor, selection);

    expect(
      (editor.children[0] as { children: any[] }).children[1].children.length
    ).toBe(2);
    editor.deleteBackward('block');
    expect((editor.children[0] as { children: any[] }).children.length).toBe(2);
    expect(
      (editor.children[0] as { children: any[] }).children[1].children.length
    ).toBe(1);
  });
});

describe('getTypeAboveBylevel()', () => {
  it('should return a node entry', () => {
    const editor = withList()(createEditor() as ReactEditor);
    editor.insertNode(listNodeWithImage);
    const selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    };
    Transforms.select(editor, selection);
    const nodeEntry = getAboveByType(editor, 'li');
    expect(nodeEntry).toBeTruthy();
  });

  it('should return null', () => {
    const editor = withList()(createEditor() as ReactEditor);
    editor.insertNode(listNodeWithImage);
    const selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    };
    Transforms.select(editor, selection);
    const nodeEntry = getAboveByType(editor, 'ol');
    expect(nodeEntry).toBeFalsy();
  });
});
