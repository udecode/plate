/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import { NodeApi } from './node';

jsx;

describe('NodeApi.children', () => {
  describe('when using from option', () => {
    it('get children starting from index', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
              <text>three</text>
              <text>four</text>
            </element>
          </editor>
        ) as any
      );

      const children = Array.from(
        NodeApi.children(editor, [0], { from: 1 })
      ).map(([node]) => node);

      expect(children).toMatchObject([
        { text: 'two' },
        { text: 'three' },
        { text: 'four' },
      ]);
    });

    it('get children in reverse from index', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
              <text>three</text>
              <text>four</text>
            </element>
          </editor>
        ) as any
      );

      const children = Array.from(
        NodeApi.children(editor, [0], { from: 2, reverse: true })
      ).map(([node]) => node);

      expect(children).toMatchObject([
        { text: 'three' },
        { text: 'two' },
        { text: 'one' },
      ]);
    });
  });

  describe('when using to option', () => {
    it('get children up to index', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
              <text>three</text>
              <text>four</text>
            </element>
          </editor>
        ) as any
      );

      const children = Array.from(NodeApi.children(editor, [0], { to: 2 })).map(
        ([node]) => node
      );

      expect(children).toMatchObject([{ text: 'one' }, { text: 'two' }]);
    });
  });

  describe('when using both from and to options', () => {
    it('get children within range', () => {
      const editor = createEditor(
        (
          <editor>
            <element>
              <text>one</text>
              <text>two</text>
              <text>three</text>
              <text>four</text>
            </element>
          </editor>
        ) as any
      );

      const children = Array.from(
        NodeApi.children(editor, [0], { from: 1, to: 3 })
      ).map(([node]) => node);

      expect(children).toMatchObject([{ text: 'two' }, { text: 'three' }]);
    });
  });

  describe('when getting next siblings', () => {
    describe('when no siblings', () => {
      it('returns empty array', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
              </hp>
            </editor>
          ) as any
        );

        const editor = createEditor();
        editor.selection = input.selection;
        editor.children = input.children;

        const above = editor.api.block()!;
        const siblings = Array.from(
          NodeApi.children(editor, above[1], {
            from: 2,
          })
        ).map(([node]) => node);

        expect(siblings).toEqual([]);
      });
    });
  });
});
