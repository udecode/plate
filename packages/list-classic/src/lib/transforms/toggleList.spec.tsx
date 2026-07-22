/** @jsx jsxt */

import { createBaseEditor, createBasePlugin } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { toggleList, toggleTaskList } from './toggleList';

jsxt;

const BaseImagePlugin = createBasePlugin({
  key: KEYS.img,
  schema: {
    element: {
      void: 'block',
    },
  },
});

const runToggleList = (
  input: TestEditor,
  plugins: any[] = [BaseListPlugin],
  type: string = KEYS.ulClassic
) => {
  const editor = createBaseEditor({
    plugins,
    selection: input.selection,
    initialValue: input.children,
  });

  editor.update((tx) => {
    toggleList(editor, tx, {
      type: editor.getType(type),
    });
  });

  return editor;
};

describe('toggleList', () => {
  it('does nothing when the editor has no selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      initialValue: [{ children: [{ text: 'plain' }], type: KEYS.p }],
    });

    const before = JSON.stringify(editor.read.children());

    editor.update((tx) => {
      toggleList(editor, tx, { type: editor.getType(KEYS.ulClassic) });
    });

    expect(JSON.stringify(editor.read.children())).toBe(before);
  });

  describe('turning paragraphs into lists', () => {
    it('wraps a collapsed paragraph in a bulleted list', () => {
      const input = (
        <editor>
          <hp>
            1<cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('preserves block order across a multi-block range selection', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            AAA
          </hp>
          <hp>BBB</hp>
          <hp>CCC</hp>
          <hp>
            DDD
            <focus />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>AAA</hlic>
              </hli>
              <hli>
                <hlic>BBB</hlic>
              </hli>
              <hli>
                <hlic>CCC</hlic>
              </hli>
              <hli>
                <hlic>DDD</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('keeps configured valid list-item children at the list item root', () => {
      const input = (
        <editor>
          <himg>
            <htext>
              <cursor />
            </htext>
          </himg>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input, [
        BaseImagePlugin,
        BaseListPlugin.configure({
          options: {
            validLiChildren: [BaseImagePlugin],
          },
        }),
      ]);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <himg>
                  <htext />
                </himg>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('creates checked task-list items through the task-list wrapper', () => {
      const input = (
        <editor>
          <hp>
            task
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;
      const editor = createBaseEditor({
        plugins: [BaseListPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update((tx) => {
        toggleTaskList(editor, tx, true);
      });

      expect(editor.read.children()).toMatchObject([
        {
          children: [
            {
              checked: true,
              children: [{ children: [{ text: 'task' }], type: 'lic' }],
              type: 'li',
            },
          ],
          type: 'taskList',
        },
      ]);
    });

    it('drops checked when switching a task list to a bulleted list', () => {
      const input = {
        children: [
          {
            children: [
              {
                checked: true,
                children: [{ children: [{ text: 'task' }], type: 'lic' }],
                type: 'li',
              },
            ],
            type: 'taskList',
          },
        ],
        selection: {
          kind: 'text' as const,
          anchor: { offset: 4, path: [0, 0, 0, 0] },
          focus: { offset: 4, path: [0, 0, 0, 0] },
        },
      } as TestEditor;

      const editor = runToggleList(input);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>task</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });
  });

  describe('turning lists off', () => {
    it('unwraps a selected list range into paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <anchor />1
              </hlic>
            </hli>
            <hli>
              <hlic>2</hlic>
            </hli>
            <hli>
              <hlic>
                3<focus />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hp>1</hp>
            <hp>2</hp>
            <hp>3</hp>
          </editor>
        ).children
      );
    });

    it('splits a list around the current item when toggled from inside the list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
            <hli>
              <hlic>
                2
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>3</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
            </hul>
            <hp>2</hp>
            <hul>
              <hli>
                <hlic>3</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });
  });

  describe('switching list types', () => {
    it('switches only the targeted nested list when the selection is inside it', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
              <hul>
                <hli>
                  <hlic>
                    11
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input, [BaseListPlugin], KEYS.olClassic);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
                <hol>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hol>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('retypes a selected list range that stays inside the list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <anchor />1
              </hlic>
            </hli>
            <hli>
              <hlic>
                2<focus />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input, [BaseListPlugin], KEYS.olClassic);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hol>
              <hli>
                <hlic>1</hlic>
              </hli>
              <hli>
                <hlic>2</hlic>
              </hli>
            </hol>
          </editor>
        ).children
      );
    });

    it('retypes the full selected range when the selection spans list content and paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <anchor />1
              </hlic>
              <hul>
                <hli>
                  <hlic>11</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
          <hp>
            body
            <focus />
          </hp>
        </editor>
      ) as TestEditor;

      const editor = runToggleList(input, [BaseListPlugin], KEYS.olClassic);

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hol>
              <hli>
                <hlic>1</hlic>
                <hol>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hol>
              </hli>
              <hli>
                <hlic>body</hlic>
              </hli>
            </hol>
          </editor>
        ).children
      );
    });
  });
});
