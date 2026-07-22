import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ElementApi, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseListPlugin,
  BaseTaskListPlugin,
} from './BaseListPlugin';

describe('BaseListPlugin schema', () => {
  it('constructs and validates the list root, item, and content grammar', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
    });
    const list = editor.read.schema.createAndFill(BaseBulletedListPlugin);

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
    expect(
      editor.read.schema.element(BaseBulletedListPlugin)?.groups
    ).toContain('block');
    expect(editor.read.schema.element(BaseListItemPlugin)?.groups).toContain(
      'block'
    );
    expect(
      editor.read.schema.element(BaseListItemContentPlugin)?.groups
    ).toContain('block');
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
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
    });
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
    const taskList = editor.read.schema.createAndFill(BaseTaskListPlugin);

    expect(taskList).toMatchObject({
      children: [
        {
          children: [{ children: [{ text: '' }], type: KEYS.lic }],
          type: KEYS.li,
        },
      ],
      type: KEYS.taskList,
    });
    expect(Reflect.get(taskList.children[0]!, 'checked')).toBe(false);
  });

  it('resolves configured valid list-item child plugin keys', () => {
    const EmbedPlugin = createBasePlugin({
      key: 'embed',
      schema: {
        element: { content: schema.content.text({ default: 'text', min: 1 }) },
      },
      type: 'image-card',
    });
    const editor = createBaseEditor({
      plugins: [
        EmbedPlugin,
        BaseListPlugin.configure({
          options: { validLiChildren: [EmbedPlugin] },
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
