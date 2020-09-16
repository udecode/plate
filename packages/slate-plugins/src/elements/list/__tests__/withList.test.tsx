import { createEditor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { DEFAULTS_LIST, withList } from '..';
import { getAboveByType } from '../../../common/queries/getAboveByType';

const listNodeWithImage = {
  type: DEFAULTS_LIST.ul.type,
  children: [
    {
      type: DEFAULTS_LIST.li.type,
      children: [{ type: DEFAULTS_LIST.p.type, children: [{ text: '' }] }],
    },
    {
      type: DEFAULTS_LIST.li.type,
      children: [
        { type: DEFAULTS_LIST.p.type, children: [{ text: '' }] },
        { type: 'image', children: [{ text: '' }] },
      ],
    },
  ],
};
describe('withList', () => {
  it('should insert a new list item when enter is pressed with an image in the current list item', () => {
    const editor = withList()(createEditor() as ReactEditor);
    editor.insertNode(listNodeWithImage);
    const selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    };
    Transforms.select(editor, selection);
    editor.insertBreak();
    expect((editor.children[0] as { children: any[] }).children.length).toBe(3);
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
