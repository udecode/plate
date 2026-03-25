import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseIndentPlugin } from '../BaseIndentPlugin';
import { indent } from './indent';
import { outdent } from './outdent';
import { setIndent } from './setIndent';

const createIndentEditor = (value: any[]) =>
  createSlateEditor({
    plugins: [BaseParagraphPlugin, BaseIndentPlugin],
    value,
  });

describe('setIndent', () => {
  it('increments every matching block and merges custom props', () => {
    const editor = createIndentEditor([
      {
        children: [{ text: 'One' }],
        type: 'p',
      },
      {
        children: [{ text: 'Two' }],
        indent: 1,
        type: 'p',
      },
    ]);

    setIndent(editor, {
      getNodesOptions: { at: [] },
      setNodesProps: ({ indent }) => ({
        foo: `indent-${indent}`,
      }),
    });

    expect(editor.children).toMatchObject([
      {
        foo: 'indent-1',
        indent: 1,
        type: 'p',
      },
      {
        foo: 'indent-2',
        indent: 2,
        type: 'p',
      },
    ]);
  });

  it('unsets indent and extra props when the next indent is zero or less', () => {
    const editor = createIndentEditor([
      {
        children: [{ text: 'One' }],
        foo: 'remove-me',
        indent: 1,
        type: 'p',
      },
    ]);

    setIndent(editor, {
      getNodesOptions: { at: [] },
      offset: -1,
      unsetNodesProps: ['foo'],
    });

    expect(editor.children[0]).toEqual({
      children: [{ text: 'One' }],
      type: 'p',
    });
  });
});

describe('indent / outdent', () => {
  it('adjust the selected block indent through the shared transform', () => {
    const editor = createIndentEditor([
      {
        children: [{ text: 'One' }],
        indent: 1,
        type: 'p',
      },
    ]);

    indent(editor, { getNodesOptions: { at: [] } });
    expect((editor.children[0] as any).indent).toBe(2);

    outdent(editor, { getNodesOptions: { at: [] } });
    expect((editor.children[0] as any).indent).toBe(1);
  });
});
