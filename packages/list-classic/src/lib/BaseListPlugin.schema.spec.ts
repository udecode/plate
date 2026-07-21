import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseListPlugin } from './BaseListPlugin';

describe('BaseListPlugin schema', () => {
  it('constructs and validates the list root, item, and content grammar', () => {
    const editor = createBaseEditor({ plugins: [BaseListPlugin] });
    const list = editor.read.schema.createAndFill(KEYS.ulClassic);

    if (!ElementApi.isElement(list)) {
      throw new Error('Expected the list schema to construct a list element.');
    }

    const listItem = list.children[0];

    if (!ElementApi.isElement(listItem)) {
      throw new Error('Expected the list schema to construct a list item.');
    }

    const listItemContent = listItem.children[0];

    if (!ElementApi.isElement(listItemContent)) {
      throw new Error('Expected the list schema to construct list elements.');
    }

    expect(list).toEqual({
      children: [
        {
          children: [{ children: [{ text: '' }], type: KEYS.lic }],
          type: KEYS.li,
        },
      ],
      type: KEYS.ulClassic,
    });
    expect(editor.read.schema.getElementSlicePolicy(list)).toEqual({
      preserveContext: true,
      replaceWhenCovered: false,
    });
    expect(editor.read.schema.element(KEYS.ulClassic)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.element(KEYS.li)?.groups).not.toContain('block');
    expect(editor.read.schema.element(KEYS.lic)?.groups).not.toContain('block');
    expect(() => editor.read.schema.validateFragment([list])).not.toThrow();
    expect(() =>
      editor.read.schema.validateDocument({ children: [listItem] })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [listItemContent],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [{ children: [{ text: '' }], type: KEYS.p }],
          type: KEYS.ulClassic,
        },
      ])
    ).toThrow(/cannot contain/i);
  });

  it('restricts checked state to task-list items', () => {
    const editor = createBaseEditor({ plugins: [BaseListPlugin] });
    const item = {
      checked: true,
      children: [{ children: [{ text: '' }], type: KEYS.lic }],
      type: KEYS.li,
    };

    expect(() =>
      editor.read.schema.validateFragment([
        { children: [item], type: KEYS.taskList },
      ])
    ).not.toThrow();
    expect(() =>
      editor.read.schema.validateFragment([
        { children: [item], type: KEYS.ulClassic },
      ])
    ).toThrow(/property "checked" cannot target element "li"/i);
    expect(editor.read.schema.createAndFill(KEYS.taskList)).toEqual({
      children: [
        {
          checked: false,
          children: [{ children: [{ text: '' }], type: KEYS.lic }],
          type: KEYS.li,
        },
      ],
      type: KEYS.taskList,
    });
  });

  it('resolves configured valid list-item child plugin keys', () => {
    const EmbedPlugin = createBasePlugin({
      key: 'embed',
      node: {
        element: { content: schema.content.text({ default: 'text', min: 1 }) },
        type: 'image-card',
      },
    });
    const editor = createBaseEditor({
      plugins: [
        EmbedPlugin,
        BaseListPlugin.configure({
          options: { validLiChildrenTypes: ['embed'] },
        }),
      ],
    });

    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [
            {
              children: [{ children: [{ text: '' }], type: 'image-card' }],
              type: KEYS.li,
            },
          ],
          type: KEYS.ulClassic,
        },
      ])
    ).not.toThrow();
  });
});
