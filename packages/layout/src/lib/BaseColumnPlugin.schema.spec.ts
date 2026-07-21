import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseColumnPlugin } from './BaseColumnPlugin';

describe('BaseColumnPlugin schema', () => {
  it('constructs configured column-group content from plugin-key grammar', () => {
    const editor = createBaseEditor({ plugins: [BaseColumnPlugin] });

    expect(editor.read.schema.createAndFill(NODES.columnGroup)).toEqual({
      children: [
        {
          children: [{ children: [{ text: '' }], type: KEYS.p }],
          type: KEYS.column,
        },
        {
          children: [{ children: [{ text: '' }], type: KEYS.p }],
          type: KEYS.column,
        },
      ],
      type: NODES.columnGroup,
    });
    expect(editor.read.schema.element(NODES.columnGroup)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.element(KEYS.column)?.groups).not.toContain(
      'block'
    );
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: KEYS.p }],
            type: KEYS.column,
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [
            { children: [{ text: '' }], type: KEYS.p },
            { children: [{ text: '' }], type: KEYS.p },
          ],
          type: NODES.columnGroup,
        },
      ])
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [
            {
              children: [{ children: [{ text: '' }], type: KEYS.p }],
              type: KEYS.column,
            },
          ],
          type: NODES.columnGroup,
        },
      ])
    ).toThrow(/at least 2 children/i);
  });
});
