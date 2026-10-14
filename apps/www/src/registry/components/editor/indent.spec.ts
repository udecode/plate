import { BaseListPlugin, type Value } from 'platejs';
import { createEditor } from 'platejs/react';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { BaseDetailsKit } from './details-static';
import { IndentKit } from './indent';
import { BaseListKit } from './list-static';
import { BaseTableKit } from './table-static';

const create = (initialValue?: Value) =>
  createEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseTableKit,
      ...BaseDetailsKit,
      ...BaseListKit,
      ...IndentKit,
    ],
    initialValue,
  });

const table = {
  type: 'table',
  children: [
    {
      type: 'tableRow',
      children: [
        {
          type: 'tableCell',
          children: [{ type: 'paragraph', children: [{ text: 'Cell' }] }],
        },
      ],
    },
  ],
};

describe('IndentKit', () => {
  it('keeps a pasted table margin as the table offset, not an indent', () => {
    const result = create().api.html.parse(
      '<table style="margin-left: 48px"><tbody><tr><td><p>Cell</p></td></tr></tbody></table>'
    );
    const [pasted] = result.ok ? result.document.children : [];

    expect({ indent: pasted?.indent, marginLeft: pasted?.marginLeft }).toEqual({
      indent: undefined,
      marginLeft: 48,
    });
  });

  it('leaves a Details whose body holds a table unconverted', () => {
    const editor = create([
      {
        type: 'details',
        children: [{ type: 'summary', children: [{ text: 'Title' }] }, table],
      },
    ]);
    const before = editor.read.children();

    expect({
      converted: editor
        .plugin(BaseListPlugin)
        .update.toggle({ at: [0, 0], type: 'bulleted' }),
      value: editor.read.children(),
    }).toEqual({ converted: false, value: before });
  });
});
