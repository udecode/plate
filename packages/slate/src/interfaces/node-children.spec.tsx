/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../create-editor';
import { NodeApi } from './node';

jsx;

describe('NodeApi.children', () => {
  describe('when using from option', () => {
    it('should get children starting from index', () => {
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

      expect(children).toEqual([
        { text: 'two' },
        { text: 'three' },
        { text: 'four' },
      ]);
    });

    it('should get children in reverse from index', () => {
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

      expect(children).toEqual([
        { text: 'three' },
        { text: 'two' },
        { text: 'one' },
      ]);
    });
  });

  describe('when using to option', () => {
    it('should get children up to index', () => {
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

      expect(children).toEqual([{ text: 'one' }, { text: 'two' }]);
    });
  });

  describe('when using both from and to options', () => {
    it('should get children within range', () => {
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

      expect(children).toEqual([{ text: 'two' }, { text: 'three' }]);
    });
  });

  describe('when getting next siblings', () => {
    describe('when no siblings', () => {
      it('should return empty array', () => {
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

    describe('when has siblings', () => {
      it('should return sibling nodes', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
                <htext />
                <htext>last</htext>
              </hp>
            </editor>
          ) as any
        );

        const output = [{ text: '' }, { text: 'last' }];

        const editor = createPlateEditor({
          plugins: [LinkPlugin],
          selection: input.selection,
          value: input.children,
        });

        const [, blockPath] = editor.api.block()!;
        const selectionPath = editor.api
          .path(input.selection!)!
          .slice(blockPath.length);
        const childIndex = selectionPath[0];

        const siblings = Array.from(
          NodeApi.children(editor as any, blockPath, {
            from: childIndex + 1,
          })
        ).map(([node]) => node);

        expect(siblings).toEqual(output);
      });
    });
  });
});
